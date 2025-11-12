<template>
  <div class="profile-container">
    <!-- 页面背景图 -->
    <div class="profile-background"></div>
    
    <div class="profile-content">
      <!-- 左侧用户信息面板 -->
      <div class="left-panel fixed-left">
        <div class="user-profile-card">
          <div class="avatar-section">
            <div class="avatar-container">
              <img 
                :src="getAvatarUrl(userProfile.avatar)" 
                alt="用户头像" 
                class="avatar"
                @error="handleAvatarError"
                @load="handleAvatarLoad"
              />
              <label class="avatar-upload-btn">
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleAvatarChange"
                  style="display: none"
                />
                <span>更换头像</span>
              </label>
            </div>
          </div>
          
          <div class="user-info">
            <h2 class="username">{{ userProfile.nickname || userProfile.username || '用户' }}</h2>
            <p class="email">{{ userProfile.email || '未设置邮箱' }}</p>
          </div>
          
          <div class="user-bio">
            <h3>个人简介</h3>
            <p>{{ userProfile.bio || '这个人很懒，还没有填写个人简介...' }}</p>
          </div>
        </div>
      </div>
      
      <!-- 右侧功能面板 -->
      <div class="right-panel">
        <!-- 修改个人信息 -->
        <div class="profile-card">
          <h3>基本信息</h3>
          <div class="info-form">
            <div class="form-group nickname-group">
              <label for="nickname">昵称</label>
              <div class="nickname-input-wrapper">
                <input 
                  id="nickname" 
                  type="text" 
                  v-model="nicknameForm.nickname" 
                  placeholder="请输入昵称"
                  required
                  minlength="2"
                  maxlength="20"
                />
                <button type="button" class="btn-primary btn-sm" :disabled="nicknameLoading" @click="handleUpdateNickname">
                  {{ nicknameLoading ? '保存中...' : '修改昵称' }}
                </button>
              </div>
            </div>
            <div class="form-group">
              <label for="bio">个人简介</label>
              <div class="bio-wrapper">
                <textarea 
                  id="bio" 
                  v-model="nicknameForm.bio" 
                  placeholder="请输入个人简介"
                  rows="3"
                  maxlength="200"
                ></textarea>
                <button type="button" class="btn-primary bio-save-btn" :disabled="nicknameLoading" @click="handleUpdateBio">
                  {{ nicknameLoading ? '保存中...' : '保存简介信息' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 用户发表的文章内容 -->
        <div class="profile-card">
          <h3>我的文章</h3>
          <div v-if="articles.length > 0" class="article-list">
            <div v-for="article in articles" :key="article.id" class="article-item">
              <h4 class="article-title">{{ article.title }}</h4>
              <p class="article-content">{{ truncateText(article.content, 150) }}</p>
              <div class="article-meta">
                <span class="article-date">{{ formatDate(article.createdAt) }}</span>
                <span class="article-views">浏览: {{ article.views }}</span>
                <span class="article-comments">评论: {{ article.comments }}</span>
              </div>
            </div>
          </div>
          <div v-else class="no-articles">
            <p>您还没有发表任何文章，快来分享你的想法吧！</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { put, uploadFile, userApi } from '../utils/api';

const router = useRouter();

// 用户信息
const userProfile = ref({
  username: '',
  email: '',
  avatar: '',
  bio: '',
  nickname: ''
});

// 修改昵称表单
const nicknameForm = ref({
  nickname: '',
  bio: ''
});

// 用户文章列表
const articles = ref([
  // 模拟数据
  {
    id: 1,
    title: 'Vue 3 Composition API 入门指南',
    content: 'Vue 3 的 Composition API 是一种新的 API 设计模式，它提供了更好的逻辑复用和代码组织能力...',
    createdAt: '2023-06-15T10:30:00Z',
    views: 1234,
    comments: 45
  },
  {
    id: 2,
    title: '如何优化 Vue 应用性能',
    content: 'Vue 应用的性能优化是开发过程中的重要考虑因素。本文将介绍一些常见的性能优化技巧...',
    createdAt: '2023-06-10T14:20:00Z',
    views: 892,
    comments: 23
  },
  {
    id: 3,
    title: 'Vue Router 深度解析',
    content: 'Vue Router 是 Vue.js 官方的路由管理器，它和 Vue.js 核心深度集成，让构建单页面应用变得易如反掌...',
    createdAt: '2023-06-05T09:15:00Z',
    views: 1567,
    comments: 67
  }
]);

// 状态管理
const nicknameLoading = ref(false);
const logoutLoading = ref(false);
const avatarUploading = ref(false);
const avatarProgress = ref(0);

// 处理头像URL - 确保返回完整的可访问URL
const getAvatarUrl = (avatarPath) => {
  console.log('获取头像URL，原始路径:', avatarPath);
  
  if (!avatarPath) {
    console.log('头像路径为空，使用默认头像');
    return '/default-avatar.png';
  }
  
  // 如果已经是完整URL，直接返回
  if (avatarPath.startsWith('http')) {
    console.log('已经是完整URL:', avatarPath);
    return avatarPath;
  }
  
  // 如果是相对路径，添加基础URL
  const baseUrl = 'http://localhost:8080'; // 根据你的后端地址调整
  const fullUrl = baseUrl + avatarPath;
  console.log('构建完整URL:', fullUrl);
  
  return fullUrl;
};

// 处理头像加载失败
const handleAvatarError = (event) => {
  console.error('头像加载失败，原始src:', event.target.src);
  event.target.src = '/default-avatar.png';
  console.log('已替换为默认头像');
};

// 头像加载成功
const handleAvatarLoad = (event) => {
  console.log('头像图片加载成功:', event.target.src);
};

// 加载用户个人资料
const loadUserProfile = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    userProfile.value = {
      username: user.username || '',
      email: user.email || '',
      avatar: user.avatar || '',
      bio: user.bio || '',
      nickname: user.nickname || user.username || '' // 优先显示昵称
    };
    nicknameForm.value.nickname = userProfile.value.nickname || userProfile.value.username;
    nicknameForm.value.bio = userProfile.value.bio || '';
    
    console.log('用户资料加载完成:', userProfile.value);
    console.log('头像完整URL:', getAvatarUrl(userProfile.value.avatar));
  } catch (error) {
    console.error('加载用户信息失败:', error);
  }
};

