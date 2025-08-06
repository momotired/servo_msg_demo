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
  content: '',
  is_private: false
})
const loading = ref(false)
const error = ref('')

// API 基础URL（在Docker环境中通过nginx代理访问后端）
const API_BASE = '/api'

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
        content: newMessage.value.content.trim(),
        is_visible: !newMessage.value.is_private
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
    <div class="background-blur"></div>
    
    <header class="header">
      <h1>Welcome!</h1>
      <p>💬 ZYPの留言箱 💬</p>
    </header>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <!-- 发送留言区域 -->
    <div class="send-section">
      <h2>✍️ 发表留言</h2>
      <div class="form-group">
        <input 
          v-model="newMessage.user" 
          type="text" 
          placeholder="昵称"
          :disabled="loading"
          class="input-field"
        />
      </div>
      
      <div class="form-group">
        <textarea 
          v-model="newMessage.content" 
          placeholder="分享你的想法..."
          rows="3"
          :disabled="loading"
          class="textarea-field"
        ></textarea>
      </div>
      
      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="newMessage.is_private"
            :disabled="loading"
          />
          <span class="checkbox-text">设为不公开，仅开发者可见</span>
        </label>
        <small class="help-text">勾选后，此留言将不会在公开列表中显示</small>
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
  max-width: 100%;
  margin: 0 auto;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.background-blur {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #007AFF;
  z-index: -2;
  overflow: hidden;
}

.background-blur::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 75%,
    transparent 100%
  );
  animation: lightSweep 8s ease-in-out infinite;
  z-index: -1;
}

@keyframes lightSweep {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  50% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
  100% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
}

.header {
  text-align: center;
  margin-bottom: 24px;
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  color: white;
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 24px;
}

.header h1 {
  margin: 0 0 8px 0;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  position: relative;
  z-index: 1;
}

.header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
  position: relative;
  z-index: 1;
}

.error-message {
  background: rgba(255, 245, 245, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #e53e3e;
  padding: 16px 20px;
  border-radius: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(229, 62, 62, 0.2);
  font-size: 0.9rem;
  box-shadow: 0 4px 16px rgba(229, 62, 62, 0.1);
}

.send-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 28px;
  border-radius: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.send-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 24px;
}

.send-section h2 {
  margin: 0 0 24px 0;
  color: #2d3748;
  font-size: 1.4rem;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #2d3748;
}

.input-field:focus,
.textarea-field:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 
    0 0 0 4px rgba(102, 126, 234, 0.1),
    0 4px 16px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.textarea-field {
  resize: vertical;
  min-height: 100px;
}

.send-btn {
  width: 100%;
  background: linear-gradient(135deg, #00b894, #00a085);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  box-shadow: 
    0 4px 16px rgba(0, 184, 148, 0.3),
    0 2px 8px rgba(0, 184, 148, 0.2);
  position: relative;
  z-index: 1;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(0, 184, 148, 0.4),
    0 4px 12px rgba(0, 184, 148, 0.3);
}

.send-btn:active:not(:disabled) {
  transform: translateY(0);
}

.send-btn:disabled {
  background: rgba(203, 213, 224, 0.8);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.checkbox-group {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 12px 0;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  accent-color: #667eea;
  border-radius: 6px;
}

.checkbox-text {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.95rem;
}

.help-text {
  display: block;
  margin-top: 6px;
  color: #718096;
  font-size: 0.85rem;
  margin-left: 32px;
}

.messages-section {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
}

.messages-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  background: rgba(247, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  position: relative;
  z-index: 1;
}

.section-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 1.3rem;
  font-weight: 600;
}

.refresh-btn {
  background: rgba(102, 126, 234, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(90, 103, 216, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.refresh-btn:disabled {
  background: rgba(203, 213, 224, 0.8);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading,
.no-messages {
  text-align: center;
  padding: 48px 28px;
  color: #718096;
  font-size: 1.1rem;
  position: relative;
  z-index: 1;
}

.messages-list {
  max-height: 60vh;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.message-item {
  padding: 24px 28px;
  border-bottom: 1px solid rgba(241, 245, 249, 0.8);
  transition: all 0.3s ease;
  position: relative;
}

.message-item:hover {
  background: rgba(248, 250, 252, 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.message-item:last-child {
  border-bottom: none;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.username {
  font-weight: 600;
  color: #667eea;
  font-size: 1rem;
}

.time {
  color: #718096;
  font-size: 0.9rem;
}

.message-content {
  color: #2d3748;
  line-height: 1.7;
  font-size: 1rem;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 16px 20px;
  border-radius: 16px;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 移动端优化 */
@media (max-width: 480px) {
  .message-app {
    padding: 12px;
  }
  
  .header {
    padding: 24px 20px;
    margin-bottom: 16px;
    border-radius: 20px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .send-section {
    padding: 24px;
    margin-bottom: 16px;
    border-radius: 20px;
  }
  
  .section-header {
    padding: 20px 24px;
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .message-item {
    padding: 20px 24px;
  }
  
  .messages-list {
    max-height: 50vh;
  }
  
  .input-field,
  .textarea-field {
    padding: 14px 18px;
    border-radius: 14px;
  }
  
  .send-btn {
    padding: 14px 20px;
    border-radius: 14px;
  }
}

/* 滚动条美化 */
.messages-list::-webkit-scrollbar {
  width: 8px;
}

.messages-list::-webkit-scrollbar-track {
  background: rgba(241, 245, 249, 0.5);
  border-radius: 4px;
}

.messages-list::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 224, 0.8);
  border-radius: 4px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.messages-list::-webkit-scrollbar-thumb:hover {
  background: rgba(160, 174, 192, 0.9);
}

/* 添加一些微妙的动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.send-section,
.messages-section {
  animation: fadeInUp 0.6s ease-out;
}

.message-item {
  animation: fadeInUp 0.4s ease-out;
}
</style>
