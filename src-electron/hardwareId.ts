import { execSync } from 'child_process';
import crypto from 'crypto';
import os from 'os';

/**
 * 执行系统命令并返回整洁的字符串结果
 */
function getSystemData(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .replace(/\r+|\n+|\s+/ig, '') // 移除所有换行和空格
      .trim();
  } catch (e) {
    return ''; // 如果获取失败，返回空字符串作为兜底
  }
}

/**
 * 获取跨平台的硬件物理序列号
 */
export function generateHardDeviceId(): string {
  let motherboard = '';
  let cpuId = '';
  
  const platform = os.platform();

  if (platform === 'win32') {
    // Windows 系统底层命令
    motherboard = getSystemData('powershell -command "(Get-CimInstance -Class Win32_BaseBoard).SerialNumber"');
    cpuId = getSystemData('powershell -command "(Get-CimInstance -Class Win32_Processor).ProcessorId"');
  } 
  else if (platform === 'darwin') {
    // macOS 系统底层命令
    motherboard = getSystemData('ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformSerialNumber | awk -F\\" \'{print $4}\'');
    cpuId = getSystemData('sysctl -n machdep.cpu.brand_string');
  } 
  else if (platform === 'linux') {
    // Linux 系统底层命令
    motherboard = getSystemData('cat /sys/class/dmi/id/board_serial');
    cpuId = getSystemData('cat /proc/cpuinfo | grep "serial" | awk \'{print $3}\'');
  }

  // 兜底方案：如果因为权限问题什么都没拿到，使用系统的网卡 MAC 地址
  if (!motherboard && !cpuId) {
    const interfaces = os.networkInterfaces();
    let mac = '';
    for (const key in interfaces) {
      const net = interfaces[key]?.find(i => !i.internal && i.mac !== '00:00:00:00:00:00');
      if (net) { mac = net.mac; break; }
    }
    motherboard = mac || os.hostname();
  }

  // 将收集到的硬件信息拼接，加入您软件的专属“盐 (Salt)”
  const rawId = `EasyLabel_v1_${motherboard}_${cpuId}`;
  
  // 使用 SHA-256 加密生成不可逆的 64 位指纹字符串
  const hashedId = crypto.createHash('sha256').update(rawId).digest('hex');
  
  return hashedId;
}