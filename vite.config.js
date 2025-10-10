import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from 'vite-plugin-pwa'

export default defineConfig(({mode}) => {
  const base = './'

  return {
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['first-config.json', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'imgs/**/*.{png,jpg,jpeg,gif,svg}', 'configs/**/*.{json,zip}'],
        manifest: {
          name: 'one',
          short_name: 'one',
          description: '高自定义的个人站点',
          theme_color: '#292929',
          background_color: '#000000',
          display: 'standalone',
          start_url: './',
          scope: './',
          icons: [
            {
              src: 'one_192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'one_512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ],
          screenshots: [
            {
              "src": "/imgs/display/starter_profile.png",
              "sizes": "2496x1365",
              "type": "image/png",
              "form_factor": "wide"   // 针对桌面
            },
            {
              "src": "/imgs/display/starter_profile.png",
              "sizes": "2496x1365",
              "type": "image/png",
            }
          ]
        },
      })
    ],
    base, // 关键配置：生产环境路径前缀
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
