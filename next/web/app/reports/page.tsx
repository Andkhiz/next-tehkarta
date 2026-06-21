import React from 'react';
import ClientReportWrapper from '../components/ClientReportWrapper';
import { RouteCardData } from '../components/GostReportTemplate';

export default async function ReportsPage() {
  // Временные статические данные для проверки отображения
  const sampleData: RouteCardData = {
    id: 2,
    documentNumber: "222",
    partName: "Деталь 222",
    material: "Сталь 45 ГОСТ 1051-73",
    massKg: 222,
    profileSize: "Круг Ø20 L=1873",
    createdAt: "2026-06-18T18:48:54.737Z",
    operations: [
      {
        id: 4,
        routeCardId: 2,
        operationNumber: "005",
        operationName: "Вхідний контроль",
        workplace: "Робоче місце ВТК",
        equipment: "Стенд контроля",
        order: 0,
        rows: [
          { id: 4, operationId: 4, rowType: "O", text: "01. Перевірити сертифікат на матеріал", order: 0 },
          { id: 5, operationId: 4, rowType: "O", text: "02. Контроль геометричних розмірів", order: 1 }
        ]
      },
      {
        id: 5,
        routeCardId: 2,
        operationNumber: "010",
        operationName: "Токарна з ЧПК",
        workplace: "Слюсарний стіл",
        equipment: "DOOSAN PUMA",
        order: 1,
        rows: [
          { id: 7, operationId: 5, rowType: "O", text: "01. Токарна операція за контуром", order: 0 },
          { id: 8, operationId: 5, rowType: "O", text: "02. Зачистити заусенці", order: 1 }
        ]
      }
    ]
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Маршрутные карты техпроцесса</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>Документ сформирован из базы данных PostgreSQL</p>
      
      {/* Передаем данные в клиентскую обертку */}
      <ClientReportWrapper reportData={sampleData} />
    </div>
  );
}
