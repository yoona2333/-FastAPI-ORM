<template>
  <div class="settings-container">
    <van-nav-bar
      :title="$t('settings.title')"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="settings-list">
      <van-cell-group inset :title="$t('settings.personalization')">
        <van-cell :title="$t('settings.themeCustomization')" is-link @click="showThemePopup = true" />
        <van-cell :title="$t('settings.languageSettings')" is-link @click="showLanguagePopup = true" />
      </van-cell-group>
      
      <van-cell-group inset :title="$t('settings.account')">
        <van-cell :title="$t('settings.privacySettings')" is-link />
        <van-cell :title="$t('settings.notificationSettings')" is-link />
        <van-cell :title="$t('settings.aboutUs')" is-link />
      </van-cell-group>
    </div>
    
    <!-- 主题选择弹出层 -->
    <van-popup
      v-model:show="showThemePopup"
      position="bottom"
      round
      :style="{ height: '62%' }"
    >
      <div class="popup-title">{{ $t('settings.selectTheme') }}</div>
      <div class="theme-list">
        <div 
          v-for="theme in themeList" 
          :key="theme.id" 
          class="theme-item"
          :class="{ active: currentTheme === theme.id }"
          @click="changeTheme(theme.id)"
        >
          <div class="theme-preview" :style="{ backgroundColor: theme.backgroundColor }">
            <span class="theme-surface" :style="{ backgroundColor: theme.surfaceColor }"></span>
            <span class="theme-color" :style="{ backgroundColor: theme.primaryColor }"></span>
            <van-icon v-if="currentTheme === theme.id" name="success" class="theme-check" />
          </div>
          <div class="theme-name">{{ theme.name }}</div>
        </div>
      </div>
    </van-popup>
    
    <!-- 语言选择弹出层 -->
    <van-popup
      v-model:show="showLanguagePopup"
      position="bottom"
      round
      :style="{ height: '62%' }"
    >
      <div class="popup-title">{{ $t('settings.selectLanguage') }}</div>
      <van-radio-group v-model="currentLanguage">
        <van-cell-group inset>
          <van-cell 
            v-for="lang in languageOptions" 
            :key="lang.value" 
            :title="lang.label" 
            clickable 
            @click="currentLanguage = lang.value"
            :class="{ 'language-active': currentLanguage === lang.value }"
          >
            <template #right-icon>
              <van-radio :name="lang.value" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
      <div class="popup-footer">
        <van-button type="primary" block @click="changeLanguage">{{ $t('common.confirm') }}</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useThemeStore } from '../store/theme';
import { useI18n } from 'vue-i18n';
import { useLanguageStore } from '../store/language';

const router = useRouter();
const themeStore = useThemeStore();
const languageStore = useLanguageStore();
const { t, locale } = useI18n();

// 返回上一页
const onClickLeft = () => {
  router.back();
};

// 主题相关
const showThemePopup = ref(false);
const themeList = computed(() => themeStore.getAllThemes);
const currentTheme = computed(() => themeStore.getCurrentTheme);

// 切换主题
const changeTheme = (themeId) => {
  themeStore.setTheme(themeId);
  showToast(t('settings.themeChanged'));
  showThemePopup.value = false;
};

// 语言相关
const showLanguagePopup = ref(false);
const currentLanguage = ref(languageStore.getCurrentLanguage);
const languageOptions = [
  { label: '🇨🇳 简体中文', value: 'zh-CN' },
  { label: '🇺🇸 English', value: 'en-US' },
  { label: '🇯🇵 日本語', value: 'ja-JP' },
  { label: '🇰🇷 한국어', value: 'ko-KR' },
  { label: '🇪🇸 Español', value: 'es-ES' },
  { label: '🇫🇷 Français', value: 'fr-FR' }
];

// 切换语言
const changeLanguage = () => {
  languageStore.setLanguage(currentLanguage.value);
  locale.value = currentLanguage.value;
  document.documentElement.setAttribute('lang', currentLanguage.value);
  showLanguagePopup.value = false;
  showToast(t('settings.languageChanged'));
};
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background:
    linear-gradient(180deg, #e9eef6 0, var(--canvas) 250px);
  color: var(--text-color);
  padding-top: 46px;
  padding-bottom: 20px;
}

.settings-list {
  margin-top: 18px;
}

:deep(.settings-list .van-cell-group__title) {
  padding: 18px 20px 8px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

:deep(.settings-list .van-cell) {
  min-height: 60px;
  align-items: center;
}

:deep(.settings-list .van-cell__title) {
  color: var(--ink);
  font-weight: 650;
}

.popup-title {
  text-align: center;
  padding: 16px;
  font-size: 16px;
  color: var(--ink);
  font-family: "Songti SC", "STSong", serif;
  font-weight: 750;
  border-bottom: 1px solid var(--line);
}

.theme-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px 8px;
  padding: 16px;
}

.theme-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.theme-preview {
  position: relative;
  width: 56px;
  height: 56px;
  margin-bottom: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 17px;
  box-shadow: inset 0 0 0 1px rgba(23, 32, 51, 0.08);
}

.theme-item.active .theme-preview {
  border-color: var(--ink);
  box-shadow: 0 0 0 3px var(--paper), 0 0 0 5px var(--ink);
}

.theme-surface {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 18px;
  border-radius: 7px;
  box-shadow: 0 3px 8px rgba(23, 32, 51, 0.12);
}

.theme-color {
  position: absolute;
  bottom: 7px;
  left: 8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.theme-check {
  position: absolute;
  right: 5px;
  bottom: 5px;
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: var(--ink);
  font-size: 11px;
}

.theme-name {
  color: var(--ink-soft);
  font-size: 11px;
  white-space: nowrap;
}

.popup-footer {
  padding: 16px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

:deep(.van-popup) {
  background: var(--canvas);
}

:deep(.van-radio-group) {
  max-height: calc(62vh - 130px);
  overflow-y: auto;
}

.language-active {
  background-color: var(--accent-soft);
}
</style>