// 修改用户昵称
const handleUpdateNickname = async () => {
  if (!nicknameForm.value.nickname.trim()) {
    alert('昵称不能为空');
    return;
  }
  
  nicknameLoading.value = true;
  try {
    // 直接使用 put 方法调用修改昵称接口
    const response = await put('/api/users/update-nickname', {
      nickname: nicknameForm.value.nickname.trim()
    });
    
    if (response.data.success) {
        // 立即更新本地存储的用户信息
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.nickname = nicknameForm.value.nickname.trim();
        localStorage.setItem('user', JSON.stringify(user));
        
        // 触发自定义事件，通知Header组件更新用户信息
        window.dispatchEvent(new Event('userLoggedIn'));
      
      // 立即更新页面显示的用户信息
      userProfile.value.nickname = nicknameForm.value.nickname.trim();
      
      alert('昵称修改成功！');
    } else {
      throw new Error(response.data.message || '修改失败');
    }
  } catch (error) {
    console.error('修改昵称失败:', error);
    alert('修改昵称失败: ' + (error.response?.data?.message || error.message || '请稍后重试'));
  } finally {
    nicknameLoading.value = false;
  }
};

// 修改用户个人简介
const handleUpdateBio = async () => {
  nicknameLoading.value = true;
  try {
    // 调用修改个人简介接口
    const response = await put('/api/users/update-bio', {
      bio: nicknameForm.value.bio.trim()
    });
    
    if (response.data.success) {
        // 立即更新本地存储的用户信息
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.bio = nicknameForm.value.bio.trim();
        localStorage.setItem('user', JSON.stringify(user));
        
        // 触发自定义事件，通知Header组件更新用户信息
        window.dispatchEvent(new Event('userLoggedIn'));
      
      // 立即更新页面显示的用户信息
      userProfile.value.bio = nicknameForm.value.bio.trim();
      
      alert('个人简介修改成功！');
    } else {
      throw new Error(response.data.message || '修改失败');
    }
  } catch (error) {
    console.error('修改个人简介失败:', error);
    alert('修改个人简介失败: ' + (error.response?.data?.message || error.message || '请稍后重试'));
  } finally {
    nicknameLoading.value = false;
  }
};

