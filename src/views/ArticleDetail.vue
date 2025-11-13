<template>
  <div class="article-detail-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchArticleDetail" class="retry-button">重试</button>
    </div>
    <div v-else-if="article" class="article-content">
      <div class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span class="author">{{ article.authorName }}</span>
          <span class="publish-date">{{ formatDate(article.createdAt) }}</span>
          <span class="category">{{ article.categoryName }}</span>
        </div>
      </div>
      
      <div v-if="article.coverImage" class="article-cover">
        <img :src="article.coverImage" :alt="article.title" class="cover-image" />
      </div>
      
      <div class="article-body" v-html="article.content"></div>
      
      <div v-if="article.tags && article.tags.length > 0" class="article-tags">
        <span v-for="tag in article.tags" :key="tag.id" class="tag">#{{ tag.name }}</span>
      </div>
      
      <div class="article-actions">
        <button @click="navigateBack" class="back-button">返回</button>
        <div v-if="isAuthor" class="author-actions">
          <button @click="editArticle" class="edit-button">编辑文章</button>
          <button @click="deleteArticle" class="delete-button">删除文章</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { articleApi } from '../utils/api';

export default {
  name: 'ArticleDetail',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const article = ref(null);
    const loading = ref(true);
    const error = ref(null);
    
    // 获取当前登录用户ID（需要从全局状态或localStorage中获取）
    const currentUserId = computed(() => {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo).id : null;
    });
    
    // 判断当前用户是否为文章作者
    const isAuthor = computed(() => {
      return article.value && currentUserId.value === article.value.authorId;
    });
    
    // 获取文章详情
    const fetchArticleDetail = async () => {
      loading.value = true;
      error.value = null;
      try {
        const articleId = route.params.id;
        const response = await articleApi.getArticleDetail(articleId);
        
        if (response.data && response.data.success) {
          article.value = response.data.data;
        } else {
          error.value = response.data?.message || '获取文章详情失败';
        }
      } catch (err) {
        error.value = err.response?.data?.message || '网络错误，请稍后重试';
        console.error('获取文章详情失败:', err);
      } finally {
        loading.value = false;
      }
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
    
    // 返回上一页
    const navigateBack = () => {
      router.back();
    };
    
    // 编辑文章
    const editArticle = () => {
      router.push({
        name: 'PostArticle',
        params: { id: article.value.id },
        query: { edit: true }
      });
    };
    
    // 删除文章
    const deleteArticle = async () => {
      if (confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
        try {
          const response = await articleApi.deleteArticle(article.value.id);
          if (response.data && response.data.success) {
            alert('文章删除成功');
            router.push('/'); // 删除成功后返回首页
          } else {
            alert(response.data?.message || '删除失败');
          }
        } catch (err) {
          alert(err.response?.data?.message || '删除失败，请稍后重试');
          console.error('删除文章失败:', err);
        }
      }
    };
    
    onMounted(() => {
      fetchArticleDetail();
    });
    
    return {
      article,
      loading,
      error,
      isAuthor,
      fetchArticleDetail,
      formatDate,
      navigateBack,
      editArticle,
      deleteArticle
    };
  }
};
</script>

<style scoped>
.article-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
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
  text-align: center;
}

.retry-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.article-header {
  margin-bottom: 20px;
}

.article-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #2c3e50;
}

.article-meta {
  display: flex;
  gap: 20px;
  color: #7f8c8d;
  font-size: 14px;
}

.article-cover {
  margin-bottom: 30px;
}

.cover-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.article-body {
  font-size: 16px;
  line-height: 1.8;
  color: #34495e;
  margin-bottom: 30px;
}

.article-body h1, .article-body h2, .article-body h3, .article-body h4, .article-body h5, .article-body h6 {
  margin: 20px 0 15px 0;
  color: #2c3e50;
}

.article-body p {
  margin-bottom: 15px;
}

.article-body img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 20px auto;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.tag {
  background-color: #ecf0f1;
  color: #3498db;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.article-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.back-button, .edit-button, .delete-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.back-button {
  background-color: #95a5a6;
  color: white;
}

.back-button:hover {
  background-color: #7f8c8d;
}

.edit-button {
  background-color: #3498db;
  color: white;
  margin-right: 10px;
}

.edit-button:hover {
  background-color: #2980b9;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
}

.delete-button:hover {
  background-color: #c0392b;
}

.author-actions {
  display: flex;
  gap: 10px;
}
</style>