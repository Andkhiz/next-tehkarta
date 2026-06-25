import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Регистрируем шрифты для поддержки кириллицы
Font.register({
  family: 'Roboto',
  src: '/fonts/Roboto-Regular.ttf',
  fontWeight: 'normal',
});
Font.register({
  family: 'RobotoBold',
  src: '/fonts/Roboto-Bold.ttf',
  fontWeight: 'bold',
});
Font.register({
  family: 'Times New Roman',
  src: '/fonts/times.ttf',
  fontWeight: 'normal',
});
Font.register({
  family: 'Times New Roman Bold',
  src: '/fonts/timesbd.ttf',
  fontWeight: 'bold',
});

// Описываем типы (интерфейсы) под ваш JSON
export interface ReportRow {
  id: number;
  operationId: number;
  rowType: string;
  text: string;
  order: number;
}

export interface ReportOperation {
  id: number;
  routeCardId: number;
  operationNumber: string;
  operationName: string;
  workplace: string;
  equipment: string;
  nv?: number | null; // НОВОЕ ПОЛЕ: Норма времени из БД (число или null)
  order: number;
  rows: ReportRow[];
}

export interface RouteCardData {
  id: number;
  documentNumber: string;
  partName: string;
  material: string;
  massKg: number;
  profileSize: string;
  createdAt: string;
  operations: ReportOperation[];
}

interface GostReportTemplateProps {
  data: RouteCardData;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28.35,     // Верхнее поле (1 см)
    paddingBottom: 28.35, // Нижнее поле (1 см)
    paddingLeft: 56.7,   // Левое поле (2 см)
    paddingRight: 37.14,  // Правое поле (1.31 см)
    fontFamily: 'Times New Roman',
    fontSize: 12,
  },
  // Базовая ячейка ГОСТа с прозрачной рамкой со всех сторон
  fullWidthTransparentRow: {
    width: '100%',
    flexDirection: 'row',
    borderWidth: 0,        // Полностью убираем границы
    borderColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 2,
    justifyContent: 'center',
    height: '100%',
  },
  cellCenter: {
    textAlign: 'center',
  },
  textBold: {
    fontFamily: 'RobotoBold',
  },
  
  // Контейнер ГОСТ шапки — теперь он создает только внешнюю верхнюю и левую рамку
  gostHeaderContainer: {
    width: '100%',
    borderTopWidth: 0,
    borderLeftWidth: 1,
    marginBottom: 10,
  },
  gostRow: {
    flexDirection: 'row',
    height: 14, // Немного увеличили высоту, чтобы текст не обрезался
  },
  gostRowDouble: {
    flexDirection: 'row',
    height: 28, // Высокая строка для подписей Разраб/Перевир
  },
    
  // Идеальные проценты колонок, подогнанные под сумму 100% в каждой строке
  w3:  { width: '3%' },
  w4:  { width: '4%' },
  w5:  { width: '5%' },
  w6:  { width: '6%' },
  w7:  { width: '7%' },
  w8:  { width: '8%' },
  w10: { width: '10%' },
  w11: { width: '11%' },
  w12: { width: '12%' },
  w14: { width: '14%' },
  w15: { width: '15%' },
  w20: { width: '20%' },
  w25: { width: '25%' },
  w30: { width: '30%' },
  w35: { width: '35%' },
  w40: { width: '40%' },
  w45: { width: '45%' },
  w50: { width: '50%' },
  w55: { width: '55%' },
  w60: { width: '60%' },
  w65: { width: '65%' },
  w70: { width: '70%' },
  w75: { width: '75%' },

  // Таблица техпроцесса
  table: {
    width: '100%',
    borderLeftWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    fontFamily: 'RobotoBold',
  },
  operationBlock: {},
  rowA: { flexDirection: 'row', height: 14 },
  rowB: { flexDirection: 'row', height: 14 },
  colType: { width: '4%', textAlign: 'center', fontFamily: 'RobotoBold' },
  colNum:  { width: '6%', textAlign: 'center' },
  colName: { width: '25%' },
  colText: { width: '45%' },
  colInfo: { width: '20%' },
  pageFooter: {
    position: 'absolute',
    bottom: 15,
    right: 20,
    fontSize: 8,
    color: '#555',
  },
  
  gostTable: {
    width: '100%',
    padding: 0,
    margin: 0,
  },
  gostCell: {
    borderRightWidth: 1,  // Каждая стандартная ячейка сама рисует свои линии
    borderBottomWidth: 1, 
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    flexShrink: 0,
    flexGrow: 0
  },
  gostCellLeft: {
    borderRightWidth: 1,  // Каждая стандартная ячейка сама рисует свои линии
    borderBottomWidth: 1, 
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 6,
    height: '100%',
  },
  // Стиль для полностью прозрачной ячейки промежутка
  transparentCellRB: {
    borderRightWidth: 0,  // Никаких линий справа
    borderBottomWidth: 0, // Никаких линий снизу
    padding: 0,
    height: '100%',
  },
  transparentCellR: {
    borderRightWidth: 0,  // Никаких линий справа
    borderBottomWidth: 1, 
    padding: 0,
    height: '100%',
  },
  transparentCellB: {
    borderRightWidth: 1,  // Никаких линий справа
    borderBottomWidth: 0, 
    padding: 0,
    height: '100%',
  },
  transparentCell: {
    borderRightWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
    margin: 0,
    height: '100%',
  },
  processHeaderRow: {
    flexDirection: 'row',
    fontFamily: 'Times New Roman',
  },
  processRow: {
    flexDirection: 'row',
  },
  processCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    flexShrink: 0,
    flexGrow: 0
  },
  processCellB: {
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    flexShrink: 0,
    flexGrow: 0
  },
});

