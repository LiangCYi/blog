<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">欢迎回来</h2>
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            id="username" 
            type="text" 
            v-model="formData.username" 
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            id="password" 
            type="password" 
            v-model="formData.password" 
            placeholder="请输入密码"
            required
          />
        </div>
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="formData.remember" />
            记住我
          </label>
          <router-link to="/change-password" class="forgot-password">忘记密码？</router-link>
        </div>
        <button type="submit" class="auth-button" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <div class="auth-footer">
          还没有账号？ <router-link to="/register" class="switch-link">立即注册</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { post } from '../utils/api';
import { setToken } from '../utils/tokenHandler';


const router = useRouter();
const loading = ref(false);
const formData = ref({
  username: '',
  password: '',
});

const setUserInfo = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
}

const handleLogin = async () => {
  try {
    loading.value = true

    // 调用后端登录接口
    const response = await post('/api/users/login', formData.value)
    
    // 登录成功后保存token和用户信息
    // 注意：axios返回的数据在 response.data 中
    if (response.data.success) {
      const token = response.data.data.token;
      const user = response.data.data.user;
      setToken(token)
      setUserInfo(user)
      console.log("Token保存成功：",token.substring(0, 20) + '...');
      console.log("用户信息保存成功：",user)
      
      console.log('Token保存成功:', token.substring(0, 20) + '...');
      console.log('用户信息保存成功:', user);
      
      
      // 触发自定义事件，通知Header组件更新用户状态
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
      
      // 跳转到首页
      router.push('/');
    } else {
      throw new Error('登录响应格式错误');
    }
    
  } catch (error) {
    console.error('登录失败:', error);
    console.error('错误详情:', error.response?.data);
    
    // 更详细的错误提示
    let errorMessage = '登录失败，请检查用户名和密码';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  min-height: calc(100vh - 120px); /* 减去header和footer的高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f5f7fa;
}

.auth-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
}

.auth-title {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-group input {
  padding: 0.8rem 1rem;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.auth-button {
  padding: 0.8rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.auth-button:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.switch-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.switch-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .auth-card {
    padding: 2rem;
  }
}
</style>