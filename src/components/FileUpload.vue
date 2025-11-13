<template>
  <div class="file-upload">
    <div class="upload-container" 
         :class="{ 'drag-active': isDragActive, 'disabled': disabled }" 
         @drop.prevent="handleDrop" 
         @dragover.prevent="handleDragOver" 
         @dragleave.prevent="handleDragLeave"
         @click="disabled ? () => {} : handleContainerClick">
      <input 
        ref="fileInput" 
        type="file" 
        :accept="getAcceptString"
        @change="handleFileSelect"
        class="file-input"
        :multiple="multiple"
        :disabled="disabled"
      />
      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <p class="upload-text">点击或拖拽文件到此处上传</p>
        <p class="upload-hint" v-if="hint">{{ hint }}</p>
        <p class="upload-hint" v-if="disabled">上传已禁用</p>
      </div>
    </div>
    

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  // 接受的文件类型，可以是字符串或数组
  accept: {
    type: [String, Array],
    default: ''
  },
  // 是否允许多文件上传
  multiple: {
    type: Boolean,
    default: false
  },
  // 是否禁用上传
  disabled: {
    type: Boolean,
    default: false
  },
  // 提示文本
  hint: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['file-selected', 'upload-success', 'upload-error', 'upload-progress']);

const fileInput = ref(null);
const isDragActive = ref(false);
const uploading = ref(false);
const progress = ref(0);
const uploadResult = ref(null);

// 将accept转换为字符串
const getAcceptString = computed(() => {
  if (Array.isArray(props.accept)) {
    return props.accept.join(',');
  }
  return props.accept;
});

// 处理容器点击
const handleContainerClick = () => {
  if (!props.disabled) {
    fileInput.value?.click();
  }
};

// 处理文件选择
const handleFileSelect = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    // 直接发出文件选择事件，由父组件处理上传
    const file = files[0];
    emit('file-selected', file);
    
    // 重置文件输入，允许重复上传同一文件
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

// 处理拖拽
const handleDragOver = (event) => {
  if (!props.disabled) {
    isDragActive.value = true;
    event.dataTransfer.dropEffect = 'copy';
  }
};

const handleDragLeave = () => {
  isDragActive.value = false;
};

const handleDrop = (event) => {
  isDragActive.value = false;
  if (!props.disabled) {
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      // 直接发出文件选择事件，由父组件处理上传
      const file = files[0];
      emit('file-selected', file);
    }
  }
};

// 移除不需要的自动上传功能，由父组件处理上传逻辑

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

.upload-container:hover:not(.disabled),
.upload-container.drag-active:not(.disabled) {
  border-color: #667eea;
  background-color: #f3f4f6;
}

.upload-container.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f9fafb;
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