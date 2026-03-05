import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LabelData } from '../types';
import { getAllLabels, saveLabel, deleteLabel } from '../utils/db';
import { ipcRenderer } from 'electron';

// 🌟 使用 Vue3 Setup 语法糖风格定义 Store
export const useMainStore = defineStore('main', () => {
    // 1. 全局视图与状态
    const currentView = ref<'login' | 'dashboard' | 'editor'>('login');
    const isLoading = ref(false);
    const loadingText = ref('处理中...');

    // 2. 核心数据
    const savedLabels = ref<LabelData[]>([]);
    const currentLabel = ref<LabelData>({ id: '', name: '', wMM: 100, hMM: 100, elements: [] });

    // 3. 全局弹窗控制
    const showShareResultModal = ref(false);
    const displayShareCode = ref('');

    // 4. 核心通用动作 (Actions)
    const setView = (view: 'login' | 'dashboard' | 'editor') => {
        currentView.value = view;
    };

    const showLoading = (text: string = '处理中...') => {
        loadingText.value = text;
        isLoading.value = true;
    };

    const hideLoading = () => {
        isLoading.value = false;
    };

    // 刷新标签库 (可以在任何组件里调用！)
    const fetchLabels = async (page = 1, pageSize = 15) => {
        showLoading('正在同步云端标签库...');
        const result = await getAllLabels(page, pageSize);
        savedLabels.value = result.labels;
        hideLoading();
        return result;
    };

    return {
        // 暴露出去的 State
        currentView, isLoading, loadingText, savedLabels, currentLabel, showShareResultModal, displayShareCode,
        // 暴露出去的 Actions
        setView, showLoading, hideLoading, fetchLabels
    };
});