'use client';

import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { GostReportTemplate, RouteCardData } from './GostReportTemplate';

interface ReportViewerProps {
  reportData: RouteCardData;
}

export default function ReportViewer({ reportData }: ReportViewerProps) {
  return (
    <div style={{ width: '100%', height: '85vh', marginTop: '20px' }}>
      <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
        <GostReportTemplate data={reportData} />
      </PDFViewer>
    </div>
  );
}
