<template>
  <div class="fixed inset-0 z-[100] bg-slate-50 flex flex-col w-screen h-screen overflow-hidden selection:bg-primary-100 selection:text-primary-700">

    <header class="h-[64px] px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="w-1/3 flex justify-start">
        <button @click="closeEditor" class="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg text-[13px] font-bold transition-all border border-transparent whitespace-nowrap shrink-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-200 group">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" class="shrink-0 transform group-hover:-translate-x-0.5 transition-transform"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          返回工作台
        </button>
      </div>

      <div class="w-1/3 flex justify-center">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all focus-within:!bg-primary-50 focus-within:!border-primary-200 group">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-400 group-focus-within:text-primary-500 shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <input v-model="store.currentLabel.name" class="w-[200px] text-[15px] font-black bg-transparent outline-none text-slate-800 text-center placeholder-slate-300" placeholder="未命名标签" />
        </div>
      </div>

      <div class="w-1/3 flex justify-end items-center gap-2.5">
        <button @click="triggerSaveModal('saveAs')" class="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg text-[13px] font-bold transition-all border whitespace-nowrap shrink-0 text-cyan-600 bg-cyan-50 border-cyan-100 shadow-sm hover:bg-cyan-100 hover:border-cyan-200"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" class="shrink-0"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>另存为</button>
        <div class="w-px h-4 bg-slate-200 mx-1"></div>
        <button @click="doExportPDF" class="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg text-[13px] font-bold transition-all border whitespace-nowrap shrink-0 text-slate-700 bg-white border-slate-200 shadow-sm hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" class="shrink-0 text-amber-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>导出标签模板</button>
        <button @click="triggerPdfImport" class="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg text-[13px] font-bold transition-all border whitespace-nowrap shrink-0 text-slate-700 bg-white border-slate-200 shadow-sm hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" class="shrink-0 text-purple-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>合成标签</button>
        <input type="file" ref="pdfInputRef" accept="application/pdf" class="hidden" @change="handleBatchPDF" />
        <div class="w-px h-4 bg-slate-200 mx-1"></div>
        <button @click="confirmSaveAction(true)" :disabled="store.isLoading" class="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg text-[13px] font-bold transition-all border border-transparent whitespace-nowrap shrink-0 text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/20 disabled:opacity-50"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" class="shrink-0"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>保存修改</button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden relative">
      <ComponentLibrary @add-item="handleSidebarClickAdd" />

      <main class="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
        
        <div class="min-h-[56px] bg-white border-b border-slate-200 flex items-center px-5 shrink-0 z-20 shadow-[0_4px_12px_rgba(0,0,0,0.01)] overflow-x-auto custom-scrollbar">
          
          <div class="flex items-center gap-2">
            <button @click="openResizeModal" class="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg text-[13px] font-bold text-slate-600 bg-white border border-slate-200 shadow-sm hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-all cursor-pointer whitespace-nowrap shrink-0 group"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-400 group-hover:text-primary-500 transition-colors shrink-0"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>画布尺寸</button>
          </div>
          
          <div class="w-px h-6 bg-slate-200 mx-4"></div>

          <div class="flex items-center gap-2">
            <button @click="canvasAreaRef?.addText()" class="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg text-[13px] font-bold text-slate-600 bg-white border border-slate-200 shadow-sm hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-all cursor-pointer whitespace-nowrap shrink-0 group"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-400 group-hover:text-primary-500 transition-colors shrink-0"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>添加文本</button>
            <button @click="triggerImageUpload" class="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg text-[13px] font-bold text-slate-600 bg-white border border-slate-200 shadow-sm hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-all cursor-pointer whitespace-nowrap shrink-0 group"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-400 group-hover:text-primary-500 transition-colors shrink-0"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>插入图片</button>
            <input type="file" ref="imageInputRef" accept="image/*" class="hidden" @change="handleImageUpload" />
            <button @click="canvasAreaRef?.addLine()" class="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg text-[13px] font-bold text-slate-600 bg-white border border-slate-200 shadow-sm hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-all cursor-pointer whitespace-nowrap shrink-0 group"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-400 group-hover:text-primary-500 transition-colors shrink-0"><line x1="5" y1="12" x2="19" y2="12"></line></svg>添加线条</button>
          </div>
          
          <div class="w-px h-6 bg-slate-200 mx-4"></div>

          <div class="flex items-center gap-2">
            <button @click="showCustomBarcodeModal = true" class="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg text-[13px] font-bold text-slate-600 bg-white border border-slate-200 shadow-sm hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-all cursor-pointer whitespace-nowrap shrink-0 group"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" stroke="none" class="text-slate-400 group-hover:text-amber-500 transition-colors shrink-0"><path d="M3 5h2v14H3V5zm4 0h3v14H7V5zm5 0h2v14h-2V5zm4 0h3v14h-3V5zm5 0h2v14h-2V5z"/></svg>自定义条码</button>
            <button @click="resetBarcode" class="flex items-center gap-1.5 h-[34px] px-3.5 rounded-lg text-[13px] font-bold text-slate-600 bg-white border border-slate-200 shadow-sm hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-all cursor-pointer whitespace-nowrap shrink-0 group" title="复原画布中的条码尺寸"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-400 group-hover:text-amber-500 transition-colors shrink-0"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>复原条码</button>
          </div>

          <div class="ml-auto flex items-center pr-1">
            <transition name="fade">
              <div v-if="activeElement" class="flex items-center h-[38px] bg-white rounded-xl px-1.5 shadow-md border border-slate-200">
                <template v-if="activeElement.type === 'text'">
                  <span class="text-[11px] text-slate-500 font-bold px-2 tracking-widest uppercase">排版</span>
                  <button @click="changeFontSize(-2)" class="w-7 h-7 rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100 flex items-center justify-center font-bold transition-all shadow-sm">-</button>
                  <span class="text-[13px] font-mono w-8 text-center font-bold text-slate-800 select-none">{{ parseInt(activeElement.fontSize || '24') }}</span>
                  <button @click="changeFontSize(2)" class="w-7 h-7 rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100 flex items-center justify-center font-bold transition-all shadow-sm">+</button>
                  <div class="w-px h-4 bg-slate-200 mx-1.5"></div>
                  <button @click="toggleBold" :class="activeElement.fontWeight === 'bold' ? 'bg-primary-100 text-primary-700 border-primary-200' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-100'" class="w-7 h-7 rounded-md flex items-center justify-center border text-[13px] font-bold transition-all shadow-sm">B</button>
                </template>
                <template v-if="activeElement.type === 'line'">
                  <span class="text-[11px] text-slate-500 font-bold px-2 tracking-widest uppercase">长度</span>
                  <input type="number" :value="linePhysicalLength" @change="updateLineLength($event)" class="w-12 bg-slate-50 border border-slate-200 rounded-md outline-none text-center font-mono text-[13px] text-slate-800 font-bold py-0.5" />
                  <span class="text-[10px] text-slate-500 font-bold px-1.5">mm</span>
                  <div class="w-px h-4 bg-slate-200 mx-1"></div>
                  <button @click="rotateLine" class="px-2.5 h-7 rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100 text-[12px] font-bold flex items-center gap-1.5 transition-all shadow-sm"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" class="shrink-0"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>旋转90°</button>
                </template>
                <div v-if="['text', 'line'].includes(activeElement.type)" class="w-px h-4 bg-slate-200 mx-2"></div>
                <button @click="canvasAreaRef?.deleteActive()" class="w-7 h-7 rounded-md bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 border border-red-100 flex items-center justify-center transition-colors shadow-sm" title="删除选中元素 (Del/Backspace)">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" class="shrink-0"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </transition>
          </div>
        </div>

        <div class="flex-1 flex flex-col relative overflow-hidden bg-workspace-grid" id="workspace-grid-container">
            <CanvasArea 
              ref="canvasAreaRef"
              :wMM="store.currentLabel.wMM" 
              :hMM="store.currentLabel.hMM"
              :initialElements="store.currentLabel.elements"
              @update:activeElement="activeElement = $event"
              @update:zoom="canvasScale = $event"
              @modified="isModified = true"
            />
        </div>

        <div class="absolute bottom-6 left-6 right-6 flex justify-between pointer-events-none z-[120]">
          <div class="pointer-events-auto flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 h-10 rounded-full shadow-lg border border-white text-slate-600 text-[13px] font-bold hover:shadow-xl transition-shadow cursor-default">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--color-primary-600)" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            目标纸张: <span class="text-primary-600 ml-1 tracking-wider font-mono">{{ store.currentLabel.wMM }} × {{ store.currentLabel.hMM }} <span class="text-[11px] text-slate-400 font-sans">mm</span></span>
          </div>
          
          <div class="pointer-events-auto flex items-center bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white overflow-hidden h-10 px-1 hover:shadow-xl transition-shadow">
            <button @click="changeZoom(-0.1)" class="w-8 h-8 rounded-full hover:bg-slate-200/50 text-slate-600 font-bold flex justify-center items-center transition-colors"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
            <span class="text-[13px] font-mono w-14 text-center font-bold text-primary-600 select-none">{{ Math.round(canvasScale * 100) }}%</span>
            <button @click="changeZoom(0.1)" class="w-8 h-8 rounded-full hover:bg-slate-200/50 text-slate-600 font-bold flex justify-center items-center transition-colors"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
          </div>
        </div>
      </main>
    </div>

    <transition name="modal-fade">
      <div v-if="showExitModal" class="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showExitModal = false"></div>
        <div class="modal-card relative bg-white rounded-[24px] shadow-2xl w-full max-w-[360px] overflow-hidden flex flex-col border border-white/50 text-center">
          <div class="p-8 pt-10">
            <div class="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h3 class="text-xl font-extrabold text-slate-900 mb-2">确认返回工作台？</h3>
            <p class="text-[13px] text-slate-500 font-medium leading-relaxed">检测到您有未保存的修改内容，直接返回将丢失这些数据。</p>
          </div>
          <div class="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-3">
            <button @click="confirmSaveAndExit" class="w-full h-[42px] rounded-xl font-bold text-[14px] text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all">保存修改并返回</button>
            <div class="grid grid-cols-2 gap-3">
              <button @click="showExitModal = false" class="h-[42px] rounded-xl font-bold text-[14px] text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all">取消</button>
              <button @click="confirmExit" class="h-[42px] rounded-xl font-bold text-[14px] text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all">放弃修改</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showResizeModal" class="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showResizeModal = false"></div>
        <div class="modal-card relative bg-white rounded-[24px] shadow-2xl w-full max-w-[360px] overflow-hidden flex flex-col border border-white/50">
          <div class="px-6 py-5 bg-slate-50/50 border-b border-slate-100 text-center"><h3 class="font-extrabold text-[16px] text-slate-900 tracking-wide">修改纸张物理尺寸</h3></div>
          <div class="p-6 space-y-4">
            <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-50 transition-all shadow-inner">
              <span class="text-[13px] font-bold text-slate-500 whitespace-nowrap shrink-0 w-12 text-right">宽度</span>
              <input v-model.number="tempResizeW" type="number" min="10" class="flex-1 w-full bg-transparent outline-none text-xl font-mono font-bold text-slate-900 text-center">
              <span class="text-[12px] font-bold text-slate-400 whitespace-nowrap shrink-0">mm</span>
            </div>
            <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-50 transition-all shadow-inner">
              <span class="text-[13px] font-bold text-slate-500 whitespace-nowrap shrink-0 w-12 text-right">高度</span>
              <input v-model.number="tempResizeH" type="number" min="10" class="flex-1 w-full bg-transparent outline-none text-xl font-mono font-bold text-slate-900 text-center">
              <span class="text-[12px] font-bold text-slate-400 whitespace-nowrap shrink-0">mm</span>
            </div>
          </div>
          <div class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-3">
            <button @click="showResizeModal = false" class="h-[42px] rounded-xl font-bold text-[14px] text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all">取消</button>
            <button @click="confirmResize" class="h-[42px] rounded-xl font-bold text-[14px] text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all">确认应用</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showCustomBarcodeModal" class="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showCustomBarcodeModal = false"></div>
        <div class="modal-card relative bg-white rounded-[24px] shadow-2xl w-full max-w-[360px] overflow-hidden flex flex-col border border-white/50">
          <div class="px-6 py-5 bg-amber-50/50 border-b border-amber-100 text-center"><h3 class="font-extrabold text-[16px] text-amber-600 tracking-wide">自定义条码尺寸</h3></div>
          <div class="p-6 space-y-4">
            <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-50 transition-all shadow-inner">
              <span class="text-[13px] font-bold text-slate-500 whitespace-nowrap shrink-0 w-12 text-right">宽度</span>
              <input v-model.number="customBarcodeW" type="number" min="10" class="flex-1 w-full bg-transparent outline-none text-xl font-mono font-bold text-slate-900 text-center">
              <span class="text-[12px] font-bold text-slate-400 whitespace-nowrap shrink-0">mm</span>
            </div>
            <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-50 transition-all shadow-inner">
              <span class="text-[13px] font-bold text-slate-500 whitespace-nowrap shrink-0 w-12 text-right">高度</span>
              <input v-model.number="customBarcodeH" type="number" min="10" class="flex-1 w-full bg-transparent outline-none text-xl font-mono font-bold text-slate-900 text-center">
              <span class="text-[12px] font-bold text-slate-400 whitespace-nowrap shrink-0">mm</span>
            </div>
          </div>
          <div class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-3">
            <button @click="showCustomBarcodeModal = false" class="h-[42px] rounded-xl font-bold text-[14px] text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all">取消</button>
            <button @click="confirmCustomBarcode" class="h-[42px] rounded-xl font-bold text-[14px] text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all">插入条码</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showSaveModal" class="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showSaveModal = false"></div>
        <div class="modal-card relative bg-white/95 backdrop-blur-xl border border-white rounded-[24px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] w-full max-w-[380px] overflow-hidden flex flex-col">
          <div class="px-6 py-5 border-b border-slate-200/50 text-center"><h3 class="font-extrabold text-[16px] text-slate-900 tracking-wide">{{ saveActionType === 'saveAs' ? '另存为新副本' : '重命名并保存' }}</h3></div>
          <div class="p-6">
            <input v-model="saveLabelName" type="text" placeholder="请输入标签名称" @keyup.enter="confirmSaveAction(false)" class="w-full bg-white border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-2xl px-4 py-4 outline-none text-center text-[16px] font-bold text-slate-800 transition-all shadow-inner">
          </div>
          <div class="px-6 py-4 bg-slate-50/50 border-t border-slate-200/50 grid grid-cols-2 gap-3">
            <button @click="showSaveModal = false" class="h-[42px] rounded-xl font-bold text-[14px] text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all">取消</button>
            <button @click="confirmSaveAction(false)" :disabled="store.isLoading" class="h-[42px] rounded-xl font-bold text-[14px] text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all disabled:opacity-50">确认保存</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMainStore } from '../store/useMainStore';
