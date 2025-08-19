import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// 根据环境变量设置 base（GitHub Pages 部署需要）
const base = process.env.NODE_ENV === 'production' ? '/one/' : '/'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
    ],
    base, // 关键配置：生产环境路径前缀
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
