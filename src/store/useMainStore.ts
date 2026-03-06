import { defineStore } from 'pinia';
import { getLocalLabelsPaginated, getLocalThenCloudLabels } from '../utils/db';
import type { LabelData } from '../types';

interface MainState {
  currentView: 'login' | 'dashboard' | 'editor';
  savedLabels: LabelData[];
  totalLabels: number;
  currentLabel: LabelData;
  isLoading: boolean;
  loadingText: string;
  currentPlatform: string; // <--- 加上这一行
}

export const useMainStore = defineStore('main', {
  // 2. 🌟 在这里给 currentPlatform 赋初始值 'ALL'
  state: (): MainState => ({
    currentView: 'login',
    savedLabels: [],
    totalLabels: 0,
    currentLabel: {} as LabelData,
    isLoading: false,
    loadingText: '',
    currentPlatform: 'TEMU', // <--- 加上这一行
  }),
  actions: {
      setView(view: 'login' | 'dashboard' | 'editor') {
        this.currentView = view;
      },
      showLoading(text = '处理中...') {
        this.isLoading = true;
        this.loadingText = text;
      },
      hideLoading() {
        this.isLoading = false;
        this.loadingText = '';
      },
// 3. 🌟 修改 fetchLabels，让它每次都去读取当前的 currentPlatform
    async fetchLabels(page = 1, pageSize = 10, forceLocal = false, skipLoading = false) {
      if (!skipLoading) this.showLoading('加载中...');
      try {
        const platform = this.currentPlatform; // 获取当前选中的平台
        let res;
        
        // 调用 db.ts 时，把 platform 传进去！
        if (forceLocal) {
          res = await getLocalLabelsPaginated(page, pageSize, platform);
        } else {
          res = await getLocalThenCloudLabels(page, pageSize, platform);
        }
        
        this.savedLabels = res.labels || [];
        this.totalLabels = res.total || 0;
      } catch (err) {
        console.error('获取标签失败', err);
      } finally {
        if (!skipLoading) this.hideLoading();
      }
    }
  }
});