import router from '../router';

/**
 * 从localStorage获取token
 * @returns {string|null} token字符串或null
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * 保存token到localStorage
 * @param {string} token - JWT token字符串
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * 清除token和用户信息
 */
export const clearToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * 解码JWT token
 * @param {string} token - JWT token字符串
 * @returns {object|null} 解码后的token对象或null
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return null;
    
    // 解码payload部分
    const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch (error) {
    console.error('Token解码失败:', error);
    return null;
  }
};

/**
 * 检查token是否过期
 * @param {string} [token] - 可选，传入特定token，默认使用本地存储的token
 * @returns {boolean} 是否过期
 */
export const isTokenExpired = (token) => {
  const tokenToCheck = token || getToken();
  if (!tokenToCheck) return true;
  
  const payload = decodeToken(tokenToCheck);
  if (!payload || !payload.exp) return true;
  
  // 检查是否已过期（添加10秒提前量，避免网络延迟导致的问题）
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + 10;
};

/**
 * 获取token过期时间
 * @param {string} [token] - 可选，传入特定token，默认使用本地存储的token
 * @returns {Date|null} 过期时间Date对象或null
 */
export const getTokenExpiry = (token) => {
  const tokenToCheck = token || getToken();
  const payload = decodeToken(tokenToCheck);
  
  if (!payload || !payload.exp) return null;
  
  return new Date(payload.exp * 1000);
};

/**
 * 处理token过期
 * 清除用户数据并跳转到登录页
 * @param {string} [currentPath] - 当前路径，用于登录成功后重定向
 */
export const handleTokenExpiry = (currentPath) => {
  // 保存当前路径用于登录后重定向
  if (currentPath && currentPath !== '/login' && currentPath !== '/register') {
    localStorage.setItem('redirectAfterLogin', currentPath);
  }
  
  // 清除用户相关数据
  clearToken();
  
  // 触发自定义事件通知应用token已失效
  window.dispatchEvent(new CustomEvent('tokenExpired'));
  
  // 跳转到登录页
  router.replace('/login');
};

/**
 * 创建token过期监听
 * 设置定时器，在token即将过期时自动退出登录
 */
let expiryTimer = null;

export const setupTokenExpiryListener = () => {
  // 清除已有的定时器
  if (expiryTimer) {
    clearInterval(expiryTimer);
    expiryTimer = null;
  }
  
  const startMonitoring = () => {
    // 每分钟检查一次token是否过期
    expiryTimer = setInterval(() => {
      const token = getToken();
      if (token && isTokenExpired(token)) {
        console.log('检测到token已过期，自动退出登录');
        handleTokenExpiry(router.currentRoute.value.path);
        // 清除定时器
        clearInterval(expiryTimer);
        expiryTimer = null;
      }
    }, 60000); // 每分钟检查一次
  };
  
  // 初始检查
  const checkInitialToken = () => {
    const token = getToken();
    if (token && isTokenExpired(token)) {
      console.log('初始化时检测到token已过期，自动退出登录');
      handleTokenExpiry(router.currentRoute.value.path);
    } else if (token) {
      // 只有在有有效token时才启动监控
      startMonitoring();
    }
  };
  
  // 初始检查
  checkInitialToken();
};

/**
 * 清除token过期监听
 */
export const clearTokenExpiryListener = () => {
  if (expiryTimer) {
    clearInterval(expiryTimer);
    expiryTimer = null;
  }
};

/**
 * 验证token是否有效（客户端验证）
 * 注意：这只是客户端验证，服务端仍然需要验证token
 * @param {string} [token] - 可选，传入特定token，默认使用本地存储的token
 * @returns {boolean} token是否有效
 */
export const isValidToken = (token) => {
  const tokenToCheck = token || getToken();
  
  if (!tokenToCheck) return false;
  
  try {
    // 验证token格式
    const tokenParts = tokenToCheck.split('.');
    if (tokenParts.length !== 3) return false;
    
    // 检查是否已过期
    if (isTokenExpired(tokenToCheck)) return false;
    
    return true;
  } catch (error) {
    console.error('Token验证失败:', error);
    return false;
  }
};

/**
 * 计算token剩余有效期（秒）
 * @param {string} [token] - 可选，传入特定token，默认使用本地存储的token
 * @returns {number} 剩余秒数，已过期返回0
 */
export const getTokenRemainingTime = (token) => {
  const tokenToCheck = token || getToken();
  if (!tokenToCheck) return 0;
  
  const payload = decodeToken(tokenToCheck);
  if (!payload || !payload.exp) return 0;
  
  const now = Math.floor(Date.now() / 1000);
  const remaining = payload.exp - now;
  
  return remaining > 0 ? remaining : 0;
};

// 默认导出
const tokenHandler = {
  getToken,
  setToken,
  clearToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiry,
  handleTokenExpiry,
  setupTokenExpiryListener,
  clearTokenExpiryListener,
  isValidToken,
  getTokenRemainingTime
};

export default tokenHandler;