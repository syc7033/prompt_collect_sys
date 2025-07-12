import api from './api';
import { AxiosResponse } from 'axios';

export enum UsageType {
  VIEW = 'view',
  COPY = 'copy',
  APPLY = 'apply',
  FORK = 'fork'
}

export interface UsageStat {
  prompt_id: string;
  total_usages: number;
  copy_count: number;
  apply_count: number;
  view_count: number;
  fork_count: number;
}

export interface Usage {
  id: string;
  prompt_id: string;
  user_id: string | null;
  usage_type: string;
  created_at: string;
}

export interface UsageResponse {
  data: Usage[];
  total: number;
  page: number;
  size: number;
}

export interface PopularPrompt {
  prompt_id: string;
  title: string;
  description: string | null;
  usage_count: number;
  creator_username: string;
  average_rating: number | null;
  rating_count: number | null;
}

export interface PopularPromptsResponse {
  data: PopularPrompt[];
  total: number;
  page: number;
  size: number;
}

/**
 * 记录提示词使用
 * @param promptId 提示词ID
 * @param usageType 使用类型
 */
export const recordUsage = async (promptId: string, usageType: UsageType): Promise<any> => {
  console.log('%c[usage.service] 开始记录提示词使用', 'background: #3F51B5; color: white', {
    promptId,
    usageType,
    endpoint: `/api/usage/prompts/${promptId}/${usageType}`
  });
  
  try {
    const response: AxiosResponse = await api.post(`/api/usage/prompts/${promptId}/${usageType}`);
    console.log('%c[usage.service] 记录提示词使用成功', 'background: #4CAF50; color: white', {
      promptId,
      usageType,
      response: response.data
    });
    return response.data;
  } catch (error) {
    console.error('%c[usage.service] 记录提示词使用失败', 'background: #F44336; color: white', {
      promptId,
      usageType,
      error
    });
    throw error;
  }
};

/**
 * 获取提示词的使用统计
 * @param promptId 提示词ID
 */
export const getUsageStats = async (promptId: string): Promise<UsageStat> => {
  console.log('%c[usage.service] 开始获取提示词使用统计', 'background: #3F51B5; color: white', {
    promptId,
    endpoint: `/api/usage/prompts/${promptId}/stats`
  });
  
  try {
    const response: AxiosResponse = await api.get(`/api/usage/prompts/${promptId}/stats`);
    console.log('%c[usage.service] 获取提示词使用统计成功', 'background: #4CAF50; color: white', {
      promptId,
      data: response.data.data
    });
    return response.data.data;
  } catch (error) {
    console.error('%c[usage.service] 获取提示词使用统计失败', 'background: #F44336; color: white', {
      promptId,
      error
    });
    throw error;
  }
};

/**
 * 获取提示词的使用记录
 * @param promptId 提示词ID
 * @param page 页码
 * @param pageSize 每页数量
 */
export const getUsageRecords = async (
  promptId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<UsageResponse> => {
  const skip = (page - 1) * pageSize;
  const endpoint = `/api/usage/prompts/${promptId}?skip=${skip}&limit=${pageSize}`;
  
  console.log('%c[usage.service] 开始获取提示词使用记录', 'background: #3F51B5; color: white', {
    promptId,
    page,
    pageSize,
    endpoint
  });
  
  try {
    const response: AxiosResponse = await api.get(endpoint);
    console.log('%c[usage.service] 获取提示词使用记录成功', 'background: #4CAF50; color: white', {
      promptId,
      data: response.data
    });
    return response.data;
  } catch (error) {
    console.error('%c[usage.service] 获取提示词使用记录失败', 'background: #F44336; color: white', {
      promptId,
      page,
      pageSize,
      error
    });
    throw error;
  }
};

/**
 * 获取热门提示词
 * @param timeRange 时间范围（天）
 * @param page 页码
 * @param pageSize 每页数量
 */
export const getPopularPrompts = async (
  timeRange?: number,
  page: number = 1,
  pageSize: number = 10
): Promise<PopularPromptsResponse> => {
  let url = `/api/usage/popular?skip=${(page - 1) * pageSize}&limit=${pageSize}`;
  if (timeRange) {
    url += `&time_range=${timeRange}`;
  }
  
  console.log('%c[usage.service] 开始获取热门提示词', 'background: #3F51B5; color: white', {
    timeRange,
    page,
    pageSize,
    endpoint: url
  });
  
  try {
    const response: AxiosResponse = await api.get(url);
    console.log('%c[usage.service] 获取热门提示词成功', 'background: #4CAF50; color: white', {
      dataCount: response.data.data?.length || 0,
      total: response.data.total
    });
    return response.data;
  } catch (error) {
    console.error('%c[usage.service] 获取热门提示词失败', 'background: #F44336; color: white', {
      timeRange,
      page,
      pageSize,
      error
    });
    throw error;
  }
};
