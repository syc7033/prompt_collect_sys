import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Typography, Card, List, Button, Empty, Spin, message, Popconfirm } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { getFavorite, getFavoritePrompts, removePromptFromFavorite } from '../../services/favorites';
import PromptCard from '../../components/prompts/PromptCard';
// @ts-ignore - 忽略类型检查错误
import MainLayout from '../../components/layouts/MainLayout';
import { useAuth } from '../../utils/AuthContext';
import api from '../../services/api';

const { Title, Text } = Typography;

const FavoriteDetailPage: React.FC = () => {
  console.log('[FavoriteDetailPage] 组件初始化');
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  console.log('[FavoriteDetailPage] 路由参数:', { id, fullQuery: router.query });
  console.log('[FavoriteDetailPage] 认证状态:', { isAuthenticated, user });
  
  const [favorite, setFavorite] = useState<{id: string; name: string; prompt_count: number} | null>(null);
  const [prompts, setPrompts] = useState<Array<{id: string; title: string; content: string; description: string; tags: string[]}>>([]); 
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 8;

  // 获取收藏夹信息
  const fetchFavorite = async () => {
    if (!id) {
      console.log('[FavoriteDetailPage] fetchFavorite: id为空，跳过获取收藏夹信息');
      return;
    }
    
    console.log(`[FavoriteDetailPage] 开始获取收藏夹信息，ID: ${id}`);
    try {
      // 使用带有认证的API实例进行请求
      const timestamp = new Date().getTime();
      const response = await api.get(`/api/favorites/${id}?_t=${timestamp}`);
      const data = response.data;
      
      console.log(`[FavoriteDetailPage] 获取收藏夹信息成功:`, data);
      setFavorite(data);
    } catch (error) {
      console.error('[FavoriteDetailPage] 获取收藏夹信息失败:', error);
      message.error('获取收藏夹信息失败，请稍后重试');
    }
  };

  // 获取收藏夹中的提示词
  const fetchPrompts = async () => {
    if (!id) {
      console.log('[FavoriteDetailPage] fetchPrompts: id为空，跳过获取提示词');
      return;
    }
    
    setLoading(true);
    console.log(`[FavoriteDetailPage] 开始获取收藏夹 ${id} 的提示词，页码: ${page}`);
    try {
      // 使用带有认证的API实例进行请求
      const timestamp = new Date().getTime();
      const response = await api.get(`/api/favorites/${id}/prompts?_t=${timestamp}`, {
        params: { page, page_size: pageSize }
      });
      const data = response.data;
      
      console.log(`[FavoriteDetailPage] 获取到原始响应数据:`, data);
      
      // 处理不同的响应格式
      let promptsData = [];
      let totalCount = 0;
      
      if (Array.isArray(data)) {
        // 直接是数组形式
        promptsData = data;
        totalCount = data.length;
        console.log(`[FavoriteDetailPage] 直接数组格式，共 ${totalCount} 条数据`);
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) {
          // 标准格式：{ data: [...], total: number }
          promptsData = data.data;
          totalCount = data.total || promptsData.length;
          console.log(`[FavoriteDetailPage] 标准对象格式，共 ${totalCount} 条数据`);
        } else {
          // 尝试其他可能的字段
          const possibleDataFields = ['items', 'prompts', 'results', 'list'];
          for (const field of possibleDataFields) {
            if (Array.isArray(data[field])) {
              promptsData = data[field];
              totalCount = data.total || data.count || promptsData.length;
              console.log(`[FavoriteDetailPage] 使用字段 ${field}，共 ${totalCount} 条数据`);
              break;
            }
          }
        }
      }
      
      console.log(`[FavoriteDetailPage] 最终处理结果:`, promptsData);
      setPrompts(promptsData);
      setTotal(totalCount);
    } catch (error) {
      console.error('[FavoriteDetailPage] 获取收藏夹提示词失败:', error);
      message.error('获取收藏夹提示词失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载完成后执行
  useEffect(() => {
    console.log('[FavoriteDetailPage] 组件挂载完成');
  }, []);
  
  // 监听id变化，获取收藏夹信息
  useEffect(() => {
    console.log('[FavoriteDetailPage] id变化触发效应:', id);
    if (id) {
      fetchFavorite();
    }
  }, [id]);

  // 监听id和页码变化，获取提示词
  useEffect(() => {
    console.log('[FavoriteDetailPage] id或page变化触发效应:', { id, page });
    if (id) {
      fetchPrompts();
    }
  }, [id, page]);
  
  // 解决依赖警告
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    console.log('[FavoriteDetailPage] 分页变化:', { 当前页: page, 新页码: newPage });
    setPage(newPage);
  };

  // 从收藏夹中移除提示词
  const handleRemovePrompt = async (promptId: string) => {
    if (!id) {
      console.log('[FavoriteDetailPage] handleRemovePrompt: id为空，跳过移除操作');
      return;
    }
    
    console.log(`[FavoriteDetailPage] 开始从收藏夹 ${id} 中移除提示词 ${promptId}`);
    try {
      const timestamp = new Date().getTime();
      try {
        const response = await api.delete(`/api/favorites/${id}/prompts/${promptId}?_t=${timestamp}`);
        console.log(`[FavoriteDetailPage] 移除提示词成功:`, response);
        message.success('提示词已从收藏夹中移除');
        fetchPrompts(); // 重新加载提示词列表
        fetchFavorite(); // 更新收藏夹信息（提示词数量可能变化）
      } catch (error) {
        console.error('[FavoriteDetailPage] 移除提示词失败:', error);
        message.error('移除提示词失败，请稍后重试');
      }
    } catch (error) {
      console.error('[FavoriteDetailPage] 移除提示词失败:', error);
      message.error('移除提示词失败，请稍后重试');
    }
  };

  // 返回收藏夹列表
  const goBack = () => {
    console.log('[FavoriteDetailPage] 返回收藏夹列表');
    router.push('/favorites');
  };

  // 如果id不存在，显示加载中
  if (!id) {
    console.log('[FavoriteDetailPage] id不存在，显示加载中');
    return <Spin />;
  }
  
  console.log('[FavoriteDetailPage] 渲染组件，当前状态:', { 
    id, 
    favorite, 
    prompts: prompts.length > 0 ? `${prompts.length}个提示词` : '无提示词', 
    loading, 
    page, 
    total 
  });

  return (
    <MainLayout>
      <div className="favorite-detail-page">
        <div className="page-header">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={goBack}
            style={{ marginRight: 16 }}
          >
            返回收藏夹列表
          </Button>
          
          {favorite && (
            <Title level={2} style={{ margin: 0 }}>
              {favorite.name}
              <Text type="secondary" style={{ fontSize: 16, marginLeft: 8 }}>
                ({total} 个提示词)
              </Text>
            </Title>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#999' }}>加载中...</div>
          </div>
        ) : prompts.length > 0 ? (
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
            renderItem={prompt => (
              <List.Item>
                <Card 
                  className="prompt-card-wrapper"
                  actions={[
                    <Popconfirm
                      key="remove"
                      title="确定要从收藏夹中移除此提示词吗？"
                      onConfirm={() => handleRemovePrompt(prompt.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>
                        移除
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <PromptCard prompt={prompt as any} showActions={false} />
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty 
            description="收藏夹中暂无提示词" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        )}

        <style jsx>{`
          .favorite-detail-page {
            padding: 24px;
          }
          .page-header {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
          }
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 300px;
          }
          :global(.prompt-card-wrapper) {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          :global(.prompt-card-wrapper .ant-card-body) {
            flex: 1;
          }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default FavoriteDetailPage;
