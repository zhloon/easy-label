<template>
  <div class="h-screen w-screen overflow-hidden bg-slate-50 text-slate-700 font-sans relative selection:bg-primary-100 selection:text-primary-700">
    
    <transition name="fade">
      <div v-if="store.isLoading" class="fixed inset-0 bg-slate-900/30 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-300">
        <div class="bg-white/95 backdrop-blur-md px-10 py-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] flex flex-col items-center border border-white">
          <div class="w-12 h-12 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin mb-5 shadow-sm"></div>
          <p class="text-slate-700 font-extrabold tracking-widest text-[15px]">{{ store.loadingText }}</p>
        </div>
      </div>
    </transition>

    <LoginView v-if="store.currentView === 'login'" />
    <DashboardView v-else-if="store.currentView === 'dashboard'" />
    <EditorView v-else-if="store.currentView === 'editor'" />

    <div id="toast-container" class="fixed top-8 left-1/2 transform -translate-x-1/2 z-[10000] flex flex-col items-center gap-3 pointer-events-none"></div>

  </div>
</template>

<script setup lang="ts">
// 在顶部引入新写的 api 方法
import { apiAutoLogin } from './utils/db';
import { onMounted } from 'vue';
import { useMainStore } from './store/useMainStore';

// 引入拆分好的三大核心视图
import LoginView from './views/LoginView.vue';
import DashboardView from './views/DashboardView.vue';
import EditorView from './views/EditorView.vue';

const store = useMainStore();

onMounted(async () => {
  // 🌟 1. 挂载全局 Toast 方法 (升级为圆润胶囊形态 + 丝滑缩放动画)
  (window as any).showToast = function (message: string, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    let icon = ''; let colorClass = ''; let bgClass = '';
    
    // 采用极简的浅色毛玻璃背景 + 对应的语义状态色
    if (type === 'success') { 
        icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`; 
        colorClass = 'text-success border-success/20'; 
        bgClass = 'bg-success-bg/90'; 
    }
    else if (type === 'error') { 
        icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`; 
        colorClass = 'text-danger border-danger/20'; 
        bgClass = 'bg-danger-bg/90'; 
    }
    else if (type === 'warning') { 
        icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`; 
        colorClass = 'text-warning border-warning/20'; 
        bgClass = 'bg-warning-bg/90'; 
    }
    else { 
        icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`; 
        colorClass = 'text-primary-600 border-primary-200'; 
        bgClass = 'bg-primary-50/90'; 
    }

    // 弹窗的基础类名，包含缩放（scale）和 Y 轴偏移的初始隐藏状态
    toast.className = `backdrop-blur-xl px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border ${bgClass} ${colorClass} flex items-center gap-2.5 transform transition-all duration-[400ms] cubic-bezier(0.16, 1, 0.3, 1) -translate-y-4 opacity-0 scale-95 z-[10000] pointer-events-auto`;
    toast.innerHTML = `<div class="w-4 h-4 shrink-0">${icon}</div><span class="font-extrabold text-slate-800 text-[14px] tracking-wide">${message}</span>`;
    container.appendChild(toast);

    // 触发进场动画
    requestAnimationFrame(() => { 
        toast.classList.remove('-translate-y-4', 'opacity-0', 'scale-95'); 
        toast.classList.add('translate-y-0', 'opacity-100', 'scale-100');
    });

    // 3秒后触发出场动画并销毁
    setTimeout(() => { 
        toast.classList.remove('translate-y-0', 'opacity-100', 'scale-100');
        toast.classList.add('-translate-y-4', 'opacity-0', 'scale-95'); 
        setTimeout(() => toast.remove(), 400); 
    }, 3000);
  };

  // 🌟 修改：使用基于 fetch 的前端请求，F12 网络面板可见
  store.showLoading('正在核对设备安全授权...');
  try {
    const result = await apiAutoLogin();
    if (result.success) {
      if (result.key) localStorage.setItem('easy_label_vip_key', result.key);
      store.setView('dashboard');
      await store.fetchLabels(1, 10); // 🌟 改为 10
    } else {
      store.setView('login');
    }
  } catch (err) {
    store.setView('login');
    (window as any).showToast('自动登录失败，请手动登录', 'warning');
  } finally {
    store.hideLoading();
  }
});
</script>

<style>
/* Vue 的 Transition 组件动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 确保 SVG 撑满容器 */
#toast-container svg { width: 100%; height: 100%; }
</style>