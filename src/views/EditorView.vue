<template>
  <div class="fixed inset-0 z-[100] bg-slate-50 flex flex-col w-screen h-screen overflow-hidden selection:bg-primary-100 selection:text-primary-700">

    <header class="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 z-30 shadow-sm relative">
      
      <div class="flex items-center gap-6 w-1/3">
        <button @click="closeEditor" class="flex items-center gap-1.5 text-slate-500 hover:text-primary-600 transition-colors font-bold text-[14px] group">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" class="transform group-hover:-translate-x-1 transition-transform"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          返回
        </button>
        <div class="w-px h-5 bg-slate-200"></div>
        <div class="flex items-center gap-2 flex-1 group relative">
          <div class="w-7 h-7 bg-primary-50 text-primary-600 rounded-md flex items-center justify-center shrink-0 border border-primary-100">
             <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <input v-model="store.currentLabel.name" class="flex-1 text-[15px] font-extrabold bg-transparent outline-none text-slate-900 placeholder-slate-400 border border-transparent hover:border-slate-200 focus:border-primary-400 focus:bg-primary-50 rounded px-2 py-1 transition-all" placeholder="未命名标签" />
        </div>
      </div>

      <div class="flex items-center gap-3 w-1/3 justify-end">
        <button @click="triggerSaveModal('saveAs')" class="btn btn-subtle text-slate-600 px-4 h-9 text-[13px]"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>另存为</button>
        <button @click="doExportPDF" class="btn text-warning hover:bg-warning-bg bg-white border border-warning/30 shadow-sm px-4 h-9 text-[13px]"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>导出为模板</button>
        <button @click="triggerPdfImport" class="btn text-purple-600 hover:bg-purple-50 bg-white border border-purple-200 shadow-sm px-4 h-9 text-[13px]"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>合成标签</button>
        <input type="file" ref="pdfInputRef" accept="application/pdf" class="hidden" @change="handleBatchPDF" />
        <div class="w-px h-5 bg-slate-200 mx-1"></div>
        <button @click="triggerSaveModal('save')" :disabled="store.isLoading" class="btn btn-primary px-6 h-9 shadow-md shadow-primary-500/20 disabled:opacity-50"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>保存</button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden relative">
      <ComponentLibrary @add-item="handleSidebarClickAdd" />

      <main class="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
        
        <div class="min-h-[50px] bg-white border-b border-slate-200 flex flex-wrap items-center px-4 gap-1 shrink-0 z-20">
          
          <button @click="openResizeModal" class="flex items-center gap-1.5 px-3 h-8 rounded-md text-[13px] font-bold text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>尺寸设定</button>
          <div class="w-px h-4 bg-slate-200 mx-2"></div>
          <button @click="addText" class="flex items-center gap-1.5 px-3 h-8 rounded-md text-[13px] font-bold text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>添加文本</button>
          <button @click="triggerImageUpload" class="flex items-center gap-1.5 px-3 h-8 rounded-md text-[13px] font-bold text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>导入图片</button>
          <input type="file" ref="imageInputRef" accept="image/*" class="hidden" @change="handleImageUpload" />
          <button @click="addLine" class="flex items-center gap-1.5 px-3 h-8 rounded-md text-[13px] font-bold text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>添加线条</button>
          <div class="w-px h-4 bg-slate-200 mx-2"></div>

          <button @click="resetBarcode" class="flex items-center gap-1.5 px-3 h-8 rounded-md text-[13px] font-bold text-warning hover:bg-warning-bg transition-colors"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>复原条码</button>
          <button @click="showCustomBarcodeModal = true" class="flex items-center gap-1.5 px-3 h-8 rounded-md text-[13px] font-bold text-warning hover:bg-warning-bg transition-colors"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none"><path d="M3 5h2v14H3V5zm4 0h3v14H7V5zm5 0h2v14h-2V5zm4 0h3v14h-3V5zm5 0h2v14h-2V5z"/></svg>定制条码</button>

          <div class="ml-auto flex items-center pr-2">
            <transition name="fade">
              <div v-if="activeElement" class="flex items-center gap-2">
                <div v-if="activeElement.type === 'text'" class="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shadow-sm">
                  <span class="text-[11px] text-slate-500 font-bold px-2">字号</span>
                  <button @click="changeFontSize(-1)" class="w-7 h-7 hover:bg-white rounded hover:shadow-sm font-bold text-slate-600 flex items-center justify-center transition-all">-</button>
                  <span class="text-[13px] font-mono w-8 text-center font-bold text-primary-600">{{ parseInt(activeElement.fontSize || '24') }}</span>
                  <button @click="changeFontSize(1)" class="w-7 h-7 hover:bg-white rounded hover:shadow-sm font-bold text-slate-600 flex items-center justify-center transition-all">+</button>
                  <div class="w-px h-4 bg-slate-300 mx-1"></div>
                  <button @click="toggleBold" :class="{ 'bg-slate-900 text-white shadow-sm': activeElement.fontWeight === 'bold', 'text-slate-600 hover:bg-white hover:shadow-sm': activeElement.fontWeight !== 'bold' }" class="w-7 h-7 rounded font-bold transition-all flex items-center justify-center text-[13px]">B</button>
                </div>
                
                <div v-if="activeElement.type === 'line'" class="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shadow-sm">
                  <span class="text-[11px] text-slate-500 font-bold px-2">长度</span>
                  <input type="number" :value="linePhysicalLength" @change="updateLineLength($event)" class="w-12 bg-white border border-slate-300 rounded outline-none text-center font-mono text-[13px] text-primary-600 font-bold py-1 mx-1" />
                  <span class="text-[10px] text-slate-400 font-bold mr-2">mm</span>
                  <div class="w-px h-4 bg-slate-300 mx-1"></div>
                  <button @click="rotateLine" class="px-2 h-7 hover:bg-white rounded hover:shadow-sm text-slate-600 text-xs font-bold flex items-center gap-1 transition-all"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>旋转</button>
                </div>
                
                <div class="w-px h-5 bg-slate-200 mx-1"></div>
                <button @click="deleteActive" class="flex items-center justify-center w-8 h-8 rounded-md text-danger hover:bg-danger-bg transition-colors" title="删除选中元素"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
              </div>
            </transition>
          </div>
        </div>

        <CanvasArea v-model:elements="store.currentLabel.elements" v-model:activeId="activeElementId" :wMM="store.currentLabel.wMM" :hMM="store.currentLabel.hMM" :scale="canvasScale" />

        <div class="absolute bottom-6 left-6 right-6 flex justify-between pointer-events-none z-[120]">
          <div class="pointer-events-auto flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 h-10 rounded-full shadow-lg border border-slate-200/50 text-slate-600 text-[13px] font-bold">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--color-primary-600)" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            纸张尺寸: 
            <span class="text-primary-600 ml-1 tracking-wider">{{ store.currentLabel.wMM }} × {{ store.currentLabel.hMM }} <span class="text-[11px] text-slate-400">mm</span></span>
          </div>

          <div class="pointer-events-auto flex items-center bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-slate-200/50 overflow-hidden h-10 px-1">
            <button @click="canvasScale = Math.max(0.1, canvasScale - 0.1)" class="w-8 h-8 rounded-full hover:bg-slate-200/50 text-slate-600 font-bold flex justify-center items-center transition-colors">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <span class="text-[13px] font-mono w-14 text-center font-bold text-primary-600 select-none">{{ Math.round(canvasScale * 100) }}%</span>
            <button @click="canvasScale = Math.min(3, canvasScale + 0.1)" class="w-8 h-8 rounded-full hover:bg-slate-200/50 text-slate-600 font-bold flex justify-center items-center transition-colors">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </main>
    </div>

    <div v-if="showResizeModal" class="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[2000] px-4 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-[360px] overflow-hidden flex flex-col border border-slate-200 transform transition-all scale-100">
        <div class="px-6 py-5 bg-slate-50 border-b border-slate-100"><h3 class="font-extrabold text-[16px] text-slate-900 text-center tracking-wide">修改画布尺寸</h3></div>
        <div class="p-6 space-y-5">
          <div class="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-50 focus-within:bg-white transition-all">
            <span class="text-[14px] font-bold text-slate-500 whitespace-nowrap shrink-0 w-16 text-right">宽度</span><input v-model.number="tempResizeW" type="number" min="10" class="flex-1 w-full bg-transparent outline-none text-xl font-mono font-bold text-slate-900 text-center"><span class="text-[13px] font-bold text-slate-400 whitespace-nowrap shrink-0">mm</span></div>
          <div class="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-50 focus-within:bg-white transition-all">
            <span class="text-[14px] font-bold text-slate-500 whitespace-nowrap shrink-0 w-16 text-right">高度</span><input v-model.number="tempResizeH" type="number" min="10" class="flex-1 w-full bg-transparent outline-none text-xl font-mono font-bold text-slate-900 text-center"><span class="text-[13px] font-bold text-slate-400 whitespace-nowrap shrink-0">mm</span></div>
        </div>
        <div class="px-6 py-5 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
          <button @click="showResizeModal = false" class="btn btn-subtle py-2.5">取消</button>
          <button @click="confirmResize" class="btn btn-primary py-2.5">确认应用</button>
        </div>
      </div>
    </div>

    <div v-if="showCustomBarcodeModal" class="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[2000] px-4 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-[360px] overflow-hidden flex flex-col border border-slate-200">
        <div class="px-6 py-5 bg-warning-bg/50 border-b border-warning/20"><h3 class="font-extrabold text-[16px] text-warning text-center tracking-wide">自定义条码尺寸</h3></div>
        <div class="p-6 space-y-5">
          <div class="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-warning focus-within:ring-2 focus-within:ring-warning-bg focus-within:bg-white transition-all">
            <span class="text-[14px] font-bold text-slate-500 whitespace-nowrap shrink-0 w-16 text-right">宽度</span><input v-model.number="customBarcodeW" type="number" min="10" class="flex-1 w-full bg-transparent outline-none text-xl font-mono font-bold text-slate-900 text-center"><span class="text-[13px] font-bold text-slate-400 whitespace-nowrap shrink-0">mm</span></div>
          <div class="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-warning focus-within:ring-2 focus-within:ring-warning-bg focus-within:bg-white transition-all">
            <span class="text-[14px] font-bold text-slate-500 whitespace-nowrap shrink-0 w-16 text-right">高度</span><input v-model.number="customBarcodeH" type="number" min="10" class="flex-1 w-full bg-transparent outline-none text-xl font-mono font-bold text-slate-900 text-center"><span class="text-[13px] font-bold text-slate-400 whitespace-nowrap shrink-0">mm</span></div>
        </div>
        <div class="px-6 py-5 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
          <button @click="showCustomBarcodeModal = false" class="btn btn-subtle py-2.5">取消</button>
          <button @click="confirmCustomBarcode" class="btn bg-warning text-white hover:brightness-95 py-2.5">插入条码</button>
        </div>
      </div>
    </div>

    <div v-if="showSaveModal" class="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[2000] px-4 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-[360px] overflow-hidden flex flex-col border border-slate-200">
        <div class="px-6 py-5 bg-slate-50 border-b border-slate-100"><h3 class="font-extrabold text-[16px] text-slate-900 text-center tracking-wide">{{ saveActionType === 'saveAs' ? '另存为新副本' : '保存标签确认' }}</h3></div>
        <div class="p-8">
          <input v-model="saveLabelName" type="text" placeholder="请输入标签名称" class="input-field w-full text-center text-lg font-bold">
        </div>
        <div class="px-6 py-5 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
          <button @click="showSaveModal = false" class="btn btn-subtle py-2.5">取消</button>
          <button @click="confirmSaveAction(false)" :disabled="store.isLoading" class="btn btn-primary py-2.5 disabled:opacity-50">确认保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMainStore } from '../store/useMainStore';
