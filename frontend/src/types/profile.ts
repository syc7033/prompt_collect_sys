// 用户个人资料类型
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  display_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  profession?: string | null;
  interests?: string | null;
  is_superuser: boolean;
  created_at: string;
  prompt_count: number;
  favorite_count: number;
}

// 用户统计数据类型
export interface ProfileStatistics {
  prompt_count: number;
  favorite_count: number;
  total_prompt_usage: number;
  total_prompt_rating: number;
}

// 用户提示词列表项类型
export interface UserPrompt {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  version: number;
  created_at: string;
  updated_at: string;
  usage_count: number;
  average_rating: number;
}

// 用户收藏夹列表项类型
export interface UserFavorite {
  id: string;
  name: string;
  created_at: string;
  prompt_count: number;
}
