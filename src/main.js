import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { setupTokenExpiryListener } from './utils/tokenHandler';

// 创建Vue应用实例
const app = createApp(App)

// 初始化token过期监听器
setupTokenExpiryListener();

// 创建一个简单的Axios引用，指向我们在api.js中配置的实例
import api from './utils/api';

// 将api实例挂载到Vue全局属性
app.config.globalProperties.$api = api;

// 提供给组合式API使用
app.provide('api', api);

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')
