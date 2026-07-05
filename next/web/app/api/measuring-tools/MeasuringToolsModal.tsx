'use client';
import { useState, useEffect } from 'react';

export default function MeasuringToolsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [tools, setTools] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) fetchTools();
  }, [isOpen]);

  const fetchTools = async () => {
    try {
      const res = await fetch('/api/measuring-tools');
      const data = await res.json();
      if (Array.isArray(data)) setTools(data);
    } catch (err) {
      console.error('Ошибка загрузки справочника', err);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? { id: editingId, name } : { name };

    const res = await fetch('/api/measuring-tools', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setName('');
      setEditingId(null);
      fetchTools();
    } else {
      const errData = await res.json();
      alert(errData.error || 'Ошибка сохранения.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот инструмент из справочника?')) return;
    await fetch('/api/measuring-tools', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isDelete: true }),
    });
    fetchTools();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[85vh] flex flex-col shadow-xl border border-gray-200">
        
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">Справочник: Мерительный инструмент</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-medium">&times;</button>
        </div>

        {/* Форма добавления / редактирования */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {editingId ? 'Редактировать инструмент' : 'Добавить новый инструмент'}
          </h3>
          <div className="w-full">
            <input
              type="text"
              placeholder="Наименование (напр., Штангенциркуль)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setName(''); }} 
                className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                Отмена
              </button>
            )}
            <button 
              type="button"
              onClick={handleSave} 
              className="px-5 py-1.5 text-sm bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
            >
              {editingId ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </div>

        {/* Список элементов без колонки описания */}
        <div className="overflow-y-auto flex-1 border border-gray-200 rounded-md">
          {tools.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">Справочник пуст</div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0 border-b z-10">
                <tr>
                  <th className="p-3">Наименование</th>
                  <th className="p-3 text-right w-24">Действия</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr key={tool.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="p-3 text-gray-800 font-medium break-words leading-relaxed pr-4">{tool.name}</td>
                    <td className="p-3 text-right whitespace-nowrap align-middle">
                      <div className="flex flex-col items-end gap-1">
                        <button
                          type="button"
                          onClick={() => { setEditingId(tool.id); setName(tool.name); }}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Изменить
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(tool.id)} 
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
