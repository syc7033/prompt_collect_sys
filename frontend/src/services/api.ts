import axios from 'axios';
import Cookies from 'js-cookie';

// 获取环境变量中的API URL
let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 移除尾随的斜杠
if (rawApiUrl.endsWith('/')) {
  rawApiUrl = rawApiUrl.slice(0, -1);
}

// 移除尾随的/api，因为环境变量中可能已经包含了
// 例如，如果环境变量是 http://localhost:8000/api，我们需要去掉/api
// 因为在各个服务模块中我们已经添加了/api前缀
if (rawApiUrl.endsWith('/api')) {
  rawApiUrl = rawApiUrl.slice(0, -4); // 移除尾随的/api
}

// 设置API基础URL
const API_URL = rawApiUrl;

// 记录API基础URL，用于调试
console.log('%c[api.service] API基础URL配置', 'background: #222; color: #bada55', {
  原始URL: process.env.NEXT_PUBLIC_API_URL,
  处理后URL: API_URL,
  完整请求示例: API_URL + '/api/prompts'
});

// 创建axios实例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 设置请求超时时间为5秒
  timeout: 5000,
});

// 请求拦截器 - 添加认证信息和日志
api.interceptors.request.use(
  (config) => {
    // 从cookie中获取token
    const token = Cookies.get('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 记录请求详情
    console.log('%c[API请求]', 'background: #4CAF50; color: white', {
      方法: config.method?.toUpperCase(),
      URL: config.url,
      完整URL: `${API_URL}${config.url || ''}`,
      基础URL: API_URL,
      参数: config.params,
      数据: config.data,
      头信息: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('%c[API请求错误]', 'background: #F44336; color: white', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误和日志
api.interceptors.response.use(
  (response) => {
    // 记录成功响应
    console.log('%c[API响应成功]', 'background: #2196F3; color: white', {
      URL: response.config.url,
      状态: response.status,
      数据: response.data
    });
    return response;
  },
  (error) => {
    // 处理超时错误
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('API请求超时，请稍后再试');
      return Promise.reject(new Error('请求超时，请稍后再试'));
    }
    
    // 处理错误响应
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('%c[API错误响应]', 'background: #F44336; color: white', {
        URL: error.config?.url,
        完整URL: `${API_URL}${error.config?.url || ''}`,
        基础URL: API_URL,
        状态码: error.response.status,
        错误数据: error.response.data,
        请求参数: error.config?.params,
        请求数据: error.config?.data
      });
      
      // 处理401未授权错误
      if (error.response.status === 401) {
        console.warn('%c[认证失败]', 'background: #FF9800; color: white', '用户未授权');
        console.log('AUTH_DEBUG: 收到401错误，开始检查路由状态');
        
        // 检查当前页面是否是公开页面
        const publicRoutes = [
          '/', 
          '/index', 
          '/prompts', 
          '/prompts/popular', 
          '/auth/login', 
          '/auth/register'
        ];
        
        // 检查是否为提示词详情页面
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const isPromptDetailPage = /^\/prompts\/[\w-]+$/.test(currentPath) && !currentPath.includes('/edit') && !currentPath.includes('/fork');
        
        console.log('AUTH_DEBUG: 当前路径:', currentPath);
        console.log('AUTH_DEBUG: 是否为提示词详情页面:', isPromptDetailPage);
        
        // 判断是否为公开路由或提示词详情页面
        const isPublicRoute = publicRoutes.includes(currentPath) || isPromptDetailPage;
        
        console.log('%c[API拦截器]', 'background: #FF9800; color: white', {
          当前路径: currentPath,
          是否提示词详情页面: isPromptDetailPage,
          是否公开路由: isPublicRoute,
          请求URL: error.config?.url
        });
        
        console.log('AUTH_DEBUG: 路由判断结果:', {
          当前路径: currentPath,
          是否提示词详情页面: isPromptDetailPage,
          是否公开路由: isPublicRoute
        });
        
        // 移除token
        Cookies.remove('token');
        
        // 只有在非公开页面上才重定向到登录页面
        if (typeof window !== 'undefined' && !isPublicRoute) {
          console.log('%c[API拦截器]', 'background: #FF9800; color: white', '非公开页面，将重定向到登录页面');
          window.location.href = '/auth/login';
        } else {
          console.log('%c[API拦截器]', 'background: #FF9800; color: white', '公开页面，不进行重定向');
        }
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('%c[API无响应]', 'background: #F44336; color: white', {
        URL: error.config?.url,
        完整URL: `${API_URL}${error.config?.url || ''}`,
        基础URL: API_URL,
        请求对象: error.request
      });
    } else {
      // 请求设置时发生错误
      console.error('%c[API请求错误]', 'background: #F44336; color: white', {
        消息: error.message,
        错误对象: error
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
