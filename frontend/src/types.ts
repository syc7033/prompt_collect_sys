// 用户类型定义
export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  profession?: string;
  interests?: string;
  is_superuser?: boolean;
  created_at: string;
  updated_at?: string;
  prompt_count?: number;
  favorite_count?: number;
}

// 提示词类型定义
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  version: number;
  parent_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  usage_count?: number;
  rating?: number;
  rating_count?: number;
}

// 收藏夹类型定义
export interface Favorite {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  prompt_count?: number;
}

// 用户提示词列表项
export interface UserPromptListItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  version: number;
  created_at: string;
  updated_at: string;
  usage_count: number;
  rating?: number;
  rating_count?: number;
}

// 用户收藏夹列表项
export interface UserFavoriteListItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  prompt_count: number;
}

// 用户统计数据
export interface ProfileStatistics {
  prompt_count: number;
  favorite_count: number;
  total_prompt_usage: number;
  total_prompt_rating: number;
  top_tags?: { tag: string; count: number }[];
}

// API 响应类型
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
  error?: string;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// 提示词搜索参数
export interface PromptSearchParams extends PaginationParams {
  q?: string;
  tags?: string[];
  user_id?: string;
}
