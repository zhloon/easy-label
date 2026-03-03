<template>
  <div class="h-screen w-screen bg-[#f3f4f6] text-[#1f2937] font-sans overflow-hidden flex flex-col relative">
    
    <div v-if="currentView === 'login'" class="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#f8fafc]">
      <div class="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#1677ff] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#10b981] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>

      <div class="w-full max-w-[420px] bg-white rounded-[24px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-[#e5e7eb] p-10 relative z-10 flex flex-col items-center transform transition-all hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]">
        
        <div class="w-20 h-20 bg-[#eff6ff] rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-[#dbeafe]">
          <svg viewBox="0 0 100 100" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(1, -7)">
              <g transform="translate(50,50) rotate(-40) translate(-50,-50)">
                  <path d="M20,30 h50 a10,10 0 0 1 10,10 v40 a10,10 0 0 1 -10,10 h-50 a10,10 0 0 1 -10,-10 v-40 a10,10 0 0 1 10,-10 z" fill="#1b6Cff"/>
                  <path d="M55,30 h15 a10,10 0 0 1 10,10 v15 L55,30 z" fill="#ff8a3d"/>
                  <path d="M55,30 v25 h25 L55,30 z" fill="#1455c0" opacity="0.6"/>
              </g>
              <path d="M 25 65 L 45 80 L 85 35" fill="none" stroke="#ff8a3d" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          </svg>
        </div>

        <h2 class="text-2xl font-extrabold text-[#1f2937] tracking-wider mb-2">易标签 Pro</h2>
        <p class="text-[14px] text-[#6b7280] font-medium mb-8 text-center">绑定设备以解锁全部高级桌面端特性</p>

        <div class="w-full mb-6">
          <div class="relative flex items-center bg-[#f8fafc] border border-[#d1d5db] rounded-xl overflow-hidden focus-within:border-[#1677ff] focus-within:ring-4 focus-within:ring-[#eff6ff] transition-all">
            <div class="pl-4 pr-2 text-[#9ca3af]">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <input v-model="inputKey" @keyup.enter="handleManualLogin" type="text" placeholder="输入卡密 (如 VIP-XXXX-YYYY)" class="flex-1 w-full bg-transparent py-4 pr-4 outline-none text-[#1f2937] font-mono font-bold text-[15px] tracking-wide placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-[#9ca3af]">
          </div>
        </div>

        <button @click="handleManualLogin" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1677ff] to-[#3b82f6] text-white font-extrabold text-[16px] tracking-widest shadow-[0_8px_20px_rgba(22,119,255,0.25)] hover:shadow-[0_10px_25px_rgba(22,119,255,0.4)] hover:-translate-y-0.5 transform transition-all duration-300 border-none outline-none flex items-center justify-center gap-2 cursor-pointer">
          激活设备并登录
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>

        <div class="w-full flex items-center justify-between mt-8 pt-6 border-t border-[#f3f4f6]">
          <button @click="openPurchaseLink" class="text-[13px] font-bold text-[#6b7280] hover:text-[#1677ff] transition-colors flex items-center gap-1.5 bg-transparent border-none cursor-pointer outline-none p-0">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            获取正版卡密
          </button>
          
          <button @click="handleDeviceUnbind" class="text-[13px] font-bold text-[#6b7280] hover:text-[#ea580c] transition-colors flex items-center gap-1.5 bg-transparent border-none cursor-pointer outline-none p-0">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
            设备解绑/换机
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="currentView === 'dashboard'" class="w-full h-full flex flex-col">
      <header class="h-14 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-3">
          <svg viewBox="0 0 100 100" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(1, -7)">
              <g transform="translate(50,50) rotate(-40) translate(-50,-50)">
                  <path d="M20,30 h50 a10,10 0 0 1 10,10 v40 a10,10 0 0 1 -10,10 h-50 a10,10 0 0 1 -10,-10 v-40 a10,10 0 0 1 10,-10 z" fill="#1b6Cff"/>
                  <path d="M55,30 h15 a10,10 0 0 1 10,10 v15 L55,30 z" fill="#ff8a3d"/>
                  <path d="M55,30 v25 h25 L55,30 z" fill="#1455c0" opacity="0.6"/>
              </g>
              <path d="M 25 65 L 45 80 L 85 35" fill="none" stroke="#ff8a3d" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          </svg>
          <span class="font-extrabold text-[16px] text-[#1f2937]">易标签 <span class="text-sm font-medium text-[#6b7280] ml-1">Pro 控制台</span></span>
        </div>
        <button @click="currentView = 'editor'" class="px-4 py-2 bg-[#1677ff] text-white rounded-lg text-sm font-bold hover:bg-[#0050b3] transition-colors cursor-pointer border-none">
          + 新建标签
        </button>
      </header>
      
      <main class="flex-1 overflow-auto p-8">
        <div class="grid grid-cols-4 gap-6">
          <div class="h-40 bg-white rounded-xl border border-dashed border-[#d1d5db] flex items-center justify-center text-[#9ca3af] font-medium">
            此处显示标签列表
          </div>
        </div>
      </main>
    </div>

    <div v-else-if="currentView === 'editor'" class="w-full h-full flex flex-col bg-white">
      <header class="h-14 border-b border-[#e5e7eb] flex items-center justify-between px-4 bg-[#f8fafc] shrink-0">
        <button @click="currentView = 'dashboard'" class="flex items-center gap-1 text-[#4b5563] hover:text-[#1677ff] text-sm font-bold bg-transparent border-none cursor-pointer">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          返回主页
        </button>
        <div class="font-bold text-[#1f2937]">标签编辑器</div>
        <button class="px-4 py-1.5 bg-[#10b981] text-white rounded-md text-sm font-bold hover:bg-[#059669] transition-colors cursor-pointer border-none">
          保存
        </button>
      </header>

      <div class="flex-1 flex overflow-hidden">
        <aside class="w-64 border-r border-[#e5e7eb] bg-white p-4 overflow-y-auto">
          <div class="text-center text-gray-400 mt-10">组件库区域</div>
        </aside>
        
        <main class="flex-1 bg-[#f3f4f6] relative overflow-auto flex items-center justify-center">
          <div class="w-[400px] h-[300px] bg-white shadow-lg flex items-center justify-center text-gray-300 border">
            画布区域
          </div>
        </main>
        
        <aside class="w-72 border-l border-[#e5e7eb] bg-white p-4 overflow-y-auto">
          <div class="text-center text-gray-400 mt-10">属性面板区域</div>
        </aside>
      </div>
    </div>

    <div v-if="showUnbindModal" class="fixed inset-0 bg-[#00000099] flex items-center justify-center z-[3000] backdrop-blur-sm px-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden flex flex-col transform transition-all">
        <div class="px-6 py-5 bg-[#fff7ed] border-b border-[#ffedd5] flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ea580c" stroke-width="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
          <h3 class="font-extrabold text-[17px] text-[#ea580c] tracking-wide">设备解绑 / 换机</h3>
        </div>
        
        <div class="p-8">
          <p class="text-[14px] text-[#4b5563] font-bold mb-6 leading-relaxed text-center">
            解绑后，本设备将<span class="text-[#ff4d4f]">失去 Pro 授权</span>。<br>您需要使用该卡密在新设备上重新验证登录。
          </p>
          
          <div class="flex flex-col gap-4">
            <div class="relative flex items-center bg-[#f8fafc] border border-[#d1d5db] rounded-xl overflow-hidden focus-within:border-[#ea580c] focus-within:ring-4 focus-within:ring-[#ffedd5] transition-all">
              <div class="pl-4 pr-2 text-[#9ca3af]">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <input v-model="unbindKey" type="text" placeholder="请输入要解绑的卡密确认" class="flex-1 w-full bg-transparent py-4 pr-4 outline-none text-[#1f2937] font-mono font-bold text-[15px] placeholder:font-sans placeholder:font-normal placeholder:text-[#9ca3af]">
            </div>
          </div>
        </div>
        
        <div class="px-6 py-5 bg-[#f9fafb] border-t border-[#e5e7eb] grid grid-cols-2 gap-4">
          <button @click="showUnbindModal = false" class="w-full py-3.5 rounded-xl bg-[#e2e8f0] text-[#4b5563] font-bold hover:bg-[#cbd5e1] transition-colors text-[15px] border-none cursor-pointer outline-none">
            暂不解绑
          </button>
          <button @click="confirmUnbind" class="w-full py-3.5 rounded-xl bg-[#ea580c] text-white font-bold hover:bg-[#f97316] shadow-[0_6px_15px_rgba(234,88,12,0.25)] hover:-translate-y-0.5 transform transition-all text-[15px] border-none cursor-pointer outline-none">
            确认解绑
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="fixed inset-0 bg-[#ffffffcc] backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
      <div class="w-12 h-12 border-4 border-[#1677ff] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-[15px] text-[#4b5563] font-bold tracking-wide">{{ loadingText }}</p>
    </div>

    <div v-if="toastMsg" class="fixed top-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg font-bold text-white z-[10000] transition-all" :class="toastClass">
      {{ toastMsg }}
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ipcRenderer } from 'electron';

