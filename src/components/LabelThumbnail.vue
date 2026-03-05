<template>
  <div class="w-full h-full overflow-hidden bg-slate-100 flex items-center justify-center" ref="containerRef">
    
    <div class="relative bg-white shadow-sm ring-1 ring-slate-200 shrink-0 origin-center transition-transform duration-75 overflow-hidden" :style="{
      width: `${label.wMM * MM_TO_PX * ZOOM_FACTOR}px`,
      height: `${label.hMM * MM_TO_PX * ZOOM_FACTOR}px`,
      transform: `scale(${scale})`
    }">
      
      <div v-for="el in label.elements" :key="el.id" class="absolute box-border"
        :style="{ width: el.style.width, height: el.style.height, left: el.style.left, top: el.style.top }">
        <div v-if="el.type === 'text'" class="w-full h-auto whitespace-pre-wrap break-words leading-snug text-slate-900"
          :style="{ fontSize: el.fontSize, fontWeight: el.fontWeight }">
          {{ el.content }}
        </div>
        <img v-else-if="el.type === 'image'" :src="el.imgUrl || el.originalUrl" class="w-full h-full object-contain" />
        <div v-else-if="el.type === 'barcode'"
          class="w-full h-full bg-white border border-slate-900 flex items-center justify-center p-1">
          <div class="w-[80%] h-[45%] bg-slate-900"></div>
        </div>
        <div v-else-if="el.type === 'line'" class="w-full h-full bg-slate-900"></div>
        <div v-else-if="el.type === 'rect'" class="w-full h-full border border-slate-900 bg-transparent"></div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { LabelData } from '../types';

const props = defineProps<{ label: LabelData }>();

const MM_TO_PX = 3.78;
const ZOOM_FACTOR = 2;

const containerRef = ref<HTMLElement | null>(null);
const scale = ref(1);
let resizeObserver: ResizeObserver | null = null;

function calculateScale() {
  if (!containerRef.value) return;
  const containerW = containerRef.value.clientWidth;
  const containerH = containerRef.value.clientHeight;
  if (containerW === 0 || containerH === 0) return;

  const canvasW = props.label.wMM * MM_TO_PX * ZOOM_FACTOR;
  const canvasH = props.label.hMM * MM_TO_PX * ZOOM_FACTOR;

  // 🌟 重新计算完美填充比例 (留 5% 边距)
  scale.value = Math.min(containerW / canvasW, containerH / canvasH) * 0.95;
}

onMounted(() => {
  setTimeout(calculateScale, 50);

  // 🌟 监听容器尺寸变化！只要浏览器窗口缩放、卡片大小改变，它就会立刻重新计算
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });
    resizeObserver.observe(containerRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});

watch(() => props.label, calculateScale, { deep: true });
</script>