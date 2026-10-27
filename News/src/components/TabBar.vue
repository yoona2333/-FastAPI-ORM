<template>
  <van-tabbar v-model="active" route class="app-tabbar">
    <van-tabbar-item to="/home" icon="home-o">{{ $t('nav.home') }}</van-tabbar-item>
    <van-tabbar-item to="/aichat" icon="chat-o">{{ $t('nav.aiChat') }}</van-tabbar-item>
    <van-tabbar-item to="/my" icon="user-o">{{ $t('nav.my') }}</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)

// 根据当前路由路径设置激活的标签
const setActiveTab = () => {
  const path = route.path
  if (path.includes('/home')) {
    active.value = 0
  } else if (path.includes('/aichat')) {
    active.value = 1
  } else if (path.includes('/my')) {
    active.value = 2
  }
}

// 初始化时设置激活标签
setActiveTab()
</script>

<style>
.app-tabbar.van-tabbar {
  left: 50%;
  bottom: 10px;
  width: min(calc(100vw - 40px), 640px);
  height: 58px;
  padding: 4px 8px calc(4px + var(--safe-area-inset-bottom));
  overflow: hidden;
  border: 1px solid rgba(227, 232, 239, 0.92);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12px 34px rgba(23, 32, 51, 0.16);
  transform: translateX(-50%);
  backdrop-filter: blur(18px);
}

.app-tabbar.van-tabbar::after {
  display: none;
}

.app-tabbar .van-tabbar-item {
  position: relative;
  border-radius: 14px;
  color: var(--muted);
}

.app-tabbar .van-tabbar-item--active {
  color: var(--accent);
  background: var(--accent-soft);
}

.app-tabbar .van-tabbar-item__icon {
  margin-bottom: 3px;
  font-size: 20px;
}

.app-tabbar .van-tabbar-item__text {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.04em;
}
</style>
