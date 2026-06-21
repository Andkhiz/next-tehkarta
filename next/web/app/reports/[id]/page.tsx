import React from 'react';
import { notFound } from 'next/navigation';
import ClientReportWrapper from '../../components/ClientReportWrapper';
import { RouteCardData } from '../../components/GostReportTemplate';
// Импортируем ваш существующий клиент Prisma. 
// Если путь отличается, замените на ваш (например, import prisma from '@/lib/prisma')
import { prisma } from '../../db'; 

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportsPage({ params }: PageProps) {
  // 1. Получаем ID из параметров адресной строки
  const resolvedParams = await params;
  const cardId = parseInt(resolvedParams.id, 10);

  if (isNaN(cardId)) {
    return notFound();
  }

  // 2. Делаем запрос в базу данных PostgreSQL через Prisma
  const routeCard = await prisma.routeCard.findUnique({
    where: { id: cardId },
    include: {
      operations: {
        orderBy: { order: 'asc' },
        include: {
          rows: { orderBy: { order: 'asc' } }
        }
      }
    }
  });

  // Если такой карты нет в базе данных, возвращаем 404 ошибку
  if (!routeCard) {
    return notFound();
  }

  // Приводим тип из Prisma к интерфейсу нашего шаблона
  const reportData = routeCard as unknown as RouteCardData;

  // 3. Отдаем данные в визуальную обертку отчета
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
        Маршрутная карта № {reportData.documentNumber}
      </h1>
      
      <ClientReportWrapper reportData={reportData} />
    </div>
  );
}
