/// <reference types="vite/client" />
import { ipcRenderer } from 'electron';

const DB_NAME = 'easy-label-db';
const STORE_NAME = 'labels';

// 初始化本地 IndexedDB 缓存
function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const getAuthKey = () => localStorage.getItem('easy_label_vip_key') || '';

// --- 本地底层操作 ---
async function saveToLocal(label: any) {
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(label);
    tx.oncomplete = () => resolve(true);
  });
}

async function deleteFromLocal(id: string) {
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve(true);
  });
}

export async function clearLocalCache() {
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve(true);
  });
}

async function getLocalLabels(): Promise<any[]> {
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

// ==========================================
// 🌟 统一网络请求层 (移步前端，F12 网络面板可见)
// ==========================================

export async function apiPost(path: string, data: any = {}) {
  // 跨进程获取硬件指纹
  const deviceId = await ipcRenderer.invoke('get-device-id');
  const key = data.key !== undefined ? data.key : getAuthKey();
  
  const payload = { key, deviceId, ...data };
  const baseURL = import.meta.env.DEV ? '' : 'https://easylabel.cloud';

  try {
    const response = await fetch(`${baseURL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, error: err.message || '网络请求失败，请检查网络连接' };
  }
}

export async function apiGet(path: string) {
  const baseURL = import.meta.env.DEV ? '' : 'https://easylabel.cloud';
  try {
    const response = await fetch(`${baseURL}${path}`);
    return await response.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 暴露鉴权相关接口
export const apiAutoLogin = () => apiPost('/api/auto-login');
export const apiVerifyLicense = (key: string) => apiPost('/api/verify', { key });
export const apiUnbindLicense = (key: string) => apiPost('/api/unbind', { key });


// ==========================================
// 🌟 强一致性业务层 (优先云端，本地兜底)
// ==========================================

export async function saveLabel(label: any) {
  if (!getAuthKey()) throw new Error('未授权');
  const res = await apiPost('/api/labels/save', { label });
  if (!res.success) throw new Error(res.error || '云端保存失败');
  await saveToLocal(label); // 云端成功后写入本地
  return res;
}

export async function deleteLabel(labelId: string) {
  if (!getAuthKey()) throw new Error('未授权');
  const res = await apiPost('/api/labels/delete', { labelId });
  if (!res.success) throw new Error(res.error || '云端删除失败');
  await deleteFromLocal(labelId);
  return res;
}

// 🌟 这里控制拉取的条数默认值为 10（完美适配 2 行网格）
export async function getCloudLabels(page = 1, pageSize = 10) {
  if (!getAuthKey()) throw new Error('未授权');
  
  try {
    const res = await apiPost('/api/labels/get', { page, pageSize });
    if (!res.success) throw new Error(res.error || '获取云端数据失败');
    
    const labels = res.labels || [];
    for (const lbl of labels) await saveToLocal(lbl); // 刷新本地缓存
    return { labels, total: res.total || labels.length };
    
  } catch (err) {
    console.warn('云端拉取失败，启用本地缓存兜底', err);
    const localData = await getLocalLabels();
    const start = (page - 1) * pageSize;
    return { labels: localData.slice(start, start + pageSize), total: localData.length };
  }
}

export async function clearAndImportDB(labels: any[]) {
  for (const label of labels) await saveLabel(label); 
}