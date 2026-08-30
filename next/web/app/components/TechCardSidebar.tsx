// components/TechCardSidebar.tsx
'use client';

import React from 'react';
import MeasuringToolsModal from '../api/measuring-tools/MeasuringToolsModal'; // Проверьте правильность пути к вашей модалке
import { TechCardSidebarProps } from '../types/types';

export function TechCardSidebar({
  setIsMeasuringCatalogOpen,
  isMeasuringCatalogOpen,
  startNewCard,
  searchQuery,
  setSearchQuery,
  filteredCardsList,
  loadSingleCard,
  selectedCardId,
}: TechCardSidebarProps) {
  return (
    <div className="w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto max-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Перечень техкарт</h3>
        <div className="flex gap-1.5">
          {/* КНОПКА: Справочник мерительного инструмента */}
          <button 
            type="button" 
            onClick={() => setIsMeasuringCatalogOpen(true)} 
            className="px-2 py-1 bg-gray-600 text-white rounded text-[11px] font-medium hover:bg-gray-700 transition"
          >
            Справочник инструмента
          </button>
          <button 
            type="button" 
            onClick={startNewCard} 
            className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-medium hover:bg-emerald-700 transition"
          >
            Новая техкарта
          </button>
        </div>
      </div>
      
      <input 
        type="text" 
        placeholder="Поиск по номеру документа..." 
        value={searchQuery} 
        onChange={e => setSearchQuery(e.target.value)} 
        className="w-full p-2 border rounded mb-4 text-xs bg-white focus:outline-none focus:border-blue-500" 
      />
      
      <div className="space-y-2">
        {filteredCardsList.map(card => (
          <button 
            key={card.id} 
            type="button" 
            onClick={() => loadSingleCard(card.id)} 
            className={`w-full text-left p-2.5 rounded border text-xs transition ${
              selectedCardId === card.id 
                ? 'border-blue-300 bg-blue-50/50 text-blue-600' 
                : 'border-gray-200 hover:bg-gray-50 text-gray-500'
            }`}
          >
            <div className="font-semibold tracking-wide">{card.documentNumber || card.document_number}</div>
            <div className="text-gray-400 uppercase text-[11px] truncate mt-0.5">{card.partName || card.part_name}</div>
          </button>
        ))}
        {filteredCardsList.length === 0 && (
          <div className="text-xs text-gray-400 text-center py-4">Документы не найдены</div>
        )}
      </div>

      {/* РЕНДЕР МОДАЛЬНОГО ОКНА */}
      <MeasuringToolsModal isOpen={isMeasuringCatalogOpen} onClose={() => setIsMeasuringCatalogOpen(false)} />
    </div>
  );
}
