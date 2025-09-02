import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // 在回调函数中可以安全访问 mode
    let base = '/'

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
