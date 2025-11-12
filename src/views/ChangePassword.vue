<template>
  <div class="change-password-container">
    <div class="change-password-content">
      <div class="change-password-card">
        <h2>重置密码</h2>
        <form @submit.prevent="handleResetPassword" class="password-form">
          <div class="form-group">
            <label for="email">邮箱</label>
            <input 
              id="email" 
              type="email" 
              v-model="passwordForm.email" 
              placeholder="请输入注册邮箱"
              required
              :disabled="loading"
            />
            <p v-if="emailError" class="error-message">{{ emailError }}</p>
          </div>
          <div class="form-group">
            <label for="newPassword">新密码</label>
            <input 
              id="newPassword" 
              type="password" 
              v-model="passwordForm.newPassword" 
              placeholder="请输入新密码（至少6位）"
              required
              minlength="6"
              :disabled="loading"
            />
            <p v-if="passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 6" class="error-message">
              密码长度至少为6位
            </p>
          </div>
          <div class="form-group">
            <label for="confirmPassword">确认新密码</label>
            <input 
              id="confirmPassword" 
              type="password" 
              v-model="passwordForm.confirmPassword" 
              placeholder="请再次输入新密码"
              required
              :disabled="loading"
            />
            <p v-if="passwordForm.confirmPassword.length > 0 && passwordForm.newPassword !== passwordForm.confirmPassword" class="error-message">
              两次输入的密码不一致
            </p>
          </div>
          <div class="form-group">
            <label for="verificationCode">验证码</label>
            <div class="verification-code-wrapper">
              <input 
                id="verificationCode" 
                type="text" 
                v-model="passwordForm.verificationCode" 
                placeholder="请输入验证码"
                required
                :disabled="loading"
                class="small-input"
              />
              <button 
                type="button" 
                class="send-code-btn" 
                @click="sendVerificationCode" 
                :disabled="countdown > 0 || loading"
              >
                {{ countdown > 0 ? `${countdown}秒后重新发送` : '发送验证码' }}
              </button>
            </div>
            <p v-if="codeError" class="error-message">{{ codeError }}</p>
          </div>
          <div class="form-actions">
            <router-link to="/login" class="btn-secondary" :disabled="loading">返回登录</router-link>
            <button type="submit" class="btn-primary" :disabled="!isFormValid || loading">
              {{ loading ? '重置中...' : '重置密码' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { post } from '../utils/api';

const router = useRouter();

// 重置密码表单
const passwordForm = ref({
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
});

// 状态管理
const loading = ref(false);
const countdown = ref(0);
const emailError = ref('');
const codeError = ref('');
let countdownTimer = null;

// 邮箱验证
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 表单验证
const isFormValid = computed(() => {
  // 清除之前的错误信息
  emailError.value = '';
  codeError.value = '';
  
  // 验证邮箱格式
  if (!isValidEmail(passwordForm.value.email)) {
    emailError.value = '请输入有效的邮箱地址';
    return false;
  }
  
  // 验证验证码
  if (!passwordForm.value.verificationCode || passwordForm.value.verificationCode.length < 4) {
    codeError.value = '请输入有效的验证码';
    return false;
  }
  
  // 验证密码
  return passwordForm.value.newPassword.length >= 6 && 
         passwordForm.value.newPassword === passwordForm.value.confirmPassword;
});

// 发送验证码
const sendVerificationCode = async () => {
  // 验证邮箱格式
  if (!isValidEmail(passwordForm.value.email)) {
    emailError.value = '请输入有效的邮箱地址';
    return;
  }
  
  loading.value = true;
  try {
    const response = await post('/api/users/send-verification-code', {
      email: passwordForm.value.email
    });
    
    alert('验证码已发送至您的邮箱，请查收');
    
    // 开始倒计时
    startCountdown();
  } catch (error) {
    console.error('发送验证码失败:', error);
    alert('发送验证码失败: ' + (error.response?.data?.message || '请稍后重试'));
  } finally {
    loading.value = false;
  }
};

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60;
  
  // 清除之前的定时器
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  
  // 设置新的定时器
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
};

// 重置密码
const handleResetPassword = async () => {
  if (!isFormValid.value) {
    alert('请检查表单信息是否正确');
    return;
  }
  
  loading.value = true;
  try {
    const response = await post('/api/users/reset-password', {
      email: passwordForm.value.email,
      verificationCode: passwordForm.value.verificationCode,
      newPassword: passwordForm.value.newPassword
    });
    
    alert('密码重置成功！请使用新密码登录');
    router.push('/login');
  } catch (error) {
    console.error('重置密码失败:', error);
    alert('重置密码失败: ' + (error.response?.data?.message || '请稍后重试'));
    
    // 如果是验证码错误，显示错误信息
    if (error.response?.data?.message?.includes('验证码')) {
      codeError.value = error.response.data.message;
    }
  } finally {
    loading.value = false;
  }
};

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});

// 页面加载时执行
onMounted(() => {
  // 不再自动清除已登录状态，允许用户在登录状态下修改密码
  // 密码修改成功后才会在handleResetPassword中跳转登录
});
</script>

<style scoped>
/* 页面容器 */
.change-password-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 0;
}

/* 背景图片 */
.change-password-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  filter: brightness(0.7);
  z-index: -1;
}

/* 用户下拉菜单 */
.user-dropdown-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.user-dropdown {
  position: relative;
}

.dropdown-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.dropdown-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dropdown-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
}

.dropdown-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  margin-top: 4px;
  min-width: 150px;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 20px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dropdown-item.active {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.logout-item {
  color: #f56c6c;
}

/* 内容容器 */
.change-password-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 2rem;
  position: relative;
  z-index: 1;
}

/* 修改密码卡片 */
.change-password-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  width: 100%;
  max-width: 500px;
}

.change-password-card h2 {
  margin-top: 0;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.8rem;
  text-align: center;
}

/* 表单样式 */
.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
    box-sizing: border-box;
  }
  
  .form-group input.small-input {
    width: 150px;
    flex: none;
  }

/* 验证码输入框和发送按钮容器 */
.verification-code-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.form-group input:focus {
  outline: none;
  border-color: #409eff;
}

.form-group input:disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

.error-message {
  color: #f56c6c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary {
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #66b1ff;
}

.btn-primary:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-block;
  text-align: center;
  background-color: #f0f2f5;
  color: #606266;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e6e8eb;
  color: #303133;
}

.btn-secondary:disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

/* 发送验证码按钮 */
.send-code-btn {
  padding: 0.75rem 1rem;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
  min-width: 120px;
}

.send-code-btn:hover:not(:disabled) {
  background-color: #66b1ff;
}

.send-code-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .change-password-content {
    padding: 1rem;
  }
  
  .change-password-card {
    padding: 1.5rem;
    border-radius: 12px;
  }
  
  .change-password-card h2 {
    font-size: 1.5rem;
  }
  
  .verification-code-wrapper {
    flex-direction: column;
  }
  
  .verification-code-wrapper input {
    width: 100%;
  }
  
  .send-code-btn {
    width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button,
  .form-actions .btn-secondary {
    width: 100%;
  }
}
</style>