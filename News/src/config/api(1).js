/**
 * API配置文件
 * 包含后端 API 基础地址
 */

// API基础URL配置
export const apiConfig = {
  // 后端API基础URL
  baseURL: 'http://127.0.0.1:8000',
}

export const aiChatConfig = {
  // AI 密钥只保存在后端，浏览器只调用本站接口
  apiEndpoint: `${apiConfig.baseURL}/api/ai/ask`,
}
