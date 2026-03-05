<template>
    <div class="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#f8fafc]">
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ipcRenderer, shell } from 'electron';
import { useMainStore } from '../store/useMainStore';

const store = useMainStore(); // 🌟 引入全局状态

const inputKey = ref('');
// ... 把格式化卡密、handleManualLogin 等登录特有逻辑搬到这里 ...

async function handleManualLogin() {
    store.showLoading('正在验证设备与授权...');
    // ... 验证成功后 ...
    store.setView('dashboard'); // 🌟 用 Pinia 切换页面
    await store.fetchLabels();  // 🌟 用 Pinia 拉取数据
    store.hideLoading();
}
</script>