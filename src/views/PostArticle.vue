<template>
  <div class="post-article-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else>
      <h1>{{ isEditMode ? '编辑文章' : '发表文章' }}</h1>
    <form @submit.prevent="handleSubmit" class="article-form">
      <div class="form-group">
        <label for="title">文章标题 *</label>
        <input 
          type="text" 
          id="title" 
          v-model="articleForm.title" 
          placeholder="请输入文章标题"
          :class="{ 'error': errors.title }"
        />
        <div v-if="errors.title" class="error-message">{{ errors.title }}</div>
      </div>
      
      <div class="form-group">
        <label for="category">文章分类 *</label>
        <select id="category" v-model="articleForm.category" :class="{ 'error': errors.category }">
          <option value="" disabled>请选择分类</option>
          <option value="技术">技术</option>
          <option value="生活">生活</option>
          <option value="旅行">旅行</option>
          <option value="美食">美食</option>
          <option value="其他">其他</option>
        </select>
        <div v-if="errors.category" class="error-message">{{ errors.category }}</div>
      </div>
      
      <div class="form-group">
        <label for="tags">文章标签</label>
        <input 
          type="text" 
          id="tags" 
          v-model="articleForm.tags" 
          placeholder="请输入标签，用逗号分隔"
        />
        <small class="form-text">例如：Vue, JavaScript, 前端开发</small>
      </div>
      

      
      <div class="form-group">
        <label for="content">文章内容 *</label>
        <textarea 
          id="content" 
          v-model="articleForm.content" 
          rows="15" 
          placeholder="请输入文章内容"
          :class="{ 'error': errors.content }"
        ></textarea>
        <div v-if="errors.content" class="error-message">{{ errors.content }}</div>
      </div>
      
      <div class="form-group">
        <label>文章封面</label>
        
        <!-- 上传方式选择 -->
        <div class="upload-method-selector">
          <label>
            <input 
              type="radio" 
              v-model="uploadMethod" 
              value="url" 
            />
            URL输入
          </label>
          <label>
            <input 
              type="radio" 
              v-model="uploadMethod" 
              value="upload" 
            />
            本地上传
          </label>
        </div>
        
        <!-- URL输入方式 -->
        <div v-if="uploadMethod === 'url'" class="upload-option">
          <input 
            type="text" 
            id="coverImage" 
            v-model="articleForm.coverImage" 
            placeholder="请输入封面图片URL"
            :class="{ 'error': errors.coverImage }"
          />
          <small class="form-text">支持jpg、png、gif格式的图片链接</small>
        </div>
        
        <!-- 文件上传方式 -->
        <div v-else class="upload-option">
          <FileUpload 
            @file-selected="handleFileSelect"
            :accept="['image/jpeg', 'image/png', 'image/gif']"
            :disabled="isUploading || isSubmitting"
          />
          
          <!-- 上传进度 -->
          <div v-if="isUploading" class="upload-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ uploadProgress }}%</span>
          </div>
        </div>
        
        <div v-if="errors.coverImage" class="error-message">{{ errors.coverImage }}</div>
        
        <!-- 图片预览 -->
        <div v-if="articleForm.coverImage" class="image-preview">
          <img :src="articleForm.coverImage" alt="封面预览" />
          <button type="button" class="remove-image" @click="removeCoverImage">移除</button>
        </div>
      </div>
      
      <div class="form-group">
        <label for="status">发布状态</label>
        <select id="status" v-model="articleForm.status">
          <option value="1">已发布</option>
          <option value="0">草稿</option>
        </select>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="handleCancel">取消</button>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : (isEditMode ? '更新文章' : '发表文章') }}
        </button>
      </div>
    </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { articleApi } from '../utils/api';
import { getToken, isTokenExpired } from '../utils/tokenHandler';
import FileUpload from '../components/FileUpload.vue';

const router = useRouter();
const route = useRoute();
const isSubmitting = ref(false);
const loading = ref(false);
// 图片上传相关状态
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadMethod = ref('url'); // 'url' 或 'upload'

// 判断是否为编辑模式
const isEditMode = computed(() => {
  return !!route.params.id && route.query.edit === 'true';
});

// 获取文章ID
const articleId = computed(() => route.params.id);

// 表单验证错误信息
const errors = reactive({
  title: '',
  category: '',
  content: '',
  coverImage: ''
});