// 退出登录
const handleLogout = async () => {
  logoutLoading.value = true;
  try {
    // 清除本地存储
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // 跳转到登录页面
    router.push('/login');
  } catch (error) {
    console.error('退出登录失败:', error);
  } finally {
    logoutLoading.value = false;
  }
};

// 头像上传处理
const handleAvatarChange = async (event) => {
  console.log('===== 开始头像上传处理 =====');
  const file = event.target.files[0];
  if (!file) {
    console.log('未选择任何文件');
    return;
  }

  // 文件信息详细调试
  console.log('选择的文件:', file);
  console.log('文件名称:', file.name);
  console.log('文件类型:', file.type);
  console.log('文件大小:', file.size, 'bytes');
  
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    console.error('文件类型不支持:', file.type);
    alert('请上传JPG、PNG、GIF或WebP格式的图片！');
    return;
  }
  
  // 验证文件大小（限制为5MB）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    console.error('文件大小超过限制:', file.size, 'bytes');
    alert('图片大小不能超过5MB！');
    return;
  }
  
  avatarUploading.value = true;
  avatarProgress.value = 0;
  
  try {
    console.log('开始创建FormData...');
    const formData = new FormData();
    formData.append('file', file); // 注意：这里应该是 'file' 而不是 'avatar'
    
    // 验证FormData是否正确创建
    console.log('FormData创建成功，文件字段存在:', formData.has('file'));
    
    // 上传进度回调增强
    const onProgress = (progress) => {
      console.log('上传进度:', progress, '%');
      avatarProgress.value = progress;
    };
    
    // 使用新添加的userApi.uploadAvatar方法
    console.log("开始上传头像...");
    console.log('调用userApi.uploadAvatar方法');
    
    const response = await userApi.uploadAvatar(formData, onProgress);
    
    console.log('上传请求完成，收到响应:', response);
    console.log('响应状态码:', response.status);
    console.log('响应数据:', response.data);
    
    if (response.data && response.data.success) {
      console.log('上传成功，头像URL:', response.data.avatarUrl);
      
      // 更新localStorage中的用户信息
      console.log('准备更新localStorage中的用户信息...');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log("更新前用户信息：", user);
      
      user.avatar = response.data.avatarUrl;
      localStorage.setItem('user', JSON.stringify(user));
      
      const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log("更新后用户信息：", updatedUser);
      
      // 验证localStorage是否正确更新
      if (updatedUser.avatar === response.data.avatarUrl) {
        console.log('localStorage更新成功');
      } else {
        console.warn('localStorage更新后验证失败');
      }
      
      // 触发自定义事件，通知Header组件更新用户信息
      console.log('触发userLoggedIn事件');
      window.dispatchEvent(new Event('userLoggedIn'));
      
      // 更新用户资料显示 - 强制重新渲染
      console.log('更新用户资料显示中的头像');
      userProfile.value.avatar = response.data.avatarUrl;
      
      // 强制重新加载图片
      console.log('头像URL更新为:', userProfile.value.avatar);
      console.log('完整头像URL:', getAvatarUrl(userProfile.value.avatar));
      
      alert('头像上传成功！');
      
      // 添加一个小延迟后重新检查
      setTimeout(() => {
        console.log('延迟检查 - userProfile.avatar:', userProfile.value.avatar);
        console.log('延迟检查 - 完整URL:', getAvatarUrl(userProfile.value.avatar));
      }, 100);
    } else {
      console.error('服务器返回上传失败状态:', response.data);
      throw new Error(response.data?.message || '上传失败');
    }
  } catch (error) {
    // 详细错误调试信息
    console.error('===== 头像上传失败错误详情 =====');
    
    if (error.response) {
      // 服务器返回了错误响应
      console.error('HTTP错误状态:', error.response.status);
      console.error('HTTP错误数据:', error.response.data);
      console.error('HTTP错误头信息:', error.response.headers);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络请求错误:', error.request);
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
    }
    
    // 显示用户友好的错误信息
    const errorMsg = error.response?.data?.message || 
                    error.message || 
                    '上传失败，请检查网络连接或稍后重试';
    
    console.error('头像上传失败:', errorMsg);
    alert('头像上传失败: ' + errorMsg);
  } finally {
    console.log('===== 头像上传处理结束 =====');
    avatarUploading.value = false;
    avatarProgress.value = 0;
    // 清空文件输入
    event.target.value = '';
  }
};

