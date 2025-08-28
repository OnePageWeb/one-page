import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import {initWorkspace} from "@/js/workspcae.js"

// 初始化工作区
initWorkspace()
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')
