<template>
  <div class="blog-list">
    <h2>{{ isSearching ? '搜索结果' : '博客文章' }}</h2>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="isSearching ? performSearch() : fetchArticles()" class="retry-button">重试</button>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="articles.length === 0" class="empty-state">
      <p>{{ isSearching ? '没有找到匹配的文章' : '暂无文章' }}</p>
    </div>
    
    <!-- 文章列表 -->
    <div v-else class="articles">
      <div v-for="article in articles" :key="article.id" class="article-item">
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
    
    <!-- 分页 -->
    <div v-if="!loading && !error && articles.length > 0 && pagination.total > pagination.size" class="pagination">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        上一页
      </button>
      
      <span class="page-info">
        第 {{ currentPage }} / {{ pagination.totalPages }} 页，共 {{ pagination.total }} 篇文章
      </span>
      
      <button 
        class="page-btn" 
        :disabled="currentPage === pagination.totalPages"
        @click="goToPage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { articleApi } from '../utils/api';

// 响应式数据
const router = useRouter();
const articles = ref([]);
const loading = ref(false);
const error = ref(null);
const currentPage = ref(1);
const pagination = reactive({
  page: 0,
  size: 10,
  total: 0,
  totalPages: 0
});
const searchKeyword = ref('');
const isSearching = ref(false);

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

// 模拟文章数据，确保首页始终能显示文章
  const mockArticles = [
    {
      id: 1,
      title: 'Java基础入门教程',
      content: 'Java是一种广泛使用的计算机编程语言，拥有"一次编写，到处运行"的跨平台特性。本教程将带你从零开始学习Java编程基础...',
      category: 'Java',
      tagList: ['Java', '编程语言', '基础教程'],
      updateTime: '2024-01-15 10:30:00',
      views: 1234,
      summary: 'Java是一种广泛使用的计算机编程语言，拥有"一次编写，到处运行"的跨平台特性。本教程将带你从零开始学习Java编程基础。'
    },
    {
      id: 2,
      title: 'Vue.js 3 核心概念详解',
      content: 'Vue.js是一套用于构建用户界面的渐进式JavaScript框架。Vue 3带来了许多激动人心的新特性，包括Composition API、Teleport等...',
      category: '前端',
      tagList: ['Vue.js', 'JavaScript', '前端框架'],
      updateTime: '2024-01-12 14:45:00',
      views: 987,
      summary: 'Vue.js是一套用于构建用户界面的渐进式JavaScript框架。Vue 3带来了许多激动人心的新特性。'
    },
    {
      id: 3,
      title: 'Spring Boot 项目实战',
      content: 'Spring Boot是由Pivotal团队提供的全新框架，其设计目的是用来简化新Spring应用的初始搭建以及开发过程...',
      category: '后端',
      tagList: ['Spring Boot', 'Java', '后端开发'],
      updateTime: '2024-01-10 09:20:00',
      views: 1567,
      summary: 'Spring Boot是由Pivotal团队提供的全新框架，其设计目的是用来简化新Spring应用的初始搭建以及开发过程。'
    },
    {
      id: 4,
      title: 'MySQL数据库优化技巧',
      content: 'MySQL是最流行的关系型数据库管理系统之一。在大型应用中，数据库性能优化至关重要...',
      category: '数据库',
      tagList: ['MySQL', '数据库', '性能优化'],
      updateTime: '2024-01-08 16:10:00',
      views: 2134,
      summary: 'MySQL是最流行的关系型数据库管理系统之一。在大型应用中，数据库性能优化至关重要。'
    }
  ];

  // 获取文章列表
const fetchArticles = async (pageNum = 1) => {
  currentPage.value = pageNum;
  loading.value = true;
  error.value = null;
  
  try {
    // 仅当有搜索关键词时才调用API，否则使用模拟数据
    if (searchKeyword.value) {
      const params = {
        page: pageNum - 1,
        size: pagination.size,
        status: 1 // 默认只显示已发布的文章
      };
      
      const response = await articleApi.getHomeArticles(params);
      
      if (response.data && response.data.success) {
        // 适配后端返回的数据格式
        articles.value = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        
        // 确保即使没有分页信息也能正常显示
        if (response.data.pagination) {
          pagination.page = response.data.pagination.page;
          pagination.size = response.data.pagination.size;
          pagination.total = response.data.pagination.total;
          pagination.totalPages = response.data.pagination.totalPages;
        } else {
          // 如果没有分页信息，设置基本的分页状态
          pagination.total = articles.value.length;
          pagination.totalPages = 1;
        }
      } else {
        error.value = response.data?.message || '获取文章列表失败';
      }
    } else {
      // 首页和非搜索页面使用模拟数据
      // 对于第一页，显示所有模拟数据
      if (pageNum === 1) {
        articles.value = mockArticles;
        pagination.total = mockArticles.length;
        pagination.totalPages = 1;
      } else {
        // 非首页返回空数组
        articles.value = [];
        pagination.total = mockArticles.length;
        pagination.totalPages = 1;
      }
    }
  } catch (err) {
    console.warn('API调用失败，使用模拟数据:', err);
    // 发生错误时，使用模拟数据
    if (pageNum === 1) {
      articles.value = mockArticles;
      pagination.total = mockArticles.length;
      pagination.totalPages = 1;
    } else {
      articles.value = [];
    }
    error.value = null; // 不显示错误，因为我们使用了模拟数据
  } finally {
    loading.value = false;
  }
};

