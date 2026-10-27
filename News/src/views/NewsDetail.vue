<template>
  <div class="news-detail">
    <van-nav-bar
      title="新闻详情"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      fixed
    />
    
    <div class="detail-content" v-if="newsStore.newsDetail.id">
      <div class="title-container">
        <h1 class="title">{{ newsStore.newsDetail.title }}</h1>
        <van-button 
          class="favorite-btn" 
          :icon="isFavorite ? 'star' : 'star-o'" 
          :class="{ 'is-favorite': isFavorite }"
          @click="toggleFavorite"
        />
      </div>
      
      <div class="info">
        <span>{{ newsStore.newsDetail.author }}</span>
        <span>{{ newsStore.newsDetail.publishTime }}</span>
        <span>{{ newsStore.newsDetail.views }} 阅读</span>
      </div>
      
      <div class="cover" v-if="newsStore.newsDetail.image">
        <img :src="newsStore.newsDetail.image" :alt="newsStore.newsDetail.title">
      </div>
      
      <div class="content">
        <p v-for="(paragraph, index) in contentParagraphs" :key="index">
          {{ paragraph }}
        </p>
      </div>

      <button class="ask-ai" type="button" @click="askAIAboutNews">
        <span class="ask-ai-mark">DS</span>
        <span><strong>让 DeepSeek 解读这篇新闻</strong><small>总结要点、解释背景，继续深入追问</small></span>
        <van-icon name="arrow" />
      </button>
      
      <div class="related-news" v-if="newsStore.newsDetail.relatedNews?.length">
        <h3>相关推荐</h3>
        <div class="related-list">
          <div 
            class="related-item" 
            v-for="item in newsStore.newsDetail.relatedNews" 
            :key="item.id"
            @click="goToRelatedNews(item.id)"
          >
            <div class="related-image">
              <img :src="item.image" :alt="item.title">
            </div>
            <div class="related-title">{{ item.title }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <van-empty v-else description="加载中..." />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNewsStore } from '../store/modules/news'
import { useHistoryStore } from '../store/modules/history'
import { useFavoriteStore } from '../store/modules/favorite'
import { useUserStore } from '../store/user'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const newsStore = useNewsStore()
const historyStore = useHistoryStore()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()

// 获取路由参数中的新闻ID
const newsId = computed(() => Number(route.params.id))

// 将内容拆分为段落
const contentParagraphs = computed(() => {
  if (!newsStore.newsDetail.content) return []
  return newsStore.newsDetail.content.split('\n\n').filter(p => p.trim())
})

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 跳转到相关新闻
const goToRelatedNews = (id) => {
  if (Number(id) !== newsId.value) {
    router.push(`/news/detail/${id}`)
  }
}

const askAIAboutNews = () => {
  if (!userStore.token) {
    showToast('请先登录后再使用 AI 解读')
    router.push('/login')
    return
  }
  router.push({ path: '/aichat', query: { newsId: newsId.value } })
}

// 判断当前新闻是否已收藏
const isFavorite = computed(() => {
  return favoriteStore.isFavorite(newsId.value)
})

// 切换收藏状态
const toggleFavorite = async () => {
  // 判断用户是否已登录
  if (!userStore.getLoginStatus) {
    // 未登录则跳转到登录页
    showToast({
      message: '请先登录后再收藏',
      position: 'bottom',
    })
    router.push('/login')
    return
  }
  
  // 已登录则调用API切换收藏状态
  const status = await favoriteStore.toggleFavorite(newsStore.newsDetail)
  
  if (status === true) {
    showToast({
      message: '已添加到收藏',
      position: 'bottom',
    })
  } else if (status === false) {
    showToast({
      message: '已取消收藏',
      position: 'bottom',
    })
  } else {
    // status为null表示操作失败
    showToast({
      message: '操作失败，请稍后重试',
      position: 'bottom',
    })
  }
}

