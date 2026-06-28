'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';

interface Tool {
  id: number;
  name: string;
}

interface ToolSelectProps {
  value: string;
  onChange: (toolName: string, toolId: number) => void;
}

let cachedTools: Tool[] | null = null;

export function MeasuringToolSelect({ value, onChange }: ToolSelectProps) {
  const [tools, setTools] = useState<Tool[]>(cachedTools || []);
  const [search, setSearch] = useState(value || ''); // Инициализация
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // КРИТИЧЕСКИ ВАЖНЫЙ ХУК: Обновляет текст в инпуте, когда данные приходят из базы данных
  useEffect(() => {
    setSearch(value || '');
  }, [value]); // Следит строго за изменением внешнего значения

  const handleFocus = async () => {
    setIsOpen(true);
    if (cachedTools) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/measuring-tools');
      const data = await res.json();
      cachedTools = data;
      setTools(data);
    } catch (err) {
      console.error('Не удалось загрузить инструменты', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTools = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return tools;
    return tools.filter((tool) => tool.name.toLowerCase().includes(query));
  }, [search, tools]);

  return (
    <div ref={containerRef} className="relative w-full text-xs">
      <input
        type="text"
        value={search} // Привязан к контролируемому стейту search
        onFocus={handleFocus}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        placeholder="Инструмент..."
        className="w-full px-2 h-[22px] bg-transparent focus:outline-none text-xs"
      />

      {isOpen && (
        <div className="absolute left-0 z-50 w-full mt-1 bg-white border border-gray-300 shadow-xl max-h-48 overflow-y-auto rounded text-left">
          {isLoading && <div className="p-2 text-gray-500 italic">Загрузка...</div>}
          
          {!isLoading && filteredTools.length === 0 && (
            <div className="p-2 text-gray-400 italic">Не найдено</div>
          )}

          {!isLoading && filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => {
                onChange(tool.name, tool.id); // Передаем данные наверх в таблицу
                setSearch(tool.name); // Обновляем локальную строку
                setIsOpen(false);
              }}
              className="p-2 cursor-pointer hover:bg-green-50 active:bg-green-100 transition-colors border-b border-gray-100 last:border-none"
            >
              {tool.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
