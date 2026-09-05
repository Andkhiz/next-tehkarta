// components/TechCardFormBody.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { TechCardHeader } from './TechCardHeader'; 
import { TechCardOperation } from './TechCardOperation';
import { Operation } from '@prisma/client'; 
import { TechCardFormBodyProps } from '../types/types'


export function TechCardFormBody({
  docNumber, setDocNumber,
  partName, setPartName,
  material, setMaterial,
  mass, setMass,
  massZag, setMassZag,
  profileSize, setProfileSize,
  selectedCardId,
  operations, setOperations,
  statusMessage,
  loading,
  handleSubmit,
  addOperation,
  handleOpChange,
  addRowToOp,
  handleRowDrop,
  handleRowChange,
  startNewCard
}: TechCardFormBodyProps) {
  return (
    <div className="flex-1 p-8 overflow-y-auto max-h-screen">
      <div className="max-w-8xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
        
        {/* Контейнер заголовка */}
        <div className="relative flex items-center justify-center w-full mb-6">
          <h1 className="text-xl font-bold text-center text-gray-800">
            Технологическая карта (ГОСТ 3.1118-82)
          </h1>

          {selectedCardId && (
            <div>
              <div className="absolute right-35">
                <Link 
                  href={`/reports/${selectedCardId}?type=ktp`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-4 py-1.5 rounded transition shadow-sm cursor-pointer"
                >
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.8A8.004 8.004 0 0112 4.5c4.14 0 7.5 3.36 7.5 7.5a7.94 7.94 0 01-1.464 4.542m-12.072 0H19.5" />
                  </svg>
                  Печать КТП
                </Link>
              </div>
              <div className="absolute right-0">
                <Link 
                  href={`/reports/${selectedCardId}?type=mk`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-4 py-1.5 rounded transition shadow-sm cursor-pointer"
                >
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.8A8.004 8.004 0 0112 4.5c4.14 0 7.5 3.36 7.5 7.5a7.94 7.94 0 01-1.464 4.542m-12.072 0H19.5" />
                  </svg>
                  Печать МК
                </Link>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ЧАСТЬ 1: Вынесенный компонент шапки */}
          <TechCardHeader 
            docNumber={docNumber} setDocNumber={setDocNumber}
            partName={partName} setPartName={setPartName}
            material={material} setMaterial={setMaterial}
            mass={mass} setMass={setMass}
            massZag={massZag} setMassZag={setMassZag}
            profileSize={profileSize} setProfileSize={setProfileSize}
          />

          {/* БЛОК КАРТОЧЕК ОПЕРАЦИЙ */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-700 text-sm">Технологические операции</h2>
              <button 
                type="button" 
                onClick={addOperation} 
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
              >
                + Добавить операцию
              </button>
            </div>

            {/* ЧАСТЬ 2: Рендеринг каждой операции через вынесенную карточку */}
            {operations.map((op, opIdx) => (
              <TechCardOperation 
                key={opIdx}
                op={op}
                opIdx={opIdx}
                operations={operations}
                setOperations={setOperations}
                handleOpChange={handleOpChange}
                addOperation={addOperation}
                addRowToOp={addRowToOp}
                handleRowDrop={handleRowDrop}
                handleRowChange={handleRowChange}
              />
            ))}
          </div>

          {/* Вывод статуса сохранения */}
          {statusMessage && (
            <div className={`p-3 text-sm rounded ${statusMessage.startsWith('Ошибка') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {statusMessage}
            </div>
          )}

          {/* Кнопки отправки формы */}
          <div className="flex gap-4 pt-2">
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded font-medium text-sm transition shadow-sm disabled:bg-gray-400"
            >
              {loading ? 'Сохранение в базу данных...' : 'Сохранить технологическую карту'}
            </button>
            <button 
              type="button" 
              onClick={startNewCard} 
              className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium text-sm transition"
            >
              Сбросить бланк
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
