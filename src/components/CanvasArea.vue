<template>
  <div class="w-full h-full overflow-auto custom-scrollbar bg-slate-50 flex p-12" ref="containerRef">
    <div 
      class="bg-white shadow-[0_12px_40px_rgba(0,0,0,0.15)] m-auto relative transition-none"
      :style="{ width: physicalW + 'px', height: physicalH + 'px' }"
    >
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as fabric from 'fabric';

const props = defineProps<{
  wMM: number;
  hMM: number;
  initialElements: any[];
}>();

const emit = defineEmits(['update:activeElement', 'modified', 'update:zoom']);

const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

// 🌟 将白纸和红线单独抽离为全局引用，从此只改大小，不删图层！
let fCanvas: fabric.Canvas | null = null;
let paperRect: fabric.Rect | null = null;
let safeRect: fabric.Rect | null = null;

const mmToPx = 3.78; 
const physicalW = ref(0);
const physicalH = ref(0);

const baseConfig: any = {
  transparentCorners: false,       
  cornerColor: '#3b82f6',          
  cornerStrokeColor: '#ffffff',    
  borderColor: '#3b82f6',          
  borderDashArray: null,           
  cornerSize: 10,                  
  padding: 6,                      
  cornerStyle: 'circle',           
  strokeWidth: 0,                  
  lockRotation: true,           
  lockScalingFlip: true            
};

// ==========================================
// 1. 核心缩放引擎：内外同步，精准对齐
// ==========================================
const centerAndZoom = (zoomLevel: number) => {
  if (!fCanvas || !paperRect) return;
  
  const logicW = Number(props.wMM) * mmToPx;
  const logicH = Number(props.hMM) * mmToPx;
  
  // Vue 的外壳尺寸
  physicalW.value = logicW * zoomLevel;
  physicalH.value = logicH * zoomLevel;
  
  // Fabric 内部真实尺寸严格同步
  fCanvas.setDimensions({ width: physicalW.value, height: physicalH.value });
  fCanvas.setViewportTransform([zoomLevel, 0, 0, zoomLevel, 0, 0]);
};

const setCanvasZoom = (zoom: number) => {
  centerAndZoom(zoom);
  fCanvas?.requestRenderAll();
};

// ==========================================
// 2. 物理引擎：0.5mm 贴边硬碰撞 & 快照锁死技术
// ==========================================
const handleMoving = (e: any) => {
  const obj = e.target;
  if (!obj || !fCanvas || obj === paperRect || obj === safeRect) return;

  const logicW = Number(props.wMM) * mmToPx;
  const logicH = Number(props.hMM) * mmToPx;
  const safeMargin = 0.5 * mmToPx; 

  let left = obj.left || 0;
  let top = obj.top || 0;
  const w = obj.getScaledWidth();
  const h = obj.getScaledHeight();

  if (left < safeMargin) left = safeMargin;
  if (top < safeMargin) top = safeMargin;
  if (left + w > logicW - safeMargin) left = Math.max(safeMargin, logicW - safeMargin - w);
  if (top + h > logicH - safeMargin) top = Math.max(safeMargin, logicH - safeMargin - h);

  if (obj.left !== left || obj.top !== top) {
    obj.set({ left, top });
  }
};

const handleScaling = (e: any) => {
  const obj = e.target;
  if (!obj || !fCanvas || obj === paperRect || obj === safeRect || !obj._lastSafeState) return;

  const logicW = Number(props.wMM) * mmToPx;
  const logicH = Number(props.hMM) * mmToPx;
  const safeMargin = 0.5 * mmToPx; 
  
  const w = obj.getScaledWidth();
  const h = obj.getScaledHeight();
  const left = obj.left || 0;
  const top = obj.top || 0;

  const isLine = obj.get('customType') === 'line';
  const isVert = obj.get('isVertical');

  const minW = isLine ? (isVert ? 2 : 10) : 10;
  const minH = isLine ? (isVert ? 10 : 2) : 10;

  const epsilon = 0.1;
  const isOut = 
    left < safeMargin - epsilon || 
    top < safeMargin - epsilon || 
    left + w > logicW - safeMargin + epsilon || 
    top + h > logicH - safeMargin + epsilon;

  const isTooSmall = w < minW || h < minH;

  if (isOut || isTooSmall) {
      obj.set(obj._lastSafeState);
  } else {
      obj._lastSafeState = { left: obj.left, top: obj.top, scaleX: obj.scaleX, scaleY: obj.scaleY, width: obj.width, height: obj.height };
  }

  if (obj.get('customType') === 'text') {
      obj.set({ width: Math.max(obj.width * obj.scaleX, 20), scaleX: 1, scaleY: 1 });
  }
};

