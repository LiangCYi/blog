<template>
  <div class="home-view">
    <section class="hero anime-wallpaper">
    </section>
    <div class="content-container">
      <BlogList />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BlogList from '../components/BlogList.vue';

// 其他相关功能可以在这里添加
</script>

<style scoped>
.home-view {
  padding: 0;
  margin: 0;
  width: 100%;
}

/* 内容容器 */
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.upload-section {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  margin: 3rem auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
}

.upload-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.upload-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: var(--primary-dark);
}

.hero {
  text-align: center;
  margin: 0;
  padding: 0;
  border-radius: 0;
  overflow: hidden;
  position: relative;
  height: 400px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.anime-wallpaper {
  background-image: url('../assets/images/bj2.svg');
  background-size: cover;
  background-position: center;
  width: 100%;
}

.wallpaper-content {
  position: relative;
  z-index: 2;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  backdrop-filter: blur(5px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-container {
    padding: 10px;
  }
}

.wallpaper-title {
  font-size: 3rem;
  color: white;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  margin: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 添加渐变遮罩层 */
.anime-wallpaper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%);
  z-index: 1;
}
</style>