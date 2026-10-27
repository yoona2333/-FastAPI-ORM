<template>
  <div class="ai-chat-container">
    <van-nav-bar :title="activeTitle" fixed>
      <template #left>
        <button class="nav-action" type="button" @click="showHistory = true">
          <van-icon name="bars" /><span>会话</span>
        </button>
      </template>
      <template #right>
        <button class="nav-action new-chat" type="button" @click="newChat">
          <van-icon name="plus" /><span>新对话</span>
        </button>
      </template>
    </van-nav-bar>

    <van-popup v-model:show="showHistory" position="left" :style="{ width: '84%', height: '100%' }">
      <aside class="history-panel">
        <div class="history-head">
          <div><span>DEEPSEEK</span><h2>对话记录</h2></div>
          <button type="button" @click="showHistory = false"><van-icon name="cross" /></button>
        </div>
        <button class="create-button" type="button" @click="newChat">
          <van-icon name="plus" /> 开始新对话
        </button>
        <div v-if="!aiStore.conversations.length" class="history-empty">还没有历史会话</div>
        <div class="conversation-list">
          <button
            v-for="item in aiStore.conversations"
            :key="item.id"
            type="button"
            :class="['conversation-item', { active: item.id === aiStore.activeConversation?.id }]"
            @click="openConversation(item.id)"
          >
            <span class="conversation-copy">
              <strong>{{ item.title }}</strong>
              <small>{{ item.lastMessage || '尚未发送消息' }}</small>
            </span>
            <span class="delete-chat" @click.stop="removeConversation(item)"><van-icon name="delete-o" /></span>
          </button>
        </div>
      </aside>
    </van-popup>

    <div class="chat-content">
      <div ref="messagesContainer" class="messages-container">
        <section v-if="!aiStore.messages.length" class="ai-intro">
          <div class="ai-mark">DS</div>
          <div>
            <span class="status"><i></i> DeepSeek 已连接</span>
            <h1>{{ contextual ? '一起读懂这篇新闻' : '从新闻里，找到答案' }}</h1>
            <p>{{ contextual ? '我已读取文章正文，你可以直接追问。' : '支持连续追问，聊天记录会自动保存。' }}</p>
          </div>
        </section>

        <div v-if="!aiStore.messages.length" class="quick-actions">
          <button v-for="item in suggestions" :key="item" type="button" @click="askSuggestion(item)">{{ item }}</button>
        </div>

        <div
          v-for="(message, index) in aiStore.messages"
          :key="message.id || index"
          :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']"
        >
          <div class="message-avatar">{{ message.role === 'user' ? '我' : 'DS' }}</div>
          <div class="message-content">
            <div v-if="message.role === 'assistant' && !message.content" class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
            <div v-else v-html="formatMessage(message.content)"></div>
          </div>
        </div>
      </div>

      <div class="input-wrap">
        <div class="input-container">
          <van-field
            v-model="userInput"
            rows="1"
            autosize
            type="textarea"
            maxlength="4000"
            placeholder="给 DeepSeek 发消息…"
            class="chat-input"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <van-button
            v-if="aiStore.streaming"
            class="send-button stop-button"
            @click="aiStore.stopGeneration()"
          >停止</van-button>
          <van-button
            v-else
            type="primary"
            class="send-button"
            :disabled="!userInput.trim()"
            @click="sendMessage"
          >发送</van-button>
        </div>
        <p class="model-note">DeepSeek 可能会出错，请核实重要信息</p>
      </div>
    </div>

    <tab-bar />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import * as marked from 'marked'
import DOMPurify from 'dompurify'
import TabBar from '../components/TabBar.vue'
import { useAIStore } from '../store/modules/ai'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const aiStore = useAIStore()
const userStore = useUserStore()
const userInput = ref('')
const showHistory = ref(false)
const messagesContainer = ref(null)
const suggestions = ['总结这篇新闻的核心要点', '这件事可能带来什么影响？', '帮我区分事实和观点']

const activeTitle = computed(() => aiStore.activeConversation?.title || 'DeepSeek AI')
const contextual = computed(() => Boolean(aiStore.activeConversation?.newsId))

const formatMessage = (content) => DOMPurify.sanitize(marked.parse(content || ''))
const scrollToBottom = () => nextTick(() => {
  if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
})

const requireLogin = () => {
  if (userStore.token) return true
  showToast('请先登录后再使用 AI 聊天')
  router.push('/login')
  return false
}

const sendMessage = async () => {
  if (!requireLogin() || !userInput.value.trim() || aiStore.streaming) return
  const question = userInput.value.trim()
  userInput.value = ''
  try {
    await aiStore.sendMessage(question)
  } catch (error) {
    showToast(error.message || '发送失败')
  }
}

const askSuggestion = (question) => {
  userInput.value = question
  sendMessage()
}

const newChat = () => {
  aiStore.startNewConversation()
  showHistory.value = false
  router.replace({ path: '/aichat' })
}

const openConversation = async (id) => {
  try {
    await aiStore.loadConversation(id)
    showHistory.value = false
    router.replace({ path: '/aichat', query: { conversation: id } })
    scrollToBottom()
  } catch (error) {
    showToast(error.message || '会话加载失败')
  }
}

const removeConversation = async (item) => {
  try {
    await showConfirmDialog({ title: '删除会话', message: `确定删除“${item.title}”吗？` })
    await aiStore.deleteConversation(item.id)
    showToast('会话已删除')
  } catch (error) {
    if (error !== 'cancel' && error?.message !== 'cancel') showToast(error.message || '删除失败')
  }
}

watch(() => aiStore.messages, scrollToBottom, { deep: true })