import ComponentLibrary from '../components/ComponentLibrary.vue';
import CanvasArea from '../components/CanvasArea.vue';
import { saveLabel, clearLocalCache } from '../utils/db';
import { exportSinglePDF, exportBatchPDF } from '../utils/pdfExport';
import { cropImageWhitespace } from '../utils/imageCrop';

const store = useMainStore();
const showToast = (msg: string, type = 'info') => (window as any).showToast(msg, type);

const activeElementId = ref<string | null>(null);
const canvasScale = ref(1);
const MM_TO_PX = 3.78;
const ZOOM_FACTOR = 2;
let elementZIndex = 100;

const pdfInputRef = ref<HTMLInputElement | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);

const showResizeModal = ref(false);
const tempResizeW = ref(100);
const tempResizeH = ref(100);

const showCustomBarcodeModal = ref(false);
const customBarcodeW = ref(70);
const customBarcodeH = ref(20);

const showSaveModal = ref(false);
const saveActionType = ref<'save' | 'saveAs'>('save');
const saveLabelName = ref('');

const activeElement = computed(() => store.currentLabel.elements.find(el => el.id === activeElementId.value));

const linePhysicalLength = computed(() => {
  if (!activeElement.value || activeElement.value.type !== 'line') return 0;
  const isVert = activeElement.value.isVertical === 'true';
  const px = parseFloat(isVert ? activeElement.value.style.height : activeElement.value.style.width);
  return Math.round(px / (MM_TO_PX * ZOOM_FACTOR));
});

