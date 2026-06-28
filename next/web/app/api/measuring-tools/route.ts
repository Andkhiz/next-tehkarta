import { NextResponse } from 'next/server';
import { prisma } from '../../db'; // <--- Импортируем синглтон (поднимаемся на два уровня вверх из папки api/measuring-tools)

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
    console.error('Ошибка в API роуте:', error); // Выводим ошибку в консоль, чтобы видеть детали
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
