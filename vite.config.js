/*
 * @Description  : 
 * @Version      : 1.0
 * @Author       : szk
 * @Date         : 2025-04-02 10:41:38
 * @LastEditors  : szk
 * @LastEditTime : 2025-04-02 11:06:18
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // 使用相对路径
  build: {
    outDir: 'dist'
  }
})
