import axios from 'axios';
import router from '../router'; // 导入Vue Router
import {
  getToken,
  isTokenExpired,
  handleTokenExpiry,
  clearToken
} from './tokenHandler.js';

// 创建axios实例
const api = axios.create({
  // 使用相对路径，配合vite代理
  baseURL: '',
  timeout: 30000, // 增加超时时间到30秒
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // 允许携带凭证(cookie等)
});

// 判断是否为公开接口
const isPublicUrl = (url) => {
  const publicRoutes = [
    '/users/register', 
    '/users/login',
    '/users/check-username',
    '/users/check-email'
  ];
  return publicRoutes.some(route => url && url.includes(route));
};

// 用于防抖的标志，防止短时间内多次处理401错误
let isRefreshing = false;

// 请求拦截器
api.interceptors.request.use(
  config => {
    console.log('=== API请求开始 ===');
    console.log('请求URL:', config.url);
    console.log('请求方法:', config.method);
    console.log('请求数据:', config.data);
    console.log('原始请求URL:', config.url);
    
    const isPublicRoute = isPublicUrl(config.url);
    console.log('是否为公开接口:', isPublicRoute);
    
    // 对于文件上传，Content-Type由浏览器自动设置，不要覆盖
    const isFileUpload = config.data instanceof FormData;
    
    if (isFileUpload) {
      console.log('检测到文件上传请求');
      // 对于文件上传，删除默认的Content-Type，让浏览器自动设置
      delete config.headers['Content-Type'];
    }
    
    // 只有非公开接口且存在token时才添加Authorization头
    if (!isPublicRoute) {
      const token = getToken();
      console.log('非公开接口，检查token是否存在:', !!token);
      if (token) {
        // 在请求前检查token是否已过期
        if (isTokenExpired(token)) {
          console.warn('Token已过期，将自动退出登录');
          handleTokenExpiry(router.currentRoute.value.path);
          return Promise.reject(new Error('Token已过期'));
        }
        config.headers.Authorization = `Bearer ${token}`;
        console.log('已添加Authorization头');
      }
    } else {
      console.log('公开接口，不添加Authorization头');
      // 确保移除可能存在的Authorization头
      delete config.headers.Authorization;
    }
    
    console.log('最终请求头:', {
      ...config.headers,
      Authorization: config.headers.Authorization ? 'Bearer ***' : undefined
    });
    console.log('=== API请求配置完成 ===');
    
    return config;
  },
  error => {
    console.error('=== 请求拦截器错误 ===', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('=== API响应开始 ===');
    console.log('请求URL:', response.config.url);
    console.log('响应状态码:', response.status);
    console.log('响应状态文本:', response.statusText);
    console.log('响应数据:', response.data);
    console.log('=== API响应结束 ===');
    // 不直接返回response.data，保留完整响应结构，以便组件能正确访问后端返回的success、message和data字段
    return response;
  },
  error => {
    console.error('=== API请求错误开始 ===');
    console.error('请求URL:', error.config?.url);
    console.error('请求方法:', error.config?.method);
    
    if (error.response) {
      // 服务器返回了错误响应
      console.error('错误类型: 服务器错误响应');
      console.error('状态码:', error.response.status);
      console.error('状态文本:', error.response.statusText);
      console.error('响应数据:', error.response.data);
      console.error('后端错误消息:', error.response.data?.message || error.response.data?.error || '无详细信息');
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('错误类型: 网络错误 - 服务器无响应');
      console.error('请求对象:', error.request);
    } else {
      // 请求配置出错
      console.error('错误类型: 请求配置错误');
      console.error('错误消息:', error.message);
    }
    
    console.error('完整错误对象:', error);
    console.error('=== API请求错误结束 ===');
    
    const isPublicRoute = isPublicUrl(error.config?.url);
    console.log('错误是否发生在公开接口:', isPublicRoute);
    
    // 处理常见错误，但避免与组件中的错误处理重复
    if (error.response && !isPublicRoute) {
      switch (error.response.status) {
        case 401:
          // 防止短时间内多次触发401处理逻辑
          if (!isRefreshing) {
            isRefreshing = true;
            
            // 未授权，使用tokenHandler处理过期token
            const errorMessage = error.response.data?.message || '您的会话已过期，请重新登录';
            
            console.warn('Token已过期或无效，需要重新登录');
            
            // 使用统一的token处理函数
            handleTokenExpiry(router.currentRoute.value.path);
            
            // 延迟显示提示，确保路由跳转后显示
            setTimeout(() => {
              alert(errorMessage);
              // 重置标志，允许下次处理
              setTimeout(() => {
                isRefreshing = false;
              }, 1000);
            }, 100);
          }
          break;
        case 403:
          console.error('403 Forbidden 错误详情:', error.response.data);
          // 不自动弹出alert，让组件处理
          break;
        case 404:
          alert('请求的资源不存在');
          break;
        case 500:
          alert('服务器内部错误');
          break;
      }
    }
    return Promise.reject(error);
  }
);

// 封装文件上传方法
export const uploadFile = (url, formData, onProgress) => {
  console.log('正在上传文件到:', url);
  
  // 检查formData内容
  for (let [key, value] of formData.entries()) {
    console.log(`使用的字段名: ${key}`);
    if (value instanceof File) {
      console.log(`文件名: ${value.name}`);
      console.log(`文件大小: ${value.size} bytes`);
      console.log(`文件类型: ${value.type}`);
    }
  }
  
  const config = {
    headers: {
      // 不要显式设置Content-Type，让浏览器自动设置multipart/form-data
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`上传进度: ${percentCompleted}%`);
        onProgress(percentCompleted);
      }
    }
  };

  // 添加认证头（如果是非公开接口）
  if (!isPublicUrl(url)) {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('已添加Authorization头');
    }
  }

  console.log('最终上传配置:', config);
  return api.post(url, formData, config);
};

// 清理过期token并退出登录
export const handleExpiredToken = () => {
  console.log('处理过期token');
  // 使用统一的token处理函数
  handleTokenExpiry(router.currentRoute.value.path);
};

// 单独导出各请求方法
export const get = (url, params) => api.get(url, { params });
export const post = (url, data) => api.post(url, data);
export const put = (url, data) => api.put(url, data);
export const del = (url) => api.delete(url);

// 用户相关接口
export const userApi = {
  // 修改昵称接口 - PUT请求
  updateNickname: (nickname) => put('/api/users/update-nickname', { nickname }),
  // 修改个人简介接口 - PUT请求
  updateBio: (bio) => put('/api/users/update-bio', { bio }),
  // 上传头像接口 - POST请求
  uploadAvatar: (formData, onProgress) => uploadFile('/api/users/upload-avatar', formData, onProgress)
};

// 文章相关接口
export const articleApi = {
  // 发表文章接口 - POST请求
  publishArticle: (articleData) => post('/api/articles', articleData),
  // 上传文章封面图片接口 - POST请求
  uploadCoverImage: (formData, onProgress) => uploadFile('/api/upload/image', formData, onProgress)
};

// 默认导出对象
export default {
  get,
  post,
  put,
  delete: del,
  uploadFile,
  userApi,
  articleApi
};