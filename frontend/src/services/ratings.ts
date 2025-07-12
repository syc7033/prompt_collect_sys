import api from './api';
import { AxiosResponse } from 'axios';

export interface Rating {
  id: string;
  prompt_id: string;
  user_id: string;
  score: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user_username: string;
  helpful_count: number;
  is_helpful: boolean;
}

export interface RatingResponse {
  data: Rating[];
  total: number;
  page: number;
  size: number;
}

export interface RatingCreate {
  score: number;
  comment?: string;
}

/**
 * 创建或更新评分
 * @param promptId 提示词ID
 * @param data 评分数据
 */
export const createRating = async (promptId: string, data: RatingCreate): Promise<any> => {
  try {
    const response: AxiosResponse = await api.post(`/api/ratings/prompts/${promptId}`, data);
    return response.data;
  } catch (error) {
    console.error('创建评分失败:', error);
    throw error;
  }
};

/**
 * 获取提示词的评分列表
 * @param promptId 提示词ID
 * @param page 页码
 * @param pageSize 每页数量
 */
export const getRatingsByPrompt = async (
  promptId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<RatingResponse> => {
  try {
    const skip = (page - 1) * pageSize;
    const response: AxiosResponse = await api.get(`/api/ratings/prompts/${promptId}?skip=${skip}&limit=${pageSize}`);
    return response.data;
  } catch (error) {
    console.error('获取评分列表失败:', error);
    throw error;
  }
};

/**
 * 标记评分为有用
 * @param ratingId 评分ID
 */
export const markRatingHelpful = async (ratingId: string): Promise<any> => {
  try {
    const response: AxiosResponse = await api.post(`/api/ratings/${ratingId}/helpful`);
    return response.data;
  } catch (error) {
    console.error('标记评分为有用失败:', error);
    throw error;
  }
};

/**
 * 删除评分
 * @param ratingId 评分ID
 */
export const deleteRating = async (ratingId: string): Promise<void> => {
  try {
    await api.delete(`/api/ratings/${ratingId}`);
  } catch (error) {
    console.error('删除评分失败:', error);
    throw error;
  }
};

