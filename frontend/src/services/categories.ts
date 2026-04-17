import api from './api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  children?: Category[];
  prompt_count: number;
  children_count?: number; // 新增子节点数量字段
  created_at: string;
  updated_at: string;
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  children?: CategoryTreeNode[];
}


// 确保在处理过程中保留children属性
export const ensureChildrenProperty = (categories: Category[]): Category[] => {
  console.log('[categories.service] 确保保留children属性，处理前:', categories);
  
  // 递归处理每个分类及其子分类
  const processCategory = (category: any): Category => {
    // 创建一个新对象，确保包含所有属性
    const processedCategory: Category = {
      id: category.id,
      name: category.name,
      description: category.description,
      parent_id: category.parent_id,
      prompt_count: category.prompt_count || 0,
      children_count: category.children_count || 0, // 添加子节点数量
      created_at: category.created_at,
      updated_at: category.updated_at,
      // 明确处理children属性
      children: Array.isArray(category.children) 
        ? category.children.map((child: any) => processCategory(child))
        : []
    };
    
    return processedCategory;
  };
  
  // 处理所有顶级分类
  const result = categories.map(category => processCategory(category));
  
  console.log('[categories.service] 确保保留children属性，处理后:', result);
  return result;
}

export interface CategoryCreateData {
  name: string;
  description?: string;
  parent_id?: string;
}

export interface CategoryUpdateData {
  name?: string;
  description?: string;
  parent_id?: string | null;
}

// 获取所有分类
export const getCategories = async (parentId?: string | null) => {
  console.log('[categories.service] 开始获取分类', parentId ? `父分类 ID: ${parentId}` : '所有分类', new Date().toISOString());
  try {
    const timestamp = new Date().getTime();
    const response = await api.get(`/api/categories?_t=${timestamp}`, {
      params: parentId !== undefined ? { parent_id: parentId } : {}
    });
    console.log('[categories.service] 获取分类成功:', response.data);
    console.log('[categories.service] 返回的数据类型:', typeof response.data);
    console.log('[categories.service] 返回的数据结构:', JSON.stringify(response.data));
    
    // 检查响应数据结构
    // 判断响应数据的结构
    let result;
    if (Array.isArray(response.data)) {
      // 如果响应数据直接是数组
      result = response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // 如果响应数据是包含 data 属性的对象
      result = response.data.data;
    } else {
      // 其他情况返回空数组
      result = [];
    }
    console.log('[categories.service] 处理后的分类数据:', result.length, '条记录');
    return result;
  } catch (error) {
    console.error('[categories.service] 获取分类失败:', error);
    // 返回模拟数据
    console.log('[categories.service] 返回空数组');
    return [];
  }
};

// 获取分类树
export const getCategoryTree = async () => {
  console.log('[categories.service] 开始获取分类树', new Date().toISOString());
  try {
    const timestamp = new Date().getTime();
    const response = await api.get(`/api/categories/tree?_t=${timestamp}`);
    console.log('[categories.service] 获取分类树成功:', response.data);
    console.log('[categories.service] 分类树数据类型:', typeof response.data);
    console.log('[categories.service] 原始响应数据:', JSON.stringify(response.data, null, 2));
    
    // 检查是否有子分类
    const hasChildren = (data: any): boolean => {
      if (Array.isArray(data)) {
        return data.some((item: any) => item.children && item.children.length > 0);
      } else if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
        return data.data.some((item: any) => item.children && item.children.length > 0);
      }
      return false;
    };
    
    console.log('[categories.service] 原始数据是否包含子分类:', hasChildren(response.data));
    
    // 判断响应数据的结构
    let result;
    if (Array.isArray(response.data)) {
      // 如果响应数据直接是数组
      result = response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // 如果响应数据是包含 data 属性的对象
      result = response.data.data;
    } else {
      // 其他情况返回空数组
      result = [];
    }
    
    // 检查结果中是否有分类
    if (result.length === 0) {
      console.log('[categories.service] 未获取到任何分类数据');
      return [];
    }
    
    // 使用 ensureChildrenProperty 确保保留 children 属性
    const processedResult = ensureChildrenProperty(result);
    
    // 检查处理后的数据是否有子分类
    const hasChildrenInResult = processedResult.some((item: any) => item.children && item.children.length > 0);
    console.log('[categories.service] 处理后的数据是否包含子分类:', hasChildrenInResult);
    
    // 打印每个顶级分类的子分类数量
    processedResult.forEach((category: Category) => {
      const childrenCount = category.children ? category.children.length : 0;
      console.log(`[categories.service] 分类 ${category.name} (ID: ${category.id}) 有 ${childrenCount} 个子分类`);
      if (childrenCount > 0) {
        console.log(`[categories.service] ${category.name} 的子分类:`, category.children!.map(c => c.name).join(', '));
      }
    });
    
    // 返回结果
    console.log('[categories.service] 返回分类树数据，共', processedResult.length, '个顶级分类');
    return processedResult;
  } catch (error) {
    console.error('[categories.service] 获取分类树失败:', error);
    // 模拟数据用于测试
    console.log('[categories.service] 返回模拟数据用于测试');
    // 返回一些模拟的分类数据
    return [
      {
        id: '1',
        name: '前端开发',
        description: '前端相关的提示词',
        children: [
          { id: '1-1', name: 'React', description: 'React相关的提示词' },
          { id: '1-2', name: 'Vue', description: 'Vue相关的提示词' }
        ]
      },
      {
        id: '2',
        name: '后端开发',
        description: '后端相关的提示词',
        children: [
          { id: '2-1', name: 'Python', description: 'Python相关的提示词' },
          { id: '2-2', name: 'Java', description: 'Java相关的提示词' }
        ]
      },
      {
        id: '3',
        name: '数据库',
        description: '数据库相关的提示词',
        children: []
      }
    ];
  }
};

