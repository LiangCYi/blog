import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import { getToken, isTokenExpired, handleTokenExpiry } from '../utils/tokenHandler';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/articles',
    name: 'Articles',
    component: () => import('../views/Articles.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('../views/ChangePassword.vue')
    // 移除登录限制，允许未登录用户访问
  },
  {
    path: '/post-article',
    name: 'PostArticle',
    component: () => import('../views/PostArticle.vue'),
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('../views/ArticleDetail.vue')
    // 文章详情页不需要登录限制，公开访问
  },
  {
    path: '/my-articles',
    name: 'MyArticles',
    component: () => import('../views/MyArticles.vue'),
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫，检查是否需要登录
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  // 获取本地存储的token
  const token = getToken();
  
  if (requiresAuth) {
    // 需要认证的页面
    if (!token) {
      // 如果没有token，重定向到登录页
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (isTokenExpired(token)) {
      // 如果token已过期，处理过期逻辑
      console.warn('路由守卫：检测到token已过期');
      handleTokenExpiry(to.fullPath);
      // 阻止当前导航
      next(false);
    } else {
      // 有有效token，允许访问
      next();
    }
  } else {
    // 不需要认证的页面
    if (token && !isTokenExpired(token) && (to.name === 'Login' || to.name === 'Register')) {
      // 如果已登录且token有效，尝试访问登录或注册页，重定向到首页
      next({ name: 'Home' });
    } else {
      // 其他情况，正常导航
      next();
    }
  }
});

export default router;