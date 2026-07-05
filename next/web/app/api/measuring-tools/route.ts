import { NextResponse } from 'next/server';
import { prisma } from '../../db'; // <-- Использован ваш синглтон

// Получить все инструменты для справочника (только ID и наименование)
export async function GET() {
  try {
    const tools = await prisma.measuringToolCatalog.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(tools);
  } catch (error) {
    console.error('Ошибка в API роуте (GET):', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// Добавить новый инструмент в справочник
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Наименование обязательно' }, { status: 400 });
    }

    const newTool = await prisma.measuringToolCatalog.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(newTool);
  } catch (error) {
    console.error('Ошибка в API роуте (POST):', error);
    // Перехват ошибки уникальности Prisma (поле name помечено как @unique)
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Инструмент с таким наименованием уже существует' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ошибка при создании записи' }, { status: 500 });
  }
}

// Изменить или удалить инструмент
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, isDelete } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID инструмента обязателен' }, { status: 400 });
    }

    // Если пришел флаг удаления
    if (isDelete) {
      await prisma.measuringToolCatalog.delete({
        where: { id: Number(id) },
      });
      return NextResponse.json({ success: true });
    }

    // Валидация для изменения имени
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Наименование обязательно' }, { status: 400 });
    }

    const updatedTool = await prisma.measuringToolCatalog.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(updatedTool);
  } catch (error) {
    console.error('Ошибка в API роуте (PUT):', error);
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Инструмент с таким наименованием уже существует' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ошибка при actualización записи' }, { status: 500 });
  }
}
