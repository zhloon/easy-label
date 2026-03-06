import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import axios from 'axios';
import { generateHardDeviceId } from './hardwareId';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
let mainWindow: BrowserWindow | null = null;

// 🌟 智能获取静态资源路径 (兼容开发环境和打包后的生产环境)
const publicPath = process.env.VITE_DEV_SERVER_URL
  ? path.join(__dirname, '../public')
  : path.join(__dirname, '../dist');

// ==========================================
// 🌟 【主进程】统一 Axios 网络请求配置
// ==========================================
const apiClient = axios.create({
  baseURL: 'https://easylabel.cloud', // 统一为您真实的正式版云端域名
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// 主进程全局响应拦截
apiClient.interceptors.response.use(
  (res) => {
    if (typeof res.data === 'string') {
      return { success: false, error: '服务器返回格式异常，请检查网络' };
    }
    return res.data;
  },
  (error) => {
    console.error('❌ [Main API Error]:', error.message);
    return Promise.resolve({
      success: false,
      error: error.response?.data?.error || '网络连接失败，请检查网络并重试'
    });
  }
);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(publicPath, process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    autoHideMenuBar: true, 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false 
    }
  });

  mainWindow.setMenu(null);

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ==========================================
// ★ 核心安全区：卡密验证与解绑的 IPC 监听
// ==========================================
ipcMain.handle('verify-license', async (event, key: string) => {
  const deviceId = generateHardDeviceId();
  console.log(`👉 [API] 正在验证设备: ${deviceId}`);
  return await apiClient.post('/api/verify', { key, deviceId });
});

ipcMain.handle('unbind-license', async (event, key: string) => {
  const deviceId = generateHardDeviceId();
  console.log(`👉 [API] 正在申请解绑设备: ${deviceId}`);
  return await apiClient.post('/api/unbind', { key, deviceId });
});

ipcMain.handle('get-device-id', () => generateHardDeviceId());

ipcMain.handle('auto-login', async () => {
  const deviceId = generateHardDeviceId();
  console.log(`👉 [API] 正在静默登录设备: ${deviceId}`);
  return await apiClient.post('/api/auto-login', { deviceId });
});

ipcMain.handle('set-badge', (event, count: number) => {
  app.setBadgeCount(count);
  return { success: true };
});

