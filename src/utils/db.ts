import { ipcRenderer } from 'electron';
import localforage from 'localforage';
import type { LabelData } from '../types';
import { apiClient } from '../api';

const CACHE_KEY = 'easy_label_cached_data';

async function getAuthPayload() {
  const key = localStorage.getItem('easy_label_vip_key');
  const deviceId = await ipcRenderer.invoke('get-device-id');
  return { key, deviceId };
}

// 手动刷新或解绑时才调用此方法
export async function clearLocalCache(): Promise<void> {
  await localforage.removeItem(CACHE_KEY);
}

/**
 * 查：只有本地完全没数据时，才向云端发起全量拉取请求 (极低消耗)
 */
export async function getAllLabels(page: number = 1, pageSize: number = 15): Promise<{ labels: LabelData[], total: number }> {
  try {
    const auth = await getAuthPayload();
    if (!auth.key) return { labels: [], total: 0 };

    let localData: LabelData[] | null = await localforage.getItem(CACHE_KEY);

    // 只有初次登录、或用户主动点击“刷新”清理了缓存后，才会真正请求云端
    if (!localData || localData.length === 0) {
      console.log('🔄 本地无缓存，正在从云端拉取全量数据...');

      const data: any = await apiClient.post('/api/labels/get', {
        ...auth,
        page: 1,
        pageSize: 9999
      });

      if (data.success && data.labels) {
        localData = data.labels;
        await localforage.setItem(CACHE_KEY, localData);
      } else {
        return { labels: [], total: 0 };
      }
    }

    // 纯本地内存分页，零延迟，零服务器请求
    const total = localData!.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLabels = localData!.slice(startIndex, endIndex);

    return { labels: paginatedLabels, total };
  } catch (err) {
    console.error('获取标签失败:', err);
    return { labels: [], total: 0 };
  }
}

/**
 * 增/改：精确增量更新！保存一条，只修改本地的那一条
 */
export async function saveLabel(label: LabelData): Promise<void> {
  try {
    const auth = await getAuthPayload();

    // 1. 发送给云端处理 (以云端为准)
    const data: any = await apiClient.post('/api/labels/save', {
      ...auth,
      label
    });

    if (!data.success) {
      throw new Error(data.error || '云端保存失败');
    }

    // 🌟 2. 核心优化：云端保存成功后，我们不去销毁缓存，而是直接把本地缓存翻出来“精准手术”
    let localData: LabelData[] | null = await localforage.getItem(CACHE_KEY);
    if (!localData) localData = [];

    const index = localData.findIndex(l => l.id === label.id);
    if (index > -1) {
      // 找到了，说明是修改，直接覆盖这一条
      localData[index] = label;
    } else {
      // 没找到，说明是新增，插到最前面
      localData.unshift(label);
    }

    // 将做完手术的数据重新存回本地。整个过程对服务器读取请求为 0！
    await localforage.setItem(CACHE_KEY, localData);

  } catch (err: any) {
    throw err;
  }
}

/**
 * 删：精确增量更新！删除一条，只在本地剔除那一条
 */
export async function deleteLabel(id: string): Promise<void> {
  const auth = await getAuthPayload();

  // 1. 发送给云端执行删除
  const data: any = await apiClient.post('/api/labels/delete', {
    ...auth,
    labelId: id
  });

  if (!data.success) throw new Error(data.error || '云端删除失败');

  // 🌟 2. 核心优化：云端删除成功后，直接从本地数组中过滤掉它
  let localData: LabelData[] | null = await localforage.getItem(CACHE_KEY);
  if (localData) {
    localData = localData.filter(l => l.id !== id);
    await localforage.setItem(CACHE_KEY, localData);
  }
}

export async function clearAndImportDB(data: LabelData[]): Promise<void> {
  for (const item of data) {
    if (!item.id) item.id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    await saveLabel(item);
  }
}