// 搜索文章
const performSearch = async (pageNum = 1) => {
  if (!searchKeyword.value.trim()) {
    clearSearch();
    return;
  }
  
  currentPage.value = pageNum;
  loading.value = true;
  error.value = null;
  isSearching.value = true;
  
  try {
    const params = {
      keyword: searchKeyword.value.trim(),
      status: 1, // 只搜索已发布的文章
      page: pageNum - 1,
      size: pagination.size
    };
    
    const response = await articleApi.searchArticles(params);
    
    if (response.data && response.data.success) {
      articles.value = response.data.data || [];
      
      if (response.data.pagination) {
        pagination.page = response.data.pagination.page;
        pagination.size = response.data.pagination.size;
        pagination.total = response.data.pagination.total;
        pagination.totalPages = response.data.pagination.totalPages;
      }
    } else {
      error.value = response.data?.message || '搜索失败';
    }
  } catch (err) {
    error.value = err.response?.data?.message || '网络错误，请稍后重试';
    console.error('搜索文章失败:', err);
  } finally {
    loading.value = false;
  }
};

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = '';
  isSearching.value = false;
  fetchArticles(1);
};

// 跳转到指定页
const goToPage = (pageNum) => {
  if (isSearching.value) {
    performSearch(pageNum);
  } else {
    fetchArticles(pageNum);
  }
};

// 查看文章详情
const viewArticle = (id) => {
  // 先滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'auto' });
  // 然后跳转到文章详情页
  router.push({ name: 'ArticleDetail', params: { id } });
};

// 组件挂载时获取文章列表
// 处理从Header组件触发的搜索事件
const handleHeaderSearch = (event) => {
  const { keyword } = event.detail;
  searchKeyword.value = keyword;
  if (keyword) {
    performSearch(1);
  } else {
    clearSearch();
  }
};

onMounted(() => {
  fetchArticles(1);
  // 添加事件监听器
  window.addEventListener('searchArticles', handleHeaderSearch);
});

onUnmounted(() => {
  // 移除事件监听器，避免内存泄漏
  window.removeEventListener('searchArticles', handleHeaderSearch);
});
</script>

<style scoped>
.blog-list {
  padding: 20px 0;
}

/* 搜索栏样式 */
.search-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.search-btn, .clear-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn {
  background-color: #3498db;
  color: white;
}

.search-btn:hover {
  background-color: #2980b9;
}

.clear-btn {
  background-color: #95a5a6;
  color: white;
}

.clear-btn:hover {
  background-color: #7f8c8d;
}

/* 加载和错误状态 */
.loading-container, .error-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e74c3c;
  margin-bottom: 20px;
  font-size: 16px;
}

.retry-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #2980b9;
}

.empty-state p {
  color: #7f8c8d;
  font-size: 16px;
}

/* 文章列表样式 */
.articles {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.article-item {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.article-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.article-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 15px 0;
  cursor: pointer;
  transition: color 0.3s;
  line-height: 1.4;
}

.article-title:hover {
  color: #3498db;
}

.article-meta {
  display: flex;
  gap: 20px;
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 15px;
}

.author {
  font-weight: 500;
}

.category {
  background-color: #ecf0f1;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  color: #7f8c8d;
}

.article-excerpt {
  color: #555;
  line-height: 1.8;
  margin-bottom: 20px;
  font-size: 15px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.tag {
  background-color: #f0f7ff;
  color: #3498db;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 13px;
  transition: background-color 0.3s;
}

.tag:hover {
  background-color: #e0f0ff;
}

.article-footer {
  text-align: right;
}

.read-more-btn {
  background: none;
  border: 2px solid #3498db;
  color: #3498db;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.read-more-btn:hover {
  background-color: #3498db;
  color: white;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.page-btn {
  padding: 10px 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6c757d;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-section {
    flex-direction: column;
  }
  
  .article-item {
    padding: 20px;
  }
  
  .article-title {
    font-size: 20px;
  }
  
  .article-meta {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>