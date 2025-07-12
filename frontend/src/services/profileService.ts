import api from './api';
import { UserProfile, ProfileStatistics, UserPrompt, UserFavorite } from '../types/profile';

// 获取当前用户的个人资料
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/api/profile/me');
  return response.data;
};

// 更新当前用户的个人资料
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await api.put('/api/profile/me', profileData);
  return response.data;
};

// 上传用户头像
export const uploadAvatar = async (file: File): Promise<{ avatar_url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// 获取用户统计数据
export const getUserStatistics = async (): Promise<ProfileStatistics> => {
  const response = await api.get('/api/profile/statistics');
  return response.data;
};

// 获取用户创建的提示词列表
export const getUserPrompts = async (
  params: { skip?: number; limit?: number; sort_by?: string; sort_order?: 'asc' | 'desc' } = {}
): Promise<{ items: UserPrompt[]; total: number; error?: string }> => {
  console.log('调用getUserPrompts API，参数:', params);
  try {
    const response = await api.get('/api/profile/prompts', { params });
    console.log('获取提示词响应数据:', response.data);
    
    // 确保响应数据结构正确
    if (response.data && typeof response.data === 'object') {
      // 如果响应数据已经是正确的格式，直接返回
      if (response.data.items && Array.isArray(response.data.items) && 'total' in response.data) {
        return response.data;
      }
      
      // 如果响应数据是数组，则将其包装为正确的格式
      if (Array.isArray(response.data)) {
        return {
          items: response.data,
          total: response.data.length
        };
      }
    }
    
    // 默认返回空数组和0总数
    console.warn('响应数据格式不符合预期，返回空结果');
    return { items: [], total: 0 };
  } catch (error) {
    console.error('获取提示词列表API错误:', error);
    throw error;
  }
};

// 获取用户收藏夹列表
export const getUserFavorites = async (
  params: { skip?: number; limit?: number } = {}
): Promise<{ items: UserFavorite[]; total: number }> => {
  const response = await api.get('/api/profile/favorites', { params });
  return response.data;
};