// ==========================================
// 全局状态与路由控制
// ==========================================
const currentView = ref<'login' | 'dashboard' | 'editor'>('login');
const showEditor = computed({ get: () => currentView.value === 'editor', set: (v) => currentView.value = v ? 'editor' : 'dashboard' });

const isLoading = ref(false);
const loadingText = ref('加载中...');

// ==========================================
// 简易 Toast 提示逻辑 (为您补全了视觉反馈)
// ==========================================
const toastMsg = ref('');
const toastClass = ref('');
let toastTimer: any = null;

function showToast(msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  toastMsg.value = msg;
  if (type === 'success') toastClass.value = 'bg-[#10b981]';
  else if (type === 'error') toastClass.value = 'bg-[#ef4444]';
  else if (type === 'warning') toastClass.value = 'bg-[#f59e0b]';
  else toastClass.value = 'bg-[#3b82f6]';

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMsg.value = ''; }, 3000);
}

// ==========================================
// 核心：授权验证逻辑 (登录、静默验证、解绑)
// ==========================================
const inputKey = ref('');
const showUnbindModal = ref(false);
const unbindKey = ref('');

onMounted(async () => {
  // 软件启动时：尝试静默拦截登录
  await checkSilentLogin();
});

// 静默自动登录
async function checkSilentLogin() {
  const savedKey = localStorage.getItem('easy_label_vip_key');
  
  // 没有历史卡密，停留在登录页
  if (!savedKey) {
    currentView.value = 'login';
    return;
  }

  isLoading.value = true;
  loadingText.value = '正在安全校验授权状态...';

  try {
    const result = await ipcRenderer.invoke('verify-license', savedKey);
    
    if (result.success) {
      // 验证通过，放行进入主页
      currentView.value = 'dashboard';
    } else {
      // 卡密已失效或设备变更被拦截
      showToast(result.error || '授权已失效，请重新登录', 'error');
      localStorage.removeItem('easy_label_vip_key');
      currentView.value = 'login';
    }
  } catch (err) {
    showToast('无法连接验证服务器，请检查网络', 'error');
    currentView.value = 'login';
  } finally {
    isLoading.value = false;
  }
}

