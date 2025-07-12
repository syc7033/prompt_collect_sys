import api from './api';

// 用户类型定义
interface User {
  id: string;
  username: string;
  avatar: string | null;
  [key: string]: any; // 允许其他属性
}

export interface StatData {
  total_prompts: number;
  total_users: number;
  total_usages: number;
  prompts_today: number;
}

// 活跃用户类型
export interface ActiveUser {
  id: string;
  username: string;
  prompt_count: number;
  avatar: string | null;
}

// 获取平台统计数据
export const getStats = async (): Promise<StatData> => {
  console.log('[stats.service] 开始获取平台统计数据');
  
  try {
    // 直接从新的统计API端点获取数据
    console.log('[stats.service] 请求统计数据: /api/stats/dashboard');
    const response = await api.get('/api/stats/dashboard');
    console.log('[stats.service] 获取统计数据成功:', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('[stats.service] 获取统计数据失败:', error);
    
    // 如果新API失败，返回默认数据
    const fallbackData: StatData = {
      total_prompts: 0,
      total_users: 0,
      total_usages: 0,
      prompts_today: 0
    };
    console.log('[stats.service] 返回默认数据:', JSON.stringify(fallbackData));
    return fallbackData;
  }
};

// 获取活跃用户列表
export const getActiveUsers = async (limit = 5): Promise<ActiveUser[]> => {
  console.log('[stats.service] 开始获取活跃用户列表');
  try {
    // 直接从新的统计API端点获取数据
    console.log(`[stats.service] 请求活跃用户数据: /api/stats/active-users?limit=${limit}`);
    const response = await api.get(`/api/stats/active-users?limit=${limit}`);
    console.log('[stats.service] 获取活跃用户成功:', JSON.stringify(response.data));
    
    // 新API返回的数据格式为 { data: ActiveUser[], total: number }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    throw new Error('活跃用户数据格式不正确');
  } catch (error) {
    console.error('[stats.service] 获取活跃用户失败:', error);
    
    // 如果新API失败，返回空数组
    return [];
  }
};

// 热门提示词信息
export interface PopularPrompt {
  id: string;
  title: string;
  description: string;
  usage_count: number;
  creator_name: string;
  creator_id: string;
}

// 热门提示词响应
export interface PopularPromptsResponse {
  data: PopularPrompt[];
  total: number;
}

// 获取热门提示词排行
export const getPopularPrompts = async (limit = 10, timeRange?: number): Promise<PopularPrompt[]> => {
  console.log('[stats.service] 开始获取热门提示词排行');
  try {
    // 构建请求URL
    let url = `/api/stats/top-prompts?limit=${limit}`;
    if (timeRange) {
      url += `&time_range=${timeRange}`;
    }
    
    console.log(`[stats.service] 请求热门提示词数据: ${url}`);
    const response = await api.get(url);
    console.log('[stats.service] 获取热门提示词成功:', JSON.stringify(response.data));
    
    // 新API返回的数据格式为 { data: PopularPrompt[], total: number }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    throw new Error('热门提示词数据格式不正确');
  } catch (error) {
    console.error('[stats.service] 获取热门提示词失败:', error);
    
    // 如果新API失败，返回空数组
    return [];
  }
};

// 获取热门标签
export const getPopularTags = async (limit = 20) => {
  console.log(`[热门标签] 开始获取热门标签，限制数量: ${limit}`);
  try {
    // 记录请求参数
    const requestParams = { 
      limit,
      sort_by: 'count',
      sort_order: 'desc'
    };
    console.log(`[热门标签] 请求参数:`, requestParams);
    
    // 发送请求
    console.log(`[热门标签] 发送请求到: /api/search/tags/popular`);
    const response = await api.get('/api/search/tags/popular', {
      params: requestParams
    });
    
    // 记录原始响应
    console.log(`[热门标签] 获取响应状态码:`, response.status);
    console.log(`[热门标签] 原始响应数据:`, response.data);
    
    // 处理响应数据
    let tags = [];
    if (response.data && Array.isArray(response.data)) {
      console.log(`[热门标签] 响应数据是数组格式`);
      tags = response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log(`[热门标签] 响应数据是对象格式，使用data属性`);
      tags = response.data.data;
    } else {
      console.log(`[热门标签] 响应数据格式不符合预期:`, response.data);
      tags = [];
    }
    
    console.log(`[热门标签] 处理后的标签数据:`, tags);
    console.log(`[热门标签] 获取到 ${tags.length} 个标签`);
    
    return tags;
  } catch (error: any) {
    console.error(`[热门标签] 获取热门标签失败:`, error);
    console.error(`[热门标签] 错误状态码:`, error.response?.status);
    console.error(`[热门标签] 错误消息:`, error.message);
    
    // 模拟数据用于测试
    console.log('[\u70ed\u95e8\u6807\u7b7e] \u8fd4\u56de\u6a21\u62df\u6570\u636e\u7528\u4e8e\u6d4b\u8bd5');
    const mockData = [
      { name: 'GPT-4', count: 35 },
      { name: 'ChatGPT', count: 28 },
      { name: '代码生成', count: 22 },
      { name: '文本生成', count: 18 },
      { name: '图像生成', count: 15 },
      { name: '翻译', count: 12 },
      { name: '数据分析', count: 10 },
      { name: '文案写作', count: 8 },
      { name: 'AI绘画', count: 7 },
      { name: '问答系统', count: 6 }
    ];
    console.log(`[热门标签] 模拟数据:`, mockData);
    return mockData;
  }
};

// 获取相关资源
export const getResources = async () => {
  console.log('[stats.service] 开始获取相关资源');
  try {
    // 模拟API调用，实际项目中应替换为真实API
    // 这里使用静态数据作为示例
    const resources = [
      {
        title: 'ChatGPT官方网站',
        url: 'https://chat.openai.com',
        description: 'OpenAI开发的对话式人工智能'
      },
      {
        title: 'Prompt Engineering指南',
        url: 'https://www.promptingguide.ai',
        description: '学习如何编写高效的AI提示词'
      },
      {
        title: 'AI模型库',
        url: 'https://huggingface.co',
        description: '发现和使用最新的AI模型'
      }
    ];
    console.log('[stats.service] 获取相关资源成功:', resources);
    return resources;
  } catch (error) {
    console.error('[stats.service] 获取相关资源失败:', error);
    throw error;
  }
};