import ComponentLibrary from '../components/ComponentLibrary.vue';
import CanvasArea from '../components/CanvasArea.vue';
import { saveLabel } from '../utils/db';
import { exportSinglePDF, exportBatchPDF } from '../utils/pdfExport';
import { cropImageWhitespace } from '../utils/imageCrop';

const store = useMainStore();
const showToast = (msg: string, type = 'info') => (window as any).showToast(msg, type);

const canvasAreaRef = ref<InstanceType<typeof CanvasArea> | null>(null);
const activeElement = ref<any>(null);
const isModified = ref(false); 
const canvasScale = ref(1); 

const MM_TO_PX = 3.78;
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

const showExitModal = ref(false);
let editorResizeObserver: ResizeObserver | null = null;

const linePhysicalLength = computed(() => {
  if (!activeElement.value || activeElement.value.type !== 'line') return 0;
  const isVert = activeElement.value.isVertical;
  const px = isVert ? activeElement.value.height : activeElement.value.width;
  return Math.round(px / MM_TO_PX);
});

function autoFitCanvas() {
  const workspace = document.getElementById('workspace-grid-container');
  if (!workspace || !canvasAreaRef.value) return;
  
  const availableW = workspace.clientWidth - 120;
  const availableH = workspace.clientHeight - 120;
  if (availableW <= 0 || availableH <= 0) return;

  const targetW = Number(store.currentLabel.wMM) * MM_TO_PX;
  const targetH = Number(store.currentLabel.hMM) * MM_TO_PX;
  
  let scale = Math.min(availableW / targetW, availableH / targetH);
  scale = Math.floor(Math.max(0.1, Math.min(scale, 3)) * 100) / 100;
  canvasScale.value = scale;
  
  canvasAreaRef.value.setCanvasZoom(scale);
}

