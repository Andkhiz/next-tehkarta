// web/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link';

interface OperationRow { type: string; text: string }
interface Operation {
  operation_number: string
  operation_name: string
  workplace: string
  equipment: string
  rows: OperationRow[]
}
interface CardListItem { id: number; documentNumber: string; partName: string }

export default function Home() {
  // Состояния для перечня документов и фильтра
  const [cardsList, setCardsList] = useState<CardListItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)

  // Состояния для полей формы технологической карты
  const [docNumber, setDocNumber] = useState('')
  const [partName, setPartName] = useState('')
  const [material, setMaterial] = useState('')
  const [mass, setMass] = useState('')
  const [profileSize, setProfileSize] = useState('')
  const [operations, setOperations] = useState<Operation[]>([])

  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  // 1. Загрузка перечня документов с бэкенда
  async function loadCardsList() {
    try {
      const res = await fetch('/api/tehkarta')
      const result = await res.json()
      if (result.success) setCardsList(result.data)
    } catch (err) { console.error('Ошибка загрузки списка:', err) }
  }

  // 2. Загрузка по клику данных конкретной карты
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
        
        setOperations(card.operations.map((op: any) => ({
          operation_number: op.operationNumber,
          operation_name: op.operationName,
          workplace: op.workplace || '',
          equipment: op.equipment || '',
          rows: op.rows.map((r: any) => ({ type: r.rowType, text: r.text }))
        })))
      }
    } catch (err) { console.error('Ошибка загрузки карты:', err) }
  }

  // Загрузка первичных данных при старте веб-приложения
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/tehkarta')
        const result = await res.json()
        if (result.success && result.data.length > 0) {
          setCardsList(result.data)
          loadSingleCard(result.data[0].id)
        } else {
          startNewCard()
        }
      } catch (err) { console.error(err) }
    }
    init()
  }, [])

  // Очистить поля бланка формы для создания нового документа
  const startNewCard = () => {
    setSelectedCardId(null)
    setDocNumber('')
    setPartName('')
    setMaterial('')
    setMass('')
    setProfileSize('')
    setOperations([{ operation_number: '005', operation_name: 'Вхідний контроль', workplace: '', equipment: '', rows: [] }])
  }

  // Функции динамического изменения массивов операций формы
  const addOperation = () => setOperations([...operations, { operation_number: '', operation_name: '', workplace: '', equipment: '', rows: [] }])
  const handleOpChange = (index: number, field: keyof Operation, value: string) => {
    const updated = [...operations]; updated[index] = { ...updated[index], [field]: value }; setOperations(updated)
  }
  const addRowToOp = (opIndex: number) => { const updated = [...operations]; updated[opIndex].rows.push({ type: 'O', text: '' }); setOperations(updated) }
  const handleRowChange = (opIndex: number, rowIndex: number, value: string) => {
    const updated = [...operations]; updated[opIndex].rows[rowIndex].text = value; setOperations(updated)
  }

  // Отправка (POST) формы бэкенду
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusMessage('')

    const payload = {
      id: selectedCardId, 
      document_info: { gost: "3.1118-82", form: "1", document_number: docNumber },
      header: { part_name: partName, material: material, mass_kg: parseFloat(mass) || 0, profile_size: profileSize },
      operations: operations
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
        await loadCardsList()
        if (result.data) setSelectedCardId(result.data.id)
      } else {
        setStatusMessage(`Ошибка: ${result.error}`)
      }
    } catch (err) { setStatusMessage('Ошибка сети при отправке') } finally { setLoading(false) }
  }

  // Клиентский фильтр перечня техкарт по номеру документа
  const filteredCardsList = cardsList.filter(card =>
    card.documentNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )
    return (
    <main className="min-h-screen bg-gray-50 flex text-black">
      
      {/* ЛЕВАЯ ЧАСТЬ: ОСНОВНАЯ ФОРМА ТЕХКАРТЫ */}
      <div className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
          
          {/* Контейнер с относительным позиционированием для разжатия заголовка */}
          <div className="relative flex items-center justify-center w-full mb-6">
            
            {/* Ваше название без изменений — теперь оно занимает всю ширину и не сжимается */}
            <h1 className="text-xl font-bold text-center text-gray-800">
              Технологическая карта (ГОСТ 3.1118-82)
            </h1>

            {/* Кнопка намертво прижимается к правому краю, не мешая заголовку */}
            <div className="absolute right-0">
              {/* Ваша кнопка без единого изменения в коде */}
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
                <div key={opIdx} className="border border-gray-200 px-4 rounded space-y-3 bg-white shadow-sm relative">
                  <div className="flex justify-between items-center w-full">
                    <button type="button" onClick={addOperation} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 my-2 rounded transition">
                      + Добавить операцию
                    </button>
                    {/* КНОПКА УДАЛЕНИЯ ОПЕРАЦИИ */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = operations.filter((_, i) => i !== opIdx)
                        setOperations(updated)
                      }}
                      className=" top-3 right-3 text-gray-400 hover:text-red-600 text-xs font-semibold border border-transparent hover:border-red-200 hover:bg-red-50 px-2 py-0.5 rounded transition"
                      title="Удалить операцию полностью"
                    >
                      Удалить операцию ×
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-4">
                    <div>
                      <label className="block text-xs text-gray-400">№ Оп.</label>
                      <input type="text" placeholder="010" value={op.operation_number} onChange={e => handleOpChange(opIdx, 'operation_number', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" required />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-400">Название операции</label>
                      <input type="text" placeholder="Токарная" value={op.operation_name} onChange={e => handleOpChange(opIdx, 'operation_name', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" required />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400">Рабочее место</label>
                      <input type="text" value={op.workplace} onChange={e => handleOpChange(opIdx, 'workplace', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400">Оборудование</label>
                      <input type="text" value={op.equipment} onChange={e => handleOpChange(opIdx, 'equipment', e.target.value)} className="w-full p-2 border rounded text-sm bg-white" />
                    </div>
                  </div>

                  {/* Блок переходов (строк) внутри конкретной операции */}
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
                        
                        {/* КНОПКА УДАЛЕНИЯ КОНКРЕТНОГО ПЕРЕХОДА */}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...operations]
                            updated[opIdx].rows = updated[opIdx].rows.filter((_, rI) => rI !== rowIdx)
                            setOperations(updated)
                          }}
                          className="text-gray-400 hover:text-red-500 text-xs font-bold px-1.5 py-1 hover:bg-gray-100 rounded transition"
                          title="Удалить строку перехода"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* КНОПКА СОХРАНЕНИЯ В БД */}
            <div className="pt-4 border-t flex flex-col items-center gap-3">
              <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition disabled:bg-gray-400">
                {loading ? 'Сохранение...' : selectedCardId ? 'Сохранить изменения (Перезаписать)' : 'Создать карту в БД'}
              </button>
              {statusMessage && (
                <p className={`text-sm font-medium ${statusMessage.includes('Ошибка') ? 'text-red-600' : 'text-green-600'}`}>
                  {statusMessage}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: ПЕРЕЧЕНЬ ТЕХКАРТ С ИНПУТОМ ФИЛЬТРАЦИИ И КНОПКОЙ ОЧИСТКИ */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col justify-between shadow-sm max-h-screen sticky top-0">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Перечень техкарт</h2>
            <button onClick={startNewCard} className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition">
              Новый бланк
            </button>
          </div>

          {/* ПОЛЕ ФИЛЬТРАЦИИ С КНОПКОЙ СБРОСА ФИЛЬТРА ✕ */}
          <div className="mb-4 relative flex items-center">
            <input
              type="text"
              placeholder="Поиск по номеру документа..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pr-8 border border-gray-300 rounded text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-gray-400 hover:text-gray-600 text-sm font-bold focus:outline-none"
                title="Очистить фильтр"
              >
                ✕
              </button>
            )}
          </div>

          {/* ДИНАМИЧЕСКИЙ СПИСОК КАРТ С ФИЛЬТРОМ И ЗАГРУЗКОЙ ПО КЛИКУ */}
          <div className="space-y-1 overflow-y-auto max-h-[75vh] pr-1">
            {filteredCardsList.length > 0 ? (
              filteredCardsList.map((card) => (
                <button
                  key={card.id}
                  onClick={() => loadSingleCard(card.id)}
                  className={`w-full text-left p-2.5 rounded text-xs border transition flex flex-col gap-0.5 ${
                    selectedCardId === card.id
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                      : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="truncate font-mono opacity-80 font-bold">{card.documentNumber || 'Без номера'}</span>
                  <span className="truncate text-gray-500">{card.partName || 'Без названия'}</span>
                </button>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Документы не найдены</p>
            )}
          </div>
        </div>
        <div className="text-[10px] text-gray-400 text-center border-t pt-2">БД: PostgreSQL в Docker</div>
      </div>
    </main>
  )
}
