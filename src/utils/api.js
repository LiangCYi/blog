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
const isPublicUrl = (url, method = 'GET') => {
  if (!url) return false;
  
  // 直接匹配完整的公开路径
  const publicExactPaths = [
    '/api/articles/list', // 文章列表接口
    '/api/public/articles' // 新增：公开文章列表接口（无需登录）
  ];
  
  // 检查是否是文章详情页（/api/articles/数字）- GET请求时公开
  const isArticleDetail = /^\/api\/articles\/\d+$/.test(url);
  
  // 检查是否是用户相关的公开接口
  const isUserPublicApi = url.includes('/users/register') || 
                         url.includes('/users/login') ||
                         url.includes('/users/check-username') ||
                         url.includes('/users/check-email');
  
  // 区分GET和POST请求的/api/articles
  // GET /api/articles 是获取文章列表，不需要认证
  // POST /api/articles 是发表文章，需要认证
  const isGetArticlesList = url === '/api/articles' && (method?.toUpperCase() === 'GET' || !method);
  
  console.log('检查公开接口:', url, method, '结果:', 
    publicExactPaths.includes(url) || isArticleDetail || isUserPublicApi || isGetArticlesList);
  
  return publicExactPaths.includes(url) || isArticleDetail || isUserPublicApi || isGetArticlesList;
};

// 用于防抖的标志，防止短时间内多次处理401错误
let isRefreshing = false;

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 简化日志记录
    console.log('API请求:', config.method?.toUpperCase(), config.url);
    
    // 对于文件上传，Content-Type由浏览器自动设置，不要覆盖
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // 检查是否为公开接口
    const url = config.url;
    
    // 对于非公开接口，添加Authorization头
    if (!isPublicUrl(url, config.method)) {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('添加认证令牌到请求');
    }
  } else {
    // 对于公开接口，移除Authorization头
    delete config.headers.Authorization;
  }
    
    return config;
  },
  error => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 简化日志记录
    console.log('API响应成功:', response.status, response.config.url);
    return response;
  },
  error => {
    // 简化错误日志
    console.error('API请求错误:', error.config?.method?.toUpperCase(), error.config?.url);
    
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('后端错误消息:', error.response.data?.message || error.response.data?.error || '无详细信息');
      
      // 处理401未授权错误（令牌过期或无效）
      if (error.response.status === 401) {
        console.log('认证失败，检查令牌状态');
        
        // 处理令牌过期情况
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            // 尝试处理令牌过期，可能会刷新令牌或清除令牌
            handleTokenExpiry();
            
            // 清除token并重定向到登录页面
            clearToken();
            alert('您的登录已过期，请重新登录');
            router.push('/login');
          } catch (refreshError) {
            console.error('处理令牌过期失败:', refreshError);
            clearToken();
            router.push('/login');
          } finally {
            isRefreshing = false;
          }
        }
      } else if (error.response.status === 404) {
        alert('请求的资源不存在');
      } else if (error.response.status === 500) {
        alert('服务器内部错误');
      }
    } else if (error.request) {
      console.error('网络错误 - 服务器无响应');
      alert('网络连接失败，请检查您的网络');
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
  if (!isPublicUrl(url, 'POST')) {
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
  // 更新文章接口 - PUT请求
  updateArticle: (id, articleData) => put(`/api/articles/${id}`, articleData),
  // 删除文章接口 - DELETE请求
  deleteArticle: (id) => del(`/api/articles/${id}`),
  // 获取文章详情接口 - GET请求
  getArticleDetail: (id) => get(`/api/articles/${id}`),
  // 获取我的文章列表接口 - GET请求
  getMyArticles: (params) => get('/api/articles/my-articles', params),
  // 搜索文章接口 - GET请求
  searchArticles: (params) => get('/api/articles/search', params),
  // 获取首页文章列表接口 - GET请求
  getHomeArticles: (params) => get('/api/articles', params),
  // 上传文章封面图片接口 - POST请求
  uploadCoverImage: (formData, onProgress) => uploadFile('/api/upload/image', formData, onProgress),
  // 新增：获取公开文章列表接口（无需登录）- GET请求
  getPublicArticles: (params) => get('/api/public/articles', params),
  // 新增：获取作者文章列表接口（需要登录）- POST请求
  getAuthorArticles: (params) => post('/api/author/articles', params)
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