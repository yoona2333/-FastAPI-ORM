<template>
  <div class="category">
    <van-nav-bar 
      :title="$t('common.allCategories')" 
      :left-text="$t('common.back')"
      left-arrow
      @click-left="onClickLeft"
      fixed 
    />
    
    <div class="category-container">
      <van-grid :column-num="3" :border="false">
        <van-grid-item 
          v-for="category in displayCategories" 
          :key="category.id"
          :text="getCategoryTranslation(category.name)"
          icon="newspaper-o"
          @click="goToCategoryNews(category.id)"
        />
      </van-grid>
    </div>
    
    <tab-bar />
  </div>
</template>

<script setup>
import { useNewsStore } from '../store/modules/news'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import TabBar from '../components/TabBar.vue'
import { computed } from 'vue'

const newsStore = useNewsStore()
const router = useRouter()
const { t } = useI18n()

// 计算属性：显示的分类（只显示非"更多"分类）
const displayCategories = computed(() => {
  return newsStore.categories.filter(category => category.name !== '更多');
})

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 跳转到对应分类的新闻列表
const goToCategoryNews = (categoryId) => {
  // 先切换分类
  newsStore.changeCategory(categoryId)
  
  // 使用路由参数传递分类ID
  router.push({
    path: '/home',
    query: { categoryId: categoryId }
  })
}

// 获取分类名称的翻译
const getCategoryTranslation = (categoryName) => {
  const categoryMap = {
    '头条': 'headline',
    '社会': 'society',
    '国内': 'domestic',
    '国际': 'international',
    '娱乐': 'entertainment',
    '体育': 'sports',
    '军事': 'military',
    '科技': 'technology',
    '财经': 'finance',
    '更多': 'more'
  };
  
  const key = categoryMap[categoryName];
  return key ? t(`home.categories.${key}`) : categoryName;
}
</script>

<style scoped>
.category {
  padding-top: 46px;
  padding-bottom: 88px;
  background: var(--canvas);
  min-height: 100vh;
}

.category-container {
  margin: 14px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--paper);
  box-shadow: var(--shadow-sm);
}

:deep(.van-grid-item__content) {
  margin: 5px;
  padding: 22px 0;
  border-radius: 16px;
  background: var(--canvas);
  transition: transform 0.2s ease, background 0.2s ease;
}

:deep(.van-grid-item__content:active) {
  transform: scale(0.97);
  background: var(--accent-soft);
}

:deep(.van-grid-item__icon) {
  font-size: 28px;
  color: var(--accent);
}

:deep(.van-grid-item__text) {
  margin-top: 8px;
  color: var(--ink);
  font-size: 14px;
  font-weight: 650;
}
</style>
