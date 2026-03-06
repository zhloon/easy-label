<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden selection:bg-primary-100 selection:text-primary-700">
    <div class="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary-300/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob pointer-events-none"></div>
    <div class="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000 pointer-events-none"></div>
    <div class="absolute bottom-[-20%] left-[20%] w-[40vw] h-[40vw] bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000 pointer-events-none"></div>

    <div class="relative w-full max-w-[420px] p-10 bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white z-10 mx-4">
      <div class="text-center mb-10">
        <div class="w-20 h-20 bg-gradient-to-tr from-primary-50 to-primary-100 rounded-[20px] mx-auto mb-6 flex items-center justify-center shadow-inner border border-primary-200/50 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
           <svg viewBox="0 0 100 100" width="46" height="46" xmlns="http://www.w3.org/2000/svg"><g transform="translate(1, -7)"><g transform="translate(50,50) rotate(-40) translate(-50,-50)"><path d="M20,30 h50 a10,10 0 0 1 10,10 v40 a10,10 0 0 1 -10,10 h-50 a10,10 0 0 1 -10,-10 v-40 a10,10 0 0 1 10,-10 z" fill="#1677ff" /><path d="M55,30 h15 a10,10 0 0 1 10,10 v15 L55,30 z" fill="#f59e0b" /><path d="M55,30 v25 h25 L55,30 z" fill="#0f5ee6" opacity="0.6" /></g><path d="M 25 65 L 45 80 L 85 35" fill="none" stroke="#f59e0b" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" /></g></svg>
        </div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight mb-2">易标签 Pro</h1>
        <p class="text-[12px] font-bold text-slate-400 tracking-[0.25em] uppercase">专业级打印排版系统</p>
      </div>

      <div class="space-y-7">
        <div>
          <label class="flex justify-between items-center text-[13px] font-extrabold text-slate-600 mb-3 tracking-wide">
            <span>设备授权卡密</span>
            <button @click="openBuyLink" class="text-primary-600 hover:text-primary-700 transition-colors font-bold cursor-pointer bg-primary-50 px-2.5 py-1 rounded-md hover:bg-primary-100">获取卡密?</button>
          </label>
          <div class="relative group">
            <input v-model="inputKey" @keyup.enter="handleManualLogin" type="text" placeholder="XXXX-XXXX-XXXX-XXXX" maxlength="19" class="w-full bg-slate-100/50 border-2 border-transparent hover:border-slate-200 focus:border-primary-500 focus:bg-white rounded-2xl px-4 py-4 outline-none text-center text-xl font-black tracking-[0.15em] uppercase font-mono text-slate-800 placeholder:text-slate-300 placeholder:font-normal transition-all duration-300 shadow-inner" />
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary-500 group-focus-within:w-1/2 transition-all duration-500 rounded-full"></div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button @click="handleManualLogin" :disabled="store.isLoading || inputKey.length < 19" class="w-full bg-slate-900 hover:bg-primary-600 text-white rounded-2xl py-4 text-[15px] font-extrabold shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_20px_-10px_rgba(22,119,255,0.5)] transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-slate-900">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg> 验证并绑定本设备
          </button>
          <button @click="triggerUnbind" :disabled="store.isLoading || inputKey.length < 19" class="w-full bg-white hover:bg-danger-bg text-slate-600 hover:text-danger border border-slate-200 hover:border-danger/30 rounded-2xl py-3.5 text-[14px] font-extrabold shadow-sm transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg> 解除本机绑定
          </button>
        </div>
      </div>
      
      <div class="mt-8 pt-5 border-t border-slate-200/60 text-center">
        <p class="text-[12px] text-slate-400 font-bold flex items-center justify-center gap-1.5"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" class="text-success"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>基于本地硬件指纹，一机一码终身安全授权</p>
      </div>
    </div>

    <transition name="modal">
      <div v-if="showUnbindModal" class="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2000] backdrop-blur-sm px-4">
        <div class="bg-white rounded-[24px] shadow-2xl w-full max-w-[380px] overflow-hidden flex flex-col text-center border border-white/50">
          <div class="p-8 pt-10">
            <div class="w-16 h-16 bg-danger-bg text-danger rounded-full flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path><line x1="4" y1="4" x2="20" y2="20"></line></svg>
            </div>
            <h3 class="text-xl font-extrabold text-slate-900 mb-2">确认解除设备绑定？</h3>
            <p class="text-sm text-slate-500 font-medium leading-relaxed">解绑后本设备将失去且清除本地数据，您需要重新输入卡密才能继续使用。</p>
          </div>
          <div class="px-6 py-5 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-4">
            <button @click="showUnbindModal = false" class="btn btn-subtle py-3.5 rounded-xl text-[15px]">取消保留</button>
            <button @click="confirmUnbindDevice" class="btn btn-danger py-3.5 rounded-xl text-[15px]">确认解绑</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
// 顶部引入
import { apiVerifyLicense, apiUnbindLicense } from '../utils/db';
import { ref, watch } from 'vue';
import { shell } from 'electron';
import { useMainStore } from '../store/useMainStore';
import { clearLocalCache } from '../utils/db'; // 🌟 引入清空缓存的方法

const store = useMainStore();
const inputKey = ref(localStorage.getItem('easy_label_vip_key') || '');
const showUnbindModal = ref(false);

watch(inputKey, (newVal) => {
  let clean = newVal.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (clean.length > 16) clean = clean.slice(0, 16);
  let formatted = '';
  for (let i = 0; i < clean.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += '-';
    formatted += clean[i];
  }
  inputKey.value = formatted;
});

// 登录方法替换
async function handleManualLogin() {
  if (inputKey.value.length !== 19) return (window as any).showToast('请输入完整的 16 位授权卡密', 'warning');
  store.showLoading('正在向云端验证授权...');
  try {
    const result = await apiVerifyLicense(inputKey.value);
    if (result.success) {
      localStorage.setItem('easy_label_vip_key', inputKey.value);
      (window as any).showToast('授权验证成功，欢迎回来！', 'success');
      store.setView('dashboard'); 
      await store.fetchLabels(1, 10); // 🌟 改为 10
    } else throw new Error(result.error || '该卡密无效或已绑定其他设备');
  } catch (err: any) { (window as any).showToast(err.message, 'error'); } finally { store.hideLoading(); }
}

function triggerUnbind() {
  if (inputKey.value.length !== 19) return (window as any).showToast('请输入完整的授权卡密以解绑', 'warning');
  showUnbindModal.value = true;
}

// 解绑方法替换
async function confirmUnbindDevice() {
  showUnbindModal.value = false;
  store.showLoading('正在向云端申请解绑...');
  try {
    const result = await apiUnbindLicense(inputKey.value);
    if (result.success) {
      await clearLocalCache();
      localStorage.removeItem('easy_label_vip_key'); 
      inputKey.value = '';
      (window as any).showToast(result.message || '解绑成功，该卡密已可用于其他设备', 'success');
    } else throw new Error(result.error || '解绑失败');
  } catch (err: any) { (window as any).showToast(err.message, 'error'); } finally { store.hideLoading(); }
}

function openBuyLink() { shell.openExternal('https://www.easylabel.cloud/'); }
</script>

<style scoped>
@reference "tailwindcss";

.modal-enter-active, .modal-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

.animate-blob { animation: blob 12s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); }
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(40px, -60px) scale(1.15); }
  66% { transform: translate(-30px, 30px) scale(0.85); }
  100% { transform: translate(0px, 0px) scale(1); }
}
</style>