// ======================================================================
// 🌟 独立封装：核心搬家执行逻辑 (只要有 Token 就能跑)
// ======================================================================
async function executeMigration(platform: string, authResult: any, event: any) {
  let convertedLabels: any[] = [];
  event.sender.send('migration-progress', '已获取有效授权，开始抓取数据...');

  try {
    // ---------------------------------------------------------
    // 🚀 分支 A：甩手工具搬家逻辑
    // ---------------------------------------------------------
    if (platform === 'shuaishou') {
      const headers = { 'Content-Type': 'application/json', 'token': authResult.token, 'tokenKey': authResult.tokenKey };
      const shuaishouPlatforms = [
        { name: 'TEMU', typeId: 1, platformId: 1 }, { name: 'SHEIN', typeId: 4, platformId: 2 },
        { name: 'TIKTOK', typeId: 5, platformId: 3 }, { name: 'ALIEXPRESS', typeId: 6, platformId: 4 },
        { name: 'AMAZON', typeId: 7, platformId: 5 }
      ];

      function convertOldLabelData(sourceJson: any, targetPlatform: string) {
        const outLabel = {
          id: Date.now().toString() + Math.floor(Math.random() * 10000).toString(),
          name: (sourceJson.name || "导入的标签") + "（甩手）",
          wMM: sourceJson.width || 100, hMM: sourceJson.height || 100,
          platform: targetPlatform, elements: [] as any[]
        };
        try {
          const jsonStr = sourceJson.canvasJSON || sourceJson.json || sourceJson.content || '{}';
          const canvasData = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
          let zIndex = 100;
          if (canvasData && canvasData.objects && Array.isArray(canvasData.objects)) {
            outLabel.elements = canvasData.objects.map((el: any) => {
              const out: any = { id: (Date.now() + Math.floor(Math.random() * 100000)).toString(), style: { zIndex: zIndex++, left: (el.left || 0) + 'px', top: (el.top || 0) + 'px', width: ((el.width || 0) * (el.scaleX || 1)) + 'px', height: ((el.height || 0) * (el.scaleY || 1)) + 'px' } };
              if (el.type === 'textbox' || el.type === 'text') {
                out.type = 'text'; out.content = el.text || ''; out.fontSize = ((el.fontSize || 14) * (el.scaleY || 1)) + 'px'; out.fontWeight = el.fontWeight === 'bold' ? 'bold' : 'normal';
              } else if (el.type === 'barcode' || el.isBarcode) {
                out.type = 'barcode'; out.content = el.text || el.code || '123456';
              } else if (el.type === 'rect' || el.type === 'line') {
                out.type = 'line'; out.isVertical = (el.height * (el.scaleY || 1)) > (el.width * (el.scaleX || 1)) ? 'true' : 'false';
              } else if (el.type === 'image') {
                out.type = 'image'; out.imgUrl = el.src || '';
              }
              return out;
            });
          }
        } catch (err) { console.error('解析甩手数据失败', err); }
        return outLabel;
      }

      for (const sp of shuaishouPlatforms) {
        event.sender.send('migration-progress', `正在查询 ${sp.name} 平台模板...`);
        try {
          const listRes = await axios.post('https://dztool.shuaishou.com/api/tool_api/printTemplates/list', {
            pageNo: 1, pageSize: 99999, param: { keyword: "", typeId: sp.typeId, platform: sp.platformId }
          }, { headers });
          let items = (listRes.data.code === 0 && listRes.data.data) ? (Array.isArray(listRes.data.data) ? listRes.data.data : (listRes.data.data.list || [])) : [];
          const ids = items.map((item: any) => item.id);
          if (ids.length === 0) continue;
          for (let i = 0; i < ids.length; i++) {
            event.sender.send('migration-progress', `正在迁移 ${sp.name} (${i + 1}/${ids.length})`);
            try {
              const detailRes = await axios.get(`https://dztool.shuaishou.com/api/tool_api/printTemplates/detail?id=${ids[i]}`, { headers });
              if (detailRes.data.code === 0 && detailRes.data.data) {
                convertedLabels.push(convertOldLabelData(detailRes.data.data, sp.name));
              }
            } catch (e) {}
            await new Promise(r => setTimeout(r, 200));
          }
        } catch (err) { console.error(`甩手 ${sp.name} 失败:`, err); }
      }
    }
    // ---------------------------------------------------------
    // 🚀 分支 B：佳同工具搬家逻辑
    // ---------------------------------------------------------
    else if (platform === 'jiatong') {
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'token': authResult.token, 'Authorization': authResult.token };
      const jiatongPlatforms = ['TEMU', 'SHEIN', 'TIKTOK', 'ALIEXPRESS', 'AMAZON'];

      function convertJiatongLabelData(sourceJson: any, targetPlatform: string) {
        const R = 1.25; 
        const fontRatio = 0.85; 
        const outLabel = {
          id: Date.now().toString() + Math.floor(Math.random() * 10000).toString(),
          name: (sourceJson.name || "导入的标签") + "（佳同）",
          wMM: sourceJson.width || sourceJson.tmWidth || 100,
          hMM: sourceJson.height || sourceJson.tmHeight || 100,
          platform: targetPlatform, elements: [] as any[]
        };
        try {
          if (sourceJson.canvasJSON) {
            const canvasData = JSON.parse(sourceJson.canvasJSON);
            let zIndex = 100;
            if (canvasData.objects && Array.isArray(canvasData.objects)) {
              outLabel.elements = canvasData.objects.map((el: any) => {
                const out: any = { id: (Date.now() + Math.floor(Math.random() * 100000)).toString(), style: { zIndex: zIndex++ } };
                
                let w = (el.width || 0) * (el.scaleX || 1); let h = (el.height || 0) * (el.scaleY || 1);
                if (el.type === 'line' && w === 0 && h === 0) { w = Math.abs((el.x2 || 0) - (el.x1 || 0)) * (el.scaleX || 1); h = Math.abs((el.y2 || 0) - (el.y1 || 0)) * (el.scaleY || 1); }
                
                let rad = (el.angle || 0) * Math.PI / 180; let cos = Math.cos(rad); let sin = Math.sin(rad);
                let px = el.originX === 'center' ? w / 2 : (el.originX === 'right' ? w : 0); let py = el.originY === 'center' ? h / 2 : (el.originY === 'bottom' ? h : 0);
                
                let corners = [{ x: -px, y: -py }, { x: w - px, y: -py }, { x: -px, y: h - py }, { x: w - px, y: h - py }];
                let absCorners = corners.map(c => ({ x: el.left + (c.x * cos - c.y * sin), y: el.top + (c.x * sin + c.y * cos) }));
                
                let minX = Math.min(...absCorners.map(c => c.x)); let maxX = Math.max(...absCorners.map(c => c.x)); let minY = Math.min(...absCorners.map(c => c.y)); let maxY = Math.max(...absCorners.map(c => c.y));
                let actualW = (maxX - minX) * R; let actualH = (maxY - minY) * R; let trueX = minX * R; let trueY = minY * R;

                if (el.type === 'barcode' || el.type === 'BarCode' || el.isBarcode || (el.type === 'image' && el.tag?.isSkuBarCode)) {
                  out.type = 'barcode'; out.content = el.text || el.content || el.code || '123456'; 
                  out.customW = Math.round(w / 7.56) || 70; out.customH = Math.round(h / 7.56) || 20;
                  out.style.width = (out.customW * 7.56).toFixed(2) + 'px'; out.style.height = (out.customH * 7.56).toFixed(2) + 'px'; out.style.left = trueX.toFixed(2) + 'px'; out.style.top = trueY.toFixed(2) + 'px';
                } else if (el.type === 'textbox' || el.type === 'i-text' || el.type === 'text') {
                  out.type = 'text'; out.content = el.text || ''; 
                  let exactFontSize = (el.fontSize || 14) * (el.scaleY || 1) * R * fontRatio; out.fontSize = exactFontSize.toFixed(2) + 'px'; 
                  let isBold = el.fontWeight === 'bold' || String(el.fontWeight) === '700' || Number(el.fontWeight) >= 600 || el.bold === true || el.isBold === true || String(el.fontFamily).toLowerCase().includes('bold') || (el.strokeWidth > 0 && el.stroke && el.stroke !== 'transparent' && el.stroke !== '#ffffff');
                  out.fontWeight = isBold ? 'bold' : 'normal';
                  let widthPadding = exactFontSize * 0.15 + 2; out.style.width = (actualW + widthPadding).toFixed(2) + 'px'; out.style.height = 'auto'; out.style.left = trueX.toFixed(2) + 'px'; out.style.top = trueY.toFixed(2) + 'px'; out.style.lineHeight = el.lineHeight || 1.16; 
                  let isSingleLine = (el.textLines && el.textLines.length === 1) || !out.content.includes('\n');
                  if (isSingleLine) { out.style.whiteSpace = 'nowrap'; } else { out.style.whiteSpace = 'pre-wrap'; out.style.wordBreak = 'break-word'; }
                } else if (el.type === 'rect' || el.type === 'line') {
                  out.type = 'line'; let isVertical = actualH > actualW;
                  if (isVertical) { out.isVertical = 'true'; out.style.width = '1.5px'; out.style.height = actualH.toFixed(2) + 'px'; out.style.left = (trueX + actualW / 2 - 0.75).toFixed(2) + 'px'; out.style.top = trueY.toFixed(2) + 'px'; } 
                  else { out.isVertical = 'false'; out.style.height = '1.5px'; out.style.width = actualW.toFixed(2) + 'px'; out.style.left = trueX.toFixed(2) + 'px'; out.style.top = (trueY + actualH / 2 - 0.75).toFixed(2) + 'px'; }
                } else if (el.type === 'image') {
                  out.type = 'image'; out.imgUrl = el.src || el.url || ''; out.style.width = actualW.toFixed(2) + 'px'; out.style.height = actualH.toFixed(2) + 'px'; out.style.left = trueX.toFixed(2) + 'px'; out.style.top = trueY.toFixed(2) + 'px';
                }
                return out;
              });
            }
          }
        } catch (err) { console.error('解析佳同失败', err); }
        return outLabel;
      }

      for (const platName of jiatongPlatforms) {
        event.sender.send('migration-progress', `正在查询 ${platName} 平台模板...`);
        try {
          const listParams = new URLSearchParams(); listParams.append('platform', platName); listParams.append('currentPage', '1'); listParams.append('limit', '9999');
          const listRes = await axios.post('https://www.tupianfanyi.com/bqConcat/get', listParams, { headers });
          const lists = listRes.data?.data?.lists || [];
          if (lists.length === 0) continue; 
          
          for (let i = 0; i < lists.length; i++) {
            const mainId = lists[i].mainId || lists[i]._id; if (!mainId) continue;
            event.sender.send('migration-progress', `正在迁移 ${platName} (${i + 1}/${lists.length})`);
            try {
              const detailParams = new URLSearchParams(); detailParams.append('id', mainId);
              const detailRes = await axios.post('https://www.tupianfanyi.com/bqConcat/getById', detailParams, { headers });
              if (detailRes.data?.data) { convertedLabels.push(convertJiatongLabelData(detailRes.data.data, platName)); }
            } catch (e) {}
            await new Promise(r => setTimeout(r, 200)); 
          }
        } catch (err) { console.error(`佳同 ${platName} 失败:`, err); }
      }
    }

    return convertedLabels;

  } catch (error: any) {
    throw new Error('抓取过程发生错误: ' + error.message);
  }
}

