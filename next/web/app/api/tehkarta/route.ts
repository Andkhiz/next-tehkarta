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
            orderBy: { order: 'asc' },
            include: { 
              rows: true,
              // Добавляем загрузку режущих инструментов из связующей таблицы и справочника
              cuttingTools: {
                include: {
                  cuttingTool: true
                }
              },
              
              // Добавляем загрузку мерительных инструментов из связующей таблицы и справочника
              measuringTools: {
                include: {
                  measuringTool: true
                }
              }
            },
            
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

    // Хелпер для маппинга операций, чтобы не дублировать код для создания и обновления
    const mapOperations = (ops: any[]) => {
      return ops.map((op: any, opIdx: number) => ({
        operationNumber: op.operation_number || op.operationNumber,
        operationName: op.operation_name || op.operationName,
        workplace: op.workplace || null,
        equipment: op.equipment || null,
        order: opIdx,
        
        // 1. Сохраняем норму времени (приводим к числу или пишем null)
        nv: op.nv !== undefined && op.nv !== null ? Number(op.nv) : null,
        
        // 2. Создаем связи с режущими инструментами
        cuttingTools: {
          create: (op.cuttingTools || []).map((ct: any) => ({
            cuttingTool: {
              connect: { id: Number(ct.cuttingToolId || ct.id) }
            }
          }))
        },

        // 3. Создаем связи с мерительными инструментами
        measuringTools: {
          create: (op.measuringTools || []).map((mt: any) => ({
            measuringTool: {
              connect: { id: Number(mt.measuringToolId || mt.id) }
            }
          }))
        },

        rows: {
          create: (op.rows || []).map((row: any, rowIdx: number) => ({
            rowType: row.type || row.rowType,
            text: row.text,
            order: rowIdx
          }))
        }
      }))
    }

    // Блок include для возвращаемого ответа, чтобы фронтенд сразу получал актуальное состояние
    const commonInclude = {
      operations: {
        orderBy: { order: 'asc' as const },
        include: {
          rows: true,
          cuttingTools: { include: { cuttingTool: true } },
          measuringTools: { include: { measuringTool: true } }
        }
      }
    }

    // ЕСЛИ ID СУЩЕСТВУЕТ — ОБНОВЛЯЕМ ТЕКУЩУЮ КАРТУ
    if (id) {
      // 1. Каскадно удаляем старые операции (инструменты и строки сотрутся автоматически благодаря onDelete: Cascade)
      await prisma.operation.deleteMany({ where: { routeCardId: Number(id) } })

      // 2. Обновляем шапку и создаем новые операции со связями
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
