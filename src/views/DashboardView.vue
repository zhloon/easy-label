<template>
  <div class="max-w-[1300px] mx-auto p-8 h-full flex flex-col relative z-10">
    <header class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-8 border border-[#e5e7eb] shrink-0">
      <h1 class="text-2xl font-extrabold text-[#1f2937] flex items-center gap-2 tracking-wide">
        <svg viewBox="0 0 100 100" width="32" height="32" xmlns="http://www.w3.org/2000/svg"><g transform="translate(1, -7)"><g transform="translate(50,50) rotate(-40) translate(-50,-50)"><path d="M20,30 h50 a10,10 0 0 1 10,10 v40 a10,10 0 0 1 -10,10 h-50 a10,10 0 0 1 -10,-10 v-40 a10,10 0 0 1 10,-10 z" fill="#1b6Cff" /><path d="M55,30 h15 a10,10 0 0 1 10,10 v15 L55,30 z" fill="#ff8a3d" /><path d="M55,30 v25 h25 L55,30 z" fill="#1455c0" opacity="0.6" /></g><path d="M 25 65 L 45 80 L 85 35" fill="none" stroke="#ff8a3d" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" /></g></svg>
        易标签 <span class="text-sm font-bold text-[#9ca3af] ml-1 tracking-normal">Easy Label</span>
      </h1>
      <div class="flex gap-3">
        <button @click="refreshPage" :disabled="store.isLoading" class="btn btn-outline text-[#6b7280] hover:text-[#1677ff] hover:bg-[#eff6ff] disabled:opacity-50">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg> 刷新
        </button>
        <div class="w-px h-5 bg-[#e5e7eb] mt-2 mx-1"></div>
        <button @click="showImportShareModal = true" :disabled="store.isLoading" class="btn btn-outline text-[#0284c7] bg-[#f0f9ff] hover:bg-[#e0f2fe] disabled:opacity-50">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line><rect x="3" y="19" width="18" height="2" rx="1"></rect></svg>提取分享码
        </button>
        <button @click="triggerJsonImport" :disabled="store.isLoading" class="btn btn-outline disabled:opacity-50">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>导入本地库
        </button>
        <button @click="exportJsonLibrary" :disabled="store.isLoading" class="btn btn-outline disabled:opacity-50">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>导出本地库
        </button>
        <input type="file" ref="jsonInputRef" accept=".json" class="hidden" @change="handleJsonImport" />
      </div>
    </header>

    <div class="flex justify-between items-center mb-4 border-b-2 border-[#e5e7eb] pb-3 shrink-0">
      <h2 class="text-[17px] font-extrabold text-[#1f2937] tracking-wide">模板库</h2>
      <button @click="openNewEditor" class="btn bg-gradient-to-r from-[#1677ff] to-[#3b82f6] text-white px-7 py-3 rounded-xl font-extrabold shadow-[0_6px_20px_rgba(22,119,255,0.3)] hover:shadow-[0_8px_25px_rgba(22,119,255,0.45)] hover:-translate-y-0.5 transform transition-all duration-300 flex items-center gap-2 text-[15px] tracking-wide border-none outline-none">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        新建模板
      </button>
    </div>

    <div class="w-full flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
      <div v-if="store.savedLabels.length === 0" class="w-full py-20 flex flex-col items-center text-[#9ca3af] border-2 border-dashed border-[#d1d5db] rounded-2xl bg-white shadow-sm">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" class="mb-4 text-[#d1d5db]"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span class="font-medium tracking-widest text-sm">暂无保存模板，请点击上方“新建模板”开始设计</span>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-1">
        <div v-for="label in store.savedLabels" :key="label.id" class="h-[240px] bg-white border border-[#e5e7eb] rounded-2xl flex flex-col overflow-hidden hover:-translate-y-1.5 hover:border-[#1677ff] hover:shadow-[0_12px_24px_rgba(22,119,255,0.15)] transition-all duration-300 group">
          <div class="flex-1 cursor-pointer overflow-hidden relative bg-[#f8fafc]" @click="openEditor(label)">
            <LabelThumbnail :label="label" />
            <div class="absolute inset-0 bg-[#0000000d] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span class="bg-[#ffffffeb] text-[#1677ff] text-xs font-bold px-4 py-2 rounded-full shadow-md backdrop-blur-sm tracking-widest flex items-center gap-1">点击编辑</span>
            </div>
          </div>
          <div class="p-3 border-t border-[#f3f4f6] bg-white">
            <div class="font-bold text-[13px] text-center truncate mb-2.5 text-[#374151]" :title="label.name">{{ label.name }}</div>
            <div class="flex gap-2 justify-between">
              <button @click.stop="triggerRenameModal(label)" class="card-action-btn hover:text-[#1677ff] hover:bg-[#eff6ff]" title="重命名模板">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button @click.stop="uploadLabelToCloud(label)" :disabled="store.isLoading" class="card-action-btn hover:text-[#0284c7] hover:bg-[#f0f9ff] disabled:opacity-50" title="生成云端分享码">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </button>
              <button @click.stop="triggerDeleteModal(label.id)" class="card-action-btn hover:text-[#ff4d4f] hover:bg-[#fef2f2]" title="永久删除模板">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 mt-4 mb-2 shrink-0">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">上一页</button>
      <span class="text-[14px] font-bold text-[#6b7280] bg-white px-4 py-1.5 rounded-lg border border-[#e5e7eb] shadow-sm">
        第 <span class="text-[#1677ff] mx-0.5">{{ currentPage }}</span> / {{ totalPages }} 页 
      </span>
      <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn">下一页</button>
    </div>
    <div v-if="showRenameModal" class="fixed inset-0 bg-[#00000099] flex items-center justify-center z-[2000] backdrop-blur-sm px-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col">
        <div class="px-6 py-5 bg-[#f9fafb] border-b border-[#e5e7eb]"><h3 class="font-extrabold text-[17px] text-[#1f2937] text-center tracking-wide">重命名标签</h3></div>
        <div class="p-8"><input v-model="renameValue" type="text" placeholder="请输入新名称" class="w-full bg-[#f8fafc] border border-[#d1d5db] rounded-xl px-4 py-4 outline-none text-xl text-[#1f2937] text-center font-bold focus:border-[#10b981] transition-all"></div>
        <div class="px-6 py-5 bg-[#f9fafb] border-t border-[#e5e7eb] grid grid-cols-2 gap-4">
          <button @click="showRenameModal = false" class="w-full py-3 rounded-xl bg-[#e2e8f0] text-[#4b5563] font-bold border-none cursor-pointer">取消</button>
          <button @click="confirmRename" :disabled="store.isLoading" class="w-full py-3 rounded-xl bg-[#10b981] text-white font-bold hover:bg-[#059669] border-none cursor-pointer">确认修改</button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 bg-[#00000099] flex items-center justify-center z-[2000] backdrop-blur-sm px-4">
       <div class="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] overflow-hidden flex flex-col text-center">
        <div class="p-8">
          <h3 class="text-xl font-extrabold text-[#1f2937] mb-2">永久删除标签？</h3>
          <p class="text-sm text-[#6b7280] font-medium">删除后数据将无法恢复，请谨慎操作。</p>
        </div>
        <div class="px-6 py-5 bg-[#f9fafb] border-t border-[#e5e7eb] grid grid-cols-2 gap-4">
          <button @click="showDeleteModal = false" class="w-full py-3 rounded-xl bg-[#e2e8f0] text-[#4b5563] font-bold border-none cursor-pointer">取消</button>
          <button @click="confirmDeleteLabel" class="w-full py-3 rounded-xl bg-[#ff4d4f] text-white font-bold border-none cursor-pointer">确认删除</button>
        </div>
      </div>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMainStore } from '../store/useMainStore';
// 假设这里有处理本地、云端、预览的 utility 方法
import { clearLocalCache, getAllLabels, saveLabel, deleteLabel } from '../utils/db';
// import { api } from '../api';
import type { LabelData } from '../types';
// 导入缩略图组件
import LabelThumbnail from '../components/LabelThumbnail.vue'; 

const store = useMainStore();

// ==========================================
// 🌟 UI 状态与方法 (仅展示涉及修改的部分逻辑)
// ==========================================

// 分页相关 (占位值)
const currentPage = ref(1);
const totalPages = ref(1);

// 🌟 初始化：确保组件挂载时如果已登录就拉取数据
onMounted(async () => {
  if (store.currentView === 'dashboard' && store.savedLabels.length === 0) {
    await store.fetchLabels(1, 15);
  }
});

async function refreshPage() {
  // store.showLoading('正在同步云端数据...');
  // await clearLocalCache();
  await store.fetchLabels(1, 15);
  // store.hideLoading();
  (window as any).showToast('数据已同步', 'success');
}

function openEditor(label: LabelData) {
  store.currentLabel = JSON.parse(JSON.stringify(label)); // 深拷贝
  store.setView('editor');
}

function openNewEditor() {
  store.currentLabel = { id: Date.now().toString(), name: '新建模板', wMM: 100, hMM: 100, elements: [] };
  store.setView('editor');
}

// 🌟 补回真实的 UI 状态
const showRenameModal = ref(false);
const renameValue = ref('');
const activeLabel = ref<LabelData | null>(null);

const showDeleteModal = ref(false);
const deleteTargetId = ref('');

// 🌟 替换掉之前的 console.log
function triggerRenameModal(label: LabelData) { 
  activeLabel.value = label;
  renameValue.value = label.name;
  showRenameModal.value = true;
}

function triggerDeleteModal(id: string) { 
  deleteTargetId.value = id;
  showDeleteModal.value = true;
}

// 确认方法 (保持原样即可，如果您之前有写过 confirmRename 和 confirmDeleteLabel 的话)
// 按钮点击处理函数 (仅占位，保持原 App.vue 逻辑即可)
async function uploadLabelToCloud(label: LabelData) { console.log('Share', label); }
function changePage(page: number) { currentPage.value = page; }
function triggerJsonImport() {}
function exportJsonLibrary() {}
function handleJsonImport() {}

// 外部弹窗控制 (仅占位)
const showImportShareModal = ref(false);
const jsonInputRef = ref<HTMLInputElement | null>(null);
// 请确保顶部有这行引入：

async function confirmRename() {
  if (!renameValue.value.trim() || !activeLabel.value) return (window as any).showToast('请输入有效名称', 'warning');
  
  const isDuplicate = store.savedLabels.some(l => l.name === renameValue.value.trim() && l.id !== activeLabel.value!.id);
  if (isDuplicate) return (window as any).showToast('该模板名称已存在', 'warning');

  store.showLoading('正在重命名...');
  try {
    // 🌟 核心修复：彻底洗白 Proxy，将 Vue 响应式对象转为纯净的普通 JSON 对象
    const rawLabel = JSON.parse(JSON.stringify(activeLabel.value));
    rawLabel.name = renameValue.value.trim();
    
    // 存入纯净的数据
    await saveLabel(rawLabel);
    
    await store.fetchLabels(1, 15);
    showRenameModal.value = false;
    (window as any).showToast('重命名成功', 'success');
  } catch (e: any) {
    (window as any).showToast(e.message, 'error');
  } finally {
    store.hideLoading();
  }
}

async function confirmDeleteLabel() {
  store.showLoading('正在删除...');
  try {
    await deleteLabel(deleteTargetId.value);
    await store.fetchLabels(1, 15); // 重新拉取最新列表
    showDeleteModal.value = false;
    (window as any).showToast('已永久删除', 'success');
  } catch (e: any) {
    (window as any).showToast(e.message, 'error');
  } finally {
    store.hideLoading();
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.btn { @apply flex items-center justify-center gap-1.5 border-none rounded-lg cursor-pointer font-bold transition-all whitespace-nowrap; }
.btn-outline { @apply bg-[#f9fafb] border border-[#e5e7eb] text-[#4b5563] hover:border-[#1677ff] hover:text-[#1677ff] hover:bg-[#eff6ff] px-4 py-2.5 text-[13px] shadow-sm; }

/* 🌟 卡片操作按钮的基础样式 */
.card-action-btn {
  @apply flex-1 py-2 bg-[#f1f5f9] text-[#6b7280] rounded-lg transition-colors flex justify-center items-center border-none cursor-pointer;
}

.page-btn {
  @apply px-4 py-2 rounded-lg bg-white border border-[#e5e7eb] text-[#4b5563] hover:bg-[#eff6ff] hover:text-[#1677ff] disabled:opacity-40 transition-all font-bold text-[13px] shadow-sm border-none cursor-pointer;
}
</style>