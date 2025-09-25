import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({mode}) => {
  const base = './'

  return {
    plugins: [vue()],
    base, // 关键配置：生产环境路径前缀
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
