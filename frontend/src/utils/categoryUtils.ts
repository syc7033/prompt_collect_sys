import { Category, CategoryTreeNode } from '../services/categories';

/**
 * 将树形结构的分类数据扁平化为一维数组
 * @param tree 树形结构的分类数据
 * @returns 扁平化后的分类数组
 */
export const flattenCategoryTree = (tree: CategoryTreeNode[]): CategoryTreeNode[] => {
  console.log('[categoryUtils] 开始扁平化分类树, 原始数据:', tree);
  
  // 检查分类数据结构
  const checkCategoryStructure = (cats: CategoryTreeNode[]) => {
    if (!cats || !cats.length) return;
    
    cats.forEach(cat => {
      // 确保 children 属性存在且是数组
      if (!cat.children) {
        cat.children = [];
      }
      
      const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
      console.log(`[categoryUtils] 分类: ${cat.name}, ID: ${cat.id}, 父ID: ${cat.parent_id || '无'}, 是否有子分类: ${hasChildren}`);
      
      if (hasChildren) {
        console.log(`[categoryUtils] ${cat.name} 的子分类:`, cat.children.map(c => c.name).join(', '));
        checkCategoryStructure(cat.children);
      }
    });
  };
  
  // 检查分类树结构
  checkCategoryStructure(tree);
  
  let result: CategoryTreeNode[] = [];
  
  const traverse = (cats: CategoryTreeNode[]) => {
    if (!cats || !cats.length) return;
    
    cats.forEach(cat => {
      // 添加当前分类
      result.push(cat);
      console.log(`[categoryUtils] 扁平化: 添加分类 ${cat.name} 到结果中`);
      
      // 递归遍历子分类
      if (Array.isArray(cat.children) && cat.children.length > 0) {
        console.log(`[categoryUtils] 扁平化: 开始遍历 ${cat.name} 的 ${cat.children.length} 个子分类`);
        traverse(cat.children);
      }
    });
  };
  
  traverse(tree);
  console.log('[categoryUtils] 扁平化后的分类数据:', result.length, '条记录');
  return result;
}

/**
 * 将树形结构转换为级联选择器所需的格式
 * @param tree 树形结构的分类数据
 * @returns 级联选择器所需的数据格式
 */
