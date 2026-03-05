export interface ElementStyle {
  width: string;
  height: string;
  left: string;
  top: string;
  zIndex: number;
}

export interface LabelElement {
  id: string;
  type: 'text' | 'image' | 'barcode' | 'line' | 'rect';
  style: ElementStyle;
  content?: string;
  fontSize?: string;
  fontWeight?: string;
  imgUrl?: string;
  originalUrl?: string;
  isVertical?: 'true' | 'false';
  // 🌟 新增以下两行：用于记忆条码的自定义物理尺寸
  customW?: number; 
  customH?: number;
}

export interface LabelData {
  id: string;
  name: string;
  wMM: number;
  hMM: number;
  elements: LabelElement[];
}

export interface ComponentItem {
  type: string;
  name: string;
  content?: string;
  sub?: string;
  img?: string;
}

export interface ComponentGroup {
  groupTitle: string;
  items: ComponentItem[];
}

export interface ComponentCategory {
  parentTitle: string;
  groups: ComponentGroup[];
}