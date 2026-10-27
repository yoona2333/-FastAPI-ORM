<template>
  <div class="home">
    <van-nav-bar fixed>
      <template #title>
        <span class="brand-title">{{ $t('home.title') }}</span>
      </template>
    </van-nav-bar>

    <section class="editorial-hero">
      <div class="hero-topline">
        <span class="pulse-label"><i></i> {{ $t('home.pulse') }}</span>
        <span class="today-label">{{ todayLabel }}</span>
      </div>
      <h1>{{ $t('home.heroTitle') }}</h1>
      <div class="hero-footer">
        <p>{{ $t('home.heroSubtitle') }}</p>
        <button type="button" class="all-categories" @click="goToCategory">
          {{ $t('home.allColumns') }} <van-icon name="arrow" />
        </button>
      </div>
    </section>
    
    <div class="category-tabs">
      <van-tabs v-model:active="activeTab" sticky :offset-top="46" swipeable animated>
        <van-tab 
          v-for="(category, index) in displayCategories" 
          :key="category.id" 
          :title="getCategoryTranslation(category.name)"
          @click="newsStore.changeCategory(category.id)"
        >
          <van-pull-refresh v-model="newsStore.refreshing" @refresh="onRefresh">
            <van-list
              v-model:loading="newsStore.loading"
              :finished="newsStore.finished"
              :finished-text="$t('home.noMore')"
              @load="onLoad"
            >
              <news-item 
                v-for="item in newsStore.newsList" 
                :key="item.id" 
                :news="item" 
              />
            </van-list>
          </van-pull-refresh>
        </van-tab>
      </van-tabs>
    </div>
    
    <tab-bar />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue'
import { useNewsStore } from '../store/modules/news'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NewsItem from '../components/NewsItem.vue'
import TabBar from '../components/TabBar.vue'

const newsStore = useNewsStore()
const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const activeTab = ref(0)
const tabsTop = ref(0)
const todayLabel = computed(() => new Intl.DateTimeFormat(locale.value, {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
}).format(new Date()))

// 监听路由变化
watch(
  () => route.query.categoryId,
  (newCategoryId) => {
    if (newCategoryId) {
      const categoryId = parseInt(newCategoryId)
      // 找到分类ID对应的索引
      const filteredCategories = newsStore.categories.filter(category => category.name !== '更多')
      const index = filteredCategories.findIndex(cat => cat.id === categoryId)
      
      if (index !== -1) {
        // 设置activeTab为对应索引
        activeTab.value = index
        // 切换分类
        newsStore.changeCategory(categoryId)
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 获取新闻分类
  newsStore.getCategories().then(() => {
    // 获取新闻列表
    newsStore.getNewsList()
  })
  
  // 初始化位置
  setTimeout(updateTabsPosition, 300)
  
  // 添加滚动事件监听
  window.addEventListener('scroll', handleScroll)
})

// 计算属性：显示的分类（只显示非"更多"分类）
const displayCategories = computed(() => {
  // 获取所有非"更多"分类
  return newsStore.categories.filter(category => category.name !== '更多');
})

// 计算属性：更多下拉菜单中显示的分类（只显示军事、科技、财经分类）
const moreCategories = computed(() => {
  return newsStore.categories.filter(category => 
    category.name === '军事' || 
    category.name === '科技' || 
    category.name === '财经'
  );
})

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
    

// 跳转到分类页面
const goToCategory = () => {
  router.push('/category')
}

// 处理标签点击事件
const handleTabClick = (index) => {
  // 如果不是点击"更多"选项，则关闭下拉菜单
  if (displayCategories.value[index].name !== '更多') {
    showDropdown.value = false
    newsStore.changeCategory(displayCategories.value[index].id)
  }
}

// 选择更多分类中的某个分类
const selectMoreCategory = (category) => {
  showDropdown.value = false
  newsStore.changeCategory(category.id)
  
  // 找到选中分类在原始分类中的索引
  const index = newsStore.categories.findIndex(cat => cat.id === category.id)
  if (index !== -1) {
    // 直接设置activeTab为对应索引
    activeTab.value = index
  }
}
// 获取分类导航栏的位置并设置滚动监听
const updateTabsPosition = () => {
  const tabsElement = document.querySelector('.van-tabs__wrap')
  if (tabsElement) {
    tabsTop.value = tabsElement.getBoundingClientRect().top
  }
}

// 滚动事件处理
const handleScroll = () => {
  updateTabsPosition()
}

onMounted(() => {
  newsStore.getNewsList()
  
  // 初始化位置
  setTimeout(updateTabsPosition, 300)
  
  // 添加滚动事件监听
  window.addEventListener('scroll', handleScroll)
})

// 组件销毁前移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 监听分类变化
watch(activeTab, (newVal) => {
  const category = displayCategories.value[newVal]
  if (category) newsStore.changeCategory(category.id)
})

// 下拉刷新
const onRefresh = () => {
  newsStore.getNewsList(true)
}

// 上拉加载更多
const onLoad = () => {
  newsStore.getNewsList()
}

// 切换分类
const changeCategory = (categoryId) => {
  // 如果点击的是"更多"选项
  if (categoryId === 10) {
    goToCategory()
    return
  }
  
  newsStore.changeCategory(categoryId)
}
</script>

<style scoped>
.home {
  padding-top: 46px;
  padding-bottom: 84px;
  background: var(--canvas);
  min-height: 100vh;
}

.brand-title {
  color: var(--ink);
  font-family: "Songti SC", "STSong", serif;
  letter-spacing: 0.12em;
}

.editorial-hero {
  position: relative;
  margin: 14px 14px 6px;
  padding: 22px 20px 20px;
  overflow: hidden;
  border-radius: var(--radius-lg);
  color: #fff;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent 46%),
    #172033;
  box-shadow: var(--shadow-lg);
}

.editorial-hero::after {
  position: absolute;
  right: -36px;
  bottom: -70px;
  width: 180px;
  height: 180px;
  border: 32px solid rgba(255, 255, 255, 0.06);
  border-radius: 50%;
  content: "";
}

.hero-topline,
.hero-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.pulse-label,
.today-label {
  font-size: 11px;
  letter-spacing: 0.08em;
  opacity: 0.82;
}

.pulse-label i {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 7px;
  border-radius: 50%;
  background: #ff6268;
  box-shadow: 0 0 0 5px rgba(255, 98, 104, 0.14);
}

.editorial-hero h1 {
  position: relative;
  z-index: 1;
  max-width: 420px;
  margin: 22px 0 20px;
  font-family: "Songti SC", "STSong", serif;
  font-size: clamp(26px, 7vw, 38px);
  font-weight: 700;
  line-height: 1.16;
  letter-spacing: 0.04em;
}

.hero-footer p {
  color: rgba(255, 255, 255, 0.66);
  font-size: 12px;
}

.all-categories {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 4px;
  padding: 8px 11px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  font-size: 12px;
}

.category-tabs {
  position: relative;
  margin-bottom: 10px;
}

:deep(.van-tabs__wrap) {
  height: 50px;
  border-bottom: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(14px);
}

:deep(.van-tabs__nav) {
  padding: 0 10px;
  background: transparent;
}

:deep(.van-tab) {
  color: var(--muted);
  font-size: 13px;
  letter-spacing: 0.03em;
}

:deep(.van-tab--active) {
  color: var(--ink);
  font-weight: 750;
}

:deep(.van-tabs__line) {
  width: 18px;
  height: 3px;
  border-radius: 999px;
  background: var(--accent);
}

:deep(.van-list__finished-text),
:deep(.van-list__loading) {
  color: var(--muted);
  font-size: 12px;
}
</style>
