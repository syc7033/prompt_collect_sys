import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Typography, Card, List, Button, Empty, Spin, message, Modal, Table, Space, Checkbox, Tooltip, Tag } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined, FolderOutlined } from '@ant-design/icons';
import { getCategory, getCategoryPrompts, getCategoryTree, deleteCategory, getCategories } from '../../services/categories';
import { addPromptToCategory, removePromptFromCategory } from '../../services/categories';
import { getPrompts, Prompt } from '../../services/prompts';
import PromptCard from '../../components/prompts/PromptCard';
// @ts-ignore - 忽略类型检查错误
import MainLayout from '../../components/layouts/MainLayout';
import { useAuth } from '../../utils/AuthContext';
import api from '../../services/api';

// 定义分类类型
interface Category {
  id: string;
  name: string;
  description: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  prompt_count?: number;
  children_count?: number;
}

const { Title, Text } = Typography;

const CategoryDetailPage: React.FC = () => {
  console.log('[CategoryDetailPage] 组件初始化');
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  console.log('[CategoryDetailPage] 路由参数:', { id, fullQuery: router.query });
  console.log('[CategoryDetailPage] 认证状态:', { isAuthenticated, user });
  
  const [category, setCategory] = useState<{id: string; name: string; description?: string; prompt_count: number; children_count?: number} | null>(null);
  const [prompts, setPrompts] = useState<Array<{id: string; title: string; content: string; description: string; tags: string[]}>>([]); 
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 8;
  
  // 子分类相关状态
  const [subCategories, setSubCategories] = useState<Array<{id: string; name: string; description?: string; prompt_count: number; children_count?: number}>>([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  
  // 批量管理相关状态
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);
  const [loadingAvailablePrompts, setLoadingAvailablePrompts] = useState(false);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);
  const [processingPrompts, setProcessingPrompts] = useState(false);
  
  // 测试模式标志 - 如果为true则使用测试数据，否则调用真实API
  const useTestData = false;

  // 获取分类信息
  const fetchCategory = async () => {
    if (!id) {
      console.log('[CategoryDetailPage] fetchCategory: id为空，跳过获取分类信息');
      return;
    }
    
    console.log(`[CategoryDetailPage] 开始获取分类信息，ID: ${id}`);
    try {
      // 使用带有认证的API实例进行请求
      const timestamp = new Date().getTime();
      const response = await api.get(`/api/categories/${id}?_t=${timestamp}`);
      const data = response.data;
      
      console.log(`[CategoryDetailPage] 获取分类信息成功:`, data);
      console.log(`[CategoryDetailPage] 分类数据详情:`, JSON.stringify(data, null, 2));
      setCategory(data);
      
      // 主动查询是否有子分类，而不依赖服务器返回的children_count字段
      console.log(`[CategoryDetailPage] 主动查询分类 ${id} 的子分类`);
      
      // 使用getCategories函数获取子分类
      try {
        // 使用导入的getCategories函数，传递parent_id参数
        // 注意：这里需要使用API的参数格式，而不是直接传递ID
        console.log(`[CategoryDetailPage] 调用API获取分类 ${id} 的子分类`);
        console.log(`[CategoryDetailPage] API请求URL: /api/categories?parent_id=${id}`);
        
        // 检查是否使用测试数据模式
        console.log(`[CategoryDetailPage] 测试模式: ${useTestData ? '开启' : '关闭'}`);
        
        // 定义子分类响应变量
        let childrenResponse;
        
        if (useTestData) {
          // 使用测试数据
          console.log(`[CategoryDetailPage] 使用测试数据模拟子分类`);
          childrenResponse = [
            {
              "id": "test-child-1",
              "name": "测试子分类1",
              "description": "测试子分类1描述",
              "parent_id": id,
              "prompt_count": 5,
              "children_count": 0,
              "created_at": new Date().toISOString(),
              "updated_at": new Date().toISOString()
            },
            {
              "id": "test-child-2",
              "name": "测试子分类2",
              "description": "测试子分类2描述",
              "parent_id": id,
              "prompt_count": 3,
              "children_count": 2,
              "created_at": new Date().toISOString(),
              "updated_at": new Date().toISOString()
            }
          ];
          console.log(`[CategoryDetailPage] 测试数据:`, childrenResponse);
          
          // 将测试数据转换为正确的类型格式
          const convertedSubCategories = childrenResponse.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            prompt_count: item.prompt_count,
            children_count: item.children_count
            // 不包含 parent_id, created_at, updated_at 等其他字段
          }));
          
          console.log(`[CategoryDetailPage] 转换后的测试数据:`, convertedSubCategories);
          
          // 设置子分类状态
          setHasChildren(true);
          setSubCategories(convertedSubCategories);
          setLoadingSubCategories(false);
          return; // 直接返回，不执行后面的代码
        } else {
          // 调用真实API
          try {
            console.log(`[CategoryDetailPage] 调用API获取子分类，parent_id=${id}`);
            const fullResponse = await api.get(`/api/categories`, {
              params: { parent_id: id }
            });
            
            console.log(`[CategoryDetailPage] API响应状态码:`, fullResponse.status);
            console.log(`[CategoryDetailPage] API响应数据类型:`, typeof fullResponse.data);
            console.log(`[CategoryDetailPage] API响应数据结构:`, JSON.stringify(fullResponse.data, null, 2));
            
            childrenResponse = fullResponse.data;
          } catch (apiError) {
            console.error(`[CategoryDetailPage] API请求失败:`, apiError);
            childrenResponse = [];
          }
        }
        console.log(`[CategoryDetailPage] 查询子分类响应:`, childrenResponse);
        
        // 处理响应数据
        let childCategoriesRaw: any[] = [];
        
        // 详细记录API响应结构
        console.log(`[CategoryDetailPage] 子分类响应类型:`, typeof childrenResponse);
        console.log(`[CategoryDetailPage] 子分类响应是否为数组:`, Array.isArray(childrenResponse));
        
        if (Array.isArray(childrenResponse)) {
          childCategoriesRaw = childrenResponse;
        } else if (childrenResponse && typeof childrenResponse === 'object') {
          if (Array.isArray(childrenResponse.data)) {
            childCategoriesRaw = childrenResponse.data;
          } else if (childrenResponse.items && Array.isArray(childrenResponse.items)) {
            // 有些 API 可能使用 items 字段
            childCategoriesRaw = childrenResponse.items;
          }
        }
        
        console.log(`[CategoryDetailPage] 原始子分类数据:`, childCategoriesRaw);
        
        // 后端已经修改，现在API会根据parent_id参数返回子分类
        // 所以我们不需要特殊的过滤逻辑，直接使用API返回的数据
        const filteredCategories = childCategoriesRaw;
        
        // 记录日志，显示每个分类的信息
        filteredCategories.forEach(cat => {
          console.log(`[CategoryDetailPage] 分类 ${cat.name} (${cat.id}) 的parent_id是 ${cat.parent_id}, 当前分类ID是 ${id}`);
        });
        
        console.log(`[CategoryDetailPage] 过滤后的子分类数量: ${filteredCategories.length}`);
        
        // 将原始数据转换为与subCategories状态兼容的类型
        const childCategories = filteredCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          parent_id: cat.parent_id, // 添加parent_id属性
          prompt_count: cat.prompt_count || 0, // 确保有prompt_count属性且不为undefined
          children_count: cat.children_count,
          created_at: cat.created_at,
          updated_at: cat.updated_at
        }));
        
        // 输出详细日志，显示每个子分类的parent_id
        console.log(`[CategoryDetailPage] 子分类详细信息:`, 
          childCategories.map(cat => ({ 
            id: cat.id, 
            name: cat.name, 
            parent_id: cat.parent_id || null // 确保有parent_id属性
          })));
          
        console.log(`[CategoryDetailPage] 子分类数量: ${childCategories.length}`);
        
        if (childCategories.length > 0) {
          console.log(`[CategoryDetailPage] 该分类有子分类，设置hasChildren=true并设置子分类数据`);
          setHasChildren(true);
          setSubCategories(childCategories);
          setLoadingSubCategories(false); // 直接设置加载完成
        } else {
          console.log(`[CategoryDetailPage] 该分类没有子分类，设置hasChildren=false并获取提示词`);
          setHasChildren(false);
          // 只有当没有子分类时，才获取提示词
          fetchPrompts();
        }
      } catch (error: any) {
        console.error(`[CategoryDetailPage] 获取子分类失败:`, error);
        if (error.response) {
          console.error(`[CategoryDetailPage] 错误响应状态码: ${error.response.status}`);
          console.error(`[CategoryDetailPage] 错误响应数据:`, error.response.data);
        }
        // 出错时设置hasChildren=false并获取提示词
        setHasChildren(false);
        fetchPrompts();
      }
    } catch (error) {
      console.error('[CategoryDetailPage] 获取分类信息失败:', error);
      message.error('获取分类信息失败，请稍后重试');
    }
  };
  
  // 获取子分类
  const fetchSubCategories = async () => {
    if (!id) {
      console.log(`[CategoryDetailPage] fetchSubCategories: id为空，跳过获取子分类`);
      return;
    }
    
    console.log(`[CategoryDetailPage] 开始获取分类 ${id} 的子分类，设置loadingSubCategories=true`);
    setLoadingSubCategories(true);
    
    try {
      // 使用带有认证的API实例进行请求
      const timestamp = new Date().getTime();
      const url = `/api/categories?_t=${timestamp}`;
      const params = { parent_id: id };
      
      console.log(`[CategoryDetailPage] 发起获取子分类请求: ${url}`, params);
      
      const response = await api.get(url, { params });
      
      console.log(`[CategoryDetailPage] 获取子分类原始响应:`, response);
      console.log(`[CategoryDetailPage] 获取子分类数据:`, response.data);
      
      // 处理不同的响应格式
      let subCategoriesData = [];
      
      if (Array.isArray(response.data)) {
        console.log(`[CategoryDetailPage] 响应数据是数组格式，长度: ${response.data.length}`);
        subCategoriesData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.data)) {
          console.log(`[CategoryDetailPage] 响应数据是对象格式，包含数组字段data，长度: ${response.data.data.length}`);
          subCategoriesData = response.data.data;
        } else {
          console.log(`[CategoryDetailPage] 响应数据是对象格式，但不包含数组字段data`);
        }
      } else {
        console.log(`[CategoryDetailPage] 响应数据无法解析，类型: ${typeof response.data}`);
      }
      
      console.log(`[CategoryDetailPage] 处理后的子分类数据:`, subCategoriesData);
      console.log(`[CategoryDetailPage] 设置子分类数据，数量: ${subCategoriesData.length}`);
      setSubCategories(subCategoriesData);
    } catch (error: any) {
      console.error(`[CategoryDetailPage] 获取子分类失败:`, error);
      if (error.response) {
        console.error(`[CategoryDetailPage] 错误响应状态码: ${error.response.status}`);
        console.error(`[CategoryDetailPage] 错误响应数据:`, error.response.data);
      }
      message.error('获取子分类失败，请稍后重试');
    } finally {
      console.log(`[CategoryDetailPage] 完成获取子分类，设置loadingSubCategories=false`);
      setLoadingSubCategories(false);
    }
  };

  // 获取分类下的提示词
  const fetchPrompts = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      console.log(`[分类详情] 开始获取分类 ${id} 的提示词`);
      
      // 使用带有认证的API实例进行请求
      const timestamp = new Date().getTime();
      const response = await api.get(`/api/categories/${id}/prompts?_t=${timestamp}`, {
        params: { skip: (page - 1) * pageSize, limit: pageSize }
      });
      const data = response.data;
      
      console.log(`[分类详情] 原始响应数据:`, data);
      
      // 处理不同的响应格式
      let promptsData = [];
      let totalCount = 0;
      
      if (Array.isArray(data)) {
        // 直接是数组形式
        promptsData = data;
        totalCount = data.length;
        console.log(`[分类详情] 直接数组格式，共 ${totalCount} 条数据`);
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) {
          // 标准格式：{ data: [...], total: number }
          promptsData = data.data;
          totalCount = data.total || promptsData.length;
          console.log(`[分类详情] 标准对象格式，共 ${totalCount} 条数据`);
        } else {
          // 尝试其他可能的字段
          const possibleDataFields = ['items', 'prompts', 'results', 'list'];
          for (const field of possibleDataFields) {
            if (Array.isArray(data[field])) {
              promptsData = data[field];
              totalCount = data.total || data.count || promptsData.length;
              console.log(`[分类详情] 使用字段 ${field}，共 ${totalCount} 条数据`);
              break;
            }
          }
        }
      }
      
      // 如果上面的处理都没有成功，但原始数据是对象，尝试直接使用
      if (promptsData.length === 0 && data && typeof data === 'object' && !Array.isArray(data)) {
        promptsData = [data];
        totalCount = 1;
        console.log(`[分类详情] 单个对象格式，共 1 条数据`);
      }
      
      console.log(`[分类详情] 最终处理结果:`, promptsData);
      
      setPrompts(promptsData);
      setTotal(totalCount);
    } catch (error) {
      console.error('获取分类提示词失败:', error);
      message.error('获取分类提示词失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载完成后执行
  useEffect(() => {
    console.log('[CategoryDetailPage] 组件挂载完成');
  }, []);
  
  // 监听id变化，获取分类信息
  useEffect(() => {
    console.log('[CategoryDetailPage] id变化触发效应:', id);
    if (id) {
      fetchCategory();
      // fetchPrompts()现在在fetchCategory中根据是否有子分类来决定是否调用
    }
  }, [id]);

  // 监听页码变化，获取提示词（仅当没有子分类时）
  useEffect(() => {
    console.log('[CategoryDetailPage] page变化触发效应:', { page });
    if (id && !hasChildren) {
      fetchPrompts();
    }
  }, [page, hasChildren]);

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    console.log('[CategoryDetailPage] 分页变化:', { 当前页: page, 新页码: newPage });
    setPage(newPage);
  };

  // 获取可添加到分类的提示词
  const fetchAvailablePrompts = async () => {
    if (!id) return;
    
    setLoadingAvailablePrompts(true);
    try {
      // 获取所有提示词
      const response = await getPrompts(1, 100);
      
      // 过滤掉已经在当前分类中的提示词
      const currentPromptIds = prompts.map(p => p.id);
      const filtered = response.data.filter(p => !currentPromptIds.includes(p.id));
      
      setAvailablePrompts(filtered);
    } catch (error) {
      console.error('获取可用提示词失败:', error);
      message.error('获取可用提示词失败');
    } finally {
      setLoadingAvailablePrompts(false);
    }
  };
  
  // 打开添加提示词模态框
  const showAddPromptsModal = () => {
    setSelectedPromptIds([]);
    setAddModalVisible(true);
    fetchAvailablePrompts();
  };
  
  // 打开移除提示词模态框
  const showRemovePromptsModal = () => {
    setSelectedPromptIds([]);
    setRemoveModalVisible(true);
  };
  
  // 处理添加提示词
  const handleAddPrompts = async () => {
    if (!id || selectedPromptIds.length === 0) return;
    
    setProcessingPrompts(true);
    try {
      // 批量添加提示词到分类
      const promises = selectedPromptIds.map(promptId => 
        addPromptToCategory(id as string, promptId)
      );
      
      await Promise.all(promises);
      message.success(`成功添加 ${selectedPromptIds.length} 个提示词到分类`);
      
      // 关闭模态框并重新加载数据
      setAddModalVisible(false);
      fetchCategory();
      fetchPrompts();
    } catch (error) {
      console.error('添加提示词失败:', error);
      message.error('添加提示词失败，请稍后重试');
    } finally {
      setProcessingPrompts(false);
    }
  };
  
  // 处理移除提示词
  const handleRemovePrompts = async () => {
    if (!id || selectedPromptIds.length === 0) return;
    
    setProcessingPrompts(true);
    try {
      // 批量从分类中移除提示词
      const promises = selectedPromptIds.map(promptId => 
        removePromptFromCategory(id as string, promptId)
      );
      
      await Promise.all(promises);
      message.success(`成功从分类中移除 ${selectedPromptIds.length} 个提示词`);
      
      // 关闭模态框并重新加载数据
      setRemoveModalVisible(false);
      fetchCategory();
      fetchPrompts();
    } catch (error) {
      console.error('移除提示词失败:', error);
      message.error('移除提示词失败，请稍后重试');
    } finally {
      setProcessingPrompts(false);
    }
  };
  
  // 删除子分类
  const handleDeleteSubCategory = async (categoryId: string) => {
    console.log(`[CategoryDetailPage] 尝试删除子分类 ${categoryId}`);
    
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个分类吗？如果该分类有子分类或关联的提示词，将无法删除。',
      okText: '确认删除',
      cancelText: '取消',
      onOk: async () => {
        console.log(`[CategoryDetailPage] 用户确认删除子分类 ${categoryId}`);
        try {
          console.log(`[CategoryDetailPage] 调用deleteCategory API删除分类 ${categoryId}`);
          await deleteCategory(categoryId);
          console.log(`[CategoryDetailPage] 删除分类成功 ${categoryId}`);
          message.success('分类删除成功');
          
          // 如果我们在使用测试数据，则从当前子分类列表中移除该分类
          if (useTestData) {
            console.log(`[CategoryDetailPage] 测试模式：从子分类列表中移除分类 ${categoryId}`);
            const updatedSubCategories = subCategories.filter(cat => cat.id !== categoryId);
            setSubCategories(updatedSubCategories);
            setHasChildren(updatedSubCategories.length > 0);
          } else {
            // 重新获取子分类列表
            console.log(`[CategoryDetailPage] 重新获取子分类列表`);
            fetchSubCategories();
          }
        } catch (error: any) {
          console.error('[CategoryDetailPage] 删除分类失败:', error);
          if (error.response && error.response.status === 400) {
            message.error('无法删除分类，该分类可能有子分类或关联的提示词');
          } else {
            message.error('删除分类失败，请稍后重试');
          }
        }
      },
    });
  };
  
  // 返回分类列表
  const goBack = () => {
    console.log('[CategoryDetailPage] 返回分类列表');
    router.push('/categories');
  };

  // 如果id不存在，显示加载中
  if (!id) {
    console.log('[CategoryDetailPage] id不存在，显示加载中');
    return <Spin />;
  }
  
  console.log('[CategoryDetailPage] 渲染组件，当前状态:', { 
    id, 
    category, 
    hasChildren,
    subCategories: subCategories.length > 0 ? `${subCategories.length}个子分类` : '无子分类',
    loadingSubCategories,
    prompts: prompts.length > 0 ? `${prompts.length}个提示词` : '无提示词', 
    loading, 
    page, 
    total 
  });
  
  console.log('[CategoryDetailPage] 子分类数据详情:', JSON.stringify(subCategories, null, 2));

  return (
    <MainLayout>
      <div className="category-detail-page">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={goBack}
              style={{ marginRight: 16 }}
            >
              返回分类列表
            </Button>
            
            {category && (
              <Title level={2} style={{ margin: 0 }}>
                {category.name}
                <Text type="secondary" style={{ fontSize: 16, marginLeft: 8 }}>
                  ({total} 个提示词)
                </Text>
              </Title>
            )}
          </div>
          
          {/* 管理按钮区域 */}
          {user?.is_superuser && (
            <Space>
              <Tooltip title="添加提示词到分类">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={showAddPromptsModal}
                >
                  添加提示词
                </Button>
              </Tooltip>
              
              <Tooltip title="从分类中移除提示词">
                <Button 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={showRemovePromptsModal}
                  disabled={prompts.length === 0}
                >
                  移除提示词
                </Button>
              </Tooltip>
              
              <Tooltip title="刷新列表">
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    fetchCategory();
                    fetchPrompts();
                  }}
                >
                  刷新
                </Button>
              </Tooltip>
            </Space>
          )}
        </div>

        {category && category.description && (
          <div className="category-description" style={{ marginBottom: 24 }}>
            <Text>{category.description}</Text>
          </div>
        )}

        {loading ? (
          <>
            {console.log('[CategoryDetailPage] 渲染加载中状态')}
            <div className="loading-container">
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#999' }}>加载中...</div>
            </div>
          </>
        ) : hasChildren ? (
          <>
            {console.log('[CategoryDetailPage] 渲染子分类列表，子分类数量:', subCategories.length)}
            {/* 显示子分类列表 */}
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">该分类下有 {subCategories.length} 个子分类</Text>
            </div>
            {loadingSubCategories ? (
              <div className="loading-container">
                <Spin size="large" />
                <div style={{ marginTop: 16, color: '#999' }}>加载子分类中...</div>
              </div>
            ) : subCategories.length > 0 ? (
              <List
                grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 4, xxl: 4 }}
                dataSource={subCategories}
                renderItem={subCategory => (
                  <List.Item>
                    <Card
                      hoverable
                      style={{ width: '100%' }}
                      onClick={() => router.push(`/categories/${subCategory.id}`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <FolderOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        <Typography.Title level={4} style={{ margin: 0 }}>
                          {subCategory.name}
                        </Typography.Title>
                      </div>
                      {subCategory.description && (
                        <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                          {subCategory.description}
                        </Typography.Paragraph>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999' }}>
                        <span>{subCategory.prompt_count || 0} 个提示词</span>
                        <span>{subCategory.children_count || 0} 个子分类</span>
                      </div>
                      
                      {/* 管理员操作按钮 */}
                      {user?.is_superuser && (
                        <div style={{ marginTop: 12, textAlign: 'right' }}>
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSubCategory(subCategory.id);
                            }}
                          >
                            删除
                          </Button>
                        </div>
                      )}
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="该分类下暂无子分类"
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            )}
          </>
        ) : prompts.length > 0 ? (
          <>
            {console.log('[CategoryDetailPage] 渲染提示词列表（没有子分类），提示词数量:', prompts.length)}
            {/* 显示提示词列表（仅当没有子分类时） */}
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">找到 {total} 个提示词</Text>
            </div>
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
              dataSource={prompts}
              pagination={{
                current: page,
                pageSize,
                total,
                onChange: handlePageChange,
                showSizeChanger: false
              }}
              renderItem={prompt => {
                console.log('渲染提示词:', prompt);
                return (
                  <List.Item>
                    <Card style={{ width: '100%', height: '100%' }}>
                      <PromptCard prompt={prompt as any} />
                    </Card>
                  </List.Item>
                );
              }}
            />
          </>
        ) : (
          <Empty 
            description="该分类下暂无提示词" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        )}

        {/* 添加提示词模态框 */}
        <Modal
          title="添加提示词到分类"
          open={addModalVisible}
          onCancel={() => setAddModalVisible(false)}
          onOk={handleAddPrompts}
          okText="添加选中提示词"
          cancelText="取消"
          width={800}
          confirmLoading={processingPrompts}
        >
          <Table
            rowSelection={{
              type: 'checkbox',
              onChange: (selectedRowKeys) => {
                setSelectedPromptIds(selectedRowKeys as string[]);
              }
            }}
            dataSource={availablePrompts}
            rowKey="id"
            loading={loadingAvailablePrompts}
            pagination={{ pageSize: 5 }}
            columns={[
              {
                title: '标题',
                dataIndex: 'title',
                key: 'title',
              },
              {
                title: '描述',
                dataIndex: 'description',
                key: 'description',
                ellipsis: true,
              },
              {
                title: '标签',
                dataIndex: 'tags',
                key: 'tags',
                render: (tags: string[]) => (
                  <>
                    {tags && tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </>
                )
              }
            ]}
          />
        </Modal>
        
        {/* 移除提示词模态框 */}
        <Modal
          title="从分类中移除提示词"
          open={removeModalVisible}
          onCancel={() => setRemoveModalVisible(false)}
          onOk={handleRemovePrompts}
          okText="移除选中提示词"
          cancelText="取消"
          width={800}
          confirmLoading={processingPrompts}
        >
          <Table
            rowSelection={{
              type: 'checkbox',
              onChange: (selectedRowKeys) => {
                setSelectedPromptIds(selectedRowKeys as string[]);
              }
            }}
            dataSource={prompts}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            columns={[
              {
                title: '标题',
                dataIndex: 'title',
                key: 'title',
              },
              {
                title: '描述',
                dataIndex: 'description',
                key: 'description',
                ellipsis: true,
              },
              {
                title: '标签',
                dataIndex: 'tags',
                key: 'tags',
                render: (tags: string[]) => (
                  <>
                    {tags && tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </>
                )
              }
            ]}
          />
        </Modal>
        
        <style jsx>{`
          .category-detail-page {
            padding: 24px;
          }
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 300px;
          }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default CategoryDetailPage;
