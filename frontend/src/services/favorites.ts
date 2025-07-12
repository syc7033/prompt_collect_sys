import api from './api';

export interface Favorite {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface FavoriteCreateData {
  name: string;
}

export interface FavoriteUpdateData {
  name: string;
}

export interface PromptInFavorite {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  version: number;
  user: {
    id: string;
    username: string;
  };
  created_at: string;
  updated_at: string;
}

// 获取用户的所有收藏夹
export const getFavorites = async () => {
  console.log('[favorites.service] 开始获取收藏夹');
  try {
    // 添加时间戳参数避免缓存
    const timestamp = new Date().getTime();
    const response = await api.get(`/api/favorites?_t=${timestamp}`);
    console.log('[favorites.service] 获取收藏夹成功:', response.data);
    
    // 处理不同的数据格式
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && typeof response.data === 'object') {
      // 尝试其他可能的数据格式
      const possibleDataFields = ['items', 'favorites', 'results', 'list'];
      for (const field of possibleDataFields) {
        if (Array.isArray(response.data[field])) {
          return response.data[field];
        }
      }
    }
    
    // 如果没有识别出数组格式，返回空数组
    console.warn('[favorites.service] 无法识别响应数据格式，返回空数组');
    return [];
  } catch (error) {
    console.error('[favorites.service] 获取收藏夹失败:', error);
    // 返回空数组，不再返回模拟数据
    return [];
  }
};

// 获取单个收藏夹
export const getFavorite = async (favoriteId: string) => {
  try {
    const response = await api.get(`/api/favorites/${favoriteId}`);
    return response.data;
  } catch (error) {
    console.error(`获取收藏夹 ${favoriteId} 失败:`, error);
    throw error;
  }
};

// 创建收藏夹
export const createFavorite = async (data: FavoriteCreateData) => {
  try {
    const response = await api.post('/api/favorites', data);
    return response.data;
  } catch (error) {
    console.error('创建收藏夹失败:', error);
    throw error;
  }
};

// 更新收藏夹
export const updateFavorite = async (favoriteId: string, data: FavoriteUpdateData) => {
  try {
    const response = await api.put(`/api/favorites/${favoriteId}`, data);
    return response.data;
  } catch (error) {
    console.error(`更新收藏夹 ${favoriteId} 失败:`, error);
    throw error;
  }
};

// 删除收藏夹
export const deleteFavorite = async (favoriteId: string) => {
  try {
    const response = await api.delete(`/api/favorites/${favoriteId}`);
    return response.data;
  } catch (error) {
    console.error(`删除收藏夹 ${favoriteId} 失败:`, error);
    throw error;
  }
};

// 获取收藏夹中的提示词
export const getFavoritePrompts = async (favoriteId: string, page = 1, pageSize = 8) => {
  try {
    const response = await api.get(`/api/favorites/${favoriteId}/prompts`, {
      params: { skip: (page - 1) * pageSize, limit: pageSize }
    });
    return response.data;
  } catch (error) {
    console.error(`获取收藏夹 ${favoriteId} 中的提示词失败:`, error);
    throw error;
  }
};

// 将提示词添加到收藏夹
export const addPromptToFavorite = async (favoriteId: string, promptId: string) => {
  try {
    const response = await api.post(`/api/favorites/${favoriteId}/prompts/${promptId}`);
    return response.data;
  } catch (error) {
    console.error(`将提示词 ${promptId} 添加到收藏夹 ${favoriteId} 失败:`, error);
    throw error;
  }
};

// 从收藏夹中移除提示词
export const removePromptFromFavorite = async (favoriteId: string, promptId: string) => {
  try {
    const response = await api.delete(`/api/favorites/${favoriteId}/prompts/${promptId}`);
    return response.data;
  } catch (error) {
    console.error(`从收藏夹 ${favoriteId} 中移除提示词 ${promptId} 失败:`, error);
    throw error;
  }
};