// 加载指定新闻详情；路由参数变化时同一个组件会被复用，因此不能只依赖 onMounted。
const loadNewsDetail = async (id) => {
  await newsStore.getNewsDetail(id)
  
  // 添加到浏览历史
  if (newsStore.newsDetail.id) {
    // 先调用API记录浏览历史
    if (userStore.getLoginStatus) {
      try {
        const result = await historyStore.addHistoryApi(newsStore.newsDetail.id);
        console.log('记录浏览历史API结果:', result);
      } catch (error) {
        console.error('记录浏览历史API失败:', error);
      }
    }
    
    // 无论API是否成功，都添加到本地浏览历史
    // historyStore.addHistory(newsStore.newsDetail);
  }
  
  // 加载收藏数据
  favoriteStore.loadFavorites()
  
  // 检查文章收藏状态
  if (userStore.getLoginStatus && newsStore.newsDetail.id) {
    const result = await favoriteStore.checkFavoriteStatusApi(newsStore.newsDetail.id)
    if (result.success && !result.isLocal) {
      // 如果API请求成功且不是本地状态，更新本地收藏状态
      if (result.isFavorite && !favoriteStore.isFavorite(newsStore.newsDetail.id)) {
        favoriteStore.addFavorite(newsStore.newsDetail)
      } else if (!result.isFavorite && favoriteStore.isFavorite(newsStore.newsDetail.id)) {
        favoriteStore.removeFavorite(newsStore.newsDetail.id)
      }
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  loadNewsDetail(newsId.value)
})

watch(newsId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadNewsDetail(newId)
  }
})
</script>

<style scoped>
.news-detail {
  padding-top: 46px;
  padding-bottom: 36px;
  background: var(--canvas);
  min-height: 100vh;
}

.detail-content {
  margin: 14px;
  padding: clamp(20px, 5vw, 38px);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--paper);
  box-shadow: var(--shadow-sm);
}

.title-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.title {
  font-family: "Songti SC", "STSong", serif;
  font-size: clamp(25px, 6vw, 36px);
  font-weight: 750;
  line-height: 1.28;
  margin: 0;
  flex: 1;
}

.favorite-btn {
  flex-shrink: 0;
  margin-left: 10px;
  padding: 0;
  width: 36px;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--canvas);
}

.favorite-btn.is-favorite {
  border-color: #f1c2c4;
  color: var(--accent);
  background: var(--accent-soft);
}

.info {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-bottom: 22px;
  color: var(--muted);
  font-size: 12px;
}

.info span {
  margin-right: 0;
}

.cover {
  margin-bottom: 24px;
  overflow: hidden;
  border-radius: 18px;
}

.cover img {
  width: 100%;
  display: block;
}

.content {
  color: #253047;
  font-family: "Songti SC", "STSong", serif;
  font-size: 17px;
  line-height: 1.95;
}

.content p {
  margin-bottom: 20px;
  text-align: justify;
}

.ask-ai {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
  margin: 28px 0 4px;
  padding: 15px;
  border: 0;
  border-radius: 17px;
  color: #fff;
  background: #172033;
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.ask-ai-mark {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  border-radius: 12px;
  background: var(--blue);
  font-size: 12px;
  font-weight: 800;
}

.ask-ai > span:nth-child(2) { min-width: 0; flex: 1; }
.ask-ai strong, .ask-ai small { display: block; }
.ask-ai strong { margin-bottom: 3px; font-size: 14px; }
.ask-ai small { color: rgba(255, 255, 255, .6); font-size: 11px; }

.related-news {
  margin-top: 34px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.related-news h3 {
  margin: 0 0 16px;
  font-family: "Songti SC", "STSong", serif;
  font-size: 20px;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.related-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 14px;
  background: var(--canvas);
}

.related-image {
  width: 80px;
  height: 60px;
  margin-right: 12px;
  flex-shrink: 0;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.related-title {
  color: var(--ink);
  font-family: "Songti SC", "STSong", serif;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.45;
  flex: 1;
}

@media (max-width: 420px) {
  .detail-content { margin: 0; border: 0; border-radius: 0; box-shadow: none; }
}
</style>
