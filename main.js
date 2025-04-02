/*
 * @Description  :
 * @Version      : 1.0
 * @Author       : szk
 * @Date         : 2025-04-02 10:42:41
 * @LastEditors  : szk
 * @LastEditTime : 2025-04-02 11:36:04
 */
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { exec } = require('child_process')
const util = require('util')
const execAsync = util.promisify(exec)
const { globalShortcut } = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,  // 出于安全考虑设为 false
      contextIsolation: true,  // 启用上下文隔离
      preload: path.join(__dirname, 'preload.js')  // 添加 preload 脚本
    }
  })

  // 或者完全移除菜单
  win.removeMenu()

  win.loadFile('dist/index.html')
}

app.whenReady().then(() => {
  // 注册快捷键
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    // 获取当前窗口并打开开发者工具
    BrowserWindow.getFocusedWindow()?.webContents.openDevTools()
  })
  
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 修改命令执行方式
ipcMain.handle('nvm:current', async () => {
  try {
    const { stdout } = await execAsync('cmd.exe /c nvm current', { shell: true })
    return stdout.trim()
  } catch (error) {
    throw new Error('获取当前版本失败')
  }
})

ipcMain.handle('nvm:list', async () => {
  try {
    const { stdout } = await execAsync('cmd.exe /c nvm list', { shell: true })
    return stdout
  } catch (error) {
    throw new Error('获取版本列表失败')
  }
})

ipcMain.handle('nvm:install', async (event, version) => {
  try {
    await execAsync(`cmd.exe /c nvm install ${version}`, { shell: true })
    return true
  } catch (error) {
    throw new Error('安装版本失败')
  }
})

ipcMain.handle('nvm:use', async (event, version) => {
  try {
    await execAsync(`cmd.exe /c nvm use ${version}`, { shell: true })
    return true
  } catch (error) {
    throw new Error('切换版本失败')
  }
})
