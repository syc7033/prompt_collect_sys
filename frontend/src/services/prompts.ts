import api from './api';
import { User } from './auth';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  version: number;
  parent_id: string | null;
  creator_id: string;
  creator: User;
  created_at: string;
  updated_at: string;
  category_id?: string | null; // 添加分类字段
  average_rating?: number;
  rating_count?: number;
  usage_stats?: {
    views: number;
    copies: number;
    applies: number;
    forks: number;
  };
  usage_count?: number; // 用于热门提示词列表
  user?: { // 用于热门提示词列表
    id: string;
    username: string;
  };
}

export interface PromptHistory {
  id: string;
  prompt_id: string;
  version: number;
  snapshot: {
    title: string;
    content: string;
    description: string;
    tags: string[];
  };
  created_at: string;
}

export interface PromptCreate {
  title: string;
  content: string;
  description?: string;
  tags?: string[];
  category_id?: string;
  parent_id?: string;
}

export interface PromptUpdate {
  title?: string;
  content?: string;
  description?: string;
  tags?: string[];
  category_id?: string;
  parent_id?: string;
}

export interface SearchResult {
  data: Prompt[];
  total: number;
  page: number;
  size: number;
}

export interface TagCount {
  tag: string;
  count: number;
}

// 获取提示词列表
export const getPrompts = async (page = 1, size = 10): Promise<SearchResult> => {
  try {
    console.log(`获取提示词列表: 页码=${page}, 每页数量=${size}`);
    const response = await api.get<SearchResult>(`/api/prompts?skip=${(page - 1) * size}&limit=${size}`);
    
    // 输出返回的数据以进行调试
    console.log('提示词列表数据:', response.data);
    
    // 确保每个提示词都有评分相关字段
    if (response.data && response.data.data) {
      response.data.data = response.data.data.map(prompt => ({
        ...prompt,
        average_rating: prompt.average_rating !== undefined ? prompt.average_rating : 0,
        rating_count: prompt.rating_count !== undefined ? prompt.rating_count : 0
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error('获取提示词列表失败:', error);
    throw error;
  }
};

// 获取单个提示词
export const getPromptById = async (id: string): Promise<Prompt> => {
  console.log('AUTH_DEBUG: getPromptById 被调用, id:', id);
  try {
    console.log(`AUTH_DEBUG: 发送API请求: /api/prompts/${id}`);
    const response = await api.get<Prompt>(`/api/prompts/${id}`);
    console.log('AUTH_DEBUG: 获取提示词成功:', response.data ? '有数据' : '无数据');
    return response.data;
  } catch (error: any) {
    console.log('AUTH_DEBUG: 获取提示词失败:', error);
    console.log('AUTH_DEBUG: 错误状态码:', error.response?.status);
    console.log('AUTH_DEBUG: 错误信息:', error.response?.data || error.message);
    throw error;
  }
};

// 创建提示词
export const createPrompt = async (promptData: PromptCreate): Promise<Prompt> => {
  const response = await api.post<Prompt>('/api/prompts', promptData);
  return response.data;
};

// 更新提示词
export const updatePrompt = async (id: string, promptData: PromptUpdate): Promise<Prompt> => {
  const response = await api.put<Prompt>(`/api/prompts/${id}`, promptData);
  return response.data;
};

// 删除提示词
export const deletePrompt = async (id: string): Promise<void> => {
  await api.delete(`/api/prompts/${id}`);
};

// 获取提示词历史记录
export const getPromptHistories = async (id: string): Promise<PromptHistory[]> => {
  const response = await api.get<PromptHistory[]>(`/api/prompts/${id}/histories`);
  return response.data;
};

// Fork提示词
export const forkPrompt = async (id: string): Promise<Prompt> => {
  console.log(`[前端] 开始fork提示词: id=${id}`);
  try {
    console.log(`[前端] 发送fork请求: /api/prompts/${id}/fork`);
    const response = await api.post<Prompt>(`/api/prompts/${id}/fork`);
    console.log(`[前端] Fork提示词成功:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[前端] Fork提示词失败:`, error);
    console.error(`[前端] 错误详情:`, error.response?.data || error.message);
    console.error(`[前端] 错误状态码:`, error.response?.status);
    throw error;
  }
};

// 搜索提示词
export const searchPrompts = async (
  query: string = '',  // 设置默认值为空字符串
  tags?: string[],
  page = 1,
  size = 10
): Promise<SearchResult> => {
  try {
    // 构建基本URL，确保q参数始终存在，即使是空字符串
    let url = `/api/search/prompts?q=${encodeURIComponent(query || '')}&skip=${(page - 1) * size}&limit=${size}`;
    
    // 添加标签参数
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        url += `&tags=${encodeURIComponent(tag)}`;
      });
    }
    
    console.log('搜索API请求URL:', url); // 添加日志以便调试
    const response = await api.get<SearchResult>(url);
    return response.data;
  } catch (error) {
    console.error('搜索提示词API调用失败:', error);
    throw error; // 重新抛出错误以便上层组件处理
  }
};

// 获取热门标签
export const getPopularTags = async (limit = 20): Promise<TagCount[]> => {
  const response = await api.get<TagCount[]>(`/api/search/tags/popular?limit=${limit}`);
  return response.data;
};

// 获取相似提示词
export const getSimilarPrompts = async (id: string, limit = 5): Promise<Prompt[]> => {
  const response = await api.get<Prompt[]>(`/api/search/prompts/${id}/similar?limit=${limit}`);
  return response.data;
};

// 获取热门提示词
export const getPopularPrompts = async (limit = 5): Promise<Prompt[]> => {
  console.log('[prompts.service] 开始获取热门提示词:', { limit });
  try {
    // 尝试使用正确的API端点和参数
    const response = await api.get<SearchResult>('/api/prompts', {
      params: { 
        limit,
        sort_by: 'usage_count',
        sort_order: 'desc'
      }
    });
    console.log('[prompts.service] 获取热门提示词成功:', response.data);
    return response.data.data || [];
  } catch (error) {
    console.error('[prompts.service] 获取热门提示词失败:', error);
    
    // 尝试从usage API获取热门提示词
    try {
      console.log('[prompts.service] 尝试从usage API获取热门提示词');
      const usageResponse = await api.get('/api/usage/popular', {
        params: { limit }
      });
      if (usageResponse.data && Array.isArray(usageResponse.data.data)) {
        console.log('[prompts.service] 从usage API获取热门提示词成功:', usageResponse.data);
        return usageResponse.data.data || [];
      }
    } catch (usageError) {
      console.error('[prompts.service] 从usage API获取热门提示词失败:', usageError);
    }
    
    // 使用普通提示词查询作为备选
    try {
      console.log('[prompts.service] 尝试获取所有提示词并手动排序');
      const fallbackResponse = await api.get<SearchResult>('/api/prompts', {
        params: { limit: 100 } // 获取更多提示词以便排序
      });
      
      if (fallbackResponse.data && Array.isArray(fallbackResponse.data.data)) {
        // 手动按使用次数排序
        const sortedPrompts = [...fallbackResponse.data.data].sort((a, b) => {
          const usageA = a.usage_count || 0;
          const usageB = b.usage_count || 0;
          return usageB - usageA; // 降序排序
        }).slice(0, limit);
        
        console.log('[prompts.service] 手动排序后的热门提示词:', sortedPrompts);
        return sortedPrompts;
      }
      return fallbackResponse.data.data || [];
    } catch {
      // 如果普通提示词查询也失败，返回空数组
      return [];
    }
  }
};