// ==========================================
// 3. 初始化 Canvas 和图层构建
// ==========================================
const initCanvas = () => {
  if (!canvasRef.value) return;

  Object.assign(fabric.Object.prototype, baseConfig);

  fCanvas = new fabric.Canvas(canvasRef.value, {
    preserveObjectStacking: true, 
    selection: true,
  });

  fCanvas.on('object:added', (opt) => {
    const obj = opt.target;
    if (!obj || obj === paperRect || obj === safeRect) return;
    if (obj.get('customType') === 'barcode') {
      obj.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false, tl: false, tr: false, bl: false, br: false, mtr: false });
    } else if (obj.get('customType') !== 'line') {
      obj.setControlsVisibility({ mtr: false });
    }
  });

  fCanvas.on('before:transform', (e: any) => {
      const obj = e.transform?.target;
      if (obj && obj !== paperRect && obj !== safeRect) {
          obj._lastSafeState = { left: obj.left, top: obj.top, scaleX: obj.scaleX, scaleY: obj.scaleY, width: obj.width, height: obj.height };
      }
  });

  fCanvas.on('object:moving', handleMoving);
  fCanvas.on('object:scaling', handleScaling);

  fCanvas.on('object:modified', () => { 
    const obj = fCanvas!.getActiveObject() as any;
    if (obj && obj.get('customType') === 'line') {
        const isVert = obj.get('isVertical');
        let finalW = obj.width * obj.scaleX;
        let finalH = obj.height * obj.scaleY;
        
        obj.set({
            width: isVert ? 2 : Math.max(finalW, 10),
            height: isVert ? Math.max(finalH, 10) : 2,
            scaleX: 1, scaleY: 1
        });
        obj.setCoords();
    }
    syncActiveObject(); 
    emit('modified'); 
  });

  fCanvas.on('selection:created', syncActiveObject);
  fCanvas.on('selection:updated', syncActiveObject);
  fCanvas.on('selection:cleared', () => emit('update:activeElement', null));

  renderPaper();
};

const syncActiveObject = () => {
  if (!fCanvas) return;
  const activeObj = fCanvas.getActiveObject();
  if (!activeObj || activeObj === paperRect || activeObj === safeRect) {
    emit('update:activeElement', null);
    return;
  }
  emit('update:activeElement', {
    id: activeObj.get('id'),
    type: activeObj.get('customType'),
    fontSize: activeObj.get('fontSize'),
    fontWeight: activeObj.get('fontWeight'),
    isVertical: activeObj.get('isVertical'),
    width: (activeObj.get('width') || 0) * (activeObj.get('scaleX') || 1),
    height: (activeObj.get('height') || 0) * (activeObj.get('scaleY') || 1)
  });
};