const cm = (value: number) => value * 28.35;

export const GostReportTemplate: React.FC<GostReportTemplateProps> = ({ data }) => {
  if (!data) return null;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        
        {/* ================= СТРОГАЯ ГОСТ-ШАПКА (ФОРМА 1) ================= */}
        <View style={{ borderLeftWidth: 0, borderBottomWidth: 0, borderColor: '#000', marginTop: -1 }}  fixed>
          
          {/* Индекс ГОСТа сверху справа */}
          <View style={[styles.fullWidthTransparentRow, {paddingRight: 8}]}>
            <Text style={{ width: '100%', fontSize: 12, textAlign: 'right' }}>
                ГОСТ 3.1118-82 Форма 1
            </Text>
          </View>
           {/* Пустая строка*/}

          <View style={styles.gostTable}>
            {/* Строка 0 — Пустая строка */}
            <View style={{ flexDirection: 'row', height: cm(0.37) }}>
                <View style={[styles.transparentCellR, { width: cm(1.53)}]}><Text></Text></View>
                <View style={[styles.transparentCellR, { width: cm(1.87) }]}><Text></Text></View>
                <View style={[styles.transparentCellR, { width: cm(1.9) }]}><Text></Text></View>
                <View style={[styles.transparentCellR, { width: cm(1.31) }]}><Text></Text></View>
                <View style={[styles.transparentCellRB, { width: cm(3.45) }]}><Text></Text></View>
                <View style={[styles.transparentCellRB, { width: cm(0.65) }]}><Text></Text></View>
                <View style={[styles.transparentCellRB, { width: cm(2.11) }]}><Text></Text></View>
                <View style={[styles.transparentCellRB, { width: cm(2.37) }]}><Text></Text></View>
                <View style={[styles.transparentCellRB, { width: cm(2.08) }]}><Text></Text></View>
                <View style={[styles.transparentCellB, { width: cm(0.42) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.2), borderTopWidth: 1 }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.46), borderTopWidth: 1 }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(3.05), borderTopWidth: 1 }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(2.04), borderTopWidth: 1 }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.4), borderTopWidth: 1 }]}><Text></Text></View>

            </View>      
            {/* Строка 1 — Дубл. на левом краю */}
            <View style={{ flexDirection: 'row', height: cm(0.37) }}>
                <View style={[styles.gostCell, { width: cm(1.53), fontSize: 8,  borderLeftWidth: 1}]}><Text>Дубл.</Text></View>
                <View style={[styles.gostCell, { width: cm(1.87) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.9) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.31) }]}><Text></Text></View>
                <View style={[styles.transparentCellRB, { width: cm(3.45) }]}><Text></Text></View>
                <View style={[styles.transparentCellR, { width: cm(0.65) }]}><Text></Text></View>
                <View style={[styles.transparentCellR, { width: cm(2.11) }]}><Text></Text></View>
                <View style={[styles.transparentCellR, { width: cm(2.37) }]}><Text></Text></View>
                <View style={[styles.transparentCellR, { width: cm(2.08) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(0.42) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.2) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.46) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(3.05) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(2.04) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.4) }]}><Text></Text></View>
            </View>

            {/* Строка 2 — Взам. на левом краю */}
            <View style={{ flexDirection: 'row', height: cm(0.37) }}>
                <View style={[styles.gostCell, { width: cm(1.53), fontSize: 8,  borderLeftWidth: 1  }]}><Text>Взам.</Text></View>
                <View style={[styles.gostCell, { width: cm(1.87) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.9) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.31) }]}><Text></Text></View>
                <View style={[styles.transparentCellB, { width: cm(3.45) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(0.65) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(2.11) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(2.37) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(2.08) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(0.42) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.2) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.46) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(3.05) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(2.04) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.4) }]}><Text></Text></View>
            </View>

            {/* Строка 3 — Підп. на левом краю, а Розроб. двигаем в третью колонку */}
            <View style={{ flexDirection: 'row', height: cm(0.37) }}>
                <View style={[styles.gostCell, { width: cm(1.53), fontSize: 8,  borderLeftWidth: 1  }]}><Text>Підп.</Text></View>
                <View style={[styles.gostCell, { width: cm(1.87) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.9) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.31) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(3.45) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(0.65) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(2.11) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(2.37) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(2.08) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(0.42) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.2) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.46) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(3.05) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(2.04) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.4) }]}><Text></Text></View>
            </View>

            <View style={{ flexDirection: 'row', height: cm(0.56) }}>
                <View style={[styles.gostCell, { width: cm(17.27), borderLeftWidth: 1 }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(6.13) }]}><Text>{data.partName}</Text></View>
                <View style={[styles.gostCell, { width: cm(2.04) }]}><Text></Text></View>
                <View style={[styles.gostCell, { width: cm(1.4) }]}><Text></Text></View>
            </View>
        </View>


        {/* Контейнер высотой на все 3 строки подписи (0.37 * 3 = 1.11 см) */}
        <View style={{ flexDirection: 'row', height: cm(1.11), borderLeftWidth: 1, borderColor: '#000' }}>
            {/* КОЛОНКА ПОДПИСЕЙ СЛЕВА (Разбита вертикально на 3 строки) */}
            <View style={{ width: cm(7.68), flexDirection: 'column' }}>
                {/* Строка 1: Розроб. */}
                <View style={{ flexDirection: 'row', height: cm(0.37) }}>
                    <View style={[styles.gostCellLeft, { width: cm(2.1) }]}><Text style={{ fontSize: 8 }}>Розроб.</Text></View>
                    <View style={[styles.gostCellLeft, { width: cm(3.2) }]}><Text></Text></View>
                    <View style={[styles.gostCellLeft, { width: cm(1.43) }]}><Text></Text></View>
                    <View style={[styles.gostCellLeft, { width: cm(0.95) }]}><Text></Text></View>
                </View>
                {/* Строка 2: Перевір. */}
                <View style={{ flexDirection: 'row', height: cm(0.37) }}>
                    <View style={[styles.gostCellLeft, { width: cm(2.1) }]}><Text style={{ fontSize: 8 }}>Перевір.</Text></View>
                    <View style={[styles.gostCell, { width: cm(3.2) }]}><Text></Text></View>
                    <View style={[styles.gostCell, { width: cm(1.43) }]}><Text></Text></View>
                    <View style={[styles.gostCell, { width: cm(0.95) }]}><Text></Text></View>
                </View>
                {/* Строка 3: Прийняв. */}
                <View style={{ flexDirection: 'row', height: cm(0.37) }}>
                    <View style={[styles.gostCellLeft, { width: cm(2.1) }]}><Text style={{ fontSize: 8 }}>Прийняв.</Text></View>
                    <View style={[styles.gostCell, { width: cm(3.2) }]}><Text></Text></View>
                    <View style={[styles.gostCell, { width: cm(1.43) }]}><Text></Text></View>
                    <View style={[styles.gostCell, { width: cm(0.95) }]}><Text></Text></View>
                </View>
            </View>

            {/* ОБЪЕДИНЕННЫЕ ЦЕНТРАЛЬНЫЕ ЯЧЕЙКи С КОДОМ (На всю высоту 1.11 см) */}
            <View style={[styles.gostCell, { width: cm(3.03), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 12, fontFamily: 'Times New Roman Bold' }}></Text>
            </View>
            <View style={[styles.gostCell, { width: cm(6.06), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 12, fontFamily: 'Times New Roman Bold' }}>XXXX.XXXXX.XXX</Text>
            </View>
            <View style={[styles.gostCell, { width: cm(4.64), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 12, fontFamily: 'Times New Roman Bold' }}></Text>
            </View>

            {/* ОБЪЕДИНЕННАЯ ПРАВАЯ ЯЧЕЙКА С ДАННЫМИ (На всю высоту 1.11 см) */}
            <View style={[styles.gostCell, { width: cm(5.45), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 12 }}>{data.documentNumber}</Text>
            </View>
        </View>

        {/* Контейнер высотой на все 2 строки подписи (0.37 * 2 = 0.74 см) */}
        <View style={{ flexDirection: 'row', height: cm(0.74), borderLeftWidth: 1, borderColor: '#000' }}>
            {/* КОЛОНКА ПОДПИСЕЙ СЛЕВА (Разбита вертикально на 3 строки) */}
            <View style={{ width: cm(7.68), flexDirection: 'column' }}>
                {/* Строка 1: Розроб. */}
                <View style={{ flexDirection: 'row', height: cm(0.37) }}>
                    <View style={[styles.gostCellLeft, { width: cm(2.1) }]}><Text style={{ fontSize: 8, justifyContent: 'flex-start' }}>Затв.</Text></View>
                    <View style={[styles.gostCell, { width: cm(3.2) }]}><Text></Text></View>
                    <View style={[styles.gostCell, { width: cm(1.43) }]}><Text></Text></View>
                    <View style={[styles.gostCell, { width: cm(0.95) }]}><Text></Text></View>
                </View>
                {/* Строка 2: Перевір. */}
                <View style={{ flexDirection: 'row', height: cm(0.37) }}>
                    <View style={[styles.gostCellLeft, { width: cm(2.1) }]}><Text style={{ fontSize: 8 }}>Н. контр.</Text></View>
                    <View style={[styles.gostCell, { width: cm(3.2) }]}><Text></Text></View>
                    <View style={[styles.gostCell, { width: cm(1.43) }]}><Text></Text></View>
                    <View style={[styles.gostCell, { width: cm(0.95) }]}><Text></Text></View>
                </View>
            </View>

            {/* ОБЪЕДИНЕННЫЕ ЦЕНТРАЛЬНЫЕ ЯЧЕЙКи С КОДОМ (На всю высоту 1.11 см) */}
            <View style={[styles.gostCell, { width: cm(15.98), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 12, fontFamily: 'Times New Roman Bold' }}>{data.partName.toUpperCase()}</Text>
            </View>
            <View style={[styles.gostCell, { width: cm(1.36), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 12, fontFamily: 'Times New Roman Bold' }}>O</Text>
            </View>
            <View style={[styles.gostCell, { width: cm(0.72), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 12, fontFamily: 'Times New Roman Bold' }}></Text>
            </View>
            <View style={[styles.gostCell, { width: cm(1.11), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 12 }}></Text>
            </View>
        </View>
         

          {/* Строка 5: Н. контр и Материал */}
        {/* Контейнер для нижней части рамки. 
    Высота складывается из: строка материала (0.82 см) + шапка параметров (0.56 см) + значения параметров (0.66 см) = 1.5 см */}
    <View style={{ flexDirection: 'row', height: cm(2.04), borderLeftWidth: 1, borderColor: '#000' }}>
    
        {/* ЛЕВЫЙ БЛОК (Занимает 22.45 см, разделен на 3 строки по горизонтали) */}
        <View style={{ width: cm(22.46), flexDirection: 'column' }}>
            
            {/* 1. СТРОКА МАТЕРИАЛА */}
            <View style={{ flexDirection: 'row', height: cm(0.82) }}>
            <View style={[styles.gostCell, { width: '100%', paddingLeft: 6 }]}><Text>{data.material}</Text></View>
            </View>
            
            {/* 2 /3.  Объединенная СТРОКА МО2 */}
            <View style={{ flexDirection: 'row', height: cm(1.22) }}>
                <View style={[styles.gostCell, { width: cm(1.2), height: '100%', fontSize: 10 }]}>
                    <Text>МО2</Text>
                </View>
            
               {/* ОСТАВШИЕСЯ ПАРАМЕТРЫ СПРАВА (Ширина 94%, делятся на 2 строки по 0.5 см) */}
                <View style={{ flexDirection: 'column' }}>
                    {/* 2. ШАПКА ПАРАМЕТРОВ ЗАГОТОВКИ */}
                    <View style={{ flexDirection: 'row', height: cm(0.66) }}>
                        <View style={[styles.gostCell, { width: cm(3.05), alignItems: 'center', fontSize: 10 }]}><Text>Код</Text></View>
                        <View style={[styles.gostCell, { width: cm(1.05), alignItems: 'center', fontSize: 10 }]}><Text>ЕВ</Text></View>
                        <View style={[styles.gostCell, { width: cm(1.14), alignItems: 'center', fontSize: 10 }]}><Text>МД</Text></View>
                        <View style={[styles.gostCell, { width: cm(1.06), alignItems: 'center', fontSize: 10 }]}><Text>ЕН</Text></View>
                        <View style={[styles.gostCell, { width: cm(1.17), alignItems: 'center', fontSize: 9, padding: 0 }]}><Text>Н.</Text><Text>витр.</Text></View>
                        <View style={[styles.gostCell, { width: cm(1.28), alignItems: 'center', fontSize: 10 }]}><Text>КИМ</Text></View>
                        <View style={[styles.gostCell, { width: cm(2.45), alignItems: 'center', fontSize: 10 }]}><Text>Код загот.</Text></View>
                        <View style={[styles.gostCell, { width: cm(5.84), alignItems: 'center', fontSize: 10 }]}><Text>Профіль та розмір</Text></View>
                        <View style={[styles.gostCell, { width: cm(2.12), alignItems: 'center', fontSize: 10 }]}><Text>К.Д.</Text></View>
                        <View style={[styles.gostCell, { width: cm(2.09), alignItems: 'center', fontSize: 10 }]}><Text>М.З.</Text></View>
                    </View>
                    
                    {/* 3. ЗНАЧЕНИЯ ПАРАМЕТРОВ ЗАГОТОВКИ (Синий цвет значений) */}
                    <View style={{ flexDirection: 'row', height: cm(0.56) }}>
                        <View style={[styles.gostCell, { width: cm(3.05) }]}><Text></Text></View>
                        <View style={[styles.gostCell, { width: cm(1.05), alignItems: 'center' }]}><Text>кг</Text></View>
                        <View style={[styles.gostCell, { width: cm(1.14), alignItems: 'center' }]}><Text style={{ color: '#0055aa' }}>4.53</Text></View>
                        <View style={[styles.gostCell, { width: cm(1.06), alignItems: 'center' }]}><Text style={{ color: '#0055aa' }}>1</Text></View>
                        <View style={[styles.gostCell, { width: cm(1.17)}]}><Text></Text></View>
                        <View style={[styles.gostCell, { width: cm(1.28)}]}><Text></Text></View>
                        <View style={[styles.gostCell, { width: cm(2.45), alignItems: 'center' }]}><Text style={{ color: '#0055aa' }}>Круг</Text></View>
                        <View style={[styles.gostCell, { width: cm(5.84), alignItems: 'center' }]}><Text style={{ color: '#0055aa' }}>{data.profileSize}</Text></View>
                        <View style={[styles.gostCell, { width: cm(2.12), alignItems: 'center' }]}><Text style={{ color: '#0055aa' }}>1</Text></View>
                        <View style={[styles.gostCell, { width: cm(2.09)}]}><Text></Text></View>
                    </View>
                </View>
            </View>
        </View>

        {/* ПРАВЫЙ ВЕРТИКАЛЬНО ОБЪЕДИНЕННЫЙ БЛОК (На всю высоту 1.5 см) */}
        <View style={[styles.gostCell, { width: cm(4.4), height: '100%' }]}>
            <Text></Text>
        </View>

    </View>
            {/* КОНТЕЙНЕР ДЛЯ СТАТИЧЕСКОГО ЗАГОЛОВКА ТАБЛИЦЫ ТЕХПРОЦЕССА */}
        <View style={{ borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#000', marginTop: 0 }} fixed>
        
        {/* СТРОКА ЗАГОЛОВКА 1 (Для строк А) */}
        <View style={[styles.processHeaderRow, { height: cm(0.63) }]}>
            <View style={[styles.processCell, { width: cm(1.2), fontSize: 10 }]}><Text>А</Text></View>
            <View style={[styles.processCell, { width: cm(0.9), fontSize: 10 }]}><Text>Цех</Text></View>
            <View style={[styles.processCell, { width: cm(1.14), fontSize: 10 }]}><Text>Дільн.</Text></View>
            <View style={[styles.processCell, { width: cm(1.01), fontSize: 10 }]}><Text>Р.М.</Text></View>
            <View style={[styles.processCell, { width: cm(1.05), fontSize: 10 }]}><Text>Опер.</Text></View>
            <View style={[styles.processCell, { width: cm(6.38), fontSize: 10 }]}><Text>Код, найменування операції</Text></View>
            <View style={[styles.processCell, { width: cm(15.18), fontSize: 10 }]}><Text>Позначення документа</Text></View>
        </View>

        {/* СТРОКА ЗАГОЛОВКА 2 (Для строк Б) */}
        <View style={[styles.processHeaderRow, { height: cm(0.63) }]}>
            <View style={[styles.processCell, { width: cm(1.2) }]}><Text>Б</Text></View>
            <View style={[styles.processCell, { width: cm(10.48), fontSize: 10 }]}><Text>Код, найменування обладнання</Text></View>
            <View style={[styles.processCell, { width: cm(1.15), fontSize: 8 }]}><Text>С.М.</Text></View>
            <View style={[styles.processCell, { width: cm(1.44), fontSize: 8 }]}><Text>Проф.</Text></View>
            <View style={[styles.processCell, { width: cm(0.93), fontSize: 8 }]}><Text>Р.</Text></View>
            <View style={[styles.processCell, { width: cm(1.15), fontSize: 8 }]}><Text>У.П.</Text></View>
            <View style={[styles.processCell, { width: cm(0.93), fontSize: 8 }]}><Text>К.Р.</Text></View>
            <View style={[styles.processCell, { width: cm(1.39), fontSize: 8 }]}><Text>Ковд.</Text></View>
            <View style={[styles.processCell, { width: cm(1.37), fontSize: 8 }]}><Text>Е.Н.</Text></View>
            <View style={[styles.processCell, { width: cm(1.01), fontSize: 8 }]}><Text>О.П.</Text></View>
            <View style={[styles.processCell, { width: cm(2.36), fontSize: 8 }]}><Text>Кшт.</Text></View>
            <View style={[styles.processCell, { width: cm(2.04), fontSize: 8 }]}><Text>Тпз.</Text></View>
            <View style={[styles.processCell, { width: cm(1.4), fontSize: 8 }]}><Text>Тшт.</Text></View>
        </View>

        <View style={[styles.processHeaderRow, { height: cm(0.63) }]}>
            <View style={[styles.processCell, { width: cm(1.2) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(10.48), fontSize: 10 }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.15), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.44), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(0.93), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.15), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(0.93), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.39), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.37), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.01), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(2.36), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(2.04), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.4), fontSize: 8 }]}><Text></Text></View>
        </View>
    </View>




        </View>

        {/* ================= СЕТКА ТАБЛИЦЫ ТЕХПРОЦЕССА ================= */}
   {/* ДИНАМИЧЕСКИЙ ВЫВОД ДАННЫХ ИЗ БАЗЫ С ИДЕАЛЬНОЙ СЕТКОЙ НОРМАТИВОВ */}
{(() => {
  let globalLineCount = 2;
  const formatNum = (num: number) => num.toString().padStart(2, '0');

  return data.operations?.map((operation) => (
    <View key={operation.id} style={{ flexDirection: 'column' }}>
      
      {/* ================= СТРОКА А (ДАННЫЕ ОПЕРАЦИИ) ================= */}
      {(() => {
        globalLineCount++;
        return (
          <View style={{ flexDirection: 'row', height: cm(0.63) }}>
            <View style={[styles.processCellB, { width: cm(0.4), fontSize: 10, borderLeftWidth: 1 }]}><Text>А</Text></View>
            <View style={[styles.processCell, { width: cm(0.8), fontSize: 10 }]}><Text>{formatNum(globalLineCount)}</Text></View>
            <View style={[styles.processCell, { width: cm(0.9) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.14) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.01), fontSize: 10 }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.05), alignItems: 'center', fontSize: 10 }]}><Text>{operation.operationNumber || ''}</Text></View>
            <View style={[styles.processCell, { width: cm(6.38), alignItems: 'flex-start', paddingLeft: 6, color: '#0055aa', fontFamily: 'Times New Roman Bold', fontSize: 10 }]}>
              <Text>{operation.operationName || ''}</Text>
            </View>
            
            {/* РАЗБИВАЕМ ПРАВУЮ СТРОКУ А НА СЕТКУ НОРМАТИВОВ */}
            <View style={[styles.processCell, { width: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.44) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.39) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.37) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.01) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(2.36) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(2.04) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.4), fontSize: 10 }]}><Text>{operation.nv || ''}</Text></View>
          </View>
        );
      })()}

      {/* ================= СТРОКА Б: РАБОЧЕЕ МЕСТО ================= */}
      {operation.workplace && (() => {
        globalLineCount++;
        return (
          <View style={{ flexDirection: 'row', height: cm(0.63) }}>
            <View style={[styles.processCellB, { width: cm(0.4), fontSize: 10, borderLeftWidth: 1}]}><Text>Б</Text></View>
            <View style={[styles.processCell, { width: cm(0.8), fontSize: 10 }]}><Text>{formatNum(globalLineCount)}</Text></View>
            <View style={[styles.processCell, { width: cm(10.48), alignItems: 'flex-start', paddingLeft: 6, fontSize: 10 }]}>
              <Text>{operation.workplace}</Text>
            </View>
            
            {/* РАЗБИВАЕМ ПРАВУЮ СТРОКУ Б НА СЕТКУ НОРМАТИВОВ */}
            <View style={[styles.processCell, { width: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.44) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.39) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.37) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.01) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(2.36) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(2.04) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.4) }]}><Text></Text></View>
          </View>
        );
      })()}

      {/* ================= СТРОКА Б: ОБОРУДОВАНИЕ ================= */}
      {operation.equipment && operation.equipment.trim() !== "" && (() => {
        globalLineCount++;
        return (
          <View style={{ flexDirection: 'row', height: cm(0.63) }}>
            <View style={[styles.processCellB, { width: cm(0.4), fontSize: 10, borderLeftWidth: 1 }]}><Text>Б</Text></View>
            <View style={[styles.processCell, { width: cm(0.8), fontSize: 10 }]}><Text>{formatNum(globalLineCount)}</Text></View>
            <View style={[styles.processCell, { width: cm(10.48), alignItems: 'flex-start', paddingLeft: 6, fontSize: 10 }]}>
              <Text>{operation.equipment}</Text>
            </View>
            
            {/* РАЗБИВАЕМ ПРАВУЮ СТРОКУ Б НА СЕТКУ НОРМАТИВОВ */}
            <View style={[styles.processCell, { width: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.44) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.39) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.37) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.01) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(2.36) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(2.04) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.4) }]}><Text></Text></View>
          </View>
        );
      })()}

      {/* ================= СТРОКИ Б: ВЛОЖЕННЫЕ ПЕРЕХОДЫ ИЗ МАССИВА ROWS ================= */}
      {operation.rows?.map((row) => {
        globalLineCount++;
        return (
          <View key={row.id} style={{ flexDirection: 'row', height: cm(0.63) }}>
            <View style={[styles.processCellB, { width: cm(0.4), fontSize: 10, borderLeftWidth: 1 }]}><Text>Б</Text></View>
            <View style={[styles.processCell, { width: cm(0.8), fontSize: 10 }]}><Text>{formatNum(globalLineCount)}</Text></View>
            <View style={[styles.processCell, { width: cm(10.48), alignItems: 'flex-start', paddingLeft: 6, fontSize: 10 }]}>
              <Text>{row.text || ' '}</Text>
            </View>
            
            {/* РАЗБИВАЕМ ПРАВУЮ СТРОКУ Б НА СЕТКУ НОРМАТИВОВ */}
            <View style={[styles.processCell, { width: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.44) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.39) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.37) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.01) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(2.36) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(2.04) }]}><Text></Text></View>
            <View style={[styles.processCell, { width: cm(1.4) }]}><Text></Text></View>
          </View>
        );
      })}

    </View>
  ));
})()}






      </Page>
    </Document>
  );
};
