// components/OperationCard.tsx
'use client';

import React from 'react';
import { OperationRowsList } from './OperationRowsList'; // Импортируем вторую часть
import { Operation } from '@prisma/client';
import { OperationCardProps } from '../types/types';

export function TechCardOperation({
  op,
  opIdx,
  operations,
  setOperations,
  handleOpChange,
  addOperation,
  addRowToOp,
  handleRowDrop,
  handleRowChange
}: OperationCardProps) {
  return (
    <div className="border border-gray-200 p-4 rounded space-y-4 bg-white shadow-sm relative">
      
      {/* Верхняя линия управления операцией */}
      <div className="flex justify-between items-center w-full border-b border-gray-100 pb-2">
        <span className="text-xs font-bold text-gray-500">Операция № {opIdx + 1}</span>
        <button 
          type="button" 
          onClick={addOperation} 
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-medium transition"
        >
          + Добавить операцию
        </button>
        <button
          type="button"
          onClick={() => setOperations(operations.filter((_, i) => i !== opIdx))}
          className="text-gray-400 hover:text-red-600 text-xs font-semibold border border-transparent hover:border-red-200 hover:bg-red-50 px-2 py-0.5 rounded transition"
        >
          Удалить операцию ×
        </button>
      </div>

      {/* Сетка основных параметров операции */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="md:col-span-1">
          <label className="block text-xs text-gray-400">№ Оп.</label>
          <input 
            type="text" 
            placeholder="010" 
            value={op.operation_number} 
            onChange={e => handleOpChange(opIdx, 'operation_number', e.target.value)} 
            className="w-full p-2 border rounded text-sm bg-white" 
            required 
          />
        </div>
        <div className="md:col-span-5">
          <label className="block text-xs text-gray-400">Название операции</label>
          <input 
            type="text" 
            placeholder="Токарная" 
            value={op.operation_name} 
            onChange={e => handleOpChange(opIdx, 'operation_name', e.target.value)} 
            className="w-full p-2 border rounded text-sm bg-white" 
            required 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-400">Рабочее место</label>
          <input 
            type="text" 
            value={op.workplace} 
            onChange={e => handleOpChange(opIdx, 'workplace', e.target.value)} 
            className="w-full p-2 border rounded text-sm bg-white" 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-400">Оборудование</label>
          <input 
            type="text" 
            value={op.equipment} 
            onChange={e => handleOpChange(opIdx, 'equipment', e.target.value)} 
            className="w-full p-2 border rounded text-sm bg-white" 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-400">Норма времени (мин)</label>
          <input 
            type="number" 
            step="0.01" 
            min="0" 
            placeholder="0.00" 
            value={op.nv} 
            onChange={e => handleOpChange(opIdx, 'nv', e.target.value)} 
            className="w-full p-2 border rounded text-sm bg-white focus:border-blue-500" 
          />
        </div>
      </div>

      {/* ВЫЗОВ ВТОРОЙ ЧАСТИ: Блок переходов (Строки О) */}
      <OperationRowsList 
        op={op}
        opIdx={opIdx}
        operations={operations}
        setOperations={setOperations}
        addRowToOp={addRowToOp}
        handleRowDrop={handleRowDrop}
        handleRowChange={handleRowChange}
      />

    </div>
  );
}
