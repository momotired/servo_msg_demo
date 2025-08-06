<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 消息数据类型
interface Message {
  id: number
  user: string
  content: string
  time: string
}

// 响应式数据
const messages = ref<Message[]>([])
const newMessage = ref({
  user: '',
  content: ''
})
const loading = ref(false)
const error = ref('')

// API 基础URL（确保与后端端口一致）
const API_BASE = 'http://localhost:8001'

// 获取所有留言
const fetchMessages = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await fetch(`${API_BASE}/messages`)
    const data = await response.json()
    
    if (response.ok) {
      messages.value = data.messages || []
      console.log('✅ 获取留言成功:', messages.value)
    } else {
      error.value = data.error || '获取留言失败'
      console.error('❌ 获取留言失败:', data)
    }
  } catch (err) {
    error.value = '网络错误，请检查后端服务是否启动'
    console.error('❌ 网络错误:', err)
  } finally {
    loading.value = false
  }
}

// 发送留言
const sendMessage = async () => {
  if (!newMessage.value.user.trim() || !newMessage.value.content.trim()) {
    error.value = '昵称和留言内容不能为空'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: newMessage.value.user.trim(),
        content: newMessage.value.content.trim()
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ 留言发送成功:', data)
      // 清空表单
      newMessage.value.content = ''
      // 重新获取留言列表
      await fetchMessages()
    } else {
      error.value = data.error || '发送留言失败'
      console.error('❌ 发送留言失败:', data)
    }
  } catch (err) {
    error.value = '网络错误，请检查后端服务是否启动'
    console.error('❌ 网络错误:', err)
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleString('zh-CN')
}

// 页面加载时获取留言
onMounted(() => {
  fetchMessages()
})
</script>

<template>
  <div class="message-app">
    <header class="header">
      <h1>💬 留言板</h1>
      <p>分享你的想法，查看大家的留言</p>
    </header>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <!-- 发送留言区域 -->
    <div class="send-section">
      <h2>✍️ 发表留言</h2>
      <div class="form-group">
        <label for="username">昵称：</label>
        <input 
          id="username"
          v-model="newMessage.user" 
          type="text" 
          placeholder="请输入你的昵称"
          :disabled="loading"
        />
      </div>
      
      <div class="form-group">
        <label for="content">留言内容：</label>
        <textarea 
          id="content"
          v-model="newMessage.content" 
          placeholder="分享你的想法..."
          rows="4"
          :disabled="loading"
        ></textarea>
      </div>
      
      <button 
        @click="sendMessage" 
        :disabled="loading || !newMessage.user.trim() || !newMessage.content.trim()"
        class="send-btn"
      >
        {{ loading ? '发送中...' : '发送留言' }}
      </button>
    </div>

    <!-- 留言列表区域 -->
    <div class="messages-section">
      <div class="section-header">
        <h2>📋 留言列表</h2>
        <button @click="fetchMessages" :disabled="loading" class="refresh-btn">
          {{ loading ? '加载中...' : '刷新' }}
        </button>
      </div>

      <div v-if="loading && messages.length === 0" class="loading">
        🔄 正在加载留言...
      </div>

      <div v-else-if="messages.length === 0" class="no-messages">
        📝 还没有留言，快来发表第一条吧！
      </div>

      <div v-else class="messages-list">
        <div 
          v-for="message in messages" 
          :key="message.id" 
          class="message-item"
        >
          <div class="message-header">
            <span class="username">👤 {{ message.user }}</span>
            <span class="time">🕒 {{ formatTime(message.time) }}</span>
          </div>
          <div class="message-content">{{ message.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
}

.header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
}

.header p {
  margin: 0;
  opacity: 0.9;
}

.error-message {
  background: #ffe6e6;
  color: #d63031;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #d63031;
}

.send-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.send-section h2 {
  margin-top: 0;
  color: #2d3436;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #2d3436;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.send-btn {
  background: linear-gradient(135deg, #00b894, #00a085);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,184,148,0.3);
}

.send-btn:disabled {
  background: #ddd;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.messages-section {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: #f1f2f6;
  border-bottom: 1px solid #ddd;
}

.section-header h2 {
  margin: 0;
  color: #2d3436;
}

.refresh-btn {
  background: #74b9ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #0984e3;
}

.refresh-btn:disabled {
  background: #ddd;
  cursor: not-allowed;
}

.loading,
.no-messages {
  text-align: center;
  padding: 40px;
  color: #636e72;
  font-size: 18px;
}

.messages-list {
  max-height: 500px;
  overflow-y: auto;
}

.message-item {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  transition: background 0.3s;
}

.message-item:hover {
  background: #f8f9fa;
}

.message-item:last-child {
  border-bottom: none;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.username {
  font-weight: bold;
  color: #667eea;
  font-size: 16px;
}

.time {
  color: #636e72;
  font-size: 14px;
}

.message-content {
  color: #2d3436;
  line-height: 1.6;
  font-size: 16px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .message-app {
    padding: 10px;
  }
  
  .header h1 {
    font-size: 2em;
  }
  
  .section-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
