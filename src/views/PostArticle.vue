<template>
  <div class="post-article-container">
    <h1>发表文章</h1>
    <form @submit.prevent="handleSubmit" class="article-form">
      <div class="form-group">
        <label for="title">文章标题 *</label>
        <input 
          type="text" 
          id="title" 
          v-model="articleForm.title" 
          placeholder="请输入文章标题"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="category">文章分类 *</label>
        <select id="category" v-model="articleForm.category" required>
          <option value="" disabled>请选择分类</option>
          <option value="tech">技术</option>
          <option value="life">生活</option>
          <option value="travel">旅行</option>
          <option value="food">美食</option>
          <option value="other">其他</option>
        </select>
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
          required
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="coverImage">文章封面</label>
        <input 
          type="file" 
          id="coverImage" 
          accept="image/*" 
          @change="handleCoverImageChange"
        />
        <div v-if="coverImagePreview" class="image-preview">
          <img :src="coverImagePreview" alt="封面预览" />
          <button type="button" class="remove-image" @click="removeCoverImage">移除</button>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="handleCancel">取消</button>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : '发表文章' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { articleApi } from '../utils/api';

const router = useRouter();
const isSubmitting = ref(false);
const coverImage = ref(null);
const coverImagePreview = ref('');

const articleForm = reactive({
  title: '',
  category: '',
  tags: '',
  content: ''
});

// 处理封面图片选择
const handleCoverImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('请上传JPG、PNG或GIF格式的图片');
      event.target.value = '';
      return;
    }
    
    // 检查文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB');
      event.target.value = '';
      return;
    }
    
    coverImage.value = file;
    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      coverImagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// 移除封面图片
const removeCoverImage = () => {
  coverImage.value = null;
  coverImagePreview.value = '';
  document.getElementById('coverImage').value = '';
};

// 取消发布
const handleCancel = () => {
  if (confirm('确定要取消发表吗？未保存的内容将会丢失。')) {
    router.back();
  }
};

// 提交文章
const handleSubmit = async () => {
  isSubmitting.value = true;
  
  try {
      // 如果有封面图片，先上传图片
      let coverImageUrl = '';
      if (coverImage.value) {
        // 创建FormData对象用于文件上传
        const formData = new FormData();
        formData.append('image', coverImage.value);
        
        const uploadResponse = await articleApi.uploadCoverImage(formData, (progress) => {
          console.log('上传进度:', progress);
        });
        
        if (uploadResponse.data && uploadResponse.data.success) {
          coverImageUrl = uploadResponse.data.imageUrl;
        } else {
          throw new Error('封面图片上传失败');
        }
      }
      
      // 构建文章数据
      const articleData = {
        title: articleForm.title,
        category: articleForm.category,
        tags: articleForm.tags ? articleForm.tags.split(',').map(tag => tag.trim()) : [],
        content: articleForm.content,
        coverImage: coverImageUrl
      };
      
      // 提交文章
      const response = await articleApi.publishArticle(articleData);
      
      if (response.data && response.data.success) {
        alert('文章发表成功！');
        // 跳转到首页或文章详情页
        router.push('/');
      } else {
        throw new Error(response.data?.message || '文章发表失败');
      }
    } catch (error) {
    console.error('发表文章失败:', error);
    alert('发表文章失败: ' + (error.message || '请稍后重试'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.post-article-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
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