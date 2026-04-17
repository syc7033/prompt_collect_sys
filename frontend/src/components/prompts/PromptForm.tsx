import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Select, Cascader, message, Spin, Typography } from 'antd';
import { Prompt, PromptCreate, PromptUpdate } from '../../services/prompts';
import { getCategories, getCategoryTree, Category, CategoryTreeNode } from '../../services/categories';
import { convertToTreeData, getCategoryPath, flattenCategoryTree, convertTreeToCascaderOptions } from '../../utils/categoryUtils';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface PromptFormProps {
  initialValues?: Partial<Prompt>;
  onSubmit: (values: PromptCreate | PromptUpdate) => Promise<void>;
  loading: boolean;
  tags?: string[]; // 可选的标签列表，用于下拉选择
  categories?: CategoryTreeNode[]; // 可选的分类列表，用于下拉选择
}

const PromptForm: React.FC<PromptFormProps> = ({ 
  initialValues, 
  onSubmit, 
  loading,
  tags = [],
  categories = []
}) => {
  const [form] = Form.useForm();
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<CategoryTreeNode[]>(categories as CategoryTreeNode[]);
  const [categoryTreeData, setCategoryTreeData] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  
  // 处理表单提交
  const handleSubmit = async (values: PromptCreate | PromptUpdate) => {
    try {
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('提交表单失败:', error);
      message.error('保存提示词失败，请稍后重试');
    }
  };
  
  // 缓存分类数据和最后获取时间
  const categoriesCache = useRef<{data: CategoryTreeNode[], timestamp: number, treeData: any[]}>({data: [], timestamp: 0, treeData: []});
  const categoriesFetchingRef = useRef<boolean>(false);
  
  // 获取分类列表 - 修改依赖，避免循环依赖
  useEffect(() => {
    // 如果传入了分类数据，直接使用
    if (categories.length > 0) {
      console.log('[PromptForm] 使用传入的分类数据:', categories.length);
      setCategoryList(categories);
      // 生成级联选择器数据
      const cascaderOptions = convertTreeToCascaderOptions(categories as CategoryTreeNode[]);
      setCategoryTreeData(cascaderOptions);
    } else {
      // 否则从服务器获取
      console.log('[PromptForm] 没有传入分类数据，准备从服务器获取');
      fetchCategories();
    }
    // 移除categories依赖，避免循环
  }, []); // 仅在组件挂载时执行一次

  // 从服务器获取分类列表
  const fetchCategories = async () => {
    // 如果已经在获取中，则跳过
    if (categoriesFetchingRef.current) {
      console.log('[PromptForm] 分类数据正在获取中，跳过重复请求');
      return;
    }
    
    // 检查缓存是否有效（5分钟内）
    const now = Date.now();
    if (categoriesCache.current.data.length > 0 && 
        now - categoriesCache.current.timestamp < 5 * 60 * 1000) {
      console.log('[PromptForm] 使用缓存的分类数据');
      setCategoryList(categoriesCache.current.data);
      setCategoryTreeData(categoriesCache.current.treeData);
      return;
    }
    
    setLoadingCategories(true);
    try {
      categoriesFetchingRef.current = true;
      console.log('[PromptForm] 开始从服务器获取分类树');
      
      // 获取分类树结构，包含完整的层级关系
      const data = await getCategoryTree();
      console.log('[PromptForm] 获取到分类树:', data);
      
      console.log('[PromptForm] 开始处理分类树数据');
      
      // 直接使用 convertTreeToCascaderOptions 处理数据
      const cascaderOptions = convertTreeToCascaderOptions(data);
      setCategoryTreeData(cascaderOptions);
      console.log('[PromptForm] 转换后的级联选择器数据:', cascaderOptions);
      
      // 扁平化分类树，便于后续处理
      const flattenedCategories = flattenCategoryTree(data);
      setCategoryList(flattenedCategories as CategoryTreeNode[]);
      console.log(`[PromptForm] 分类结构分析: 扁平化后共 ${flattenedCategories.length} 个分类`);
      
      // 更新缓存
      categoriesCache.current = {
        data: flattenedCategories,
        timestamp: now,
        treeData: cascaderOptions
      };
    } catch (error) {
      console.error('[PromptForm] 获取分类树失败:', error);
      message.error('获取分类列表失败');
    } finally {
      categoriesFetchingRef.current = false;
      setLoadingCategories(false);
    }
  };
  
  // 注意: processCategoryData 函数已被移除，直接在 fetchCategories 函数中处理分类数据
  
  // 处理级联选择器的值变化
  const handleCascaderChange = (value: string[] | string) => {
    console.log('[PromptForm] 级联选择器值变化, 原始值:', value);
    
    // 确保value是数组
    const valueArray = Array.isArray(value) ? value : [value];
    console.log('[PromptForm] 处理后的值数组:', valueArray);
    
    // 级联选择器返回的是路径数组，我们只需要最后一个值（叶子节点）
    const selectedCategoryId = valueArray.length > 0 ? valueArray[valueArray.length - 1] : undefined;
    
    // 更新表单中的category_id字段
    form.setFieldsValue({ category_id: selectedCategoryId });
    
    // 如果选择了分类，尝试找到它的路径
    if (selectedCategoryId) {
      const category = categoryList.find(cat => cat.id === selectedCategoryId);
      if (category) {
        console.log(`[PromptForm] 选择的分类: ${category.name}, ID: ${selectedCategoryId}, 父ID: ${category.parent_id || '无'}`);
      }
    }
    
    console.log('[PromptForm] 最终选择的分类ID:', selectedCategoryId);
  };
  
  // 获取初始的级联选择器值（用于编辑表单）
  const getInitialCascaderValue = () => {
    const categoryId = initialValues?.category_id;
    console.log('[PromptForm] 获取初始级联选择器值, 分类ID:', categoryId);
    
    if (!categoryId) return [];
    
    // 如果分类列表为空，返回空数组
    if (!categoryList || categoryList.length === 0) {
      console.log('[PromptForm] 分类列表为空，无法获取路径');
      return [categoryId]; // 至少返回当前分类ID
    }
    
    // 获取从根节点到当前分类的完整路径
    const path = getCategoryPath(categoryId, categoryList);
    console.log('[PromptForm] 分类路径:', path);
    
    // 打印路径中每个分类的名称
    const pathNames = path.map(id => {
      const cat = categoryList.find(c => c.id === id);
      return cat ? cat.name : 'unknown';
    });
    console.log('[PromptForm] 分类路径名称:', pathNames.join(' > '));
    
    return path;
  };

  // 处理自定义标签输入
  const handleTagChange = (value: string[]) => {
    // 过滤出自定义标签（不在预设标签列表中的标签）
    const newCustomTags = value.filter(tag => !tags.includes(tag) && !customTags.includes(tag));
    if (newCustomTags.length > 0) {
      setCustomTags([...customTags, ...newCustomTags]);
    }
  };

  return (
    <Form
      form={form}
      name="prompt_form"
      className="prompt-form"
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="title"
        label="标题"
        rules={[{ required: true, message: '请输入提示词标题' }]}
      >
        <Input placeholder="提示词标题" />
      </Form.Item>
      
      <Form.Item
        name="content"
        label="内容"
        rules={[{ required: true, message: '请输入提示词内容' }]}
      >
        <TextArea 
          rows={10} 
          placeholder="输入提示词内容..." 
          className="prompt-content-editor" 
        />
      </Form.Item>
      
      <Form.Item
        name="description"
        label="描述"
      >
        <TextArea 
          rows={4} 
          placeholder="描述这个提示词的用途和使用场景..." 
        />
      </Form.Item>
      
      <Form.Item
        name="tags"
        label="标签"
      >
        <Select
          mode="tags"
          placeholder="添加标签"
          className="tag-select"
          onChange={handleTagChange}
        >
          {/* 预设标签选项 */}
          {tags.map(tag => (
            <Option key={tag} value={tag}>
              {tag}
            </Option>
          ))}
          {/* 用户自定义标签 */}
          {customTags.map(tag => (
            <Option key={tag} value={tag}>
              {tag}
            </Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item
        name="category_id"
        label="分类"
        extra="选择一个分类来组织你的提示词"
      >
        <Form.Item noStyle name="category_path">
          <Cascader
            options={categoryTreeData}
            placeholder="请选择分类"
            expandTrigger="click" // 改为click，使用户需要点击才能展开子菜单
            changeOnSelect
            showSearch
            loading={loadingCategories}
            onChange={(value) => {
              console.log('[PromptForm] Cascader onChange 事件触发, 值:', value);
              console.log('[PromptForm] Cascader 选项数据结构:', JSON.stringify(categoryTreeData, null, 2));
              handleCascaderChange(value as string[]);
            }}
            defaultValue={getInitialCascaderValue()}
            style={{ width: '100%' }}
            displayRender={(labels) => {
              console.log('[PromptForm] Cascader displayRender, 标签:', labels);
              return labels.join(' > ');
            }}
            onDropdownVisibleChange={(open) => {
              console.log('[PromptForm] Cascader 下拉菜单可见性变化:', open);
              if (open) {
                console.log('[PromptForm] Cascader 下拉菜单打开，当前选项数量:', categoryTreeData.length);
                categoryTreeData.forEach((option, index) => {
                  console.log(`[PromptForm] 顶级选项 ${index+1}: ${option.label}, ID: ${option.value}, 是否有子选项: ${!option.isLeaf}, 子选项数量: ${option.children ? option.children.length : 0}`);
                  if (option.children && option.children.length > 0) {
                    option.children.forEach((child: {label: string, value: string, isLeaf?: boolean, children?: any[]}, childIndex: number) => {
                      console.log(`  [PromptForm] 子选项 ${index+1}.${childIndex+1}: ${child.label}, ID: ${child.value}, 是否有子选项: ${!child.isLeaf}, 子选项数量: ${child.children ? child.children.length : 0}`);
                    });
                  }
                });
              }
            }}
            // 添加加载数据的函数，用于动态加载子选项
            loadData={(selectedOptions) => {
              console.log('[PromptForm] Cascader loadData 被调用, 已选选项:', selectedOptions);
              if (selectedOptions && selectedOptions.length > 0) {
                const targetOption = selectedOptions[selectedOptions.length - 1];
                console.log(`[PromptForm] 当前选中的选项: ${targetOption.label}, ID: ${targetOption.value}, 是否有子选项: ${!targetOption.isLeaf}`);
              }
            }}
          />
        </Form.Item>
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? '更新提示词' : '创建提示词'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PromptForm;

