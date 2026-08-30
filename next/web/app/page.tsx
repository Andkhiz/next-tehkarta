'use client'

import { useState, useEffect } from 'react'
import { TechCardFormBody } from './components/TechCardFormBody';
import { TechCardSidebar } from './components/TechCardSidebar';

// 1. Полные интерфейсы для типизации с учетом новых полей и таблиц-справочников
import { Operation, CardListItem, ToolCatalogItem } from './types/types';



export default function Home() {
  // Состояния для перечня документов и фильтра
  const [cardsList, setCardsList] = useState<CardListItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)

  // Справочник режущего инструмента (подгружается автоматически с сервера)
  const [cuttingCatalog, setCuttingCatalog] = useState<ToolCatalogItem[]>([])
  const [isMeasuringCatalogOpen, setIsMeasuringCatalogOpen] = useState(false);


  // Состояния для полей формы технологической карты (Шапка)
  const [docNumber, setDocNumber] = useState('')
  const [partName, setPartName] = useState('')
  const [material, setMaterial] = useState('')
  const [mass, setMass] = useState('')
  const [massZag, setMassZag] = useState('')
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
        setMassZag(card.massZagKg.toString())
        setProfileSize(card.profileSize)
        
        // Маппим данные из структуры БД (camelCase) в структуру формы (snake_case + nv)
        setOperations(card.operations.map((op: any) => ({
          operation_number: op.operationNumber,
          operation_name: op.operationName,
          workplace: op.workplace || '',
          equipment: op.equipment || '',
          nv: op.nv !== null && op.nv !== undefined ? op.nv.toString() : '',
          rows: op.rows.map((r: any) => ({ 
            type: r.rowType, 
            text: r.text,
            // Переносим инструменты внутрь конкретной строки, куда их прислала БД:
            cuttingTools: r.cuttingTools || [],
            measuringTools: r.measuringTools || []
          }))
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
        //await loadCuttingCatalog() // Сначала загружаем справочник инструментов
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
    setMassZag('')
    setProfileSize('')
    setOperations([{ 
      operation_number: '005', 
      operation_name: 'Вхідний контроль', 
      workplace: '', 
      equipment: '', 
      nv: '', 
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
      rows: [] 
    }
  ])

  // Обновление текстовых полей и массивов инструментов внутри операции
  const handleOpChange = (index: number, field: string, value: any) => {
    const updated = [...operations]; 
    updated[index] = { ...updated[index], [field]: value }; 
    setOperations(updated);
  };

  // Добавление новой строки перехода "О" к конкретной операции
  const addRowToOp = (opIndex: number) => { 
    const updated = [...operations]; 
    updated[opIndex].rows.push({ type: 'O', text: '', cuttingTools: [], measuringTools: [] }); 
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
      header: { part_name: partName, material: material, mass_kg: parseFloat(mass) || 0, mass_zag_kg: parseFloat(massZag) || 0, profile_size: profileSize },
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

  // Изменение порядка строк переходов внутри конкретной операции
const handleRowDrop = (opIndex: number, result: any) => {
  // Если элемент сбросили вне рабочей зоны droppable
  if (!result.destination) return

  const sourceIdx = result.source.index
  const destIdx = result.destination.index

  // Если элемент сбросили на то же самое место
  if (sourceIdx === destIdx) return

  const updatedOps = [...operations]
  const rows = [...updatedOps[opIndex].rows]

  // Удаляем перемещаемый элемент из старой позиции и вставляем в новую
  const [movedRow] = rows.splice(sourceIdx, 1)
  rows.splice(destIdx, 0, movedRow)

  // Обновляем состояние
  updatedOps[opIndex].rows = rows
  setOperations(updatedOps)
}


  // Фильтрация архива на клиенте
  const filteredCardsList = cardsList.filter(card =>
    card.documentNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gray-50 flex text-black">
      
      {/* ЛЕВАЯ ЧАСТЬ: ОСНОВНАЯ ФОРМА ТЕХКАРТЫ (ВЫНЕСЕНА) */}
      <TechCardFormBody 
        docNumber={docNumber} setDocNumber={setDocNumber}
        partName={partName} setPartName={setPartName}
        material={material} setMaterial={setMaterial}
        mass={mass} setMass={setMass}
        massZag={massZag} setMassZag={setMassZag}
        profileSize={profileSize} setProfileSize={setProfileSize}
        selectedCardId={selectedCardId}
        operations={operations} setOperations={setOperations}
        statusMessage={statusMessage}
        loading={loading}
        handleSubmit={handleSubmit}
        addOperation={addOperation}
        handleOpChange={handleOpChange}
        addRowToOp={addRowToOp}
        handleRowDrop={handleRowDrop}
        handleRowChange={handleRowChange}
        startNewCard={startNewCard}
      />

      {/* ПРАВАЯ ЧАСТЬ: МЕНЮ СПИСКА ТЕХКАРТ */}
      <TechCardSidebar 
        setIsMeasuringCatalogOpen={setIsMeasuringCatalogOpen}
        isMeasuringCatalogOpen={isMeasuringCatalogOpen}
        startNewCard={startNewCard}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredCardsList={filteredCardsList}
        loadSingleCard={loadSingleCard}
        selectedCardId={selectedCardId}
      />


    </main>
  )
}
