<template>
  <div class="file-upload">
    <div class="upload-container" :class="{ 'drag-active': isDragActive }" @drop.prevent="handleDrop" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave">
      <input 
        ref="fileInput" 
        type="file" 
        :accept="accept" 
        @change="handleFileSelect"
        class="file-input"
        :multiple="multiple"
      />
      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <p class="upload-text">点击或拖拽文件到此处上传</p>
        <p class="upload-hint" v-if="hint">{{ hint }}</p>
      </div>
    </div>
    
    <!-- 上传进度条 -->
    <div v-if="uploading" class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="progress-text">{{ progress }}%</span>
    </div>
    
    <!-- 上传结果 -->
    <div v-if="uploadResult" class="upload-result" :class="uploadResult.success ? 'success' : 'error'">
      {{ uploadResult.message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { uploadFile } from '../utils/api';

const props = defineProps({
  // 接受的文件类型，例如 '.jpg,.png,.gif'
  accept: {
    type: String,
    default: ''
  },
  // 是否允许多文件上传
  multiple: {
    type: Boolean,
    default: false
  },
  // 上传接口地址
  uploadUrl: {
    type: String,
    default: '/upload'
  },
  // 提示文本
  hint: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['upload-success', 'upload-error', 'upload-progress']);

const fileInput = ref(null);
const isDragActive = ref(false);
const uploading = ref(false);
const progress = ref(0);
const uploadResult = ref(null);

// 处理文件选择
const handleFileSelect = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    processFiles(files);
  }
};

// 处理拖拽
const handleDragOver = () => {
  isDragActive.value = true;
};

const handleDragLeave = () => {
  isDragActive.value = false;
};

const handleDrop = (event) => {
  isDragActive.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    processFiles(files);
  }
};

// 处理文件上传
const processFiles = async (files) => {
  // 重置状态
  uploadResult.value = null;
  uploading.value = true;
  progress.value = 0;
  
  try {
    // 如果允许多文件上传，这里可以循环处理多个文件
    // 现在先处理单个文件
    const file = files[0];
    
    // 调用上传方法
    const response = await uploadFile(props.uploadUrl, file, (percent) => {
      progress.value = percent;
      emit('upload-progress', percent);
    });
    
    // 上传成功
    uploadResult.value = {
      success: true,
      message: '文件上传成功',
      data: response
    };
    emit('upload-success', response);
    
  } catch (error) {
    // 上传失败
    uploadResult.value = {
      success: false,
      message: error.response?.data?.message || '文件上传失败'
    };
    emit('upload-error', error);
  } finally {
    uploading.value = false;
    // 重置文件输入，允许重复上传同一文件
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    
    // 3秒后清除结果提示
    setTimeout(() => {
      uploadResult.value = null;
    }, 3000);
  }
};

// 暴露方法给父组件
defineExpose({
  // 手动触发文件选择框
  triggerUpload: () => {
    fileInput.value?.click();
  }
});
</script>

<style scoped>
.file-upload {
  margin: 1rem 0;
}

.upload-container {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

.upload-container:hover,
.upload-container.drag-active {
  border-color: #667eea;
  background-color: #f3f4f6;
}

.file-input {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
}

.upload-text {
  font-size: 1rem;
  font-weight: 500;
  color: #4b5563;
  margin: 0;
}

.upload-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.progress-container {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #667eea;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #4b5563;
  min-width: 35px;
  text-align: right;
}

.upload-result {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: center;
}

.upload-result.success {
  background-color: #d1fae5;
  color: #065f46;
}

.upload-result.error {
  background-color: #fee2e2;
  color: #991b1b;
}
</style>