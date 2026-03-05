<template>
  <div class="h-screen w-screen overflow-hidden bg-[#f3f4f6] text-[#1f2937] font-sans relative">
    
    <div v-if="store.isLoading" class="fixed inset-0 bg-[#00000099] z-[9999] flex flex-col items-center justify-centerbackdrop-blur-sm transition-opacity duration-300">
      <div class="w-10 h-10 border-4 border-white/20 border-t-[#1677ff] rounded-full animate-spin"></div>
      <p class="text-white mt-4 font-bold tracking-widest text-sm">{{ store.loadingText }}</p>
    </div>

    <LoginView v-if="store.currentView === 'login'" />
    <DashboardView v-else-if="store.currentView === 'dashboard'" />
    <EditorView v-else-if="store.currentView === 'editor'" />

    <div id="toast-container" class="fixed top-10 left-1/2 transform -translate-x-1/2 z-[10000] flex flex-col gap-3 pointer-events-none"></div>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useMainStore } from './store/useMainStore';
import { ipcRenderer } from 'electron';

// 引入拆分好的三大核心视图
import LoginView from './views/LoginView.vue';
import DashboardView from './views/DashboardView.vue';
import EditorView from './views/EditorView.vue';

const store = useMainStore();

onMounted(async () => {
  // 🌟 1. 挂载全局 Toast 方法 (完整实现代码，确保可用)
  (window as any).showToast = function (message: string, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    let icon = ''; let colorClass = '';
    if (type === 'success') { icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`; colorClass = 'border-l-[#10b981] text-[#10b981] bg-white'; }
    else if (type === 'error') { icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`; colorClass = 'border-l-[#ff4d4f] text-[#ff4d4f] bg-white'; }
    else if (type === 'warning') { icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`; colorClass = 'border-l-[#ea580c] text-[#ea580c] bg-white'; }
    else { icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`; colorClass = 'border-l-[#1677ff] text-[#1677ff] bg-white'; }

    toast.className = `backdrop-blur-md px-5 py-3.5 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-[#e5e7eb] border-l-[5px] ${colorClass} flex items-center gap-3 transform transition-all duration-300 translate-x-[120%] opacity-0 z-[10000] pointer-events-auto`;
    toast.innerHTML = `<div class="w-5 h-5 shrink-0">${icon}</div><span class="font-bold text-[#1f2937] text-[14px] tracking-wide">${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => { toast.classList.remove('translate-x-[120%]', 'opacity-0'); });
    setTimeout(() => { toast.classList.add('translate-x-[120%]', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 3000);
  };

  // 🌟 2. 检查静默登录与视图初始化
  store.showLoading('正在核对设备级安全授权...');
  try {
    const result = await ipcRenderer.invoke('auto-login');
    if (result.success) {
      if (result.key) localStorage.setItem('easy_label_vip_key', result.key);
      // 登录成功，跳转主页并加载数据
      store.setView('dashboard');
      await store.fetchLabels(1, 15); // 初始化加载模板库
    } else {
      // 登录失败，强制去登录页
      store.setView('login');
    }
  } catch (err) {
    // 发生错误，默认去登录页
    store.setView('login');
    (window as any).showToast('自动登录失败，请手动登录', 'warning');
  } finally {
    store.hideLoading();
  }
});
</script>

<style>
/* 全局样式，确保 SVG Toast 图标大小正确 */
#toast-container svg {
  width: 100%;
  height: 100%;
}
</style>