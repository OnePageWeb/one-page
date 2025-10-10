import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/dist/index.css'
import {initWorkspace} from "@/js/workspcae.js"
import '../assets/style.css'
import '../assets/dialog.css'
import i18n from './i18n'
import { registerSW } from 'virtual:pwa-register'

let deferredUpdateSW = null
const updateSW = registerSW({
  immediate: false,
  onNeedRefresh() {
    console.log('有新版本可用')
    deferredUpdateSW = updateSW
  },
  onOfflineReady() {
    console.log('应用已准备好离线使用')
  }
})
window.$updateVersion = () => {
  deferredUpdateSW?.(true)
}

// 初始化工作区
initWorkspace()
const app = createApp(App)
app.use(i18n)
app.mount('#app')