// 检查提示词是否在收藏夹中
export const checkPromptInFavorite = async (favoriteId: string, promptId: string) => {
  try {
    const response = await api.get(`/api/favorites/${favoriteId}/prompts/${promptId}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { in_favorite: false };
    }
    console.error(`检查提示词 ${promptId} 是否在收藏夹 ${favoriteId} 中失败:`, error);
    throw error;
  }
};

// 检查提示词是否被任何收藏夹收藏
export const checkPromptInAnyFavorite = async (promptId: string) => {
  try {
    console.log(`[收藏状态] 检查提示词 ${promptId} 是否被收藏`);
    try {
      const response = await api.get(`/api/prompts/${promptId}/favorites/check`);
      console.log(`[收藏状态] 检查结果:`, response.data);
      return response.data;
    } catch (apiError: any) {
      // 如果后端API不支持这个端点，则使用替代方案
      console.log(`[收藏状态] API请求失败，状态码:`, apiError.response?.status);
      console.log(`[收藏状态] 使用替代方案检查收藏状态`);
    }
    
    // 获取所有收藏夹，然后逐个检查
    console.log(`[收藏状态] 开始获取所有收藏夹`);
    const favoritesResponse = await api.get('/api/favorites');
    console.log(`[收藏状态] 收藏夹原始响应:`, favoritesResponse.data);
    
    let favorites = [];
    if (Array.isArray(favoritesResponse.data)) {
      favorites = favoritesResponse.data;
      console.log(`[收藏状态] 收藏夹数据是数组格式`);
    } else if (favoritesResponse.data?.data && Array.isArray(favoritesResponse.data.data)) {
      favorites = favoritesResponse.data.data;
      console.log(`[收藏状态] 收藏夹数据是对象格式，使用data属性`);
    } else {
      console.log(`[收藏状态] 无法解析收藏夹数据格式:`, favoritesResponse.data);
      return { is_favorited: false, error: '无法解析收藏夹数据' };
    }
    
    console.log(`[收藏状态] 获取到 ${favorites.length} 个收藏夹:`, favorites.map((f: any) => ({ id: f.id, name: f.name })));
    
    // 逐个检查收藏夹
    for (const favorite of favorites) {
      console.log(`[收藏状态] 检查收藏夹 ${favorite.name} (${favorite.id})`);
      
      try {
        // 先检查收藏夹中的所有提示词
        console.log(`[收藏状态] 获取收藏夹 ${favorite.id} 的所有提示词`);
        const promptsResponse = await api.get(`/api/favorites/${favorite.id}/prompts`);
        console.log(`[收藏状态] 收藏夹提示词原始响应:`, promptsResponse.data);
        
        let prompts = [];
        if (Array.isArray(promptsResponse.data)) {
          prompts = promptsResponse.data;
        } else if (promptsResponse.data?.data && Array.isArray(promptsResponse.data.data)) {
          prompts = promptsResponse.data.data;
        } else {
          console.log(`[收藏状态] 无法解析收藏夹提示词数据格式:`, promptsResponse.data);
          continue;
        }
        
        console.log(`[收藏状态] 收藏夹 ${favorite.name} 中有 ${prompts.length} 个提示词`);
        
        // 检查提示词是否在收藏夹中
        console.log(`[收藏状态] 正在检查提示词 ID: ${promptId} (类型: ${typeof promptId})`);
        console.log(`[收藏状态] 收藏夹中的提示词 ID:`, prompts.map((p: any) => ({ id: p.id, type: typeof p.id })));
        
        // 尝试不同的比较方式
        const foundExact = prompts.some((p: any) => p.id === promptId);
        const foundString = prompts.some((p: any) => String(p.id) === String(promptId));
        const foundLowerCase = prompts.some((p: any) => String(p.id).toLowerCase() === String(promptId).toLowerCase());
        
        console.log(`[收藏状态] 比较结果 - 精确匹配: ${foundExact}, 字符串匹配: ${foundString}, 忽略大小写: ${foundLowerCase}`);
        
        if (foundExact || foundString || foundLowerCase) {
          const matchedPrompt = prompts.find((p: any) => 
            p.id === promptId || 
            String(p.id) === String(promptId) || 
            String(p.id).toLowerCase() === String(promptId).toLowerCase()
          );
          
          console.log(`[收藏状态] 找到提示词 ${promptId} 在收藏夹 ${favorite.name} 中`);
          console.log(`[收藏状态] 匹配的提示词详情:`, matchedPrompt);
          
          return { 
            is_favorited: true, 
            favorite_id: favorite.id,
            favorite_name: favorite.name,
            matched_prompt_id: matchedPrompt?.id
          };
        }
        
        // 如果上面的方法没有找到，尝试使用单个检查API
        try {
          console.log(`[收藏状态] 尝试使用单个检查API检查收藏夹 ${favorite.id} 中的提示词 ${promptId}`);
          const checkResponse = await checkPromptInFavorite(favorite.id, promptId);
          console.log(`[收藏状态] 单个检查结果:`, checkResponse);
          
          if (checkResponse && checkResponse.in_favorite) {
            console.log(`[收藏状态] 单个检查确认提示词在收藏夹 ${favorite.name} 中`);
            return { 
              is_favorited: true, 
              favorite_id: favorite.id,
              favorite_name: favorite.name 
            };
          }
        } catch (checkError) {
          console.error(`[收藏状态] 单个检查出错:`, checkError);
        }
      } catch (promptsError) {
        console.error(`[收藏状态] 获取收藏夹提示词失败:`, promptsError);
      }
    }
    
    // 所有收藏夹都检查完毕，未找到
    console.log(`[收藏状态] 所有收藏夹检查完毕，未找到提示词 ${promptId}`);
    return { is_favorited: false };
  } catch (error) {
    console.error(`[收藏状态] 检查提示词收藏状态失败:`, error);
    return { is_favorited: false, error: '检查失败' };
  }
};

// 取消提示词的收藏状态
export const unfavoritePrompt = async (promptId: string) => {
  try {
    console.log(`[收藏状态] 开始取消提示词 ${promptId} 的收藏`);
    
    // 先检查提示词在哪个收藏夹中
    const favoriteStatus = await checkPromptInAnyFavorite(promptId);
    
    if (favoriteStatus.is_favorited && favoriteStatus.favorite_id) {
      // 从收藏夹中移除提示词
      console.log(`[收藏状态] 从收藏夹 ${favoriteStatus.favorite_id} 中移除提示词`);
      const response = await api.delete(`/api/favorites/${favoriteStatus.favorite_id}/prompts/${promptId}`);
      return { success: true, message: '已取消收藏' };
    } else {
      return { success: false, message: '提示词未被收藏' };
    }
  } catch (error) {
    console.error(`[收藏状态] 取消收藏失败:`, error);
    throw error;
  }
};
