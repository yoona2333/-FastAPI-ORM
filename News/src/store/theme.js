import { defineStore } from 'pinia';

const themes = {
  light: {
    name: '编辑白',
    backgroundColor: '#f3f6fa',
    surfaceColor: '#ffffff',
    textColor: '#172033',
    textSoftColor: '#526074',
    mutedColor: '#8a94a5',
    primaryColor: '#db3b42',
    primarySoftColor: '#fff0f0',
    secondaryColor: '#2457d6',
    lineColor: '#e3e8ef',
    colorScheme: 'light'
  },
  dark: {
    name: '墨夜黑',
    backgroundColor: '#10141d',
    surfaceColor: '#1b2230',
    textColor: '#f5f7fb',
    textSoftColor: '#c0c8d5',
    mutedColor: '#8994a6',
    primaryColor: '#ff6268',
    primarySoftColor: '#3a2027',
    secondaryColor: '#75a0ff',
    lineColor: '#30394a',
    colorScheme: 'dark'
  },
  blue: {
    name: '海湾蓝',
    backgroundColor: '#eef4ff',
    surfaceColor: '#ffffff',
    textColor: '#12213d',
    textSoftColor: '#53647f',
    mutedColor: '#8896aa',
    primaryColor: '#2463eb',
    primarySoftColor: '#e8f0ff',
    secondaryColor: '#1746a2',
    lineColor: '#dce6f6',
    colorScheme: 'light'
  },
  green: {
    name: '松柏绿',
    backgroundColor: '#eff7f2',
    surfaceColor: '#ffffff',
    textColor: '#173128',
    textSoftColor: '#526b62',
    mutedColor: '#879c94',
    primaryColor: '#19875b',
    primarySoftColor: '#e2f5ec',
    secondaryColor: '#2f6e55',
    lineColor: '#d9e9e1',
    colorScheme: 'light'
  },
  purple: {
    name: '暮云紫',
    backgroundColor: '#f5f1fb',
    surfaceColor: '#ffffff',
    textColor: '#2b1e3d',
    textSoftColor: '#675878',
    mutedColor: '#9a8ca9',
    primaryColor: '#7650b8',
    primarySoftColor: '#eee5fb',
    secondaryColor: '#513382',
    lineColor: '#e7dff0',
    colorScheme: 'light'
  },
  amber: {
    name: '暖阳橙',
    backgroundColor: '#fff7ea',
    surfaceColor: '#ffffff',
    textColor: '#3b2a17',
    textSoftColor: '#735f48',
    mutedColor: '#a28f78',
    primaryColor: '#d97812',
    primarySoftColor: '#fff0d8',
    secondaryColor: '#9a5510',
    lineColor: '#f0e1ca',
    colorScheme: 'light'
  },
  rose: {
    name: '蔷薇粉',
    backgroundColor: '#fff2f5',
    surfaceColor: '#ffffff',
    textColor: '#3a2029',
    textSoftColor: '#745665',
    mutedColor: '#a48794',
    primaryColor: '#d94876',
    primarySoftColor: '#ffe5ed',
    secondaryColor: '#913251',
    lineColor: '#f1dce3',
    colorScheme: 'light'
  },
  teal: {
    name: '湖水青',
    backgroundColor: '#edf8f8',
    surfaceColor: '#ffffff',
    textColor: '#153334',
    textSoftColor: '#526f70',
    mutedColor: '#83a0a1',
    primaryColor: '#13858a',
    primarySoftColor: '#dcf3f3',
    secondaryColor: '#1d6266',
    lineColor: '#d5eaea',
    colorScheme: 'light'
  }
};

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: localStorage.getItem('theme') || 'light',
    themes
  }),

  getters: {
    getCurrentTheme: (state) => state.currentTheme,
    getThemeConfig: (state) => state.themes[state.currentTheme] || state.themes.light,
    getAllThemes: (state) => Object.entries(state.themes).map(([id, theme]) => ({
      id,
      name: theme.name,
      primaryColor: theme.primaryColor,
      backgroundColor: theme.backgroundColor,
      surfaceColor: theme.surfaceColor
    }))
  },

  actions: {
    setTheme(themeName) {
      if (!this.themes[themeName]) return;
      this.currentTheme = themeName;
      localStorage.setItem('theme', themeName);
      this.applyTheme();
    },

    applyTheme() {
      const theme = this.themes[this.currentTheme] || this.themes.light;
      const root = document.documentElement;
      const variables = {
        '--canvas': theme.backgroundColor,
        '--paper': theme.surfaceColor,
        '--ink': theme.textColor,
        '--ink-soft': theme.textSoftColor,
        '--muted': theme.mutedColor,
        '--accent': theme.primaryColor,
        '--accent-soft': theme.primarySoftColor,
        '--blue': theme.secondaryColor,
        '--line': theme.lineColor,
        '--background-color': theme.backgroundColor,
        '--text-color': theme.textColor,
        '--text-color-light': theme.textSoftColor,
        '--text-color-lighter': theme.mutedColor,
        '--primary-color': theme.primaryColor,
        '--secondary-color': theme.secondaryColor,
        '--van-primary-color': theme.primaryColor,
        '--van-blue': theme.primaryColor,
        '--van-background': theme.backgroundColor,
        '--van-background-2': theme.surfaceColor,
        '--van-text-color': theme.textColor,
        '--van-text-color-2': theme.textSoftColor,
        '--van-border-color': theme.lineColor,
        '--van-nav-bar-background': theme.surfaceColor,
        '--van-tabs-bottom-bar-color': theme.primaryColor
      };

      Object.entries(variables).forEach(([name, value]) => root.style.setProperty(name, value));
      root.dataset.theme = this.currentTheme;
      root.style.colorScheme = theme.colorScheme;
    },

    initTheme() {
      if (!this.themes[this.currentTheme]) this.currentTheme = 'light';
      this.applyTheme();
    }
  }
});
