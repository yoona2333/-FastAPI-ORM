import { defineStore } from 'pinia'
import { apiConfig } from '../../config/api'
import { useUserStore } from '../user'

const api = `${apiConfig.baseURL}/api/ai`

const errorMessage = async (response) => {
  const result = await response.json().catch(() => ({}))
  return result.message || result.detail || `请求失败 (${response.status})`
}

export const useAIStore = defineStore('ai', {
  state: () => ({
    conversations: [],
    activeConversation: null,
    messages: [],
    loading: false,
    streaming: false,
    abortController: null,
  }),

  actions: {
    headers(json = false) {
      const userStore = useUserStore()
      return {
        ...(json ? { 'Content-Type': 'application/json' } : {}),
        Authorization: userStore.token,
      }
    },

    async fetchConversations() {
      const response = await fetch(`${api}/conversations`, { headers: this.headers() })
      if (!response.ok) throw new Error(await errorMessage(response))
      const result = await response.json()
      this.conversations = result.data || []
      return this.conversations
    },

    async createConversation(newsId = null) {
      const response = await fetch(`${api}/conversations`, {
        method: 'POST',
        headers: this.headers(true),
        body: JSON.stringify(newsId ? { newsId: Number(newsId) } : {}),
      })
      if (!response.ok) throw new Error(await errorMessage(response))
      const result = await response.json()
      this.activeConversation = result.data
      this.messages = []
      await this.fetchConversations()
      return result.data
    },

    startNewConversation() {
      if (this.streaming) this.stopGeneration()
      this.activeConversation = null
      this.messages = []
    },

    async loadConversation(id) {
      if (this.streaming) this.stopGeneration()
      this.loading = true
      try {
        const response = await fetch(`${api}/conversations/${id}/messages`, { headers: this.headers() })
        if (!response.ok) throw new Error(await errorMessage(response))
        const result = await response.json()
        this.activeConversation = result.data.conversation
        this.messages = result.data.messages || []
      } finally {
        this.loading = false
      }
    },

    async deleteConversation(id) {
      const response = await fetch(`${api}/conversations/${id}`, {
        method: 'DELETE',
        headers: this.headers(),
      })
      if (!response.ok) throw new Error(await errorMessage(response))
      this.conversations = this.conversations.filter((item) => item.id !== id)
      if (this.activeConversation?.id === id) this.startNewConversation()
    },

    stopGeneration() {
      this.abortController?.abort()
      this.abortController = null
      this.streaming = false
    },

    async sendMessage(question) {
      const text = question.trim()
      if (!text || this.streaming) return
      if (!this.activeConversation) await this.createConversation()

      this.messages.push({ role: 'user', content: text })
      this.messages.push({ role: 'assistant', content: '', streaming: true })
      const assistant = this.messages[this.messages.length - 1]
      this.abortController = new AbortController()
      this.streaming = true

      try {
        const response = await fetch(`${api}/conversations/${this.activeConversation.id}/messages`, {
          method: 'POST',
          headers: this.headers(true),
          body: JSON.stringify({ question: text }),
          signal: this.abortController.signal,
        })
        if (!response.ok) throw new Error(await errorMessage(response))
        if (!response.body) throw new Error('浏览器不支持流式响应')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { value, done } = await reader.read()
          buffer += decoder.decode(value || new Uint8Array(), { stream: !done })
          const events = buffer.split('\n\n')
          buffer = events.pop() || ''

          for (const event of events) {
            const line = event.split('\n').find((item) => item.startsWith('data:'))
            if (!line) continue
            const payload = JSON.parse(line.slice(5).trim())
            if (payload.type === 'delta') assistant.content += payload.content || ''
            if (payload.type === 'error') throw new Error(payload.message || 'AI 服务异常')
          }
          if (done) break
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          if (!assistant.content) assistant.content = `请求失败：${error.message}`
          throw error
        }
      } finally {
        assistant.streaming = false
        this.abortController = null
        this.streaming = false
        await this.fetchConversations().catch(() => {})
      }
    },
  },
})