// ======================================================================
// 🚀 主路由：支持前端传入本地存储的 Token (实现免弹窗闭环)
// ======================================================================
ipcMain.handle('migrate-labels', async (event, platform: string, storedAuth?: any) => {
  return new Promise(async (resolve, reject) => {
    
    // 🌟 1. 优先使用前端传入的本地 Token
    if (storedAuth && storedAuth.token) {
      console.log(`✅ [Migrate] 检测到 ${platform} 本地授权，正在静默抓取...`);
      try {
        const result = await executeMigration(platform, storedAuth, event);
        return resolve(result); 
      } catch (e) {
        console.warn('本地 Token 可能已过期，回退到登录弹窗模式');
      }
    }

    // 🌟 2. 如果无 Token 或已过期，弹出窗口要求登录
    let targetUrl = platform === 'shuaishou' ? 'https://dztool.shuaishou.com/' : 'hhttps://jiatongkuajing.com//';
    let targetTitle = platform === 'shuaishou' ? '登录甩手打印工具' : '登录佳同跨境工具';

    const migrateWin = new BrowserWindow({
      width: 1000, height: 700, title: targetTitle, show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true, partition: 'persist:store' }
    });
    migrateWin.loadURL(targetUrl);

    let pollInterval: NodeJS.Timeout;
    let hasStartedMigration = false;

    const checkToken = async () => {
      if (migrateWin.isDestroyed()) return null;
      try {
        if (platform === 'shuaishou') {
          return await migrateWin.webContents.executeJavaScript(`
            (function() {
              const userStoreStr = window.localStorage.getItem('userStore');
              if (!userStoreStr) return null;
              const userStore = JSON.parse(userStoreStr);
              if (!userStore.token) return null;
              return { token: userStore.token, tokenKey: userStore.tokenKey };
            })();
          `);
        } else if (platform === 'jiatong') {
          return await migrateWin.webContents.executeJavaScript(`
            (function() {
              const token = window.localStorage.getItem('token') || window.sessionStorage.getItem('token');
              if (!token) return null;
              return { token: token };
            })();
          `);
        }
      } catch (e) { return null; }
    };

    pollInterval = setInterval(async () => {
      if (hasStartedMigration || migrateWin.isDestroyed()) {
        clearInterval(pollInterval);
        return;
      }
      
      const authResult = await checkToken();
      if (authResult) {
        clearInterval(pollInterval);
        hasStartedMigration = true;
        
        // 🌟 核心新增：拿到新 Token 后，通过事件通知前端存入 LocalStorage
        event.sender.send('save-migration-auth', { platform, auth: authResult });
        
        if (!migrateWin.isDestroyed()) migrateWin.close(); 
        
        try {
          const result = await executeMigration(platform, authResult, event);
          resolve(result);
        } catch (e: any) {
          reject(e.message);
        }
      } else {
        if (!migrateWin.isVisible()) {
          migrateWin.show();
          event.sender.send('migration-progress', 'WAITING_LOGIN');
          const injectTipScript = `
            if (!document.getElementById('easy-label-login-tip')) {
              const tip = document.createElement('div');
              tip.id = 'easy-label-login-tip';
              tip.style.cssText = 'position:fixed; top:24px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color:#fff; padding:16px 32px; border-radius:16px; z-index:2147483647; font-family:sans-serif; font-size:16px; font-weight:bold; box-shadow:0 10px 25px -5px rgba(79, 70, 229, 0.4); pointer-events:none; text-align:center; animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1);';
              const style = document.createElement('style');
              style.innerHTML = '@keyframes slideDown { from { top: -50px; opacity: 0; } to { top: 24px; opacity: 1; } }';
              document.head.appendChild(style);
              tip.innerHTML = '✨ 易标签助手：请在此窗口登录目标系统<br><span style="font-size:13px; font-weight:normal; opacity:0.9; margin-top:6px; display:inline-block;">登录成功后，此窗口将自动关闭并开始极速搬家</span>';
              document.body.appendChild(tip);
            }
          `;
          migrateWin.webContents.executeJavaScript(injectTipScript).catch(() => {});
        }
      }
    }, 1500);
  });
});