const renderPaper = () => {
  if (!fCanvas) return;
  const currentZoom = fCanvas.getZoom() || 1;
  fCanvas.clear();

  const logicW = Number(props.wMM) * mmToPx;
  const logicH = Number(props.hMM) * mmToPx;

  // 1. 唯一一次创建白底 (最先添加 = 最底层)
  paperRect = new fabric.Rect({
    left: 0, top: 0, width: logicW, height: logicH, fill: '#ffffff',
    selectable: false, evented: false, strokeWidth: 0, hoverCursor: 'default'
  });
  paperRect.set('customType', 'paperRect');
  fCanvas.add(paperRect);

  // 2. 唯一一次创建红线 (紧随其后 = 倒数第二层)
  const safeMargin = 0.5 * mmToPx;
  safeRect = new fabric.Rect({
    left: safeMargin, 
    top: safeMargin, 
    width: Math.max(0, logicW - safeMargin * 2), 
    height: Math.max(0, logicH - safeMargin * 2),
    fill: 'transparent',
    stroke: '#ff4d4f', 
    strokeWidth: 1, 
    strokeUniform: true, 
    strokeDashArray: [4, 4],
    selectable: false,   
    evented: false,      
    hoverCursor: 'default',
    excludeFromExport: true
  });
  safeRect.set('customType', 'safeArea');
  fCanvas.add(safeRect);

  props.initialElements.forEach(el => {
    const parsePx = (val: string | number) => parseFloat(String(val).replace('px', '')) || 0;
    const left = parsePx(el.style?.left); 
    const top = parsePx(el.style?.top);
    const width = parsePx(el.style?.width || 100);
    const height = parsePx(el.style?.height || 20);

    let fObj: fabric.Object | null = null;

    if (el.type === 'text') {
      fObj = new fabric.Textbox(el.content || '请输入文字', {
        left, top, width, fontSize: parsePx(el.fontSize || 24),
        fontWeight: el.fontWeight === 'bold' ? 'bold' : 'normal',
        fontFamily: 'Microsoft YaHei, sans-serif', fill: '#000000', splitByGrapheme: true,
        ...baseConfig
      });
      fObj.set('customType', 'text');
    } 
    else if (el.type === 'line') {
      const isVertical = el.isVertical === 'true' || el.isVertical === true;
      fObj = new fabric.Rect({
        left, top,
        width: isVertical ? 2 : Math.max(width, 10),
        height: isVertical ? Math.max(height, 10) : 2,
        fill: '#000000',
        lockScalingX: isVertical, lockScalingY: !isVertical,
        centeredScaling: false,
        ...baseConfig
      });
      fObj.setControlsVisibility({ tl: false, tr: false, bl: false, br: false, mtr: false, mt: isVertical, mb: isVertical, ml: !isVertical, mr: !isVertical });
      fObj.set('customType', 'line');
      fObj.set('isVertical', isVertical);
    } 
    else if (el.type === 'image' && el.imgUrl) {
      fabric.Image.fromURL(el.imgUrl).then((img) => {
        img.set({ 
          left, top, customType: 'image', id: el.id, originalUrl: el.originalUrl, imgUrl: el.imgUrl,
          lockUniScaling: true,
          ...baseConfig 
        } as any);
        img.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false, mtr: false }); 
        img.scaleToWidth(width);
        fCanvas?.add(img);
        fCanvas?.requestRenderAll();
      });
      return; 
    }
    else if (el.type === 'barcode') {
      const rect = new fabric.Rect({
        left: 0, top: 0, width: el.customW ? el.customW * mmToPx : width, height: el.customH ? el.customH * mmToPx : height,
        fill: '#f8fafc', stroke: '#94a3b8', strokeDashArray: [4, 4]
      });
      const tagText = new fabric.Text('条码占位', { left: 5, top: 5, fontSize: 12, fill: '#64748b' });
      fObj = new fabric.Group([rect, tagText], { 
        left, top, customType: 'barcode', customW: el.customW, customH: el.customH,
        lockScalingX: true, lockScalingY: true,
        ...baseConfig
      } as any);
    }

    if (fObj) {
      fObj.set('id', el.id || Date.now().toString());
      fCanvas!.add(fObj);
      handleMoving({ target: fObj }); 
    }
  });

  centerAndZoom(currentZoom);
  fCanvas.requestRenderAll();
};

const getPaperCenter = () => {
  return { cx: (Number(props.wMM) * mmToPx) / 2, cy: (Number(props.hMM) * mmToPx) / 2 };
};

const addText = (content = '双击修改文本') => {
  if (!fCanvas || !paperRect) return;
  const { cx, cy } = getPaperCenter();
  const w = Math.min(200, Number(props.wMM) * mmToPx);
  const text = new fabric.Textbox(content, {
    left: Math.max(0, cx - w/2), top: Math.max(0, cy - 15), width: w, 
    fontSize: 24, fontFamily: 'Microsoft YaHei, sans-serif', fill: '#000000', splitByGrapheme: true,
    ...baseConfig
  });
  text.set('customType', 'text');
  text.set('id', Date.now().toString());
  fCanvas.add(text);
  fCanvas.setActiveObject(text);
  handleMoving({ target: text });
  emit('modified');
};

