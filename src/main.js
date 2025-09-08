import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Promise from 'core-js/stable/promise'
window.Promise = Promise

import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/dist/index.css'
import {initWorkspace} from "@/js/workspcae.js"
import '../assets/style.css'
import i18n from './i18n'

// 初始化工作区
initWorkspace()
const app = createApp(App)
app.use(i18n)
app.mount('#app')
