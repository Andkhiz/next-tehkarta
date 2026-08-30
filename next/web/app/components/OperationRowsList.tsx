// components/OperationRowsList.tsx
'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MeasuringToolSelect } from './MeasuringToolSelect'; // Проверьте правильность пути к вашему селекту

interface OperationRowsListProps {
  op: any;
  opIdx: number;
  operations: any[];
  setOperations: React.Dispatch<React.SetStateAction<any[]>>;
  addRowToOp: (opIdx: number) => void;
  handleRowDrop: (opIdx: number, result: any) => void;
  handleRowChange: (opIdx: number, rowIdx: number, value: string) => void;
}

export function OperationRowsList({
  op,
  opIdx,
  operations,
  setOperations,
  addRowToOp,
  handleRowDrop,
  handleRowChange
}: OperationRowsListProps) {
  return (
    <div className="pl-4 border-l-2 border-gray-200 space-y-1">
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-xs font-medium text-gray-400">Содержимое (Строки О):</span>
        <button 
          type="button" 
          onClick={() => addRowToOp(opIdx)} 
          className="text-xs text-blue-600 hover:underline"
        >
          + Добавить переход
        </button>
      </div>
      
      {/* Контекст перетаскивания строк для конкретной операции */}
      <DragDropContext onDragEnd={(result) => handleRowDrop(opIdx, result)}>
        <Droppable droppableId={`droppable-rows-${opIdx}`}>
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="space-y-1"
            >
              {op.rows.map((row: any, rowIdx: number) => (
                <Draggable 
                  key={`row-${opIdx}-${rowIdx}`} 
                  draggableId={`drag-${opIdx}-${rowIdx}`} 
                  index={rowIdx}
                >
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex gap-2 items-start py-0.5 group transition-colors ${
                        snapshot.isDragging ? 'bg-blue-50/60 rounded shadow-sm' : ''
                      }`}
                    >
                      
                      {/* Буква О (работает как ручка перетаскивания) */}
                      <span 
                        {...provided.dragHandleProps}
                        className="text-xs font-bold text-gray-400 bg-gray-50 border px-2 py-1.5 rounded h-[32px] flex items-center shadow-sm cursor-grab active:cursor-grabbing hover:bg-gray-100 select-none"
                        title="Потяните для изменения порядка"
                      >
                        О
                      </span>
                      
                      {/* Поле действия перехода */}
                      <input 
                        type="text" 
                        placeholder="Действие перехода..." 
                        value={row.text} 
                        onChange={e => handleRowChange(opIdx, rowIdx, e.target.value)} 
                        className="flex-[2] min-w-[200px] p-1.5 border rounded text-xs bg-white focus:outline-none focus:border-blue-400 shadow-sm h-[32px]" 
                        required 
                      />

                      {/* Правая часть: Фиксированная ячейка инструментов */}
                      <div className="relative flex flex-col gap-1 flex-1 min-w-[180px] bg-gray-50/30 border border-dashed border-gray-200 rounded p-1 min-h-[32px] pr-8">
                        
                        <button
                          type="button"
                          onClick={() => {
                            const updatedOps = [...operations];
                            const currentTools = row.measuringTools || [];
                            updatedOps[opIdx].rows[rowIdx].measuringTools = [
                              ...currentTools,
                              { name: '', measuringTool: { name: '' } }
                            ];
                            setOperations(updatedOps);
                          }}
                          className="absolute top-1 right-1 text-[11px] text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 rounded w-5 h-5 font-bold transition-colors flex items-center justify-center z-10"
                          title="Добавить инструмент"
                        >
                          +
                        </button>

                        {(!row.measuringTools || row.measuringTools.length === 0) ? (
                          <div className="w-full">
                            <MeasuringToolSelect
                              value=""
                              onChange={(toolName, toolId) => {
                                const updatedOps = [...operations];
                                updatedOps[opIdx].rows[rowIdx].measuringTools = [
                                  { 
                                    id: toolId,
                                    measuringToolId: toolId,
                                    name: toolName,
                                    measuringTool: { name: toolName } 
                                  }
                                ];
                                setOperations(updatedOps);
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 w-full">
                            {row.measuringTools.map((mt: any, mtIdx: number) => (
                              <div key={mtIdx} className="flex items-center border rounded bg-white shadow-sm h-[24px] pr-1 focus-within:border-green-400 transition-colors w-full">
                                
                                <div className="w-full">
                                  <MeasuringToolSelect
                                    value={mt.measuringTool?.name || mt.name || ''}
                                    onChange={(toolName, toolId) => {
                                      const updatedOps = [...operations];
                                      updatedOps[opIdx].rows[rowIdx].measuringTools[mtIdx] = {
                                        ...updatedOps[opIdx].rows[rowIdx].measuringTools[mtIdx],
                                        id: toolId,
                                        measuringToolId: toolId,
                                        name: toolName,
                                        measuringTool: { name: toolName }
                                      };
                                      setOperations(updatedOps);
                                    }}
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedOps = [...operations];
                                    updatedOps[opIdx].rows[rowIdx].measuringTools = row.measuringTools.filter((_: any, i: number) => i !== mtIdx);
                                    setOperations(updatedOps);
                                  }}
                                  className="text-gray-400 hover:text-red-500 font-bold text-xs px-1 z-10"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Кнопка удаления всей строки перехода */}
                      <button
                        type="button"
                        onClick={() => {
                          const updatedOps = [...operations];
                          updatedOps[opIdx].rows = updatedOps[opIdx].rows.filter((_: any, rI: any) => rI !== rowIdx);
                          setOperations(updatedOps);
                        }}
                        className="text-gray-300 hover:text-red-500 text-xs font-bold transition-colors h-[32px] flex items-center px-1"
                      >
                        ×
                      </button>

                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
