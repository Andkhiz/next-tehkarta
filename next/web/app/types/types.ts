// app/tehkarta/types.ts

export interface ToolRelation { 
  id?: number; 
  cuttingToolId?: number; 
  measuringToolId?: number; 
  cuttingTool?: { name: string }; 
  measuringTool?: { name: string };
  name?: string;   // Для временного хранения ручного ввода до сохранения
  rowKey?: string; // Временный ключ для удобной привязки инструментов в UI-компонентах
}

export interface OperationRow { 
  type: string; 
  text: string;
  cuttingTools: ToolRelation[];   // Режущий инструмент теперь привязан к строке перехода
  measuringTools: ToolRelation[]; // Мерительный инструмент теперь привязан к строке перехода
}

export interface Operation {
  operation_number: string;
  operation_name: string;
  workplace: string;
  equipment: string;
  nv: string; // На фронтенде храним строкой для удобства работы <input type="number">
  rows: OperationRow[]; // Массивы инструментов удалены из корня операции
}

export interface CardListItem { 
  id: number; 
  documentNumber: string; 
  partName: string; 
}

export interface ToolCatalogItem { 
  id: number; 
  name: string; 
}

export interface TechCardFormBodyProps {
  // Стейты шапки
  docNumber: string;
  setDocNumber: (val: string) => void;
  partName: string;
  setPartName: (val: string) => void;
  material: string;
  setMaterial: (val: string) => void;
  mass: string;
  setMass: (val: string) => void;
  massZag: string;
  setMassZag: (val: string) => void;
  profileSize: string;
  setProfileSize: (val: string) => void;
  
  // Управление операциями и общие стейты
  selectedCardId: any;
  operations: any[];
  setOperations: React.Dispatch<React.SetStateAction<any[]>>;
  statusMessage: string | null;
  loading: boolean;
  
  // Функции-обработчики
  handleSubmit: (e: React.FormEvent) => void;
  addOperation: () => void;
  handleOpChange: (index: number, field: string, value: any) => void;
  addRowToOp: (opIdx: number) => void;
  handleRowDrop: (opIdx: number, result: any) => void;
  handleRowChange: (opIdx: number, rowIdx: number, value: string) => void;
  startNewCard: () => void;
}

export interface DocumentHeaderProps {
  docNumber: string;
  setDocNumber: (val: string) => void;
  partName: string;
  setPartName: (val: string) => void;
  material: string;
  setMaterial: (val: string) => void;
  mass: string;
  setMass: (val: string) => void;
  massZag: string;
  setMassZag: (val: string) => void;
  profileSize: string;
  setProfileSize: (val: string) => void;
}

export interface OperationCardProps {
  op: any;
  opIdx: number;
  operations: any[];
  setOperations: React.Dispatch<React.SetStateAction<any[]>>;
  handleOpChange: (index: number, field: string, value: any) => void;
  addOperation: () => void;
  addRowToOp: (opIdx: number) => void;
  handleRowDrop: (opIdx: number, result: any) => void;
  handleRowChange: (opIdx: number, rowIdx: number, value: string) => void;
}

export interface TechCardSidebarProps {
  setIsMeasuringCatalogOpen: (open: boolean) => void;
  isMeasuringCatalogOpen: boolean;
  startNewCard: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredCardsList: any[];
  loadSingleCard: (id: any) => void;
  selectedCardId: any;
}