const getCleanData = (label: any) => {
  if (!label) return '';
  return JSON.stringify({
    name: label.name, wMM: label.wMM, hMM: label.hMM,
    elements: label.elements.map((el: any) => ({
      id: el.id, type: el.type, content: el.content, customW: el.customW, customH: el.customH,
      style: { width: el.style?.width, height: el.style?.height, left: el.style?.left, top: el.style?.top }
    }))
  });
};

const isCurrentLabelUnsaved = computed(() => {
  if (!store.currentLabel || !store.currentLabel.id) return true;
  const original = store.savedLabels.find(l => l.id === store.currentLabel.id);
  if (!original) return true;
  return getCleanData(original) !== getCleanData(store.currentLabel);
});

function autoFitCanvas() {
  const workspace = document.getElementById('workspace-container') || document.body;
  const availableW = workspace.clientWidth - 100;
  const availableH = workspace.clientHeight - 100;
  const targetW = store.currentLabel.wMM * MM_TO_PX * ZOOM_FACTOR;
  const targetH = store.currentLabel.hMM * MM_TO_PX * ZOOM_FACTOR;
  let scale = Math.min(availableW / targetW, availableH / targetH);
  canvasScale.value = Math.max(0.1, Math.min(scale, 3));
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if (!activeElement.value) return;
  const tag = (e.target as HTMLElement).tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;

  if (e.key === 'Delete' || e.key === 'Backspace') { deleteActive(); e.preventDefault(); return; }

  const stepPx = e.shiftKey ? 10 : 1;
  let left = parseFloat(activeElement.value.style.left);
  let top = parseFloat(activeElement.value.style.top);
  let moved = false;

  switch (e.key) {
    case 'ArrowUp': top -= stepPx; moved = true; break;
    case 'ArrowDown': top += stepPx; moved = true; break;
    case 'ArrowLeft': left -= stepPx; moved = true; break;
    case 'ArrowRight': left += stepPx; moved = true; break;
  }
  if (moved) {
    e.preventDefault();
    activeElement.value.style.left = `${Math.max(0, left)}px`;
    activeElement.value.style.top = `${Math.max(0, top)}px`;
  }
}