export const convertTreeToCascaderOptions = (tree: CategoryTreeNode[]): any[] => {
  console.log('[categoryUtils] 开始转换分类树为级联选择器格式:', tree);
  
  // 先确保所有分类都有 children 属性
  const ensureChildren = (cats: CategoryTreeNode[]): CategoryTreeNode[] => {
    if (!cats || !cats.length) return [];
    
    return cats.map(cat => {
      // 创建新对象，确保不修改原始对象
      const newCat = { ...cat };
      
      // 确保 children 属性存在且是数组
      if (!Array.isArray(newCat.children)) {
        newCat.children = [];
      }
      
      // 递归处理子分类
      if (newCat.children && newCat.children.length > 0) {
        newCat.children = ensureChildren(newCat.children);
      }
      
      return newCat;
    });
  };
  
  // 验证分类数据结构
  const validateCategories = (cats: CategoryTreeNode[]) => {
    if (!cats || !cats.length) {
      console.log('[categoryUtils] 警告: 分类数组为空或不存在');
      return false;
    }
    
    // 深度检查是否有子分类
    const checkChildrenDeep = (categories: CategoryTreeNode[]): boolean => {
      if (!categories || !categories.length) return false;
      
      return categories.some(cat => {
        const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
        if (hasChildren) return true;
        return false;
      });
    };
    
    const hasChildrenCategories = checkChildrenDeep(cats);
    console.log(`[categoryUtils] 分类数据是否包含子分类: ${hasChildrenCategories}`);
    
    // 打印每个分类的子分类数量
    const logCategoryTree = (categories: CategoryTreeNode[], level = 0) => {
      if (!categories || !categories.length) return;
      
      categories.forEach(cat => {
        const indent = '  '.repeat(level);
        const childrenCount = Array.isArray(cat.children) ? cat.children.length : 0;
        console.log(`${indent}[categoryUtils] 分类 ${cat.name} (ID: ${cat.id}) 有 ${childrenCount} 个子分类`);
        
        // 如果有子分类，递归打印
        if (childrenCount > 0) {
          console.log(`${indent}[categoryUtils] ${cat.name} 的子分类:`, cat.children!.map(c => c.name).join(', '));
          logCategoryTree(cat.children!, level + 1);
        }
      });
    };
    
    console.log('[categoryUtils] 分类树结构:');
    logCategoryTree(cats);
    
    return true;
  };
  
  // 首先确保所有分类都有 children 属性
  const processedCategories = ensureChildren(tree);
  validateCategories(processedCategories);
  
  const convert = (cats: CategoryTreeNode[]): any[] => {
    if (!cats || !cats.length) {
      console.log('[categoryUtils] convert: 传入的分类数组为空或不存在');
      return [];
    }
    
    console.log(`[categoryUtils] convert: 开始处理 ${cats.length} 个分类`);
    
    return cats.map(cat => {
      // 确保 children 属性存在且是数组
      const children = Array.isArray(cat.children) ? cat.children : [];
      const hasChildren = children.length > 0;
      
      console.log(`[categoryUtils] 处理分类: ${cat.name}, ID: ${cat.id}, 父ID: ${cat.parent_id || '无'}, 子分类数量: ${children.length}`);
      if (hasChildren) {
        console.log(`[categoryUtils] ${cat.name} 的子分类:`, children.map(c => c.name).join(', '));
      }
      
      // 创建级联选择器选项
      const option = {
        value: cat.id,
        label: cat.name,
        isLeaf: !hasChildren,
        children: hasChildren ? convert(children) : []
      };
      
      console.log(`[categoryUtils] 创建级联选项: ${cat.name}, 是否有子选项: ${!option.isLeaf}, 子选项数量: ${option.children.length}`);
      
      // 检查选项结构
      if (hasChildren && option.children.length === 0) {
        console.log(`[categoryUtils] 警告: ${cat.name} 有子分类但转换后的选项没有子选项!`);
      }
      
      return option;
    });
  };
  
  const result = convert(processedCategories);
  console.log('[categoryUtils] 转换后的级联选择器数据:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * 将扁平的分类列表转换为树形结构，用于级联选择器
 * @param categories 扁平的分类列表
 * @returns 树形结构的分类数据
 */
export const convertToTreeData = (categories: CategoryTreeNode[]) => {
  console.log('[categoryUtils] 开始转换分类数据，原始数据:', categories);
  
  // 创建节点映射
  const categoryMap: Record<string, any> = {};
  const result: any[] = [];

  // 首先创建所有节点的映射
  categories.forEach(category => {
    categoryMap[category.id] = {
      value: category.id,
      label: category.name,
      isLeaf: true, // 默认为叶子节点，后面会更新
      children: []
    };
    console.log(`[categoryUtils] 创建节点: ${category.name}, ID: ${category.id}, 父ID: ${category.parent_id || '无'}`);
  });

  // 构建树形结构
  categories.forEach(category => {
    const node = categoryMap[category.id];
    
    if (category.parent_id) {
      // 如果有父节点，添加到父节点的children中
      const parent = categoryMap[category.parent_id];
      if (parent) {
        parent.children.push(node);
        parent.isLeaf = false; // 有子节点，不是叶子节点
        console.log(`[categoryUtils] 将节点 ${category.name} 添加到父节点 ${parent.label} 的子节点列表中`);
      } else {
        console.warn(`[categoryUtils] 警告: 节点 ${category.name} 的父节点 ID ${category.parent_id} 不存在`);
        // 如果找不到父节点，作为根节点处理
        result.push(node);
      }
    } else {
      // 如果是根节点，直接添加到结果中
      result.push(node);
      console.log(`[categoryUtils] 添加根节点: ${category.name}`);
    }
  });

  console.log('[categoryUtils] 转换完成，树形结构:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * 获取分类的完整路径（包含所有父级分类）
 * @param categoryId 分类ID
 * @param categories 所有分类列表
 * @returns 分类路径数组，从根节点到当前分类
 */
export const getCategoryPath = (categoryId: string, categories: CategoryTreeNode[]): string[] => {
  if (!categoryId) return [];
  
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return [categoryId];
  
  if (category.parent_id) {
    return [...getCategoryPath(category.parent_id, categories), categoryId];
  }
  
  return [categoryId];
}

/**
 * 根据分类ID获取分类的完整名称路径
 * @param categoryId 分类ID
 * @param categories 所有分类列表
 * @returns 分类名称路径，例如："前端 > React > Hooks"
 */
export function getCategoryNamePath(categoryId: string, categories: Category[]): string {
  if (!categoryId) return '';
  
  const path = getCategoryPath(categoryId, categories);
  return path
    .map(id => {
      const cat = categories.find(c => c.id === id);
      return cat ? cat.name : '';
    })
    .filter(Boolean)
    .join(' > ');
}