const articleForm = reactive({
  title: '',
  category: '',
  tags: '',
  content: '',
  coverImage: '', // 保存URL或上传后的路径
  status: '0' // 默认设置为草稿状态
});

// 保存文件对象，用于上传
const fileToUpload = ref(null);

// 移除封面图片
const removeCoverImage = () => {
  articleForm.coverImage = '';
  errors.coverImage = '';
  fileToUpload.value = null;
};

// 处理文件选择
const handleFileSelect = (file) => {
  fileToUpload.value = file;
  articleForm.coverImage = URL.createObjectURL(file); // 创建临时预览URL
  errors.coverImage = '';
};

// 检查用户是否已登录
const checkLoginStatus = () => {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    console.log('用户未登录或登录已过期');
    loading.value = false;
    alert('请先登录后再发表文章');
    router.push('/login');
    return false;
  }
  return true;
};

// 组件挂载时检查登录状态
onMounted(() => {
  // 先检查登录状态
  if (!checkLoginStatus()) {
    return;
  }
  
  // 如果是编辑模式，加载文章详情
  if (isEditMode.value) {
    loadArticleDetail();
  } else {
    loading.value = false;
  }
});



// 验证图片URL格式
const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // 简单的URL验证正则
  const urlPattern = /^(https?:\/\/.*\.(jpe?g|png|gif))$/i;
  return urlPattern.test(url);
};

// 验证表单数据
const validateForm = () => {
  // 清空之前的错误信息
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  
  let isValid = true;
  
  // 验证标题
  if (!articleForm.title.trim()) {
    errors.title = '请输入文章标题';
    isValid = false;
  } else if (articleForm.title.length > 100) {
    errors.title = '标题长度不能超过100个字符';
    isValid = false;
  }
  
  // 验证分类
  if (!articleForm.category) {
    errors.category = '请选择文章分类';
    isValid = false;
  }
  

  
  // 验证内容
  if (!articleForm.content.trim()) {
    errors.content = '请输入文章内容';
    isValid = false;
  }
  
  // 验证封面图片（如果选择了URL方式且有输入）
  if (uploadMethod.value === 'url' && articleForm.coverImage && !isValidImageUrl(articleForm.coverImage)) {
    errors.coverImage = '请输入有效的图片URL（支持jpg、png、gif格式）';
    isValid = false;
  }
  
  // 如果选择了上传方式但没有选择文件
  if (uploadMethod.value === 'upload' && !fileToUpload.value && !articleForm.coverImage) {
    errors.coverImage = '请选择要上传的图片文件';
    isValid = false;
  }
  
  return isValid;
};

// 取消发布
const handleCancel = () => {
  if (confirm('确定要取消发表吗？未保存的内容将会丢失。')) {
    router.back();
  }
};

// 加载文章详情
const loadArticleDetail = async () => {
  if (!isEditMode.value) return;
  
  loading.value = true;
  try {
    const response = await articleApi.getArticleDetail(articleId.value);
    
    if (response.data && response.data.success && response.data.data) {
      const article = response.data.data;
      // 填充表单数据
      articleForm.title = article.title || '';
      articleForm.category = article.category || '';
      articleForm.tags = article.tags && Array.isArray(article.tags) 
        ? article.tags.map(tag => typeof tag === 'string' ? tag : tag.name).join(', ') 
        : '';
      articleForm.content = article.content || '';
      
      // 如果有封面图片，设置预览
      if (article.coverImage) {
        articleForm.coverImage = article.coverImage;
      }
      
      // 设置文章摘要
      if (article.summary) {
        articleForm.summary = article.summary;
      }
      
      // 设置文章状态
      if (article.status !== undefined) {
        articleForm.status = article.status.toString();
      }
    } else {
      throw new Error(response.data?.message || '获取文章详情失败');
    }
  } catch (error) {
    console.error('加载文章详情失败:', error);
    alert('加载文章详情失败: ' + (error.message || '请稍后重试'));
    router.back();
  } finally {
    loading.value = false;
  }
};



// 上传图片
const uploadCoverImage = async () => {
  if (!fileToUpload.value) return null;
  
  isUploading.value = true;
  uploadProgress.value = 0;
  
  try {
    const formData = new FormData();
    formData.append('coverImage', fileToUpload.value);
    
    console.log('开始上传封面图片:', fileToUpload.value.name);
    
    const response = await articleApi.uploadCoverImage(formData, (progress) => {
      uploadProgress.value = progress;
    });
    
    if (response.data && (response.data.success || response.data.code === 200)) {
      // 获取上传后的图片URL
      const imageUrl = response.data.data?.url || response.data.url;
      console.log('图片上传成功，URL:', imageUrl);
      return imageUrl;
    } else {
      throw new Error(response.data?.message || '图片上传失败');
    }
  } catch (error) {
    console.error('图片上传失败:', error);
    throw new Error('图片上传失败: ' + (error.message || '请稍后重试'));
  } finally {
    isUploading.value = false;
  }
};