const addLine = () => {
  if (!fCanvas || !paperRect) return;
  const { cx, cy } = getPaperCenter();
  const length = Math.max(10, Math.min(150, Number(props.wMM) * mmToPx));
  
  const line = new fabric.Rect({
    left: Math.max(0, cx - length/2), top: Math.max(0, cy - 1), 
    width: length, height: 2, fill: '#000000',
    lockScalingY: true, centeredScaling: false,
    ...baseConfig
  });
  line.setControlsVisibility({ tl: false, tr: false, bl: false, br: false, mt: false, mb: false, mtr: false, ml: true, mr: true });
  line.set('customType', 'line');
  line.set('isVertical', false);
  line.set('id', Date.now().toString());
  fCanvas.add(line);
  fCanvas.setActiveObject(line);
  handleMoving({ target: line });
  emit('modified');
};

const addImage = (url: string, originalUrl?: string) => {
  if (!fCanvas || !paperRect) return;
  const { cx, cy } = getPaperCenter();
  fabric.Image.fromURL(url).then((img) => {
    img.scaleToWidth(Math.min(80, Number(props.wMM) * mmToPx));
    img.set({
      left: Math.max(0, cx - img.getScaledWidth() / 2), 
      top: Math.max(0, cy - img.getScaledHeight() / 2),
      customType: 'image', id: Date.now().toString(), imgUrl: url, originalUrl: originalUrl || url,
      lockUniScaling: true,
      ...baseConfig
    } as any);
    img.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false, mtr: false });
    fCanvas?.add(img);
    fCanvas?.setActiveObject(img);
    handleMoving({ target: img });
    emit('modified');
  });
};

const addBarcode = (w: number, h: number) => {
  if (!fCanvas || !paperRect) return;
  const { cx, cy } = getPaperCenter();
  const wPx = w * mmToPx; const hPx = h * mmToPx;
  
  const rect = new fabric.Rect({ left: 0, top: 0, width: wPx, height: hPx, fill: '#f8fafc', stroke: '#94a3b8', strokeDashArray: [4, 4] });
  const text = new fabric.Text('条码占位', { left: 5, top: 5, fontSize: 14, fill: '#64748b' });
  const group = new fabric.Group([rect, text], {
    left: Math.max(0, cx - wPx / 2), top: Math.max(0, cy - hPx / 2),
    customType: 'barcode', customW: w, customH: h, id: Date.now().toString(),
    lockScalingX: true, lockScalingY: true,
    ...baseConfig
  } as any);
  group.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false, tl: false, tr: false, bl: false, br: false, mtr: false });
  fCanvas.add(group);
  fCanvas.setActiveObject(group);
  handleMoving({ target: group });
  emit('modified');
};

const deleteActive = () => {
  if (!fCanvas) return;
  const activeObjects = fCanvas.getActiveObjects();
  if (activeObjects.length) {
    activeObjects.forEach(obj => { if (obj !== paperRect && obj !== safeRect) fCanvas!.remove(obj); });
    fCanvas.discardActiveObject();
    fCanvas.requestRenderAll();
    emit('modified');
  }
};

const updateActiveTextProperty = (key: string, value: any) => {
  const obj = fCanvas?.getActiveObject();
  if (obj && obj.get('customType') === 'text') {
    obj.set(key, value);
    obj.setCoords();
    handleMoving({ target: obj });
    fCanvas?.requestRenderAll();
    emit('modified');
  }
};

const updateActiveLineProperty = (isVertical: boolean, lengthPx: number) => {
  const obj = fCanvas?.getActiveObject() as any;
  if (obj && obj.get('customType') === 'line') {
    obj.set({
      width: isVertical ? 2 : Math.max(lengthPx, 10),
      height: isVertical ? Math.max(lengthPx, 10) : 2,
      isVertical: isVertical,
      scaleX: 1, scaleY: 1,
      lockScalingX: isVertical,
      lockScalingY: !isVertical
    });
    obj.setControlsVisibility({ tl: false, tr: false, bl: false, br: false, mtr: false, mt: isVertical, mb: isVertical, ml: !isVertical, mr: !isVertical });
    obj.setCoords(); 
    handleMoving({ target: obj });
    fCanvas?.requestRenderAll();
    syncActiveObject(); 
    emit('modified');
  }
};

