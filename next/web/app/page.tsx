'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link';

// 1. Полные интерфейсы для типизации с учетом новых полей и таблиц-справочников
interface OperationRow { 
  type: string; 
  text: string 
}

interface ToolRelation { 
  id?: number; 
  cuttingToolId?: number; 
  measuringToolId?: number; 
  cuttingTool?: { name: string }; 
  measuringTool?: { name: string };
  name?: string; // Для временного хранения ручного ввода до сохранения
}

interface Operation {
  operation_number: string
  operation_name: string
  workplace: string
  equipment: string
  nv: string // На фронтенде храним строкой для удобства работы <input type="number">
  cuttingTools: ToolRelation[]
  measuringTools: ToolRelation[]
  rows: OperationRow[]
}

interface CardListItem { 
  id: number; 
  documentNumber: string; 
  partName: string 
}

interface ToolCatalogItem { 
  id: number; 
  name: string 
}

export default function Home() {
  // Состояния для перечня документов и фильтра
  const [cardsList, setCardsList] = useState<CardListItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)

  // Справочник режущего инструмента (подгружается автоматически с сервера)
  const [cuttingCatalog, setCuttingCatalog] = useState<ToolCatalogItem[]>([])

  // Состояния для полей формы технологической карты (Шапка)
  const [docNumber, setDocNumber] = useState('')
  const [partName, setPartName] = useState('')
  const [material, setMaterial] = useState('')
  const [mass, setMass] = useState('')
  const [profileSize, setProfileSize] = useState('')
  
  // Массив операций
  const [operations, setOperations] = useState<Operation[]>([])

  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  // Загрузка каталога режущих инструментов для выпадающего списка
  async function loadCuttingCatalog() {
    try {
      const res = await fetch('/api/tools/cutting')
      const result = await res.json()
      if (result.success) setCuttingCatalog(result.data)
    } catch (err) { 
      console.error('Ошибка загрузки справочника режущих инструментов:', err) 
    }
  }

  // Загрузка архива (краткого списка всех карт)
  async function loadCardsList() {
    try {
      const res = await fetch('/api/tehkarta')
      const result = await res.json()
      if (result.success) setCardsList(result.data)
    } catch (err) { 
      console.error('Ошибка загрузки списка карт:', err) 
    }
  }

  // Загрузка полных данных конкретной карты по её ID
  async function loadSingleCard(id: number) {
    try {
      const res = await fetch(`/api/tehkarta?id=${id}`)
      const result = await res.json()
      if (result.success && result.data) {
        const card = result.data
        setSelectedCardId(card.id)
        setDocNumber(card.documentNumber)
        setPartName(card.partName)
        setMaterial(card.material)
        setMass(card.massKg.toString())
        setProfileSize(card.profileSize)
        
        // Маппим данные из структуры БД (camelCase) в структуру формы (snake_case + nv)
        setOperations(card.operations.map((op: any) => ({
          operation_number: op.operationNumber,
          operation_name: op.operationName,
          workplace: op.workplace || '',
          equipment: op.equipment || '',
          nv: op.nv !== null && op.nv !== undefined ? op.nv.toString() : '',
          cuttingTools: op.cuttingTools || [],
          measuringTools: op.measuringTools || [],
          rows: op.rows.map((r: any) => ({ type: r.rowType, text: r.text }))
        })))
      }
    } catch (err) { 
      console.error('Ошибка загрузки конкретной карты:', err) 
    }
  }

  // Первичная инициализация приложения при старте
  useEffect(() => {
    async function init() {
      try {
        await loadCuttingCatalog() // Сначала загружаем справочник инструментов
        const res = await fetch('/api/tehkarta')
        const result = await res.json()
        if (result.success && result.data.length > 0) {
          setCardsList(result.data)
          // Открываем первую карту из списка по умолчанию
          loadSingleCard(result.data[0].id)
        } else {
          startNewCard()
        }
      } catch (err) { 
        console.error('Ошибка инициализации:', err) 
      }
    }
    init()
  }, [])

  // Сброс и создание абсолютно чистого бланка новой карты
  const startNewCard = () => {
    setSelectedCardId(null)
    setDocNumber('')
    setPartName('')
    setMaterial('')
    setMass('')
    setProfileSize('')
    setOperations([{ 
      operation_number: '005', 
      operation_name: 'Вхідний контроль', 
      workplace: '', 
      equipment: '', 
      nv: '', 
      cuttingTools: [], 
      measuringTools: [], 
      rows: [] 
    }])
  }

  // Добавление новой пустой карточки операции
  const addOperation = () => setOperations([
    ...operations, 
    { 
      operation_number: '', 
      operation_name: '', 
      workplace: '', 
      equipment: '', 
      nv: '', 
      cuttingTools: [], 
      measuringTools: [], 
      rows: [] 
    }
  ])

  // Обновление текстовых полей и массивов инструментов внутри операции
  const handleOpChange = (index: number, field: keyof Operation, value: any) => {
    const updated = [...operations]; 
    updated[index] = { ...updated[index], [field]: value }; 
    setOperations(updated)
  }

  // Добавление новой строки перехода "О" к конкретной операции
  const addRowToOp = (opIndex: number) => { 
    const updated = [...operations]; 
    updated[opIndex].rows.push({ type: 'O', text: '' }); 
    setOperations(updated) 
  }

  // Обновление текста внутри строки перехода "О"
  const handleRowChange = (opIndex: number, rowIndex: number, value: string) => {
    const updated = [...operations]; 
    updated[opIndex].rows[rowIndex].text = value; 
    setOperations(updated)
  }

  // Функция сохранения / отправки формы на бэкенд
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusMessage('')

    // Формируем payload. Валидируем строку nv в число Float
    const payload = {
      id: selectedCardId, 
      document_info: { gost: "3.1118-82", form: "1", document_number: docNumber },
      header: { part_name: partName, material: material, mass_kg: parseFloat(mass) || 0, profile_size: profileSize },
      operations: operations.map(op => ({
        ...op,
        nv: op.nv.trim() !== '' ? parseFloat(op.nv) : null
      }))
    }

    try {
      const response = await fetch('/api/tehkarta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      if (result.success) {
        setStatusMessage('Успешно сохранено в PostgreSQL!')
        await loadCardsList() // Обновляем боковое меню архива
        if (result.data) {
          setSelectedCardId(result.data.id)
          // Важно: перезагружаем карту из базы, чтобы прописались выданные СУБД id для связей
          await loadSingleCard(result.data.id)
        }
      } else {
        setStatusMessage(`Ошибка: ${result.error}`)
      }
    } catch (err) { 
      setStatusMessage('Ошибка сети при отправке') 
    } finally { 
      setLoading(false) 
    }
  }

  // Фильтрация архива на клиенте
  const filteredCardsList = cardsList.filter(card =>
    card.documentNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )
  return (
    <main className="min-h-screen bg-gray-50 flex text-black">
      
      {/* ЛЕВАЯ ЧАСТЬ: ОСНОВНАЯ ФОРМА ТЕХКАРТЫ */}
      <div className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
          
          {/* Контейнер заголовка */}
          <div className="relative flex items-center justify-center w-full mb-6">
            <h1 className="text-xl font-bold text-center text-gray-800">
              Технологическая карта (ГОСТ 3.1118-82)
            </h1>

            {selectedCardId && (
              <div className="absolute right-0">
                <Link 
                  href={`/reports/${selectedCardId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-4 py-1.5 rounded transition shadow-sm cursor-pointer"
                >
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.8A8.004 8.004 0 0112 4.5c4.14 0 7.5 3.36 7.5 7.5a7.94 7.94 0 01-1.464 4.542m-12.072 0H19.5" />
                  </svg>
                  Печать
                </Link>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* БЛОК ШАПКИ ДОКУМЕНТА */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border border-gray-100">
              <h2 className="col-span-2 font-semibold text-gray-700 text-sm">Шапка документа</h2>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Номер документа</label>
                <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} className="w-full p-2 border rounded bg-white text-sm focus:outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Наименование детали</label>
                <input type="text" value={partName} onChange={e => setPartName(e.target.value)} className="w-full p-2 border rounded bg-white text-sm focus:outline-none focus:border-blue-500" required />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Материал</label>
                <input type="text" value={material} onChange={e => setMaterial(e.target.value)} className="w-full p-2 border rounded bg-white text-sm focus:outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Масса (кг)</label>
                <input type="number" step="0.01" value={mass} onChange={e => setMass(e.target.value)} className="w-full p-2 border rounded bg-white text-sm focus:outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Профиль и размеры</label>
                <input type="text" value={profileSize} onChange={e => setProfileSize(e.target.value)} className="w-full p-2 border rounded bg-white text-sm focus:outline-none focus:border-blue-500" required />
              </div>
            </div>

            {/* БЛОК КАРТОЧЕК ОПЕРАЦИЙ */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-700 text-sm">Технологические операции</h2>
                <button type="button" onClick={addOperation} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition">
                  + Добавить операцию
                </button>
              </div>

              {operations.map((op, opIdx) => (
                <div key={opIdx} className="border border-gray-200 p-4 rounded space-y-4 bg-white shadow-sm relative">
                  
                  {/* Верхняя линия управления операцией */}
                  <div className="flex justify-between items-center w-full border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-gray-500">Операция № {opIdx + 1}</span>
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
                      <input type="text" placeholder="010" value={op.operation_number} onChange={e => handleOpChange(opIdx, 'operation_number', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" required />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-xs text-gray-400">Название операции</label>
                      <input type="text" placeholder="Токарная" value={op.operation_name} onChange={e => handleOpChange(opIdx, 'operation_name', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400">Рабочее место</label>
                      <input type="text" value={op.workplace} onChange={e => handleOpChange(opIdx, 'workplace', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400">Оборудование</label>
                      <input type="text" value={op.equipment} onChange={e => handleOpChange(opIdx, 'equipment', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" />
                    </div>
                    {/* Поле нормы времени */}
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400">Норма времени (мин)</label>
                      <input type="number" step="0.01" min="0" placeholder="0.00" value={op.nv} onChange={e => handleOpChange(opIdx, 'nv', e.target.value)} className="w-full p-2 border rounded text-sm bg-white focus:border-blue-500" />
                    </div>
                  </div>

                  {/* Оснащение выведено до переходов «О» */}
                  <div className="p-3 bg-gray-50 rounded border border-gray-100 space-y-3">
                    <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">Технологическое оснащение</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Выбор режущего инструмента */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Режущий инструмент</label>
                        <select 
                          className="w-full p-2 border rounded bg-white text-xs"
                          value=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            if (!op.cuttingTools?.some((t: any) => Number(t.cuttingToolId) === Number(val))) {
                              const updatedTools = [...(op.cuttingTools || []), { cuttingToolId: Number(val) }];
                              handleOpChange(opIdx, 'cuttingTools', updatedTools);
                            }
                          }}
                        >
                          <option value="">-- Выбрать из исходника --</option>
                          {cuttingCatalog.map(tool => (
                            <option key={tool.id} value={tool.id}>{tool.name}</option>
                          ))}
                        </select>

                        {/* Бейджи выбранных режущих инструментов */}
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {op.cuttingTools?.map((ct: any, idx: number) => {
                            const found = cuttingCatalog.find(c => c.id === ct.cuttingToolId);
                            return (
                              <span key={idx} className="text-[11px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded flex items-center gap-1">
                                {found ? found.name : `ID: ${ct.cuttingToolId}`}
                                <button type="button" className="hover:text-red-500 font-bold ml-0.5" onClick={() => {
                                  const filtered = op.cuttingTools.filter((_, i) => i !== idx);
                                  handleOpChange(opIdx, 'cuttingTools', filtered);
                                }}>×</button>
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      {/* Мерительный инструмент */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Мерительный инструмент</label>
                        <input 
                          type="text"
                          placeholder="Ввод вручную (нажмите Enter)..."
                          className="w-full p-2 border rounded bg-white text-xs focus:outline-none"
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              e.preventDefault();
                              const text = e.currentTarget.value.trim();
                              
                              try {
                                const res = await fetch('/api/tools/measuring', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ name: text })
                                });
                                const result = await res.json();
                                if (result.success && result.data) {
                                  const updatedTools = [...(op.measuringTools || []), { measuringToolId: result.data.id, measuringTool: { name: text } }];
                                  handleOpChange(opIdx, 'measuringTools', updatedTools);
                                  e.currentTarget.value = '';
                                }
                              } catch (err) { console.error('Ошибка добавления мерительного инструмента:', err) }
                            }
                          }}
                        />

                        {/* Бейджи мерительных инструментов */}
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {op.measuringTools?.map((mt: any, idx: number) => (
                            <span key={idx} className="text-[11px] bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded flex items-center gap-1">
                              {mt.measuringTool?.name || mt.name || `ID: ${mt.measuringToolId}`}
                              <button type="button" className="hover:text-red-500 font-bold ml-0.5" onClick={() => {
                                const filtered = op.measuringTools.filter((_, i) => i !== idx);
                                handleOpChange(opIdx, 'measuringTools', filtered);
                              }}>×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Блок переходов (строк О), смещенный ниже блоков инструментов */}
                  <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-400">Содержимое (Строки О):</span>
                      <button type="button" onClick={() => addRowToOp(opIdx)} className="text-xs text-blue-600 hover:underline">
                        + Добавить переход
                      </button>
                    </div>
                    {op.rows.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex gap-2 items-center group">
                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">О</span>
                        <input type="text" placeholder="Действие перехода..." value={row.text} onChange={e => handleRowChange(opIdx, rowIdx, e.target.value)} className="w-full p-1.5 border rounded text-xs bg-white focus:outline-none" required />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedOps = [...operations]
                            updatedOps[opIdx].rows = updatedOps[opIdx].rows.filter((_, rI) => rI !== rowIdx)
                            setOperations(updatedOps)
                          }}
                          className="text-gray-300 hover:text-red-500 text-xs px-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>

            {/* Вывод статуса */}
            {statusMessage && (
              <div className={`p-3 text-sm rounded ${statusMessage.startsWith('Ошибка') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {statusMessage}
              </div>
            )}

            {/* Кнопки отправки формы */}
            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded font-medium text-sm transition shadow-sm disabled:bg-gray-400">
                {loading ? 'Сохранение в базу данных...' : 'Сохранить технологическую карту'}
              </button>
              <button type="button" onClick={startNewCard} className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium text-sm transition">
                Сбросить бланк
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: МЕНЮ СПИСКА ТЕХКАРТ */}
      <div className="w-80 border-l border-gray-200 bg-white p-6 overflow-y-auto max-h-screen">
        <h3 className="font-bold text-gray-800 mb-4 text-sm">Архив документов</h3>
        <input type="text" placeholder="Поиск по номеру..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full p-2 border rounded mb-4 text-xs bg-gray-50" />
        <div className="space-y-2">
          {filteredCardsList.map(card => (
            <button key={card.id} type="button" onClick={() => loadSingleCard(card.id)} className={`w-full text-left p-3 rounded border text-xs transition ${selectedCardId === card.id ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-gray-100 hover:bg-gray-50 text-gray-600'}`}>
              <div className="font-semibold">№ {card.documentNumber}</div>
              <div className="text-gray-400 truncate mt-0.5">{card.partName}</div>
            </button>
          ))}
          {filteredCardsList.length === 0 && <div className="text-xs text-gray-400 text-center py-4">Документы не найдены</div>}
        </div>
      </div>

    </main>
  )
}