// 手动输入卡密登录
async function handleManualLogin() {
  if (!inputKey.value.trim()) return showToast('请输入有效的卡密', 'warning');
  
  isLoading.value = true;
  loadingText.value = '正在验证设备与授权...';
  
  try {
    const result = await ipcRenderer.invoke('verify-license', inputKey.value.trim());
    
    if (result.success) {
      showToast('授权验证成功！', 'success');
      // 记录在本地，下次静默登录
      localStorage.setItem('easy_label_vip_key', inputKey.value.trim());
      currentView.value = 'dashboard'; 
    } else {
      showToast(result.error || '验证失败，请检查卡密状态', 'error');
    }
  } catch (err) {
    showToast('验证服务异常，请检查网络并稍后再试', 'error');
  } finally {
    isLoading.value = false;
  }
}

// 触发解绑弹窗
function handleDeviceUnbind() {
  // 自动填充历史卡密，优化体验
  unbindKey.value = inputKey.value || localStorage.getItem('easy_label_vip_key') || '';
  showUnbindModal.value = true;
}

// 确认解绑设备（对接真实底层 IPC）
async function confirmUnbind() {
  if (!unbindKey.value.trim()) return showToast('请输入要解绑的卡密', 'warning');
  
  isLoading.value = true;
  loadingText.value = '正在向云端申请解绑...';
  
  try {
    const result = await ipcRenderer.invoke('unbind-license', unbindKey.value.trim());
    
    if (result.success) {
      showUnbindModal.value = false;
      showToast('设备解绑成功！请在新设备重新登录。', 'success');
      
      // 清空所有授权凭证
      unbindKey.value = '';
      inputKey.value = '';
      localStorage.removeItem('easy_label_vip_key');
      currentView.value = 'login';
    } else {
      showToast(result.error || '解绑失败，请检查卡密状态', 'error');
    }
  } catch (err) {
    showToast('系统内部通信异常', 'error');
  } finally {
    isLoading.value = false;
  }
}

// 跳转购买页面
function openPurchaseLink() {
  // 可以解开注释，并替换成您的发卡网链接
  // const { shell } = require('electron'); 
  // shell.openExternal('https://your-shop.com');
  showToast('跳转前往官方发卡商店...', 'info');
}

</script>

<style scoped>
/* 隐藏滚动条但保留滚动功能，让界面更像原生应用 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>