// 提交文章
const handleSubmit = async () => {
  // 先验证表单
  if (!validateForm()) {
    // 滚动到第一个错误字段
    const firstError = document.querySelector('.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // 如果选择了上传方式且有新文件，先上传图片
    let coverImageUrl = articleForm.coverImage;
    if (uploadMethod.value === 'upload' && fileToUpload.value) {
      try {
        coverImageUrl = await uploadCoverImage();
        if (!coverImageUrl) {
          throw new Error('图片上传失败，请重试');
        }
      } catch (uploadError) {
        alert(uploadError.message);
        return;
      }
    }
    
    // 构建文章数据
    const articleData = {
      title: articleForm.title,
      category: articleForm.category,
      tags: articleForm.tags ? articleForm.tags.split(',').map(tag => tag.trim()) : [],
      content: articleForm.content,
      summary: articleForm.summary,
      coverImage: coverImageUrl,
      status: parseInt(articleForm.status)
    };
    
    console.log('准备提交的文章数据:', articleData);
    
    let response;
    if (isEditMode.value) {
      // 更新文章
      console.log('调用更新文章API，ID:', articleId.value);
      response = await articleApi.updateArticle(articleId.value, articleData);
      console.log('更新文章API响应:', response);
      
      if (response.data && response.data.success) {
        alert('文章更新成功！');
        // 跳转到文章详情页
        router.push({ name: 'ArticleDetail', params: { id: articleId.value } });
      } else {
        console.error('更新文章失败，响应数据:', response.data);
        throw new Error(response.data?.message || '文章更新失败');
      }
    } else {
        // 发表文章 - 使用登录后的POST/api/author/articles接口
        console.log('调用发表文章API (POST/api/author/articles)');
        response = await articleApi.getAuthorArticles(articleData);
        console.log('发表文章API响应:', response);
      
      // 兼容不同的响应格式
      if (response.data && (response.data.success || response.data.code === 200)) {
        alert('文章发表成功！');
        // 跳转到首页
        router.push('/');
      } else {
        console.error('发表文章失败，响应数据:', response.data);
        throw new Error(response.data?.message || response.data?.error || '文章发表失败');
      }
    }
  } catch (error) {
    console.error('API调用异常:', error);
    // 显示更详细的错误信息
    const errorMsg = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     '请稍后重试';
    alert((isEditMode.value ? '更新文章失败' : '发表文章失败') + ': ' + errorMsg);
  } finally {
    isSubmitting.value = false;
  }
};

// 添加一个手动测试API连接的方法，方便调试
const testApiConnection = async () => {
  try {
    console.log('测试API连接...');
    const response = await fetch('/api/articles', { method: 'GET' });
    const data = await response.json();
    console.log('API连接测试结果:', response.status, data);
    alert(`API连接测试: 状态码 ${response.status}`);
  } catch (error) {
    console.error('API连接测试失败:', error);
    alert('API连接测试失败: ' + error.message);
  }
};

// 组件挂载时检查是否需要加载文章详情
onMounted(() => {
  if (isEditMode.value) {
    loadArticleDetail();
  }
});
</script>

<style scoped>
.post-article-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container {
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

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.article-form {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.upload-method-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.upload-method-selector label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: normal;
  cursor: pointer;
}

.upload-option {
  margin-top: 10px;
}

.upload-progress {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #409eff;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #606266;
  min-width: 40px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

input[type="text"],
select,
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #409eff;
}

input.error,
select.error,
textarea.error,
.upload-option.error {
  border-color: #f56c6c;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}

textarea {
  resize: vertical;
  min-height: 200px;
  font-family: inherit;
}

input[type="file"] {
  margin-top: 8px;
}

.image-preview {
  margin-top: 15px;
  position: relative;
  display: inline-block;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.remove-image {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-text {
  display: block;
  margin-top: 5px;
  color: #999;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #66b1ff;
}

.btn-primary:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-secondary:hover {
  background-color: #eef2f7;
}
</style>