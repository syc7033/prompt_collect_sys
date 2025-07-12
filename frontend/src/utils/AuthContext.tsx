import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/router';
import { User, getCurrentUser, isAuthenticated, logout } from '../services/auth';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  logout: () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastAuthCheck, setLastAuthCheck] = useState<number>(0);
  const router = useRouter();

  // 公开路由 - 不需要认证
  const publicRoutes = [
    '/', // 首页路径
    '/index',
    '/prompts', // 提示词列表页，允许匿名浏览
    '/prompts/popular', // 热门提示词页，允许匿名浏览
    '/auth/login', 
    '/auth/register', 
    '/auth/login-simple',
    '/auth/register-simple',
    '/public-debug', 
    '/debug',
    '/no-auth-debug',
    '/direct-test',
    '/simple',
    '/home-fixed',
    '/pure-html-test'
  ];
  
  console.log('[AuthContext] 公开路由列表:', publicRoutes);
  
  // 打印调试日志
  console.log('认证上下文加载');
  console.log('当前路径:', router.pathname);
  console.log('是否公开路由:', publicRoutes.includes(router.pathname));

  // 获取当前用户信息的函数，使用useCallback缓存
  const fetchUser = useCallback(async () => {
    try {
      console.log('[AuthContext] 正在获取用户信息...');
      const userData = await getCurrentUser();
      console.log('[AuthContext] 获取到用户信息:', userData.username);
      setUser(userData);
      setError(null);
      // 更新最后认证检查时间
      setLastAuthCheck(Date.now());
      // 缓存用户信息到localStorage
      if (typeof window !== 'undefined') {
        console.log('[AuthContext] 缓存用户信息到localStorage:', userData.username);
        localStorage.setItem('cachedUser', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('[AuthContext] 获取用户信息失败:', err);
      setError('获取用户信息失败');
      if (typeof window !== 'undefined') {
        console.log('[AuthContext] 清除localStorage中的用户缓存');
        localStorage.removeItem('cachedUser');
      }
      console.log('[AuthContext] 调用logout函数，禁止重定向');
      logout(false); // 禁止自动重定向
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 检查当前路由是否为公开路由
    const isPublicRoute = publicRoutes.includes(router.pathname);
    console.log('[AuthContext] ====== 路由变化检测开始 ======');
    console.log('[AuthContext] 当前路径:', router.pathname);
    console.log('[AuthContext] 是否公开路由:', isPublicRoute);
    console.log('[AuthContext] 公开路由列表:', publicRoutes);
    console.log('[AuthContext] 完整URL:', typeof window !== 'undefined' ? window.location.href : 'SSR模式');
    console.log('[AuthContext] 路由查询参数:', router.query);
    console.log('[AuthContext] 路由就绪状态:', { isReady: router.isReady, asPath: router.asPath });
    console.log('[AuthContext] 当前用户状态:', {
      isAuthenticated: !!Cookies.get('token'),
      hasUser: !!user,
      username: user?.username,
      loading
    });
    console.log('[AuthContext] 本地存储状态:', {
      hasToken: !!Cookies.get('token'),
      hasCachedUser: !!localStorage.getItem('cachedUser'),
      cachedUsername: localStorage.getItem('cachedUser') ? JSON.parse(localStorage.getItem('cachedUser') || '{}').username : null
    });
    console.log('[AuthContext] token内容:', Cookies.get('token'));
    console.log('[AuthContext] ====== 路由变化检测结束 ======');
    
    // 检查是否有token
    const hasToken = !!Cookies.get('token');
    console.log('[AuthContext] 检查token状态:', hasToken ? '存在' : '不存在');
    console.log('[AuthContext] 所有cookie:', document.cookie);
    
    // 检查是否有重定向请求
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const redirectRequested = urlParams.has('redirect');
    console.log('[AuthContext] 检查URL参数:', { redirectRequested, search: typeof window !== 'undefined' ? window.location.search : '' });
    
    // 如果是公开路由，检查是否有token，有token则获取用户信息
    if (isPublicRoute) {
      console.log('[AuthContext] 公开路由检测: 是公开路由');
      console.log('[AuthContext] 路径"' + router.pathname + '"在公开路由列表中');
      
      // 即使是公开路由，如果有token，也应该尝试获取用户信息
      if (hasToken && !user) {
        console.log('[AuthContext] 公开路由处理: 发现token但没有用户信息，尝试获取用户信息');
        
        // 尝试从缓存加载用户信息
        if (typeof window !== 'undefined') {
          const cachedUserData = localStorage.getItem('cachedUser');
          if (cachedUserData) {
            try {
              const parsedUser = JSON.parse(cachedUserData);
              console.log('[AuthContext] 从缓存加载用户信息:', parsedUser.username);
              setUser(parsedUser);
              setLoading(false);
              return;
            } catch (e) {
              console.error('[AuthContext] 解析缓存用户信息失败:', e);
              localStorage.removeItem('cachedUser');
            }
          } else {
            console.log('[AuthContext] 公开路由处理: 没有缓存的用户信息，从服务器获取');
            fetchUser();
            return;
          }
        }
      } else {
        console.log('[AuthContext] 公开路由处理: 设置loading=false并返回');
        setLoading(false);
        return;
      }
    }
    console.log('[AuthContext] 公开路由检测: 非公开路由');
    console.log('[AuthContext] 路径"' + router.pathname + '"不在公开路由列表中');

    // 如果没有token，清除用户状态但不重定向（允许未登录浏览）
    if (!hasToken) {
      console.log('[AuthContext] 未找到认证令牌，清除用户状态，但允许继续浏览');
      setUser(null); // 重要！清除当前用户状态
      
      // 清除本地缓存
      if (typeof window !== 'undefined') {
        console.log('[AuthContext] 清除本地缓存的用户信息');
        localStorage.removeItem('cachedUser');
      }
      
      // 只有在明确请求重定向时才重定向到登录页面
      if (redirectRequested) {
        console.log('[AuthContext] 检测到重定向请求参数，将重定向到登录页面');
        router.push('/auth/login');
      } else {
        console.log('[AuthContext] 未检测到重定向请求，允许访问当前页面');
        setLoading(false);
      }
      return;
    }

    // 尝试从缓存加载用户信息
    if (typeof window !== 'undefined') {
      const cachedUserData = localStorage.getItem('cachedUser');
      if (cachedUserData) {
        try {
          const parsedUser = JSON.parse(cachedUserData);
          console.log('[AuthContext] 从缓存加载用户信息:', parsedUser.username);
          setUser(parsedUser);
          setLoading(false);
          
          // 如果最后认证检查时间超过5分钟，在后台刷新用户信息
          const now = Date.now();
          if (now - lastAuthCheck > 5 * 60 * 1000) {
            console.log('[AuthContext] 缓存过期，在后台刷新用户信息');
            fetchUser();
          }
          return;
        } catch (e) {
          console.error('[AuthContext] 解析缓存用户信息失败:', e);
          localStorage.removeItem('cachedUser');
          // 调用logout函数，禁止重定向
          logout(false);
        }
      } else {
        console.log('[AuthContext] 本地没有缓存的用户信息');
      }
    }

    // 没有缓存，获取用户信息
    console.log('[AuthContext] 从服务器获取用户信息');
    fetchUser();
  }, [router.pathname, fetchUser, lastAuthCheck]);

  // 修正：isAuthenticated应该基于token而不仅仅是user对象
  const isUserAuthenticated = !!Cookies.get('token');
  console.log('[AuthContext] 计算认证状态:', { 
    hasToken: !!Cookies.get('token'), 
    hasUser: !!user, 
    finalAuthState: isUserAuthenticated 
  });
  
  const value = {
    user,
    loading,
    error,
    isAuthenticated: isUserAuthenticated, // 修改为基于token的认证状态
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
