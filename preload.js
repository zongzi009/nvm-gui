/*
 * @Description  : 
 * @Version      : 1.0
 * @Author       : szk
 * @Date         : 2025-04-02 10:47:10
 * @LastEditors  : szk
 * @LastEditTime : 2025-04-02 11:21:25
 */
const { contextBridge, ipcRenderer } = require('electron');

// 定义与主进程通信的接口
contextBridge.exposeInMainWorld('nvm', {
  current: () => ipcRenderer.invoke('nvm:current'),
  list: () => ipcRenderer.invoke('nvm:list'),
  install: (version) => ipcRenderer.invoke('nvm:install', version),
  use: (version) => ipcRenderer.invoke('nvm:use', version)
});
