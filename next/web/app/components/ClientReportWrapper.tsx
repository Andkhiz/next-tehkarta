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
  reportType: string; 
}


export default function ClientReportWrapper({ reportData, reportType }: ClientReportWrapperProps) {
  return <ReportViewer reportData={reportData} reportType={reportType}/>;
}