// 文本截断
const truncateText = (text, length) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// 日期格式化
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 页面加载时执行
onMounted(() => {
  console.log('===== 页面加载开始 =====');
  loadUserProfile();
  
  // 延迟检查加载后的头像状态
  setTimeout(() => {
    console.log('页面加载完成 - userProfile:', userProfile.value);
    console.log('页面加载完成 - 头像URL:', getAvatarUrl(userProfile.value.avatar));
  }, 500);
});
</script>

<style scoped>
/* 保持你原有的所有样式不变 */
/* 页面容器 */
.profile-container {
  min-height: 100vh;
  position: relative;
  overflow: visible;
  padding: 0;
}

/* 背景图片 */
.profile-background {
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

/* 内容容器 */
.profile-content {
  display: flex;
  gap: 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 2rem auto;
  padding-left: 200px;
  padding-right: 2rem;
  position: relative;
  z-index: 1;
}

/* 左侧面板 */
.left-panel {
  flex: 0 0 350px;
  width: 350px;
}

.fixed-left {
  position: absolute;
  left: -180px;
  top: 100px;
  margin-left: 0;
  z-index: 100;
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  min-width: 0;
  margin-left: 0;
}

/* 用户资料卡片 - 透明白色矩形 */
.user-profile-card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  text-align: center;
}

/* 右侧面板卡片样式 */
.profile-card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  margin-bottom: 2rem;
}

.profile-card h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.3rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 0.5rem;
}

/* 头像部分样式 */
.avatar-section {
  margin-bottom: 1.5rem;
}

.avatar-container {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #409eff;
  margin: 0 auto 1rem;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar:hover {
  transform: scale(1.1);
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  text-align: center;
  padding: 0.5rem 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.avatar-upload-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.user-info {
  margin-bottom: 1.5rem;
}

/* 个人简介样式 */
.user-bio {
  text-align: left;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.user-bio h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #333;
  border: none;
  padding: 0;
}

.user-bio p {
  line-height: 1.6;
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

.username {
  margin: 0 0 0.5rem;
  font-size: 1.8rem;
  color: #333;
  font-weight: 600;
}

.email,
.join-date {
  margin: 0.35rem 0;
  color: #666;
  font-size: 0.95rem;
}

/* 文章列表样式 */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.article-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 1.5rem;
}

.article-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.article-title {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
}

.article-content {
  line-height: 1.6;
  color: #666;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.article-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: #909399;
}

.no-articles {
  text-align: center;
  padding: 2rem;
  color: #909399;
}

/* 表单样式 */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

/* 昵称输入框限制宽度为200px */
.nickname-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nickname-input-wrapper input {
  width: 200px;
  flex-shrink: 0;
}

/* 个人简介包装器 */
.bio-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bio-wrapper textarea {
  width: 100%;
  resize: vertical;
  min-height: 80px;
}

.bio-save-btn {
  align-self: flex-start;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #409eff;
}

.btn-primary {
  background-color: #7ab6ff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #99c5ff;
}

.btn-primary:disabled {
  background-color: #c6e1ff;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .profile-content {
    flex-direction: column;
    padding-left: 2rem;
  }
  
  .left-panel {
    flex: auto;
    max-width: 100%;
    position: static;
    margin-bottom: 2rem;
  }
  
  .fixed-left {
    position: static;
    top: auto;
    margin-left: auto;
  }
}

@media (max-width: 768px) {
  .profile-content {
    padding: 0 1rem;
    margin: 1rem auto;
  }
  
  .user-profile-card,
  .profile-card {
    padding: 1.5rem;
    border-radius: 12px;
  }
  
  .avatar-container {
    width: 120px;
    height: 120px;
  }
  
  .username {
    font-size: 1.5rem;
  }
  
  .article-meta {
    flex-wrap: wrap;
    gap: 1rem;
  }
}
</style>