const resetBarcodeSize = () => {
  if (!fCanvas) return false;
  let hasBarcode = false;
  fCanvas.getObjects().forEach(obj => {
    if (obj.get('customType') === 'barcode') {
      obj.set({ scaleX: 1, scaleY: 1 });
      obj.setCoords(); 
      handleMoving({ target: obj });
      hasBarcode = true;
    }
  });
  if (hasBarcode) {
    fCanvas.requestRenderAll();
    syncActiveObject(); 
    emit('modified');
  }
  return hasBarcode;
};

const exportToJSON = () => {
  if (!fCanvas) return [];
  const elements: any[] = [];
  
  fCanvas.getObjects().forEach(obj => {
    if (obj === paperRect || obj === safeRect) return;
    const leftPx = obj.left!;
    const topPx = obj.top!;
    const widthPx = (obj.width || 0) * (obj.scaleX || 1);
    const heightPx = (obj.height || 0) * (obj.scaleY || 1);

    const type = obj.get('customType');
    const elData: any = { id: obj.get('id'), type: type, style: { left: `${leftPx}px`, top: `${topPx}px`, width: `${widthPx}px`, height: `${heightPx}px` }};

    if (type === 'text') {
      elData.content = (obj as any).text;
      elData.fontSize = `${obj.get('fontSize')}px`;
      elData.fontWeight = obj.get('fontWeight');
    } else if (type === 'line') {
      elData.isVertical = obj.get('isVertical');
    } else if (type === 'image') {
      elData.imgUrl = obj.get('imgUrl');
      elData.originalUrl = obj.get('originalUrl');
    } else if (type === 'barcode') {
      elData.customW = obj.get('customW');
      elData.customH = obj.get('customH');
      elData.content = '123456789'; 
    }
    elements.push(elData);
  });
  return elements;
};

// 🌟 当尺寸变化时：【只改宽高，不改图层】
watch(() => [props.wMM, props.hMM], () => { 
  if (!fCanvas) return;
  
  const logicW = Number(props.wMM) * mmToPx;
  const logicH = Number(props.hMM) * mmToPx;

  // 直接修改原纸张的大小（不删不加，绝不改变图层层级）
  if (paperRect) {
    paperRect.set({ width: logicW, height: logicH });
    paperRect.setCoords();
  }

  // 直接修改红线的大小
  const safeMargin = 0.5 * mmToPx;
  if (safeRect) {
    safeRect.set({
      width: Math.max(0, logicW - safeMargin * 2),
      height: Math.max(0, logicH - safeMargin * 2)
    });
    safeRect.setCoords();
  }

  // 同步内外尺寸
  centerAndZoom(fCanvas.getZoom() || 1); 
  
  // 把元素挤回新的框里
  fCanvas.getObjects().forEach(obj => {
    if (obj !== paperRect && obj !== safeRect) {
      handleMoving({ target: obj });
    }
  });
  
  fCanvas.requestRenderAll();
  emit('modified'); 
});

onMounted(() => {
  setTimeout(() => {
    initCanvas();
    window.addEventListener('keydown', handleKeydown);
  }, 50);
});

const handleKeydown = (e: KeyboardEvent) => {
  const tag = (e.target as HTMLElement).tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;
  if (e.key === 'Delete' || e.key === 'Backspace') {
    deleteActive();
    e.preventDefault();
  }
};

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (fCanvas) fCanvas.dispose();
});

defineExpose({
  addText, addLine, addImage, addBarcode, deleteActive, setCanvasZoom,
  updateActiveTextProperty, updateActiveLineProperty, resetBarcodeSize, exportToJSON, 
  getCanvas: () => canvasRef.value
});
</script>

<style scoped>
/* 🌟 核心破局：物理学消灭错位！强制内部 Fabric 画布绝对填满 Vue 控制的那个带阴影白纸壳 */
:deep(.canvas-container) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

:deep(canvas) {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  outline: none !important;
}
</style>