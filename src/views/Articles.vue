<template>
  <div class="articles-view">
    <div class="content-container">
      <h1 class="page-title">文章列表</h1>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchArticles" class="retry-button">重试</button>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="articles.length === 0" class="empty-state">
        <p>暂无文章</p>
      </div>
      
      <!-- 文章列表 -->
      <div v-else class="articles-grid">
        <div v-for="article in articles" :key="article.id" class="article-card">
          <h3 class="article-title" @click="viewArticle(article.id)">{{ article.title }}</h3>
          <div class="article-meta">
            <span class="author">作者</span>
            <span class="publish-date">{{ formatDate(article.updateTime) }}</span>
            <span v-if="article.category" class="category">{{ article.category }}</span>
          </div>
          <div class="article-excerpt">{{ getExcerpt(article.content) }}</div>
          
          <div v-if="article.tagList && article.tagList.length > 0" class="article-tags">
            <span v-for="tag in article.tagList" :key="tag" class="tag">
              #{{ tag }}
            </span>
          </div>
          
          <div class="article-footer">
            <button @click="viewArticle(article.id)" class="read-more-btn">阅读全文</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页组件 -->
    <div v-if="totalArticles > 0" class="pagination">
      <button 
        @click="fetchArticles(0)" 
        :disabled="currentPage === 0"
        class="pagination-btn"
      >
        首页
      </button>
      
      <button 
        @click="fetchArticles(currentPage - 1)" 
        :disabled="currentPage === 0"
        class="pagination-btn"
      >
        上一页
      </button>
      
      <!-- 页码显示 -->
      <div class="pagination-numbers">
        <button
          v-for="page in displayedPages"
          :key="page"
          @click="fetchArticles(page - 1)"
          :class="['pagination-number-btn', { active: page - 1 === currentPage }]"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        @click="fetchArticles(currentPage + 1)" 
        :disabled="currentPage >= totalPages - 1"
        class="pagination-btn"
      >
        下一页
      </button>
      
      <button 
        @click="fetchArticles(totalPages - 1)" 
        :disabled="currentPage === totalPages - 1"
        class="pagination-btn"
      >
        末页
      </button>
      
      <div class="pagination-info">
        共 {{ totalArticles }} 篇文章
      </div>
      
      <!-- 页码跳转功能 -->
      <div class="pagination-jump">
        <span>跳转到</span>
        <input 
          v-model.number="jumpToPage" 
          type="number" 
          min="1" 
          :max="Math.max(1, totalPages)"
          class="jump-input"
          @keyup.enter="handleJumpToPage"
          placeholder="页码"
        />
        <button @click="handleJumpToPage" class="jump-btn">跳转</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { articleApi } from '../utils/api.js';
import { getToken } from '../utils/tokenHandler.js';

const router = useRouter();
const articles = ref([]);
const loading = ref(false);
const error = ref(null);

// 分页相关状态
const currentPage = ref(0);
const pageSize = ref(6);
const totalArticles = ref(0);
const totalPages = computed(() => Math.ceil(totalArticles.value / pageSize.value));

// 页码跳转相关
const jumpToPage = ref('');

// 处理页码跳转
const handleJumpToPage = () => {
  if (jumpToPage.value && !isNaN(jumpToPage.value)) {
    const page = parseInt(jumpToPage.value, 10);
    if (page >= 1 && page <= totalPages.value) {
      fetchArticles(page - 1);
    } else {
      alert(`请输入1-${totalPages.value}之间的页码`);
    }
  }
  jumpToPage.value = '';
};

