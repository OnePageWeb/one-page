import i18n from './index'

// 切换语言
export const changeLanguage = (lang) => {
  if (lang) {
    i18n.global.locale.value = lang;  // 修改当前语言
    localStorage.setItem('lang', lang);  // 持久化存储
  }
}

// 获取当前语言
export const getCurrentLanguage = () => {
  // 获取地址栏参数
  const lang = new URLSearchParams(window.location.search).get('lang')
  if (lang) {
    changeLanguage(lang)
  }
  return i18n.global.locale.value;
}