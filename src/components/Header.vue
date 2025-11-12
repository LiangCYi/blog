<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        <a href="/">Blog</a>
      </div>
      <nav class="nav">
        <ul>
          <li><router-link to="/" class="nav-link" active-class="active">首页</router-link></li>
          <li><a href="#" class="nav-link">文章</a></li>
          <li v-if="isLoggedIn"><router-link to="/post-article" class="nav-link">发表</router-link></li>
          <li><router-link :to="isLoggedIn ? '/profile' : '/login'" class="nav-link">关于我</router-link></li>
        </ul>
      </nav>
      <div class="search-box">
        <input type="text" placeholder="搜索文章..." />
        <button>🔍</button>
      </div>
      <div v-if="isLoggedIn" class="user-menu">
        <div class="user-info" @click="toggleUserMenu">
          <img 
            v-if="userInfo.avatar" 
            :src="getAvatarUrl(userInfo.avatar)" 
            alt="用户头像" 
            class="user-avatar"
            @error="handleAvatarError"
          />
          <span v-else class="avatar-placeholder">{{ (userInfo.nickname || userInfo.username || '游')?.charAt(0) }}</span>
          <span class="user-name">{{ userInfo.nickname || userInfo.username || '用户' }}</span>
          <span class="dropdown-arrow" :class="{ 'active': userMenuOpen }">▼</span>
        </div>
        <div class="dropdown-menu" v-show="userMenuOpen">
          <router-link to="/profile" class="dropdown-item" @click="closeUserMenu">个人中心</router-link>
          <router-link to="/change-password" class="dropdown-item" @click="closeUserMenu">修改密码</router-link>
          <a href="#" class="dropdown-item" @click="handleLogout">退出登录</a>
        </div>
      </div>
      <div v-else class="auth-buttons">
        <router-link to="/login" class="login-btn">登录</router-link>
        <router-link to="/register" class="register-btn">注册</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoggedIn = ref(false);
const userInfo = reactive({
  username: '',
  nickname: '',
  avatar: ''
});
const userMenuOpen = ref(false);

// 处理头像URL - 确保返回完整的可访问URL
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) {
    return '/default-avatar.png';
  }
  
  // 如果已经是完整URL，直接返回
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  // 如果是相对路径，添加基础URL
  const baseUrl = 'http://localhost:8080'; // 与Profile.vue保持一致
  return baseUrl + avatarPath;
};

// 处理头像加载失败
const handleAvatarError = (event) => {
  event.target.src = '/default-avatar.png';
};

// 检查用户登录状态
const checkLoginStatus = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    isLoggedIn.value = true;
    try {
      const userData = JSON.parse(user);
      userInfo.username = userData.username || '';
      userInfo.nickname = userData.nickname || '';
      userInfo.avatar = userData.avatar || '';
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  } else {
    isLoggedIn.value = false;
    userInfo.username = '';
    userInfo.nickname = '';
    userInfo.avatar = '';
  }
};

// 切换用户菜单
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

// 关闭用户菜单
const closeUserMenu = () => {
  userMenuOpen.value = false;
};

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 更新状态
    checkLoginStatus();
    closeUserMenu();
    
    // 跳转到首页
    router.push('/');
  }
};

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  const userMenu = document.querySelector('.user-menu');
  if (userMenu && !userMenu.contains(event.target)) {
    closeUserMenu();
  }
};

// 监听localStorage变化
const handleStorageChange = (event) => {
  if (event.key === 'token' || event.key === 'user') {
    checkLoginStatus();
  }
};

onMounted(() => {
  checkLoginStatus();
  document.addEventListener('click', handleClickOutside);
  // 添加localStorage变化监听
  window.addEventListener('storage', handleStorageChange);
  
  // 为了处理同一标签页内的变化，添加自定义事件
  window.addEventListener('userLoggedIn', checkLoginStatus);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('storage', handleStorageChange);
  window.removeEventListener('userLoggedIn', checkLoginStatus);
});
</script>

<style scoped>
/* 发表按钮特殊样式 */
.nav-link[to="/post-article"] {
  background-color: #409eff;
  color: white;
  border-radius: 4px;
  padding: 4px 12px;
  margin: 0 5px;
  transition: all 0.3s;
}

.nav-link[to="/post-article"]:hover {
  background-color: #66b1ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.nav-link[to="/post-article"].active {
  background-color: #337ecc;
}
.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  position: relative;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* 用户菜单样式 */
.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 0.9rem;
}

.user-name {
  font-size: 0.9rem;
  color: var(--text-primary);
}

.dropdown-arrow {
  font-size: 0.7rem;
  color: var(--text-secondary);
  transition: transform 0.3s;
}

.dropdown-arrow.active {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  min-width: 150px;
  z-index: 1000;
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 0.3s;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item:last-child {
  color: #ef4444;
}

.dropdown-item:last-child:hover {
  background-color: #fee2e2;
}

.login-btn {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--text-primary);
  transition: color 0.3s;
}

.login-btn:hover {
  color: var(--primary-color);
}

.register-btn {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.register-btn:hover {
  background-color: var(--primary-dark);
}

.logo a {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  text-decoration: none;
}

.nav-link {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--text-primary);
  transition: color 0.3s;
  display: inline-block;
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link.active {
  color: var(--primary-color);
  font-weight: 500;
}

.nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav ul li {
  margin-right: 0.5rem;
}

.nav a {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  padding: 0.5rem 0;
  position: relative;
}

.nav a:hover,
.nav a.active {
  color: #667eea;
}

.nav a.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #667eea;
}

.search-box {
  display: flex;
  align-items: center;
}

.search-box input {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  outline: none;
  width: 200px;
  transition: border-color 0.3s;
}

.search-box input:focus {
  border-color: #667eea;
}

.search-box button {
  padding: 0.5rem 1rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-box button:hover {
  background-color: #5a67d8;
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }
  
  .search-box input {
    width: 120px;
  }
  
  /* 移动端用户菜单样式调整 */
  .user-info {
    gap: 0.25rem;
  }
  
  .user-name {
    display: none; /* 在小屏幕上隐藏用户名 */
  }
  
  .dropdown-menu {
    right: -1rem;
    min-width: 130px;
    font-size: 0.85rem;
  }
  
  .dropdown-item {
    padding: 0.6rem 0.8rem;
  }
}
</style>