onMounted(() => {
  const maxZ = Math.max(0, ...store.currentLabel.elements.map(el => Number(el.style.zIndex) || 0));
  elementZIndex = maxZ + 10;
  window.addEventListener('resize', autoFitCanvas);
  document.addEventListener('keydown', handleGlobalKeydown);
  setTimeout(autoFitCanvas, 100);
});

onUnmounted(() => {
  window.removeEventListener('resize', autoFitCanvas);
  document.removeEventListener('keydown', handleGlobalKeydown);
});

function addText() { store.currentLabel.elements.push({ id: Date.now().toString(), type: 'text', content: '双击修改文本', fontSize: '24px', fontWeight: 'normal', style: { width: '200px', height: 'auto', left: '20px', top: '20px', zIndex: elementZIndex++ } }); }
function addLine() { store.currentLabel.elements.push({ id: Date.now().toString(), type: 'line', isVertical: 'false', style: { width: '150px', height: `${0.2 * MM_TO_PX * ZOOM_FACTOR}px`, left: '20px', top: '20px', zIndex: elementZIndex++ } }); }
function triggerImageUpload() { imageInputRef.value?.click(); }

function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const dataUrl = ev.target?.result as string;
    const cropResult = await cropImageWhitespace(dataUrl);
    const finalH = Math.round(80 * (cropResult.height / cropResult.width));
    store.currentLabel.elements.push({ id: Date.now().toString(), type: 'image', imgUrl: cropResult.url, originalUrl: dataUrl, style: { width: '80px', height: `${finalH}px`, left: '20px', top: '20px', zIndex: elementZIndex++ } });
    if (imageInputRef.value) imageInputRef.value.value = '';
  };
  reader.readAsDataURL(file);
}

function confirmCustomBarcode() {
  if (!customBarcodeW.value || !customBarcodeH.value) return showToast('请输入完整尺寸', 'warning');
  let wPx = customBarcodeW.value * MM_TO_PX * ZOOM_FACTOR;
  let hPx = customBarcodeH.value * MM_TO_PX * ZOOM_FACTOR;
  store.currentLabel.elements.push({ id: Date.now().toString(), type: 'barcode', customW: customBarcodeW.value, customH: customBarcodeH.value, style: { width: `${wPx}px`, height: `${hPx}px`, left: '10px', top: '10px', zIndex: elementZIndex++ } });
  showCustomBarcodeModal.value = false;
}

