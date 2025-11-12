<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">创建账号</h2>
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            id="username" 
            type="text" 
            v-model="formData.username" 
            placeholder="请输入用户名"
            required
            minlength="3"
            maxlength="20"
          />
        </div>
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            id="email" 
            type="email" 
            v-model="formData.email" 
            placeholder="请输入邮箱"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            id="password" 
            type="password" 
            v-model="formData.password" 
            placeholder="请设置密码（至少6位）"
            required
            minlength="6"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            id="confirmPassword" 
            type="password" 
            v-model="formData.confirmPassword" 
            placeholder="请再次输入密码"
            required
          />
        </div>
        <div class="form-group agree-terms">
          <label class="terms-label">
            <input type="checkbox" v-model="formData.agreeTerms" required />
            我已阅读并同意 <a href="#">服务条款</a> 和 <a href="#">隐私政策</a>
          </label>
        </div>
        <button type="submit" class="auth-button" :disabled="loading || !isFormValid">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <div class="auth-footer">
          已有账号？ <router-link to="/login" class="switch-link">立即登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { post } from '../utils/api';

const router = useRouter();
const loading = ref(false);
const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
});

const setToken = (token) => {
  localStorage.setItem('token', token);
};

const setUserInfo = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

const isFormValid = computed(() => {
  return formData.value.password === formData.value.confirmPassword && formData.value.agreeTerms;
});

const handleRegister = async () => {
  if (!isFormValid.value) {
    alert('密码不匹配或未同意条款');
    return;
  }
  
  loading.value = true;
  try {
    // 调用后端注册接口
    const response = await post('/api/users/register', {
      username: formData.value.username,
      email: formData.value.email,
      password: formData.value.password
    });
    
    // 注意：axios返回的数据在 response.data 中
    if (response.data.success) {
      // 注册成功后跳转到登录页
      alert(response.data.message || '注册成功！');
      router.push('/login');
    } else {
      throw new Error('注册响应格式错误');
    }
  } catch (error) {
    console.error('注册失败:', error);
    console.error('错误详情:', error.response?.data);
    
    // 更详细的错误提示
    let errorMessage = '注册失败，请稍后重试';
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

.agree-terms {
  margin-top: 0.5rem;
}

.terms-label {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-secondary);
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
}

.terms-label a {
  color: var(--primary-color);
  text-decoration: none;
}

.terms-label a:hover {
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