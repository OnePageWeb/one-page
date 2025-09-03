import { createI18n } from 'vue-i18n'
import zh from './locales/zh.js'
import en from './locales/en.js'

// 读取本地存储的语言偏好，默认中文
const browserLang = navigator.language.includes('zh') ? 'zh' : 'en'
const locale = localStorage.getItem('lang') || browserLang

const i18n = createI18n({
  legacy: false,  // 使用 Composition API 必须设置为 false
  globalInjection: true,  // 全局注入 $t 函数
  locale,
  fallbackLocale: 'zh',  // 语言不存在时的 fallback
  messages: {
    'zh': zh,
    'en': en
  }
})

export default i18n