function resetBarcode() { 
  const barcode = store.currentLabel.elements.find(el => el.type === 'barcode'); 
  if (!barcode) return showToast('画布中暂无条码，无法复原', 'warning');
  const w = barcode.customW || 70; const h = barcode.customH || 20;
  const wPx = w * MM_TO_PX * ZOOM_FACTOR; const hPx = h * MM_TO_PX * ZOOM_FACTOR;
  const canvasHPx = store.currentLabel.hMM * MM_TO_PX * ZOOM_FACTOR; 
  barcode.style.width = `${wPx}px`; barcode.style.height = `${hPx}px`;
  barcode.style.left = '0px'; barcode.style.top = `${Math.max(0, canvasHPx - hPx)}px`; 
}

function deleteActive() { if (activeElementId.value) { store.currentLabel.elements = store.currentLabel.elements.filter(el => el.id !== activeElementId.value); activeElementId.value = null; } }

function changeFontSize(delta: number) {
  if (activeElement.value && activeElement.value.type === 'text') {
    let currentSize = parseInt(activeElement.value.fontSize || '24');
    activeElement.value.fontSize = `${Math.max(10, currentSize + delta * 2)}px`;
  }
}

function toggleBold() { if (activeElement.value && activeElement.value.type === 'text') { activeElement.value.fontWeight = activeElement.value.fontWeight === 'bold' ? 'normal' : 'bold'; } }

function updateLineLength(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value);
  if (val && activeElement.value) {
    const newPx = val * MM_TO_PX * ZOOM_FACTOR;
    if (activeElement.value.isVertical === 'true') { activeElement.value.style.height = `${newPx}px`; } else { activeElement.value.style.width = `${newPx}px`; }
  }
}

function rotateLine() {
  if (activeElement.value && activeElement.value.type === 'line') {
    const isVert = activeElement.value.isVertical === 'true';
    const oldW = activeElement.value.style.width; const oldH = activeElement.value.style.height;
    activeElement.value.style.width = oldH; activeElement.value.style.height = oldW;
    activeElement.value.isVertical = isVert ? 'false' : 'true';
  }
}

async function handleSidebarClickAdd(payload: any) {
  let finalImgUrl = payload.imgUrl; let finalW = payload.type === 'text' ? 200 : 80; let finalH = 80;
  if (payload.type === 'image' && finalImgUrl) {
    const cropResult = await cropImageWhitespace(finalImgUrl);
    finalImgUrl = cropResult.url; finalH = Math.round(80 * (cropResult.height / cropResult.width));
  }
  const canvasW = store.currentLabel.wMM * MM_TO_PX * ZOOM_FACTOR; const canvasH = store.currentLabel.hMM * MM_TO_PX * ZOOM_FACTOR;
  store.currentLabel.elements.push({
    id: Date.now().toString(), type: payload.type, content: payload.content, imgUrl: finalImgUrl, originalUrl: payload.imgUrl, fontSize: '24px', fontWeight: 'normal',
    style: { width: `${finalW}px`, height: payload.type === 'text' ? 'auto' : `${finalH}px`, left: `${(canvasW - finalW) / 2}px`, top: `${(canvasH - (payload.type === 'text' ? 30 : finalH)) / 2}px`, zIndex: elementZIndex++ }
  });
}

function openResizeModal() { tempResizeW.value = store.currentLabel.wMM; tempResizeH.value = store.currentLabel.hMM; showResizeModal.value = true; }
function confirmResize() {
  if (!tempResizeW.value || !tempResizeH.value) return showToast('请输入完整尺寸', 'warning');
  store.currentLabel.wMM = tempResizeW.value; store.currentLabel.hMM = tempResizeH.value;
  showResizeModal.value = false; autoFitCanvas(); showToast('尺寸已修改生效', 'success');
}

function triggerSaveModal(type: 'save' | 'saveAs') {
  saveActionType.value = type; const isExisting = store.savedLabels.some(l => l.id === store.currentLabel.id);
  if (type === 'save' && isExisting && store.currentLabel.name.trim() !== '') { confirmSaveAction(true); return; }
  saveLabelName.value = type === 'saveAs' ? (store.currentLabel.name === '新建标签' ? '未命名标签' : store.currentLabel.name) + ' - 副本' : (store.currentLabel.name === '新建标签' ? '未命名标签' : store.currentLabel.name);
  showSaveModal.value = true;
}

