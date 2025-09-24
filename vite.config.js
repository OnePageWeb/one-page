import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  console.log('当前模式:', mode) // 确认 mode
  // 在回调函数中可以安全访问 mode
  let base = mode === 'production' ? '/one/' : '/'

  if (mode === 'dev') {
    // 映射为标准的 development 环境
    process.env.NODE_ENV = 'development'
    base = '/'
  }
  console.log('当前base:', base) // 确认 mode

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