onMounted(() => {
  setTimeout(() => {
    const workspace = document.getElementById('workspace-grid-container');
    if (workspace) {
      editorResizeObserver = new ResizeObserver(() => autoFitCanvas());
      editorResizeObserver.observe(workspace);
    }
    autoFitCanvas();
  }, 100);
});

onUnmounted(() => {
  editorResizeObserver?.disconnect(); 
});

function changeZoom(delta: number) {
  let newZoom = canvasScale.value + delta;
  newZoom = Math.max(0.1, Math.min(newZoom, 5));
  canvasScale.value = newZoom;
  canvasAreaRef.value?.setCanvasZoom(newZoom);
}

async function handleSidebarClickAdd(payload: any) {
  if (payload.type === 'text') {
    canvasAreaRef.value?.addText(payload.content);
  } else if (payload.type === 'image' && payload.imgUrl) {
    const cropResult = await cropImageWhitespace(payload.imgUrl);
    canvasAreaRef.value?.addImage(cropResult.url, payload.imgUrl);
  }
}

function changeFontSize(delta: number) {
  if (activeElement.value && activeElement.value.type === 'text') {
    let currentSize = parseInt(activeElement.value.fontSize || '24');
    let newSize = Math.max(10, currentSize + delta);
    canvasAreaRef.value?.updateActiveTextProperty('fontSize', newSize);
    activeElement.value.fontSize = `${newSize}px`; 
  }
}