async function confirmSaveAction(directSave = false) {
  if (!directSave && !saveLabelName.value.trim()) return showToast('请输入标签名称', 'warning');
  const targetName = directSave ? store.currentLabel.name : saveLabelName.value.trim();
  let isDuplicate = saveActionType.value === 'saveAs' ? store.savedLabels.some(l => l.name === targetName) : store.savedLabels.some(l => l.name === targetName && l.id !== store.currentLabel.id);
  if (isDuplicate) return showToast('该标签名称已存在，请换一个名称', 'warning');
  if (!directSave) showSaveModal.value = false;

  store.showLoading('保存中...'); activeElementId.value = null;
  try {
    if (saveActionType.value === 'saveAs') {
      const newLabel = JSON.parse(JSON.stringify(store.currentLabel)); newLabel.id = Date.now().toString(); newLabel.name = targetName;
      await saveLabel(newLabel); store.currentLabel = newLabel; showToast('已存为新副本！', 'success');
    } else {
      if (!directSave) store.currentLabel.name = targetName;
      await saveLabel(JSON.parse(JSON.stringify(store.currentLabel))); showToast('保存成功', 'success');
    }
    await clearLocalCache(); await store.fetchLabels(); store.setView('dashboard');
  } catch (e: any) { showToast(e.message || '保存失败', 'error'); } finally { store.hideLoading(); }
}

function closeEditor() { activeElementId.value = null; store.setView('dashboard'); }

async function doExportPDF() {
  if (isCurrentLabelUnsaved.value) return showToast('检测到未保存的修改，请先点击【保存】！', 'warning');
  store.showLoading('生成模板标签中...');
  setTimeout(async () => {
    try {
      const canvasEl = document.getElementById('canvas'); const sizerEl = document.getElementById('canvasSizer');
      if (canvasEl && sizerEl) { await exportSinglePDF(canvasEl, sizerEl, store.currentLabel.wMM, store.currentLabel.hMM, store.currentLabel.name || '导出文件'); showToast('导出成功', 'success'); }
    } catch (err) { showToast('导出失败', 'error'); } finally { store.hideLoading(); }
  }, 150);
}

function triggerPdfImport() {
  if (isCurrentLabelUnsaved.value) return showToast('检测到未保存的修改，请先点击【保存】！', 'warning');
  const barcodeEl = store.currentLabel.elements.find(el => el.type === 'barcode');
  if (!barcodeEl) return showToast('请先新增条码进行占位', 'warning');
  pdfInputRef.value?.click();
}

function handleBatchPDF(e: Event) {
  const input = e.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
  if (file.type !== 'application/pdf') { showToast('只能上传 PDF 文件！', 'warning'); return; }
  const barcodeEl = store.currentLabel.elements.find(el => el.type === 'barcode'); if (!barcodeEl) return;

  activeElementId.value = null; store.showLoading('极速合成中...');
  setTimeout(async () => {
    try {
      const canvasEl = document.getElementById('canvas'); const sizerEl = document.getElementById('canvasSizer');
      if (canvasEl && sizerEl) {
        await exportBatchPDF(file, canvasEl, sizerEl, store.currentLabel.wMM, store.currentLabel.hMM, store.currentLabel.name || '导出文件', barcodeEl, (current, total) => { store.showLoading(`正在合成 (${current}/${total})...`); });
        showToast('合成完成！', 'success');
      }
    } catch (err: any) { showToast('请检查文件是否为条码', 'error'); } finally { store.hideLoading(); if (pdfInputRef.value) pdfInputRef.value.value = ''; }
  }, 150);
}
</script>

<style scoped>
@reference "tailwindcss";

/* 动态面板显隐动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateX(10px); }

/* 防止选中残影 */
:deep(.canvas-item img),
:deep(.barcode-placeholder img) {
  -webkit-user-drag: none !important;
  user-select: none !important;
  pointer-events: none !important;
}

:deep(.vdr),
:deep(.canvas-item),
:deep([class*="vdr"]) {
  transform: translateZ(0) !important;
  backface-visibility: hidden !important;
  will-change: transform, left, top !important;
  box-shadow: none !important;
}

:deep(.vdr.active:before) {
  display: none !important;
}
</style>