// 获取单个分类
export const getCategory = async (categoryId: string) => {
  try {
    const response = await api.get(`/api/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`获取分类 ${categoryId} 失败:`, error);
    throw error;
  }
};

// 创建分类
export const createCategory = async (data: CategoryCreateData) => {
  console.log('[categories.service] 开始创建分类:', data, new Date().toISOString());
  try {
    const response = await api.post('/api/categories', data);
    console.log('[categories.service] 创建分类成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('[categories.service] 创建分类失败:', error);
    throw error;
  }
};

// 更新分类
export const updateCategory = async (categoryId: string, data: CategoryUpdateData) => {
  try {
    const response = await api.put(`/api/categories/${categoryId}`, data);
    return response.data;
  } catch (error) {
    console.error(`更新分类 ${categoryId} 失败:`, error);
    throw error;
  }
};

// 删除分类
export const deleteCategory = async (categoryId: string) => {
  try {
    const response = await api.delete(`/api/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`删除分类 ${categoryId} 失败:`, error);
    throw error;
  }
};

// 获取分类下的提示词
// 获取带子节点计数的分类树
export const getCategoryTreeWithCounts = async () => {
  console.log('[categories.service] 开始获取带子节点计数的分类树', new Date().toISOString());
  try {
    const timestamp = new Date().getTime();
    const response = await api.get(`/api/categories/tree-with-counts?_t=${timestamp}`);
    console.log('[categories.service] 获取带子节点计数的分类树成功:', response.data);
    console.log('[categories.service] 分类树数据类型:', typeof response.data);
    
    // 处理响应数据
    let result;
    if (Array.isArray(response.data)) {
      result = response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      result = response.data.data;
    } else {
      result = [];
    }
    
    // 确保每个分类都有正确的属性
    return ensureChildrenProperty(result);
  } catch (error) {
    console.error('[categories.service] 获取带子节点计数的分类树失败:', error);
    // 返回空数组
    return [];
  }
};

export const getCategoryPrompts = async (categoryId: string, page = 1, pageSize = 8) => {
  try {
    console.log(`[categories.service] 开始获取分类 ${categoryId} 的提示词`);
    // 添加时间戳参数避免缓存
    const timestamp = new Date().getTime();
    const response = await api.get(`/api/categories/${categoryId}/prompts?_t=${timestamp}`, {
      params: { skip: (page - 1) * pageSize, limit: pageSize }
    });
    
    console.log(`[categories.service] 获取分类提示词成功:`, response.data);
    
    // 直接返回原始数据，由页面组件处理不同格式
    return response.data;
  } catch (error) {
    console.error(`[categories.service] 获取分类 ${categoryId} 下的提示词失败:`, error);
    throw error;
  }
};

// 添加提示词到分类
export const addPromptToCategory = async (categoryId: string, promptId: string) => {
  console.log(`[categories.service] 添加提示词 ${promptId} 到分类 ${categoryId}`);
  try {
    const response = await api.post(`/api/categories/${categoryId}/prompts/${promptId}`);
    return response.data;
  } catch (error) {
    console.error(`[categories.service] 添加提示词到分类失败:`, error);
    throw error;
  }
};

// 从分类中移除提示词
export const removePromptFromCategory = async (categoryId: string, promptId: string) => {
  console.log(`[categories.service] 从分类 ${categoryId} 中移除提示词 ${promptId}`);
  try {
    const response = await api.delete(`/api/categories/${categoryId}/prompts/${promptId}`);
    return response.data;
  } catch (error) {
    console.error(`[categories.service] 从分类中移除提示词失败:`, error);
    throw error;
  }
};
