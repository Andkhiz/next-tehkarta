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
        where: { 
          id: parseInt(cardId) 
        },
        include: {
          operations: {
            orderBy: { order: 'asc' as const },
            include: {
              rows: {
                orderBy: { order: 'asc' as const },
                // КРИТИЧЕСКИ ВАЖНО: инструменты внутри rows ВСЕГДА лежат в include!
                include: {
                  cuttingTools: {
                    orderBy: { order: 'asc' as const },
                    include: { cuttingTool: true }
                  },
                  measuringTools: {
                    orderBy: { order: 'asc' as const },
                    include: { measuringTool: true }
                  }
                }
              }
            }
          }
        }
      });

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
    const { id, header, document_info, operations } = body

    // Данные для записи/обновления шапки
    const cardData = {
      documentNumber: document_info.document_number,
      partName: header.part_name,
      material: header.material,
      massKg: Number(header.mass_kg),
      massZagKg: Number(header.mass_zag_kg),
      profileSize: header.profile_size,
    }

    // Хелпер для маппинга операций, адаптированный под новую схему Prisma
    const mapOperations = (ops: any[]) => {
      return ops.map((op: any, opIdx: number) => ({
        operationNumber: op.operation_number || op.operationNumber,
        operationName: op.operation_name || op.operationName,
        workplace: op.workplace || null,
        equipment: op.equipment || null,
        order: opIdx,
        
        // Сохраняем норму времени
        nv: op.nv !== undefined && op.nv !== null ? Number(op.nv) : null,
        
        // Инструменты из корня операции удалены. 
        // Теперь они создаются вложенными элементами внутри каждой строки:
        rows: {
          create: (op.rows || []).map((row: any, rowIdx: number) => ({
            rowType: row.type || row.rowType || 'O',
            text: row.text,
            order: rowIdx,
            
            // Создаем связи с режущими инструментами ДЛЯ КОНКРЕТНОЙ СТРОКИ
            cuttingTools: {
              create: (row.cuttingTools || [])
                .filter((ct: any) => ct.cuttingToolId || ct.id)
                .map((ct: any, toolIdx: number) => ({ // <--- Добавили индекс
                  order: toolIdx,                     // <--- Записываем порядок в базу
                  cuttingTool: {
                    connect: { id: Number(ct.cuttingToolId || ct.id) }
                  }
                }))
            },
            // Создаем связи с мерительными инструментами ДЛЯ КОНКРЕТНОЙ СТРОКИ
            measuringTools: {
              create: (row.measuringTools || [])
                .filter((mt: any) => mt.measuringToolId || mt.id)
                .map((mt: any, toolIdx: number) => ({ // <--- Добавили индекс
                  order: toolIdx,                     // <--- Записываем порядок в базу
                  measuringTool: {
                    connect: { id: Number(mt.measuringToolId || mt.id) }
                  }
                }))
            }
          }))
        }
      }))
    }

    // Обновленный блок include для возвращаемого ответа.
    // Вытягивает строки и рекурсивно подтягивает каталоги инструментов для каждой строки.
    const commonInclude = {
      operations: {
        orderBy: { order: 'asc' as const },
        include: {
          rows: {
            orderBy: { order: 'asc' as const },
            include: {
              cuttingTools: { 
                orderBy: { order: 'asc' as const }, 
                include: { cuttingTool: true }  
              },
              measuringTools: { 
                orderBy: { order: 'asc' as const }, 
                include: { measuringTool: true }  
              }
            }
          }
        }
      }
    }

    // ЕСЛИ ID СУЩЕСТВУЕТ — ОБНОВЛЯЕМ ТЕКУЩУЮ КАРТУ
    if (id) {
      // 1. Каскадно удаляем старые операции
      // Благодаря onDelete: Cascade в схеме, все старые строки и их инструменты очистятся автоматически!
      await prisma.operation.deleteMany({ where: { routeCardId: Number(id) } })

      // 2. Обновляем шапку и создаем новые операции с глубоко вложенными строками и инструментами
      const updatedCard = await prisma.routeCard.update({
        where: { id: Number(id) },
        data: {
          ...cardData,
          operations: {
            create: mapOperations(operations)
          }
        },
        include: commonInclude
      })

      return NextResponse.json({ success: true, data: updatedCard })
    }

    // ЕСЛИ ID НЕТ — СОЗДАЕМ НОВУЮ КАРТУ С НУЛЯ
    const savedCard = await prisma.routeCard.create({
      data: {
        ...cardData,
        operations: {
          create: mapOperations(operations)
        }
      },
      include: commonInclude
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

