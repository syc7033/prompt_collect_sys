import api from './api';
import Cookies from 'js-cookie';

export interface UserRegisterData {
  username: string;
  email: string;
  password: string;
  invite_code?: string; // 可选的邀请码字段
}

export interface UserLoginData {
  username: string;
  password: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// 用户注册
export const register = async (userData: UserRegisterData): Promise<User> => {
  console.log('[auth.service] 开始注册用户', { username: userData.username });
  const response = await api.post<User>('/api/auth/register', userData);
  console.log('[auth.service] 注册成功', response.data);
  return response.data;
};

// 用户登录
export const login = async (userData: UserLoginData): Promise<AuthResponse> => {
  // 登录API使用表单数据而不是JSON
  console.log('[AUTH_SERVICE] ====== 开始登录用户 ======');
  console.log('[AUTH_SERVICE] 用户名:', userData.username);
  console.log('[AUTH_SERVICE] 当前认证状态:', isAuthenticated() ? '已登录' : '未登录');
  
  const formData = new URLSearchParams();
  formData.append('username', userData.username);
  formData.append('password', userData.password);

  try {
    console.log('[AUTH_SERVICE] 发送登录请求到API');
    const response = await api.post<AuthResponse>('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // 保存token到cookie
    if (response.data.access_token) {
      console.log('[AUTH_SERVICE] 登录成功，保存令牌');
      Cookies.set('token', response.data.access_token, { expires: 7 });
      console.log('[AUTH_SERVICE] 令牌已保存到cookie');
      console.log('[AUTH_SERVICE] 登录后认证状态:', isAuthenticated() ? '已登录' : '未登录');
      
      // 登录成功后立即获取用户信息并缓存
      try {
        console.log('[AUTH_SERVICE] 登录成功，获取用户信息');
        const userResponse = await api.get<User>('/api/auth/me');
        console.log('[AUTH_SERVICE] 获取用户信息成功:', userResponse.data.username);
        
        // 缓存用户信息到localStorage
        if (typeof window !== 'undefined') {
          console.log('[AUTH_SERVICE] 缓存用户信息到localStorage');
          localStorage.setItem('cachedUser', JSON.stringify(userResponse.data));
        }
      } catch (userError) {
        console.error('[AUTH_SERVICE] 获取用户信息失败:', userError);
        // 即使获取用户信息失败，也不影响登录成功
      }
    } else {
      console.log('[AUTH_SERVICE] 警告: 登录成功但没有收到令牌');
    }

    return response.data;
  } catch (error) {
    console.error('[AUTH_SERVICE] 登录请求失败:', error);
    throw error;
  }
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User> => {
  console.log('[auth.service] 获取当前用户信息');
  const response = await api.get<User>('/api/auth/me');
  console.log('[auth.service] 获取用户信息成功', response.data);
  return response.data;
};

// 登出
export const logout = (redirect: boolean = true): void => {
  console.log('[auth.service] ====== 开始退出登录 ======');
  console.log('[auth.service] 调用参数:', { redirect });
  console.log('[auth.service] 当前页面URL:', typeof window !== 'undefined' ? window.location.href : 'SSR模式');
  console.log('[auth.service] 当前页面路径:', typeof window !== 'undefined' ? window.location.pathname : 'SSR模式');
  
  Cookies.remove('token');
  console.log('[auth.service] 已移除token');
  
  // 清除本地缓存的用户信息
  if (typeof window !== 'undefined') {
    console.log('[auth.service] 清除本地缓存的用户信息');
    const hadCachedUser = !!localStorage.getItem('cachedUser');
    console.log('[auth.service] 清除前缓存状态:', { hadCachedUser });
    localStorage.removeItem('cachedUser');
    
    // 只在需要时重定向到登录页面
    if (redirect) {
      console.log('[auth.service] 重定向模式: 将重定向到登录页面');
      console.log('[auth.service] 重定向目标: /auth/login');
      window.location.href = '/auth/login';
    } else {
      console.log('[auth.service] 重定向模式: 跳过重定向');
      console.log('[auth.service] 留在当前页面:', window.location.pathname);
    }
  }
  console.log('[auth.service] ====== 退出登录完成 ======');
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!Cookies.get('token');
};

// 修改密码
export const changePassword = async (passwordData: ChangePasswordData): Promise<User> => {
  console.log('[auth.service] 开始修改密码');
  const response = await api.put<User>('/api/auth/change-password', passwordData);
  console.log('[auth.service] 密码修改成功');
  return response.data;
};
