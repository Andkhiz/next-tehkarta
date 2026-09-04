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
  massZagKg: number;
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
    paddingBottom: 28.65, // Нижнее поле (1 см)
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
  rowA: { 
    flexDirection: 'row', 
    minHeight: 14,       // Минимальная высота по ГОСТу
    alignItems: 'stretch' // Растягивает все ячейки строки до максимальной высоты
  },
  rowB: { 
    flexDirection: 'row', 
    minHeight: 14, 
    alignItems: 'stretch' 
  },
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
    //height: '100%',
    flexShrink: 0,
    flexGrow: 0,
    fontFamily: 'Times New Roman',
  },
  processCellB: {
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    //height: '100%',
    flexShrink: 0,
    flexGrow: 0,
    fontFamily: 'Times New Roman'
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
          <View style={[styles.fullWidthTransparentRow, { paddingRight: 8 }]}>
            <View 
              fixed
              render={({ pageNumber }) => (
                <Text style={{ width: '100%', fontSize: 12, textAlign: 'right' }}>
                  ГОСТ 3.1118-82 Форма 1{pageNumber !== 1 ? 'а' : ''}
                </Text>
              )}
            />
          </View>

           {/* Пустая строка*/}

          <View style={styles.gostTable}>
            {/* Строка 0 — Пустая строка */}
            <View style={{ flexDirection: 'row', height: cm(0.4) }}>
                <View style={[styles.transparentCellR, { flexBasis: cm(1.53)}]}><Text></Text></View>
                <View style={[styles.transparentCellR, { flexBasis: cm(1.87) }]}><Text></Text></View>
                <View style={[styles.transparentCellR, { flexBasis: cm(1.9) }]}><Text></Text></View>
                <View style={[styles.transparentCellR, { flexBasis: cm(1.31) }]}><Text></Text></View>
                <View style={[styles.transparentCellRB, { flexBasis: cm(3.45) }]}><Text></Text></View>
                <View style={[styles.transparentCellRB, { flexBasis: cm(0.65) }]}><Text></Text></View>
                <View style={[styles.transparentCellRB, { flexBasis: cm(2.11) }]}><Text></Text></View>
                <View style={[styles.transparentCellRB, { flexBasis: cm(2.37) }]}><Text></Text></View>
                <View style={[styles.transparentCellRB, { flexBasis: cm(2.08) }]}><Text></Text></View>
                <View style={[styles.transparentCellB, { flexBasis: cm(0.42) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.2), borderTopWidth: 1 }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.46), borderTopWidth: 1 }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(3.05), borderTopWidth: 1 }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(2.04), borderTopWidth: 1 }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.4), borderTopWidth: 1 }]}><Text></Text></View>

            </View>      
            {/* Строка 1 — Дубл. на левом краю */}
            <View style={{ flexDirection: 'row', height: cm(0.4) }}>
                <View style={[styles.gostCell, { flexBasis: cm(1.53), fontSize: 8,  borderLeftWidth: 1}]}><Text>Дубл.</Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.87) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.9) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.31) }]}><Text></Text></View>
                <View style={[styles.transparentCellRB, { flexBasis: cm(3.45) }]}><Text></Text></View>
                <View style={[styles.transparentCellR, { flexBasis: cm(0.65) }]}><Text></Text></View>
                <View style={[styles.transparentCellR, { flexBasis: cm(2.11) }]}><Text></Text></View>
                <View style={[styles.transparentCellR, { flexBasis: cm(2.37) }]}><Text></Text></View>
                <View style={[styles.transparentCellR, { flexBasis: cm(2.08) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(0.42) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.2) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.46) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(3.05) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(2.04) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.4) }]}><Text></Text></View>
            </View>

            {/* Строка 2 — Взам. на левом краю */}
            <View style={{ flexDirection: 'row', height: cm(0.4) }}>
                <View style={[styles.gostCell, { flexBasis: cm(1.53), fontSize: 8,  borderLeftWidth: 1  }]}><Text>Взам.</Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.87) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.9) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.31) }]}><Text></Text></View>
                <View style={[styles.transparentCellB, { flexBasis: cm(3.45) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(0.65) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(2.11) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(2.37) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(2.08) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(0.42) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.2) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.46) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(3.05) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(2.04) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.4) }]}><Text></Text></View>
            </View>

            {/* Строка 3 — Підп. на левом краю, а Розроб. двигаем в третью колонку */}
            <View style={{ flexDirection: 'row', height: cm(0.4) }}>
                <View style={[styles.gostCell, { flexBasis: cm(1.53), fontSize: 8,  borderLeftWidth: 1  }]}><Text>Підп.</Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.87) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.9) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.31) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(3.45) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(0.65) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(2.11) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(2.37) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(2.08) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(0.42) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.2) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.46) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(3.05) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(2.04) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.4) }]}><Text></Text></View>
            </View>

            <View style={{ flexDirection: 'row', height: cm(0.56) }}>
                <View style={[styles.gostCell, { flexBasis: cm(17.27), borderLeftWidth: 1 }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(6.13) }]}><Text>{data.partName}</Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(2.04) }]}><Text></Text></View>
                <View style={[styles.gostCell, { flexBasis: cm(1.4) }]}><Text></Text></View>
            </View>
        </View>


        {/* Контейнер высотой на все 3 строки подписи (0.37 * 3 = 1.11 см) */}
        <View 
          render={({ pageNumber }) => (
            // Если страница НЕ первая, этот блок полностью исчезает из потока документа
            pageNumber !== 1 ? (
              
              <View style={{ 
                flexDirection: 'column', 
                height: cm(1.15), 
                borderLeftWidth: 1, 
                borderColor: '#000' 
              }}>
                
                {/* Строка 1 */}
                <View style={[styles.gostCell, { flexBasis: '100%', height: cm(0.383), paddingLeft: 6, justifyContent: 'center' }]}>
                  <Text>{data.material}</Text>
                </View>
                
                {/* Строка 2 */}
                <View style={[styles.gostCell, { flexBasis: '100%', height: cm(0.383), paddingLeft: 6, justifyContent: 'center' }]}>
                  <Text>{data.material}</Text>
                </View>
                
                {/* Строка 3 */}
                <View style={[styles.gostCell, { flexBasis: '100%', height: cm(0.383), paddingLeft: 6, justifyContent: 'center' }]}>
                  <Text>{data.material}</Text>
                </View>

              </View>


            ) : (
                <View>
                  <View style={{ flexDirection: 'row', height: cm(1.3), borderLeftWidth: 1, borderColor: '#000' }}>
                      {/* КОЛОНКА ПОДПИСЕЙ СЛЕВА (Разбита вертикально на 3 строки) */}
                      <View style={{ flexBasis: cm(7.68), flexDirection: 'column' }}>
                          {/* Строка 1: Розроб. */}
                          <View style={{ flexDirection: 'row', height: cm(0.4) }}>
                              <View style={[styles.gostCellLeft, { flexBasis: cm(2.1) }]}><Text style={{ fontSize: 8, justifyContent: 'flex-start' }}>Розроб.</Text></View>
                              <View style={[styles.gostCellLeft, { flexBasis: cm(3.2) }]}><Text></Text></View>
                              <View style={[styles.gostCellLeft, { flexBasis: cm(1.43) }]}><Text></Text></View>
                              <View style={[styles.gostCellLeft, { flexBasis: cm(0.95) }]}><Text></Text></View>
                          </View>
                          {/* Строка 2: Перевір. */}
                          <View style={{ flexDirection: 'row', height: cm(0.4) }}>
                              <View style={[styles.gostCellLeft, { flexBasis: cm(2.1) }]}><Text style={{ fontSize: 8 }}>Перевір.</Text></View>
                              <View style={[styles.gostCell, { flexBasis: cm(3.2) }]}><Text></Text></View>
                              <View style={[styles.gostCell, { flexBasis: cm(1.43) }]}><Text></Text></View>
                              <View style={[styles.gostCell, { flexBasis: cm(0.95) }]}><Text></Text></View>
                          </View>
                          {/* Строка 3: Прийняв. */}
                          <View style={{ flexDirection: 'row', height: cm(0.4) }}>
                              <View style={[styles.gostCellLeft, { flexBasis: cm(2.1) }]}><Text style={{ fontSize: 8 }}>Прийняв.</Text></View>
                              <View style={[styles.gostCell, { flexBasis: cm(3.2) }]}><Text></Text></View>
                              <View style={[styles.gostCell, { flexBasis: cm(1.43) }]}><Text></Text></View>
                              <View style={[styles.gostCell, { flexBasis: cm(0.95) }]}><Text></Text></View>
                          </View>
                      </View>

                      {/* ОБЪЕДИНЕННЫЕ ЦЕНТРАЛЬНЫЕ ЯЧЕЙКи С КОДОМ (На всю высоту 1.11 см) */}
                      <View style={[styles.gostCell, { flexBasis: cm(3.03), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={{ fontSize: 12, fontFamily: 'Times New Roman Bold' }}></Text>
                      </View>
                      <View style={[styles.gostCell, { flexBasis: cm(6.06), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={{ fontSize: 12, fontFamily: 'Times New Roman Bold' }}>XXXX.XXXXX.XXX</Text>
                      </View>
                      <View style={[styles.gostCell, { flexBasis: cm(4.64), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={{ fontSize: 12, fontFamily: 'Times New Roman Bold' }}></Text>
                      </View>

                      {/* ОБЪЕДИНЕННАЯ ПРАВАЯ ЯЧЕЙКА С ДАННЫМИ (На всю высоту 1.11 см) */}
                      <View style={[styles.gostCell, { flexBasis: cm(5.45), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={{ fontSize: 12 }}>{data.documentNumber}</Text>
                      </View>
                  </View>
                  <View style={{ flexDirection: 'row', height: cm(0.77), borderLeftWidth: 1, borderColor: '#000' }}>
            {/* КОЛОНКА ПОДПИСЕЙ СЛЕВА (Разбита вертикально на 3 строки) */}
                  <View style={{ flexBasis: cm(7.68), flexDirection: 'column' }}>
                      {/* Строка 1: Розроб. */}
                      <View style={{ flexDirection: 'row', height: cm(0.37) }}>
                          <View style={[styles.gostCellLeft, { flexBasis: cm(2.1) }]}><Text style={{ fontSize: 8, justifyContent: 'flex-start' }}>Затв.</Text></View>
                          <View style={[styles.gostCell, { flexBasis: cm(3.2) }]}><Text></Text></View>
                          <View style={[styles.gostCell, { flexBasis: cm(1.43) }]}><Text></Text></View>
                          <View style={[styles.gostCell, { flexBasis: cm(0.95) }]}><Text></Text></View>
                      </View>
                      {/* Строка 2: Перевір. */}
                      <View style={{ flexDirection: 'row', height: cm(0.37) }}>
                          <View style={[styles.gostCellLeft, { flexBasis: cm(2.1) }]}><Text style={{ fontSize: 8 }}>Н. контр.</Text></View>
                          <View style={[styles.gostCell, { flexBasis: cm(3.2) }]}><Text></Text></View>
                          <View style={[styles.gostCell, { flexBasis: cm(1.43) }]}><Text></Text></View>
                          <View style={[styles.gostCell, { flexBasis: cm(0.95) }]}><Text></Text></View>
                      </View>
                  </View>

                  {/* ОБЪЕДИНЕННЫЕ ЦЕНТРАЛЬНЫЕ ЯЧЕЙКи С КОДОМ (На всю высоту 1.11 см) */}
                  <View style={[styles.gostCell, { flexBasis: cm(15.98), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ fontSize: 12, fontFamily: 'Times New Roman Bold' }}>{data.partName.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.gostCell, { flexBasis: cm(1.36), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ fontSize: 12, fontFamily: 'Times New Roman Bold' }}>O</Text>
                  </View>
                  <View style={[styles.gostCell, { flexBasis: cm(0.72), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ fontSize: 12, fontFamily: 'Times New Roman Bold' }}></Text>
                  </View>
                  <View style={[styles.gostCell, { flexBasis: cm(1.11), height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ fontSize: 12 }}></Text>
                  </View>
                </View>
              </View>
            )
          )}
         />
                

          {/* Строка 5: Н. контр и Материал */}
        {/* Контейнер для нижней части рамки. 
    Высота складывается из: строка материала (0.82 см) + шапка параметров (0.56 см) + значения параметров (0.66 см) = 1.5 см */}
  <View 
          render={({ pageNumber }) => (
            // Если страница НЕ первая, этот блок полностью исчезает из потока документа
            pageNumber !== 1 ? null : (  
    
    <View style={{ flexDirection: 'row', /*height: cm(2.04),*/ borderLeftWidth: 1, borderColor: '#000' }}>
    
        {/* ЛЕВЫЙ БЛОК (Занимает 22.45 см, разделен на 3 строки по горизонтали) */}
        <View style={{ flexBasis: cm(22.46), flexDirection: 'column' }}>
            
            {/* 1. СТРОКА МАТЕРИАЛА */}
            <View style={{ flexDirection: 'row', /*height: cm(0.82) */}}>
               <View style={[styles.gostCell, { width: '100%', paddingLeft: 6 }]}><Text>{data.material}</Text></View>
            </View>
            
            {/* 2 /3.  Объединенная СТРОКА МО2 */}
            
            <View style={{ flexDirection: 'row', height: cm(1.22) }}>
                <View style={[styles.gostCell, { flexBasis: cm(1.2), height: '100%', fontSize: 10 }]}>
                    <Text>МО2</Text>
                </View>
            
               {/* ОСТАВШИЕСЯ ПАРАМЕТРЫ СПРАВА (Ширина 94%, делятся на 2 строки по 0.5 см) */}
                <View style={{ flexDirection: 'column' }}>
                    {/* 2. ШАПКА ПАРАМЕТРОВ ЗАГОТОВКИ */}
                    <View style={{ flexDirection: 'row', height: cm(0.66) }}>
                        <View style={[styles.gostCell, { flexBasis: cm(3.05), alignItems: 'center', fontSize: 10 }]}><Text>Код</Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(1.05), alignItems: 'center', fontSize: 10 }]}><Text>ЕВ</Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(1.14), alignItems: 'center', fontSize: 10 }]}><Text>МД</Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(1.06), alignItems: 'center', fontSize: 10 }]}><Text>ЕН</Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(1.17), alignItems: 'center', fontSize: 9, padding: 0 }]}><Text>Н.</Text><Text>витр.</Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(1.28), alignItems: 'center', fontSize: 10 }]}><Text>КИМ</Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(2.45), alignItems: 'center', fontSize: 10 }]}><Text>Код загот.</Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(5.84), alignItems: 'center', fontSize: 10 }]}><Text>Профіль та розмір</Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(2.12), alignItems: 'center', fontSize: 10 }]}><Text>К.Д.</Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(2.09), alignItems: 'center', fontSize: 10 }]}><Text>М.З.</Text></View>
                    </View>
                    
                    {/* 3. ЗНАЧЕНИЯ ПАРАМЕТРОВ ЗАГОТОВКИ (Синий цвет значений) */}
                    <View style={{ flexDirection: 'row', height: cm(0.56) }}>
                        <View style={[styles.gostCell, { flexBasis: cm(3.05) }]}><Text></Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(1.05), alignItems: 'center' }]}><Text>кг</Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(1.14), alignItems: 'center' }]}><Text style={{ color: '#0055aa' }}>{data.massKg}</Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(1.06), alignItems: 'center' }]}><Text style={{ color: '#0055aa' }}></Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(1.17)}]}><Text></Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(1.28)}]}><Text></Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(2.45), alignItems: 'center' }]}><Text style={{ color: '#0055aa' }}></Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(5.84), alignItems: 'center' }]}><Text style={{ color: '#0055aa' }}>{data.profileSize}</Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(2.12), alignItems: 'center' }]}><Text style={{ color: '#0055aa' }}></Text></View>
                        <View style={[styles.gostCell, { flexBasis: cm(2.09), alignItems: 'center' }]}><Text>{data.massZagKg}</Text></View>
                    </View>
                </View>
            </View>
        </View>

        {/* ПРАВЫЙ ВЕРТИКАЛЬНО ОБЪЕДИНЕННЫЙ БЛОК (На всю высоту 1.5 см) */}
        <View style={[styles.gostCell, { flexBasis: cm(4.4), height: '100%' }]}>
            <Text></Text>
        </View>

    </View>

)
          )}
         />

            {/* КОНТЕЙНЕР ДЛЯ СТАТИЧЕСКОГО ЗАГОЛОВКА ТАБЛИЦЫ ТЕХПРОЦЕССА */}
        <View style={{ borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#000', marginTop: 0 }} fixed>
        
        {/* СТРОКА ЗАГОЛОВКА 1 (Для строк А) */}
        <View style={[styles.processHeaderRow, { height: cm(0.63) }]}>
            <View style={[styles.processCell, { flexBasis: cm(1.2), fontSize: 10 }]}><Text>А</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.9), fontSize: 10 }]}><Text>Цех</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.14), fontSize: 10 }]}><Text>Дільн.</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.01), fontSize: 10 }]}><Text>Р.М.</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.05), fontSize: 10 }]}><Text>Опер.</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(6.38), fontSize: 10 }]}><Text>Код, найменування операції</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(15.18), fontSize: 10 }]}><Text>Позначення документа</Text></View>
        </View>

        {/* СТРОКА ЗАГОЛОВКА 2 (Для строк Б) */}
        <View style={[styles.processHeaderRow, { height: cm(0.63) }]}>
            <View style={[styles.processCell, { flexBasis: cm(1.2) }]}><Text>Б</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(10.48), fontSize: 10 }]}><Text>Код, найменування обладнання</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.15), fontSize: 8 }]}><Text>С.М.</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.44), fontSize: 8 }]}><Text>Проф.</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.93), fontSize: 8 }]}><Text>Р.</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.15), fontSize: 8 }]}><Text>У.П.</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.93), fontSize: 8 }]}><Text>К.Р.</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.39), fontSize: 8 }]}><Text>Ковд.</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.37), fontSize: 8 }]}><Text>Е.Н.</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.01), fontSize: 8 }]}><Text>О.П.</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(2.36), fontSize: 8 }]}><Text>Кшт.</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(2.04), fontSize: 8 }]}><Text>Тпз.</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.4), fontSize: 8 }]}><Text>Тшт.</Text></View>
        </View>

        <View style={[styles.processHeaderRow, { height: cm(0.63) }]}>
            <View style={[styles.processCell, { flexBasis: cm(1.2) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(10.48), fontSize: 10 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.15), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.44), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.93), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.15), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.93), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.39), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.37), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.01), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(2.36), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(2.04), fontSize: 8 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.4), fontSize: 8 }]}><Text></Text></View>
        </View>
    </View>




        </View>

        {/* ================= СЕТКА ТАБЛИЦЫ ТЕХПРОЦЕССА ================= */}
   {/* ДИНАМИЧЕСКИЙ ВЫВОД ДАННЫХ ИЗ БАЗЫ С ИДЕАЛЬНОЙ СЕТКОЙ НОРМАТИВОВ */}
{(() => {
  let globalLineCount = 2;
  const formatNum = (num: number) => num.toString().padStart(2, '0');

  return data.operations?.map((operation) => (
    <View key={operation.id} style={{ flexDirection: 'column' }} wrap={false} >
      
      {/* ================= СТРОКА А (ДАННЫЕ ОПЕРАЦИИ) ================= */}
      {(() => {
        globalLineCount++;
        return (
          <View style={{ flexDirection: 'row', minHeight: cm(0.65), alignItems: 'stretch', }} >
            <View style={[styles.processCellB, { flexBasis: cm(0.4), fontSize: 10, borderLeftWidth: 1 }]}><Text>А</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.8), fontSize: 10 }]}><Text>{formatNum(globalLineCount)}</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.9) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.14) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.01), fontSize: 10 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.05), alignItems: 'center', fontSize: 10 }]}><Text>{operation.operationNumber || ''}</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(6.38), flexGrow: 1, alignItems: 'flex-start', paddingLeft: 6, color: '#0055aa', fontFamily: 'Times New Roman Bold', fontSize: 10 }]}>
              <Text>{operation.operationName || ''}</Text>
            </View>
            
            {/* РАЗБИВАЕМ ПРАВУЮ СТРОКУ А НА СЕТКУ НОРМАТИВОВ */}
            <View style={[styles.processCell, { flexBasis: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.44) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.39) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.37) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.01) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(2.36) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(2.04) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.4), fontSize: 10 }]}><Text>{operation.nv || ''}</Text></View>
          </View>
        );
      })()}

      {/* ================= СТРОКА Б: РАБОЧЕЕ МЕСТО ================= */}
      {operation.workplace && (() => {
        globalLineCount++;
        return (
          <View style={{ flexDirection: 'row', minHeight: cm(0.63), alignItems: 'stretch' }} wrap={false}>
            <View style={[styles.processCellB, { flexBasis: cm(0.4), fontSize: 10, borderLeftWidth: 1}]}><Text>Б</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.8), fontSize: 10 }]}><Text>{formatNum(globalLineCount)}</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(10.48), flexGrow: 1, alignItems: 'flex-start', paddingLeft: 6, fontSize: 10 }]}>
              <Text>{operation.workplace}</Text>
            </View>
            
            {/* РАЗБИВАЕМ ПРАВУЮ СТРОКУ Б НА СЕТКУ НОРМАТИВОВ */}
            <View style={[styles.processCell, { flexBasis: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.44) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.39) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.37) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.01) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(2.36) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(2.04) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.4) }]}><Text></Text></View>
          </View>
        );
      })()}

      {/* ================= СТРОКА Б: ОБОРУДОВАНИЕ ================= */}
      {operation.equipment && operation.equipment.trim() !== "" && (() => {
        globalLineCount++;
        return (
          <View style={{ flexDirection: 'row', minHeight: cm(0.63), alignItems: 'stretch' }} wrap={false}>
            <View style={[styles.processCellB, { flexBasis: cm(0.4), fontSize: 10, borderLeftWidth: 1 }]}><Text>Б</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.8), fontSize: 10 }]}><Text>{formatNum(globalLineCount)}</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(10.48), flexGrow: 1, alignItems: 'flex-start', paddingLeft: 6, fontSize: 10 }]}>
              <Text>{operation.equipment}</Text>
            </View>
            
            {/* РАЗБИВАЕМ ПРАВУЮ СТРОКУ Б НА СЕТКУ НОРМАТИВОВ */}
            <View style={[styles.processCell, { flexBasis: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.44) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.15) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.93) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.39) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.37) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.01) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(2.36) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(2.04) }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.4) }]}><Text></Text></View>
          </View>
        );
      })()}

      {/* ================= СТРОКИ Б: ВЛОЖЕННЫЕ ПЕРЕХОДЫ ИЗ МАССИВА ROWS ================= */}
     {operation.rows?.map((row) => {
    // Увеличиваем счетчик для основной строки перехода
    globalLineCount++;

    const measuringTools = (row as any).measuringTools || [];

    return (
        <React.Fragment key={row.id}>
        
        {/* 1. ОСНОВНАЯ СТРОКА ПЕРЕХОДА */}
        <View style={{ flexDirection: 'row', minHeight: cm(0.63), alignItems: 'stretch', fontFamily: 'Times New Roman', width: '100%' }} wrap={false}>
            {/* ИСПРАВЛЕНО: Для всех ячеек в этой строке переопределяем flexGrow на 0, чтобы они подчинялись жесткой ширине cm */}
            <View style={[styles.processCellB, { flexBasis: cm(0.4), fontSize: 10, borderLeftWidth: 1, flexGrow: 0 }]}><Text>Б</Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.8), fontSize: 10, flexGrow: 0 }]}><Text>{formatNum(globalLineCount)}</Text></View>
            
            {/* Ячейка текста перехода */}
            <View style={[styles.processCell, { flexBasis: cm(10.48), alignItems: 'flex-start', paddingLeft: 6, fontSize: 10, flexGrow: 1, paddingVertical: 3 }]}>
                {/* ИСПРАВЛЕНО: Даем тексту ширину 100%, чтобы перенос строк считался корректно */}
                <Text style={{ width: '100%' }}>{row.text || ' '}</Text>
            </View>
            
            {/* РАЗБИВАЕМ ПРАВУЮ СТРОКУ Б НА СЕТКУ НОРМАТИВОВ */}
            {/* ИСПРАВЛЕНО: Добавляем flexGrow: 0 на все внутренние ячейки нормирования */}
            <View style={[styles.processCell, { flexBasis: cm(1.15), flexGrow: 0 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.44), flexGrow: 0 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.93), flexGrow: 0 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.15), flexGrow: 0 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(0.93), flexGrow: 0 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.39), flexGrow: 0 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.37), flexGrow: 0 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(1.01), flexGrow: 0 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(2.36), flexGrow: 0 }]}><Text></Text></View>
            <View style={[styles.processCell, { flexBasis: cm(2.04), flexGrow: 0 }]}><Text></Text></View>
            {/* ИСПРАВЛЕНО: Последняя правая ячейка обязана иметь borderRightWidth: 1 */}
            <View style={[styles.processCell, { flexBasis: cm(1.4), borderRightWidth: 1, flexGrow: 0 }]}><Text></Text></View>
        </View>

        {/* 2. ПОСТРОЧНЫЙ ВЫВОД МЕРИТЕЛЬНОГО ИНСТРУМЕНТА СРАЗУ ПОСЛЕ ПЕРЕХОДА */}
        {measuringTools.map((mt: any, mtIdx: number) => {
            globalLineCount++;

            const rawName = mt.measuringTool?.name || mt.name || '';
            const cleanedToolName = rawName.replace(/^"|"$/g, '').replace(/\\"/g, '"');

            if (!cleanedToolName) return null;

            // Внутренний объект для одинаковых стилей пустых правых ячеек нормирования
            const rightCellOption = {
                borderRightWidth: 1,
                borderBottomWidth: 1,
                borderColor: '#000000',
                minHeight: cm(0.63),
                flexGrow: 0 // ИСПРАВЛЕНО: жестко запрещаем ячейкам нормативов неконтролируемо растягиваться вширь
            };

            return (
            <View 
                key={mt.id || mtIdx} 
                style={{ 
                    flexDirection: 'row', 
                    minHeight: cm(0.63), 
                    alignItems: 'stretch', 
                    width: '100%'
                }} 
                wrap={false}
            >
                {/* Ячейка кода строки Б */}
                <View style={{ flexBasis: cm(0.4), fontSize: 10, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#000000', borderRightWidth: 0, justifyContent: 'center', alignItems: 'center', fontFamily: 'Times New Roman' }}>
                    <Text>Б</Text>
                </View>

                {/* Ячейка номера строки */}
                <View style={{ flexBasis: cm(0.8), fontSize: 10, borderBottomWidth: 1, borderColor: '#000000', borderRightWidth: 1, justifyContent: 'center', alignItems: 'center', fontFamily: 'Times New Roman' }}>
                    <Text>{formatNum(globalLineCount)}</Text>
                </View>
                
                {/* Ячейка НАЗВАНИЯ ИНСТРУМЕНТА */}
                <View style={{ 
                    flexBasis: cm(10.48), 
                    borderBottomWidth: 1, 
                    borderColor: '#000000', 
                    borderRightWidth: 1,
                    alignItems: 'flex-start', 
                    justifyContent: 'center', 
                    paddingLeft: 6, 
                    paddingTop: 3,     
                    paddingBottom: 3,  
                    fontSize: 10, 
                    fontFamily: 'Times New Roman',
                    flexGrow: 1,
                    // ИСПРАВЛЕНО: Убрали flexWrap: 'wrap', который вызывал баг высоты в `@react-pdf`
                }}>
                    <Text style={{ width: '100%' }}>{cleanedToolName}</Text>
                </View>
                
                {/* Идеальная по размерам сетка нормативов справа */}
                <View style={[rightCellOption, { flexBasis: cm(1.15) }]}><Text></Text></View>
                <View style={[rightCellOption, { flexBasis: cm(1.44) }]}><Text></Text></View>
                <View style={[rightCellOption, { flexBasis: cm(0.93) }]}><Text></Text></View>
                <View style={[rightCellOption, { flexBasis: cm(1.15) }]}><Text></Text></View>
                <View style={[rightCellOption, { flexBasis: cm(0.93) }]}><Text></Text></View>
                <View style={[rightCellOption, { flexBasis: cm(1.39) }]}><Text></Text></View>
                <View style={[rightCellOption, { flexBasis: cm(1.37) }]}><Text></Text></View>
                <View style={[rightCellOption, { flexBasis: cm(1.01) }]}><Text></Text></View>
                <View style={[rightCellOption, { flexBasis: cm(2.36) }]}><Text></Text></View>
                <View style={[rightCellOption, { flexBasis: cm(2.04) }]}><Text></Text></View>
                <View style={[rightCellOption, { flexBasis: cm(1.4) }]}><Text></Text></View>
            </View>
            );
        })}

        </React.Fragment>
    );
})}


    </View>
  ));
})()}






      </Page>
    </Document>
  );
};
