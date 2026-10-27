<template>
  <div class="news-item" @click="goToDetail">
    <div class="news-content">
      <h3 class="news-title">{{ news.title }}</h3>
      <p class="news-desc">{{ news.description }}</p>
      <div class="news-info">
        <span class="source">{{ news.author || '新闻资讯' }}</span>
        <span>{{ news.publishTime }}</span>
        <span class="views">{{ news.views }} 阅读</span>
      </div>
    </div>
    <div class="news-image">
      <img :src="news.image" :alt="news.title">
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  news: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToDetail = () => {
  router.push(`/news/detail/${props.news.id}`)
}
</script>

<style scoped>
.news-item {
  display: flex;
  gap: 14px;
  margin: 12px 14px;
  padding: 17px;
  border: 1px solid rgba(227, 232, 239, 0.9);
  border-radius: var(--radius-md);
  background: var(--paper);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.news-item:active {
  transform: scale(0.99);
  box-shadow: none;
}

.news-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.news-title {
  margin: 0 0 9px;
  color: var(--ink);
  font-family: "Songti SC", "STSong", serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.38;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-desc {
  margin: 0 0 12px;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.55;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  color: var(--muted);
  font-size: 11px;
}

.news-info span {
  white-space: nowrap;
}

.news-info span + span::before {
  content: "·";
  margin-right: 7px;
  color: #c5ccd6;
}

.news-info .source {
  color: var(--accent);
  font-weight: 700;
}

.news-info .views {
  color: var(--ink-soft);
}

.news-image {
  width: 116px;
  height: 92px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: #e9edf2;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.news-item:active .news-image img {
  transform: scale(1.03);
}

@media (max-width: 420px) {
  .news-item {
    gap: 12px;
    margin: 10px 12px;
    padding: 14px;
  }

  .news-title {
    font-size: 16px;
  }

  .news-desc {
    display: none;
  }

  .news-image {
    width: 104px;
    height: 78px;
  }
}
</style>
