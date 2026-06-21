'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { RouteCardData } from './GostReportTemplate';

// Переносим динамический импорт сюда, где он разрешен
const ReportViewer = dynamic(
  () => import('./ReportViewer'),
  { ssr: false, loading: () => <p style={{ padding: '20px' }}>Загрузка генератора отчетов...</p> }
);

interface ClientReportWrapperProps {
  reportData: RouteCardData;
}


export default function ClientReportWrapper({ reportData }: ClientReportWrapperProps) {
  return <ReportViewer reportData={reportData} />;
}
