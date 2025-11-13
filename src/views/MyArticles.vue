<template>
  <div class="my-articles-container">
    <h1>我的文章</h1>
    
    <div class="filter-section">
      <div class="status-filter">
        <label for="status-filter">文章状态：</label>
        <select id="status-filter" v-model="searchParams.status" @change="fetchArticles(1)">
          <option value="">全部</option>
          <option value="1">已发布</option>
          <option value="0">草稿</option>
        </select>
      </div>
      <button class="new-article-btn" @click="createNewArticle">
        <i class="icon-plus"></i> 写新文章
      </button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchArticles(currentPage)" class="retry-button">重试</button>
    </div>
    
    <div v-else>
      <div v-if="articles.length === 0" class="empty-state">
        <p>您还没有文章，快去写第一篇吧！</p>
      </div>
      
      <div v-else class="articles-list">
        <div v-for="article in articles" :key="article.id" class="article-item">
          <div class="article-header">
            <h3 class="article-title" @click="viewArticle(article.id)">{{ article.title }}</h3>
            <div class="article-actions">
              <button class="edit-btn" @click="editArticle(article.id)">编辑</button>
              <button class="delete-btn" @click="deleteArticleConfirm(article)">删除</button>
            </div>
          </div>
          
          <div class="article-meta">
            <span class="category">{{ article.categoryName || getCategoryName(article.category) }}</span>
            <span class="publish-date">{{ formatDate(article.createdAt) }}</span>
            <span class="status">{{ getStatusText(article.status) }}</span>
          </div>
          
          <div class="article-excerpt">{{ getExcerpt(article.content) }}</div>
          
          <div v-if="article.tags && article.tags.length > 0" class="article-tags">
            <span v-for="tag in article.tags" :key="typeof tag === 'object' ? tag.id : tag" class="tag">
              #{{ typeof tag === 'object' ? tag.name : tag }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 分页组件 -->
      <div v-if="pagination.total > pagination.size" class="pagination">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="fetchArticles(currentPage - 1)"
        >
          上一页
        </button>
        
        <span class="page-info">
          第 {{ currentPage }} / {{ pagination.totalPages }} 页，共 {{ pagination.total }} 篇文章
        </span>
        
        <button 
          class="page-btn" 
          :disabled="currentPage === pagination.totalPages"
          @click="fetchArticles(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { articleApi } from '../utils/api';

export default {
  name: 'MyArticles',
  setup() {
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
    
    const searchParams = reactive({
      status: '' // 1: 已发布, 0: 草稿, '': 全部
    });
    
    // 文章分类映射
    const categoryMap = {
      'tech': '技术',
      'life': '生活',
      'travel': '旅行',
      'food': '美食',
      'other': '其他'
    };
    
    // 获取分类名称
    const getCategoryName = (categoryKey) => {
      return categoryMap[categoryKey] || categoryKey || '未分类';
    };
    
    // 获取状态文本
    const getStatusText = (status) => {
      return status === 1 ? '已发布' : '草稿';
    };
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };
    
    // 获取文章摘要
    const getExcerpt = (content) => {
      if (!content) return '';
      // 移除HTML标签并截取前100个字符
      const plainText = content.replace(/<[^>]*>/g, '').trim();
      return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
    };
    
    // 获取我的文章列表
    const fetchArticles = async (pageNum = 1) => {
      currentPage.value = pageNum;
      loading.value = true;
      error.value = null;
      
      try {
        const params = {
          page: pageNum - 1, // 后端使用0-indexed
          size: pagination.size
        };
        
        // 如果有状态筛选，添加到参数中
        if (searchParams.status !== '') {
          params.status = parseInt(searchParams.status);
        }
        
        const response = await articleApi.getMyArticles(params);
        
        if (response.data && response.data.success) {
          articles.value = response.data.data || [];
          
          // 更新分页信息
          if (response.data.pagination) {
            pagination.page = response.data.pagination.page;
            pagination.size = response.data.pagination.size;
            pagination.total = response.data.pagination.total;
            pagination.totalPages = response.data.pagination.totalPages;
          }
        } else {
          error.value = response.data?.message || '获取文章列表失败';
        }
      } catch (err) {
        error.value = err.response?.data?.message || '网络错误，请稍后重试';
        console.error('获取我的文章列表失败:', err);
      } finally {
        loading.value = false;
      }
    };
    
    // 查看文章详情
    const viewArticle = (id) => {
      router.push({ name: 'ArticleDetail', params: { id } });
    };
    
    // 编辑文章
    const editArticle = (id) => {
      router.push({
        name: 'PostArticle',
        params: { id },
        query: { edit: 'true' }
      });
    };
    
    // 删除文章确认
    const deleteArticleConfirm = (article) => {
      if (confirm(`确定要删除文章《${article.title}》吗？此操作不可恢复。`)) {
        deleteArticle(article.id);
      }
    };
    
    // 删除文章
    const deleteArticle = async (id) => {
      try {
        const response = await articleApi.deleteArticle(id);
        if (response.data && response.data.success) {
          alert('文章删除成功');
          // 重新获取文章列表
          fetchArticles(currentPage.value);
        } else {
          alert(response.data?.message || '删除失败');
        }
      } catch (err) {
        alert(err.response?.data?.message || '删除失败，请稍后重试');
        console.error('删除文章失败:', err);
      }
    };
    
    // 创建新文章
    const createNewArticle = () => {
      router.push({ name: 'PostArticle' });
    };
    
    // 组件挂载时获取文章列表
    onMounted(() => {
      fetchArticles(1);
    });
    
    return {
      articles,
      loading,
      error,
      currentPage,
      pagination,
      searchParams,
      fetchArticles,
      viewArticle,
      editArticle,
      deleteArticleConfirm,
      createNewArticle,
      getCategoryName,
      getStatusText,
      formatDate,
      getExcerpt
    };
  }
};
</script>

<style scoped>
.my-articles-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.status-filter {
  display: flex;
  align-items: center;
}

.status-filter label {
  margin-right: 10px;
  font-weight: 500;
  color: #555;
}

.status-filter select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.new-article-btn {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.new-article-btn:hover {
  background-color: #66b1ff;
}

.loading-container, .error-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
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
}

.retry-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.empty-state p {
  color: #7f8c8d;
  font-size: 16px;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-item {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.article-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.article-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
  cursor: pointer;
  transition: color 0.3s;
}

.article-title:hover {
  color: #3498db;
}

.article-actions {
  display: flex;
  gap: 10px;
  margin-left: 20px;
}

.edit-btn, .delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
}

.edit-btn {
  background-color: #3498db;
  color: white;
}

.edit-btn:hover {
  background-color: #2980b9;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.article-meta {
  display: flex;
  gap: 15px;
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 10px;
}

.category {
  background-color: #ecf0f1;
  padding: 2px 8px;
  border-radius: 4px;
}

.status {
  font-weight: 500;
}

.article-excerpt {
  color: #555;
  line-height: 1.6;
  margin-bottom: 15px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background-color: #f8f9fa;
  color: #3498db;
  padding: 3px 10px;
  border-radius: 15px;
  font-size: 12px;
}

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
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
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
</style>