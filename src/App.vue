<!--
 * @Description  : 
 * @Version      : 1.0
 * @Author       : szk
 * @Date         : 2025-04-02 10:41:38
 * @LastEditors  : szk
 * @LastEditTime : 2025-04-02 11:49:05
-->
<template>
  <div class="container">
    <div class="left-panel">
      <h1 class="title">Node 版本管理</h1>
      <div class="version-info">
        <p>当前版本: <span class="current-version">{{ currentVersion }}</span></p>
      </div>
      <div class="version-control">
        <select 
          v-model="selectedVersion" 
          class="version-select"
          :disabled="isLoading"
        >
          <option value="">选择版本</option>
          <option 
            v-for="version in installedVersions" 
            :key="version" 
            :value="version"
          >
            {{ version }}{{ version === currentVersion ? ' (当前使用)' : '' }}
          </option>
        </select>
        <div class="button-group">
          <button 
            @click="useSelectedVersion" 
            class="btn btn-use"
            :disabled="isLoading || !selectedVersion"
          >
            {{ isLoading ? '切换中...' : '使用版本' }}
          </button>
          <button 
            @click="showInstallDialog" 
            class="btn btn-install"
            :disabled="isLoading"
          >
            安装新版本
          </button>
        </div>
      </div>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>

    <!-- 安装弹窗 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>安装新版本</h2>
        <input 
          v-model="newVersion" 
          type="text" 
          placeholder="请输入版本号 (例如: 16.14.0)"
          class="version-input"
        >
        <div class="dialog-buttons">
          <button 
            @click="installVersion" 
            class="btn btn-install"
            :disabled="!isValidVersion || isInstalling"
          >
            {{ isInstalling ? '安装中...' : '安装' }}
          </button>
          <button 
            @click="closeDialog" 
            class="btn btn-cancel"
            :disabled="isInstalling"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentVersion: '',
      installedVersions: [],
      selectedVersion: '',
      isLoading: false,
      errorMessage: '',
      showDialog: false,
      newVersion: '',
      isInstalling: false,
      NVM_GITHUB_URL: 'https://github.com/coreybutler/nvm-windows/releases'
    }
  },
  computed: {
    isValidVersion() {
      // 简单的版本号验证
      const versionPattern = /^\d+\.\d+\.\d+$/
      return versionPattern.test(this.selectedVersion.trim())
    }
  },
  async created() {
    this.updateVersions()
  },
  methods: {
    async updateVersions() {
      try {
        this.currentVersion = await window.nvm.current()
        const list = await window.nvm.list()
        this.installedVersions = list.split('\n')
          .filter((v) => v.trim())
          .sort((a, b) => {
            const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
            const [bMajor, bMinor, bPatch] = b.split('.').map(Number)
            return bMajor - aMajor || bMinor - aMinor || bPatch - aPatch
          })
      } catch (error) {
        await window.dialog.showMessageBox({
          type: 'error',
          title: '错误',
          message: '获取版本信息失败：' + error.message,
          detail: `请确保 NVM for Windows 已正确安装。\n访问 ${this.NVM_GITHUB_URL} 获取最新版本。`
        })
      }
    },
    async useSelectedVersion() {
      if (!this.selectedVersion) {
        await window.dialog.showMessageBox({
          type: 'error',
          title: '错误',
          message: '请选择版本'
        })
        return
      }

      try {
        this.isLoading = true
        await window.nvm.use(this.selectedVersion)
        await this.updateVersions()
        this.selectedVersion = ''
        await window.dialog.showMessageBox({
          type: 'info',
          title: '成功',
          message: `已成功切换到 Node.js ${this.selectedVersion}`
        })
      } catch (error) {
        await window.dialog.showMessageBox({
          type: 'error',
          title: '错误',
          message: '切换版本失败：' + error.message
        })
      } finally {
        this.isLoading = false
      }
    },
    showInstallDialog() {
      this.showDialog = true
      this.newVersion = ''
    },
    
    closeDialog() {
      this.showDialog = false
      this.newVersion = ''
    },
    
    async installVersion() {
      if (!this.isValidVersion) {
        await window.dialog.showMessageBox({
          type: 'error',
          title: '错误',
          message: '请输入有效的版本号'
        })
        return
      }

      try {
        this.isInstalling = true
        await window.nvm.install(this.newVersion)
        await this.updateVersions()
        await window.dialog.showMessageBox({
          type: 'info',
          title: '成功',
          message: `Node.js ${this.newVersion} 安装成功！`
        })
        this.closeDialog()
      } catch (error) {
        await window.dialog.showMessageBox({
          type: 'error',
          title: '错误',
          message: `安装失败：${error.message}`
        })
      } finally {
        this.isInstalling = false
      }
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.left-panel {
  flex: 1;
  max-width: 500px;
}

.right-panel {
  flex: 1;
}

.title {
  color: #2c3e50;
  margin-bottom: 30px;
}

.version-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.current-version {
  font-weight: bold;
  color: #42b983;
}

.version-control {
  margin-bottom: 30px;
}

.version-select {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
}

/* 移除 focus-visible 样式 */
.version-select:focus-visible {
  outline: none;
}

/* 保留普通的 focus 样式 */
.version-select:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-use {
  background-color: #2c3e50;
  color: white;
}

.btn-use:hover {
  background-color: #243342;
}

.btn-install {
  background-color: #42b983;
  color: white;
}

.btn-install:hover {
  background-color: #3aa876;
}

.btn-cancel {
  background-color: #666;
  color: white;
}

.btn-cancel:hover {
  background-color: #555;
}

.error-message {
  display: none;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
}

.version-input {
  width: calc(100% - 20px);
  padding: 12px 10px;
  margin-bottom: 25px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.version-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.dialog-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.dialog-buttons .btn {
  min-width: 80px;
  padding: 10px 20px;
}

.btn-install {
  background-color: #42b983;
  color: white;
  font-weight: 500;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.btn-cancel:hover {
  background-color: #e8e8e8;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
