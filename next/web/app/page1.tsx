// web/app/page.tsx
'use client'

import { useState } from 'react'

interface OperationRow {
  type: string
  text: string
}

interface Operation {
  operation_number: string
  operation_name: string
  workplace: string
  equipment: string
  rows: OperationRow[]
}

export default function Home() {
  // Состояние для шапки
  const [docNumber, setDocNumber] = useState('37846036.01100.0011.143')
  const [partName, setPartName] = useState('СТРИЖЕНЬ')
  const [material, setMaterial] = useState('Сталь 35 ГОСТ 1051-73')
  const [mass, setMass] = useState('4.53')
  const [profileSize, setProfileSize] = useState('Ø20 L=1873')

  // Состояние для списка операций (по умолчанию добавляем одну пустую)
  const [operations, setOperations] = useState<Operation[]>([
    {
      operation_number: '005',
      operation_name: 'Вхідний контроль',
      workplace: 'Робоче місце ВТК',
      equipment: '',
      rows: [{ type: 'O', text: 'Перевірити сертифікат на матеріал' }]
    }
  ])

  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  // Функции для динамического изменения операций
  const addOperation = () => {
    setOperations([...operations, { operation_number: '', operation_name: '', workplace: '', equipment: '', rows: [] }])
  }

  const handleOpChange = (index: number, field: keyof Operation, value: string) => {
    const updated = [...operations]
    updated[index] = { ...updated[index], [field]: value }
    setOperations(updated)
  }

  const addRowToOp = (opIndex: number) => {
    const updated = [...operations]
    updated[opIndex].rows.push({ type: 'O', text: '' })
    setOperations(updated)
  }

  const handleRowChange = (opIndex: number, rowIndex: number, value: string) => {
    const updated = [...operations]
    updated[opIndex].rows[rowIndex].text = value
    setOperations(updated)
  }

  // Отправка JSON на наш бэкенд API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusMessage('')

    // Формируем структуру JSON, которую требует наш API
    const payload = {
      document_info: {
        gost: "3.1118-82",
        form: "1",
        document_number: docNumber
      },
      header: {
        part_name: partName,
        material: material,
        mass_kg: parseFloat(mass) || 0,
        profile_size: profileSize
      },
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
      } else {
        setStatusMessage(`Ошибка: ${result.error}`)
      }
    } catch (err) {
      setStatusMessage('Ошибка сети при отправке запроса')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-2 text-black">
      <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-xl font-bold  mb-2 text-center text-gray-800">
          Технологическая карта (ГОСТ 3.1118-82)
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* БЛОК ШАПКИ */}
          <div className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded border">
            <div>
              <label className="block text-xs text-gray-500">Номер документа</label>
              <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} className="w-full p-2 border rounded bg-white text-sm" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Наименование детали</label>
              <input type="text" value={partName} onChange={e => setPartName(e.target.value)} className="w-full p-2 border rounded bg-white text-sm" required />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500">Материал</label>
              <input type="text" value={material} onChange={e => setMaterial(e.target.value)} className="w-full p-2 border rounded bg-white text-sm" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Масса (кг)</label>
              <input type="number" step="0.01" value={mass} onChange={e => setMass(e.target.value)} className="w-full p-2 border rounded bg-white text-sm" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Профиль и размеры</label>
              <input type="text" value={profileSize} onChange={e => setProfileSize(e.target.value)} className="w-full p-2 border rounded bg-white text-sm" required />
            </div>
          </div>

          {/* БЛОК ОПЕРАЦИЙ */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">Технологические операции</h2>
              <button type="button" onClick={addOperation} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                + Добавить операцию
              </button>
            </div>

            {operations.map((op, opIdx) => (
              <div key={opIdx} className="border p-4 rounded space-y-3 bg-white relative shadow-sm">
                <div className="grid grid-cols-4 gap-2">
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

                {/* Внутренние строки (Переходы О) */}
                <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">Содержимое (Строки О/Т/М):</span>
                    <button type="button" onClick={() => addRowToOp(opIdx)} className="text-xs text-blue-600 hover:underline">
                      + Добавить переход/строку
                    </button>
                  </div>
                  {op.rows.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex gap-2 items-center">
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">О</span>
                      <input type="text" placeholder="Подрезать торец, обточить поверхность..." value={row.text} onChange={e => handleRowChange(opIdx, rowIdx, e.target.value)} className="w-full p-1.5 border rounded text-xs bg-white" required />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* КНОПКА ОТПРАВКИ */}
          <div className="pt-4 border-t flex flex-col items-center gap-3">
            <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition disabled:bg-gray-400">
              {loading ? 'Сохранение...' : 'Сформировать JSON и отправить в БД'}
            </button>
            {statusMessage && (
              <p className={`text-sm font-medium ${statusMessage.includes('Ошибка') ? 'text-red-600' : 'text-green-600'}`}>
                {statusMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}
