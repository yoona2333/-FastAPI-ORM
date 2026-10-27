import { defineStore } from 'pinia';

const supportedLanguages = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'es-ES', 'fr-FR'];

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: localStorage.getItem('language') || 'zh-CN', // 默认中文
  }),
  
  getters: {
    getCurrentLanguage: (state) => state.currentLanguage,
  },
  
  actions: {
    setLanguage(language) {
      if (!supportedLanguages.includes(language)) return;
      this.currentLanguage = language;
      localStorage.setItem('language', language);
    },
  }
});
