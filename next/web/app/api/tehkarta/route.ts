// web/app/api/tehkarta/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/app/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cardId = searchParams.get('id')

    // 1. Если запросили конкретную карту по ID
    if (cardId) {
      const card = await prisma.routeCard.findUnique({
        where: { id: parseInt(cardId) },
        include: {
          operations: {
            include: { rows: true },
            orderBy: { order: 'asc' }
          }
        }
      })
      return NextResponse.json({ success: true, data: card })
    }

    // 2. Если ID нет — отдаем краткий список всех карт для меню
    const allCards = await prisma.routeCard.findMany({
      select: {
        id: true,
        documentNumber: true,
        partName: true,
      },
      orderBy: { createdAt: 'desc' } // Свежие сверху
    })

    return NextResponse.json({ success: true, data: allCards })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Добавляем id из тела запроса (если он передан с фронтенда)
    const { id, header, document_info, operations } = body

    // Данные для записи/обновления шапки
    const cardData = {
      documentNumber: document_info.document_number,
      partName: header.part_name,
      material: header.material,
      massKg: Number(header.mass_kg),
      profileSize: header.profile_size,
    }

    // ЕСЛИ ID СУЩЕСТВУЕТ — ОБНОВЛЯЕМ ТЕКУЩУЮ КАРТУ
    if (id) {
      // 1. Удаляем старые связанные операции и строки, чтобы записать новые актуальные
      await prisma.operation.deleteMany({ where: { routeCardId: id } })

      // 2. Обновляем шапку и создаем новые операции внутри нее
      const updatedCard = await prisma.routeCard.update({
        where: { id: Number(id) },
        data: {
          ...cardData,
          operations: {
            create: operations.map((op: any, opIdx: number) => ({
              operationNumber: op.operation_number,
              operationName: op.operation_name,
              workplace: op.workplace || null,
              equipment: op.equipment || null,
              order: opIdx,
              rows: {
                create: (op.rows || []).map((row: any, rowIdx: number) => ({
                  rowType: row.type,
                  text: row.text,
                  order: rowIdx
                }))
              }
            }))
          }
        },
        include: { operations: { include: { rows: true } } }
      })

      return NextResponse.json({ success: true, data: updatedCard })
    }

    // ЕСЛИ ID НЕТ — СОЗДАЕМ НОВУЮ КАРТУ С НУЛЯ (Ваш старый код)
    const savedCard = await prisma.routeCard.create({
      data: {
        ...cardData,
        operations: {
          create: operations.map((op: any, opIdx: number) => ({
            operationNumber: op.operation_number,
            operationName: op.operation_name,
            workplace: op.workplace || null,
            equipment: op.equipment || null,
            order: opIdx,
            rows: {
              create: (op.rows || []).map((row: any, rowIdx: number) => ({
                rowType: row.type,
                text: row.text,
                order: rowIdx
              }))
            }
          }))
        }
      },
      include: { operations: { include: { rows: true } } }
    })

    return NextResponse.json({ success: true, data: savedCard }, { status: 201 })

  } catch (error: any) {
    console.error("Ошибка БД:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Ошибка сервера" }, 
      { status: 500 }
    )
  }
}