// 计算显示的页码范围（最多显示5个页码）
const displayedPages = computed(() => {
  const pages = [];
  const maxDisplayPages = 5;
  const total = Math.max(1, totalPages.value);
  
  if (total <= maxDisplayPages) {
    // 如果总页数不超过最大显示页数，则显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // 否则显示当前页附近的页码
    let start = Math.max(1, currentPage.value - 1);
    let end = Math.min(total, start + maxDisplayPages - 1);
    
    // 调整起始页码，确保显示足够的页码
    if (end - start + 1 < maxDisplayPages) {
      start = Math.max(1, end - maxDisplayPages + 1);
    }
    
    // 添加页码
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  
  return pages;
});

// 模拟文章数据，确保始终能显示文章
const mockArticles = [
  {
    id: 1,
    title: 'Java基础入门教程',
    content: 'Java是一种广泛使用的计算机编程语言，拥有"一次编写，到处运行"的跨平台特性。本教程将带你从零开始学习Java编程基础...',
    category: 'Java',
    tagList: ['Java', '编程语言', '基础教程'],
    updateTime: '2024-01-15 10:30:00',
    views: 1234
  },
  {
    id: 2,
    title: 'Vue.js 3 核心概念详解',
    content: 'Vue.js是一套用于构建用户界面的渐进式JavaScript框架。Vue 3带来了许多激动人心的新特性，包括Composition API、Teleport等...',
    category: '前端',
    tagList: ['Vue.js', 'JavaScript', '前端框架'],
    updateTime: '2024-01-12 14:45:00',
    views: 987
  },
  {
    id: 3,
    title: 'Spring Boot 项目实战',
    content: 'Spring Boot是由Pivotal团队提供的全新框架，其设计目的是用来简化新Spring应用的初始搭建以及开发过程...',
    category: '后端',
    tagList: ['Spring Boot', 'Java', '后端开发'],
    updateTime: '2024-01-10 09:20:00',
    views: 756
  },
  {
    id: 4,
    title: 'Python数据分析入门',
    content: 'Python在数据分析领域有着广泛的应用。本教程将介绍如何使用Python的pandas、numpy等库进行数据处理和分析...',
    category: '数据分析',
    tagList: ['Python', '数据分析', 'Pandas'],
    updateTime: '2024-01-08 16:15:00',
    views: 543
  },
  {
    id: 5,
    title: 'Git版本控制入门教程',
    content: 'Git是一个开源的分布式版本控制系统，可以有效、高速地处理从很小到非常大的项目版本管理...',
    category: '开发工具',
    tagList: ['Git', '版本控制', '开发工具'],
    updateTime: '2024-01-05 11:30:00',
    views: 432
  },
  {
    id: 6,
    title: 'React Hooks 最佳实践',
    content: 'React Hooks是React 16.8版本引入的新特性，它可以让你在不编写class的情况下使用state以及其他的React特性...',
    category: '前端',
    tagList: ['React', 'JavaScript', 'Hooks'],
    updateTime: '2024-01-03 15:40:00',
    views: 321
  },
  {
    id: 7,
    title: 'Docker容器化部署实战',
    content: 'Docker是一个开源的应用容器引擎，让开发者可以打包他们的应用以及依赖包到一个可移植的容器中，然后发布到任何流行的Linux机器上...',
    category: '运维',
    tagList: ['Docker', '容器化', '运维'],
    updateTime: '2023-12-28 13:20:00',
    views: 289
  },
  {
    id: 8,
    title: 'TypeScript入门到精通',
    content: 'TypeScript是JavaScript的超集，添加了可选的静态类型和基于类的面向对象编程。本教程将带你从入门到精通TypeScript...',
    category: '前端',
    tagList: ['TypeScript', 'JavaScript', '前端开发'],
    updateTime: '2023-12-25 10:15:00',
    views: 456
  },
  {
    id: 9,
    title: '微服务架构设计原则',
    content: '微服务架构是一种架构风格，它将一个应用程序构建为一系列松耦合的服务。本文将探讨微服务架构的设计原则和最佳实践...',
    category: '架构',
    tagList: ['微服务', '架构', '分布式系统'],
    updateTime: '2023-12-20 09:40:00',
    views: 389
  },
  {
    id: 10,
    title: 'Redis高性能缓存实战',
    content: 'Redis是一个开源的内存数据结构存储，可用作数据库、缓存和消息代理。本文将介绍如何使用Redis实现高性能缓存...',
    category: '数据库',
    tagList: ['Redis', '缓存', '性能优化'],
    updateTime: '2023-12-15 14:25:00',
    views: 678
  }
];

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// 获取文章摘要
const getExcerpt = (content) => {
  if (!content) return '';
  // 移除HTML标签并截取前100个字符
  const plainText = content.replace(/<[^>]*>/g, '').trim();
  return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
};

// 获取文章列表（支持分页）
const fetchArticles = async (page = 0) => {
  currentPage.value = page;
  loading.value = true;
  error.value = null;
  
  try {
    // 尝试从API获取文章
    const params = {
      page: page,
      size: pageSize.value,
      status: 1 // 只获取已发布的文章
    };
    
    // 直接使用公开接口GET /api/public/articles，不考虑登录状态
    console.log('使用公开文章接口:', '/api/public/articles');
    let response = await articleApi.getPublicArticles(params);
    
    if (response.data && response.data.success) {
      articles.value = response.data.data || [];
      // 如果API返回了总数，则更新totalArticles
      totalArticles.value = response.data.total || articles.value.length;
      console.log('API返回文章数:', articles.value.length, '总文章数:', totalArticles.value);
    } else {
      // API调用失败，使用模拟数据
      console.warn('获取文章失败，使用模拟数据');
      // 基于pageSize进行正常分页，确保能显示所有文章
      const startIndex = page * pageSize.value;
      const endIndex = startIndex + pageSize.value;
      articles.value = mockArticles.slice(startIndex, endIndex);
      totalArticles.value = mockArticles.length;
    }
  } catch (err) {
    // 发生错误，使用模拟数据
    console.error('获取文章失败:', err);
    // 显示友好的错误提示，但不阻止用户继续浏览
    error.value = '网络连接暂时不可用，正在显示本地文章';
    // 基于pageSize进行正常分页，确保能显示所有文章
    const startIndex = page * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    articles.value = mockArticles.slice(startIndex, endIndex);
    totalArticles.value = mockArticles.length;
  } finally {
    loading.value = false;
  }
};

// 查看文章详情
const viewArticle = (id) => {
  // 先滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'auto' });
  // 跳转到文章详情页
  router.push(`/article/${id}`);
};

// 组件挂载时获取文章列表
onMounted(() => {
  fetchArticles();
});
</script>

<style scoped>
.articles-view {
  padding: 2rem 0;
  min-height: 100vh;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 2rem;
  font-weight: 700;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  text-align: center;
  padding: 3rem 0;
  color: #ef4444;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: var(--primary-dark);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* 文章列表网格布局 */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.article-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.article-title {
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  cursor: pointer;
  transition: color 0.3s;
}

.article-title:hover {
  color: var(--primary-color);
}

.article-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.article-excerpt {
  margin-bottom: 1rem;
  color: var(--text-primary);
  line-height: 1.6;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  background-color: #f1f5f9;
  color: var(--primary-color);
  border-radius: 12px;
  font-size: 0.8rem;
}

.article-footer {
  text-align: right;
}

.read-more-btn {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.read-more-btn:hover {
  background-color: var(--primary-dark);
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 40px;
  padding-bottom: 40px;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.pagination-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.pagination-numbers {
  display: flex;
  gap: 5px;
}

.pagination-number-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.pagination-number-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.pagination-number-btn.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.pagination-info {
  color: #666;
  font-size: 14px;
  margin-left: 10px;
}

/* 页码跳转样式 */
.pagination-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 15px;
}

.jump-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.jump-btn {
  padding: 6px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.jump-btn:hover {
  background-color: #218838;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .article-card {
    padding: 1.25rem;
  }
  
  .pagination {
    gap: 5px;
  }
  
  .pagination-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .pagination-number-btn {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
  
  .pagination-info {
    font-size: 12px;
    margin-left: 0;
    margin-top: 10px;
    width: 100%;
    text-align: center;
  }
  
  .pagination-jump {
    margin-left: 0;
    margin-top: 10px;
    width: 100%;
    justify-content: center;
    gap: 5px;
  }
  
  .jump-input {
    width: 50px;
    font-size: 12px;
    padding: 4px 6px;
  }
  
  .jump-btn {
    font-size: 12px;
    padding: 4px 10px;
  }
}
</style>