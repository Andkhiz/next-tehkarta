import React from 'react';
import { notFound } from 'next/navigation';
import ClientReportWrapper from '../../components/ClientReportWrapper';
import { RouteCardData } from '../../components/GostReportTemplate';
import { prisma } from '../../db'; 

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReportsPage({ params, searchParams }: PageProps) {
  // 1. Получаем ID из параметров адресной строки
  const resolvedParams = await params;
  const cardId = parseInt(resolvedParams.id, 10);
  const resolvedSearchParams = await searchParams;
  const reportType = resolvedSearchParams.type as string | undefined;
  const isKTP = reportType === 'ktp';

  if (isNaN(cardId)) {
    return notFound();
  }

  // 2. Делаем глубокий запрос в БД с сортировкой по order
  const routeCard = await prisma.routeCard.findUnique({
    where: { id: cardId },
    include: {
      operations: {
        orderBy: { order: 'asc' as const },
        include: {
          rows: { 
            orderBy: { order: 'asc' as const },
            // КРИТИЧЕСКИ ВАЖНО: Тянем мерительные и режущие инструменты для каждой строки отчёта
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

  // Если такой карты нет в базе данных, возвращаем 404 ошибку
  if (!routeCard) {
    return notFound();
  }

  // Приводим тип из Prisma к интерфейсу нашего шаблона
  const reportData = routeCard as unknown as RouteCardData;

  // 3. Отдаем обогащенные данными инструменты в визуальную обертку отчета
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
        Маршрутная карта № {reportData.documentNumber}
      </h1>
      
      <ClientReportWrapper reportData={reportData} reportType={reportType || 'mk'}/>
    </div>
  );
}