function toggleBold() { 
  if (activeElement.value && activeElement.value.type === 'text') { 
    const newWeight = activeElement.value.fontWeight === 'bold' ? 'normal' : 'bold';
    canvasAreaRef.value?.updateActiveTextProperty('fontWeight', newWeight);
    activeElement.value.fontWeight = newWeight;
  } 
}

function updateLineLength(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value);
  if (val && activeElement.value) {
    const newPx = val * MM_TO_PX;
    canvasAreaRef.value?.updateActiveLineProperty(activeElement.value.isVertical, newPx);
  }
}

function rotateLine() {
  if (activeElement.value && activeElement.value.type === 'line') {
    const isVert = !activeElement.value.isVertical;
    const px = isVert ? activeElement.value.width : activeElement.value.height;
    canvasAreaRef.value?.updateActiveLineProperty(isVert, px);
  }
}

function triggerImageUpload() { imageInputRef.value?.click(); }

function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const dataUrl = ev.target?.result as string;
    const cropResult = await cropImageWhitespace(dataUrl);
    canvasAreaRef.value?.addImage(cropResult.url, dataUrl);
    if (imageInputRef.value) imageInputRef.value.value = '';
  };
  reader.readAsDataURL(file);
}

function confirmCustomBarcode() {
  if (!customBarcodeW.value || !customBarcodeH.value) return showToast('请输入完整尺寸', 'warning');
  canvasAreaRef.value?.addBarcode(customBarcodeW.value, customBarcodeH.value);
  showCustomBarcodeModal.value = false;
}