onMounted(async () => {
  if (!requireLogin()) return
  try {
    await aiStore.fetchConversations()
    const newsId = Number(route.query.newsId)
    const conversationId = Number(route.query.conversation)
    if (newsId) {
      const conversation = await aiStore.createConversation(newsId)
      router.replace({ path: '/aichat', query: { conversation: conversation.id } })
    } else if (conversationId) {
      await aiStore.loadConversation(conversationId)
    }
  } catch (error) {
    showToast(error.message || 'AI 服务连接失败')
  }
  scrollToBottom()
})
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-top: 46px;
  padding-bottom: 82px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 100% 0%, rgba(36, 87, 214, 0.1), transparent 26rem),
    var(--canvas);
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 0;
  border: 0;
  color: var(--accent);
  background: transparent;
  font-size: 13px;
}

.new-chat { justify-content: flex-end; }

.history-panel {
  height: 100%;
  padding: 24px 16px;
  box-sizing: border-box;
  color: var(--ink);
  background: var(--canvas);
  overflow-y: auto;
}

.history-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.history-head span {
  color: var(--accent);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .16em;
}

.history-head h2 { margin: 3px 0 0; font-family: "Songti SC", "STSong", serif; font-size: 25px; }
.history-head button { padding: 8px; border: 0; background: transparent; color: var(--muted); font-size: 18px; }

.create-button {
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: 14px;
  color: #fff;
  background: var(--accent);
  font-weight: 700;
}

.conversation-list { display: grid; gap: 8px; margin-top: 16px; }
.history-empty { padding: 42px 0; color: var(--muted); text-align: center; font-size: 13px; }

.conversation-item {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 14px;
  color: var(--ink);
  background: transparent;
  text-align: left;
}

.conversation-item.active { border-color: var(--line); background: var(--paper); box-shadow: var(--shadow-sm); }
.conversation-copy { min-width: 0; flex: 1; }
.conversation-copy strong, .conversation-copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.conversation-copy strong { margin-bottom: 4px; font-size: 14px; }
.conversation-copy small { color: var(--muted); font-size: 11px; }
.delete-chat { flex: 0 0 auto; padding: 5px; color: var(--muted); }

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px 22px;
}

.ai-intro {
  display: flex;
  gap: 15px;
  margin-bottom: 14px;
  padding: 21px;
  border-radius: var(--radius-lg);
  color: #fff;
  background: #172033;
  box-shadow: var(--shadow-lg);
}

.ai-mark {
  display: grid;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  place-items: center;
  border-radius: 14px;
  color: #fff;
  background: var(--blue);
  font-weight: 800;
  letter-spacing: -0.04em;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 11px;
  letter-spacing: 0.06em;
}

.status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #67dc9a;
}

.ai-intro h1 {
  margin: 5px 0 5px;
  font-family: "Songti SC", "STSong", serif;
  font-size: 22px;
  line-height: 1.25;
}

.ai-intro p {
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;
}

.quick-actions {
  display: flex;
  gap: 8px;
  margin: 0 2px 18px;
  overflow-x: auto;
  scrollbar-width: none;
}

.quick-actions::-webkit-scrollbar {
  display: none;
}

.quick-actions button {
  flex: 0 0 auto;
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--ink-soft);
  background: var(--paper);
  font-size: 12px;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 88%;
  margin-bottom: 16px;
}

.user-message {
  flex-direction: row-reverse;
  margin-left: auto;
}

.ai-message {
  margin-right: auto;
}

.message-avatar {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  place-items: center;
  border-radius: 10px;
  color: #fff;
  background: var(--ink);
  font-size: 10px;
  font-weight: 800;
}

.user-message .message-avatar {
  background: var(--accent);
}

.message-content {
  padding: 11px 14px;
  border: 1px solid var(--line);
  border-radius: 5px 16px 16px 16px;
  background: var(--paper);
  box-shadow: 0 5px 16px rgba(23, 32, 51, 0.05);
  word-break: break-word;
  font-size: 14px;
  line-height: 1.65;
}

.user-message .message-content {
  border-color: var(--accent);
  border-radius: 16px 5px 16px 16px;
  background: var(--accent);
  color: white;
}

.ai-message .message-content {
  color: var(--ink);
}

.input-container {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 9px;
  margin: 0 12px;
  padding: 8px;
  border: 1px solid var(--line);
  border-radius: 19px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 30px rgba(23, 32, 51, 0.12);
  backdrop-filter: blur(16px);
}

.input-wrap { padding-bottom: 5px; }
.model-note { margin: 5px 0 0; color: var(--muted); text-align: center; font-size: 10px; }
.stop-button { border-color: var(--line); color: var(--ink); background: var(--canvas); }

.chat-input {
  flex: 1;
  padding: 0;
  background: transparent;
}

:deep(.chat-input .van-field__control) {
  max-height: 100px;
  padding: 8px 5px;
  line-height: 1.5;
}

.send-button {
  width: 64px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 13px;
  font-weight: 700;
}

/* Markdown 样式 */
.message-content pre {
  background-color: #f3f5f8;
  padding: 10px;
  border-radius: 10px;
  overflow-x: auto;
}

.message-content code {
  background-color: rgba(23, 32, 51, 0.07);
  padding: 2px 4px;
  border-radius: 3px;
}

.message-content img {
  max-width: 100%;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  padding: 5px;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  background-color: #999;
  border-radius: 50%;
  margin: 0 2px;
  display: inline-block;
  animation: bounce 1.5s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}

/* Markdown样式 */
:deep(pre) {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

:deep(code) {
  font-family: monospace;
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 4px;
}

:deep(p) {
  margin: 8px 0;
}

:deep(ul), :deep(ol) {
  padding-left: 20px;
}

:deep(a) {
  color: #1989fa;
  text-decoration: none;
}
</style>
