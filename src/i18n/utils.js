import i18n from './index'

// 切换语言
export const changeLanguage = (lang) => {
  if (lang) {
    i18n.global.locale.value = lang;  // 修改当前语言
    localStorage.setItem('lang', lang);  // 持久化存储
  }
};

// 获取当前语言
export const getCurrentLanguage = () => {
  return i18n.global.locale.value;
}