function resetBarcode() { 
  const res = canvasAreaRef.value?.resetBarcodeSize();
  if (!res) showToast('画布中暂无条码，无法复原', 'warning');
}

function openResizeModal() { 
  tempResizeW.value = store.currentLabel.wMM; 
  tempResizeH.value = store.currentLabel.hMM; 
  showResizeModal.value = true; 
}

function confirmResize() {
  if (!tempResizeW.value || !tempResizeH.value) return showToast('请输入完整尺寸', 'warning');
  store.currentLabel.wMM = Number(tempResizeW.value); 
  store.currentLabel.hMM = Number(tempResizeH.value);
  isModified.value = true;
  showResizeModal.value = false; 
  showToast('尺寸已修改生效', 'success');
  setTimeout(autoFitCanvas, 50);
}

function triggerSaveModal(type: 'save' | 'saveAs') {
  saveActionType.value = type; 
  const isExisting = store.savedLabels.some(l => l.id === store.currentLabel.id);
  if (type === 'save' && isExisting && store.currentLabel.name.trim() !== '' && store.currentLabel.name !== '新建标签') { 
    confirmSaveAction(true); 
    return; 
  }
  saveLabelName.value = type === 'saveAs' ? (store.currentLabel.name === '新建标签' ? '未命名标签' : store.currentLabel.name) + ' - 副本' : (store.currentLabel.name === '新建标签' ? '未命名标签' : store.currentLabel.name);
  showSaveModal.value = true;
}

