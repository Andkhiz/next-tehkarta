// components/DocumentHeader.tsx
'use client';

import React from 'react';
import { DocumentHeaderProps } from '../types/types';


export function TechCardHeader({
  docNumber, setDocNumber,
  partName, setPartName,
  material, setMaterial,
  mass, setMass,
  massZag, setMassZag,
  profileSize, setProfileSize
}: DocumentHeaderProps) {
  return (
    <div className="grid grid-cols-6 gap-4 bg-gray-50 p-4 rounded border border-gray-100">
      {/* Заголовок на всю ширину (6 колонок) */}
      <h2 className="col-span-6 font-semibold text-gray-700 text-sm">Шапка документа</h2>
      
      {/* ПЕРВЫЙ РЯД: Ровно пополам */}
      <div className="col-span-3">
        <label className="block text-xs text-gray-400 mb-1">Номер документа</label>
        <input 
          type="text" 
          value={docNumber} 
          onChange={e => setDocNumber(e.target.value)} 
          className="w-full p-2 border rounded bg-white text-sm focus:outline-none focus:border-blue-500" 
          required 
        />
      </div>
      
      <div className="col-span-3">
        <label className="block text-xs text-gray-400 mb-1">Наименование детали</label>
        <input 
          type="text" 
          value={partName} 
          onChange={e => setPartName(e.target.value)} 
          className="w-full p-2 border rounded bg-white text-sm focus:outline-none focus:border-blue-500" 
          required 
        />
      </div>
      
      {/* ВТОРОЙ РЯД: Материал на всю ширину */}
      <div className="col-span-6">
        <label className="block text-xs text-gray-400 mb-1">Материал</label>
        <input 
          type="text" 
          value={material} 
          onChange={e => setMaterial(e.target.value)} 
          className="w-full p-2 border rounded bg-white text-sm focus:outline-none focus:border-blue-500" 
          required 
        />
      </div>
      
      {/* ТРЕТИЙ РЯД: Три поля в ряд */}
      <div className="col-span-2">
        <label className="block text-xs text-gray-400 mb-1">Масса чистая (кг)</label>
        <input 
          type="number" 
          step="0.01" 
          value={mass} 
          onChange={e => setMass(e.target.value)} 
          className="w-full p-2 border rounded bg-white text-sm focus:outline-none focus:border-blue-500" 
          required 
        />
      </div>
      
      <div className="col-span-2">
        <label className="block text-xs text-gray-400 mb-1">Масса заготовки (кг)</label>
        <input 
          type="number" 
          step="0.01" 
          value={massZag} 
          onChange={e => setMassZag(e.target.value)} 
          className="w-full p-2 border rounded bg-white text-sm focus:outline-none focus:border-blue-500" 
          required 
        />
      </div>
      
      <div className="col-span-2">
        <label className="block text-xs text-gray-400 mb-1">Профиль и размеры</label>
        <input 
          type="text" 
          value={profileSize} 
          onChange={e => setProfileSize(e.target.value)} 
          className="w-full p-2 border rounded bg-white text-sm focus:outline-none focus:border-blue-500" 
          required 
        />
      </div>
    </div>
  );
}