async function confirmSaveAction(directSave = false) {
  if (!directSave && !saveLabelName.value.trim()) return showToast('请输入标签名称', 'warning');
  const targetName = directSave ? store.currentLabel.name : saveLabelName.value.trim();
  let isDuplicate = saveActionType.value === 'saveAs' 
      ? store.savedLabels.some(l => l.name === targetName) 
      : store.savedLabels.some(l => l.name === targetName && l.id !== store.currentLabel.id);
  
  if (isDuplicate) return showToast('该标签名称已存在，请换一个名称', 'warning');
  if (!directSave) showSaveModal.value = false;

  store.showLoading('保存至云端...');
  
  const currentElements = canvasAreaRef.value?.exportToJSON() || [];
  store.currentLabel.elements = currentElements;

  try {
    if (saveActionType.value === 'saveAs') {
      const newLabel = JSON.parse(JSON.stringify(store.currentLabel)); 
      newLabel.id = Date.now().toString(); 
      newLabel.name = targetName;
      await saveLabel(newLabel); 
      
      store.savedLabels.unshift(newLabel);
      if (store.savedLabels.length > 10) store.savedLabels.pop();
      store.totalLabels++;
      store.currentLabel = newLabel; 
      showToast('已存为新副本！', 'success');
    } else {
      if (!directSave) store.currentLabel.name = targetName;
      const updatedLabel = JSON.parse(JSON.stringify(store.currentLabel));
      await saveLabel(updatedLabel); 
      
      const idx = store.savedLabels.findIndex(l => l.id === updatedLabel.id);
      if (idx > -1) store.savedLabels[idx] = updatedLabel;
      else {
          store.savedLabels.unshift(updatedLabel);
          if (store.savedLabels.length > 10) store.savedLabels.pop();
          store.totalLabels++;
      }
      showToast('云端保存成功', 'success');
    }
    isModified.value = false;
    store.setView('dashboard');
  } catch (e: any) { 
    showToast(e.message || '保存失败', 'error'); 
  } finally { 
    store.hideLoading(); 
  }
}

function closeEditor() { 
    if (isModified.value) {
        showExitModal.value = true;
    } else {
        store.setView('dashboard'); 
    }
}

async function confirmSaveAndExit() {
    showExitModal.value = false;
    await confirmSaveAction(true);
}

function confirmExit() {
    showExitModal.value = false;
    isModified.value = false;
    store.setView('dashboard');
}

async function doExportPDF() {
  if (isModified.value) return showToast('检测到未保存的修改，请先点击【保存】！', 'warning');
  store.showLoading('生成模板标签中...');
  setTimeout(async () => {
    try {
      const canvasEl = document.querySelector('canvas'); 
      if (canvasEl) { 
        await exportSinglePDF(canvasEl, canvasEl, store.currentLabel.wMM, store.currentLabel.hMM, store.currentLabel.name || '导出文件'); 
        showToast('导出成功', 'success'); 
      }
    } catch (err) { showToast('导出失败', 'error'); } finally { store.hideLoading(); }
  }, 150);
}

function triggerPdfImport() {
  if (isModified.value) return showToast('检测到未保存的修改，请先点击【保存】！', 'warning');
  const barcodeEl = store.currentLabel.elements.find(el => el.type === 'barcode');
  if (!barcodeEl) return showToast('请先新增条码进行占位，并保存', 'warning');
  pdfInputRef.value?.click();
}

function handleBatchPDF(e: Event) {
  const input = e.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
  if (file.type !== 'application/pdf') { showToast('只能上传 PDF 文件！', 'warning'); return; }
  const barcodeEl = store.currentLabel.elements.find(el => el.type === 'barcode'); if (!barcodeEl) return;

  store.showLoading('极速合成中...');
  setTimeout(async () => {
    try {
      const canvasEl = document.querySelector('canvas');
      if (canvasEl) {
        await exportBatchPDF(file, canvasEl, canvasEl, store.currentLabel.wMM, store.currentLabel.hMM, store.currentLabel.name || '导出文件', barcodeEl, (current, total) => { store.showLoading(`正在合成 (${current}/${total})...`); });
        showToast('合成完成！', 'success');
      }
    } catch (err: any) { showToast('请检查文件是否为条码', 'error'); } finally { store.hideLoading(); if (pdfInputRef.value) pdfInputRef.value.value = ''; }
  }, 150);
}
</script>

<style scoped>
.bg-workspace-grid {
  background-color: #f1f5f9;
  background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
  background-size: 24px 24px;
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-active .modal-card, .modal-fade-leave-active .modal-card { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-card, .modal-fade-leave-to .modal-card { transform: scale(0.95) translateY(10px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateX(10px); }
</style>