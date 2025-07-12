import React, { useState, useEffect } from 'react';
import { 
  List, Card, Button, Pagination, Empty, 
  Spin, message, Modal, Input, Tooltip,
  Collapse, Space, Divider
} from 'antd';
import { 
  FolderOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, EyeOutlined, FileTextOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { getUserFavorites } from '../../services/profileService';
import api from '../../services/api';

const { Panel } = Collapse;

const MyFavoritesList: React.FC = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentFavorite, setCurrentFavorite] = useState<any>(null);
  const [newFavoriteName, setNewFavoriteName] = useState('');
  const [favoritePrompts, setFavoritePrompts] = useState<Record<string, any[]>>({});
  const [loadingPrompts, setLoadingPrompts] = useState<Record<string, boolean>>({});

  // 获取用户收藏夹列表
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const result = await getUserFavorites({
          skip: (page - 1) * pageSize,
          limit: pageSize
        });
        
        setFavorites(result.items);
        setTotal(result.total);
      } catch (error) {
        console.error('获取收藏夹列表失败:', error);
        message.error('获取收藏夹列表失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [page, pageSize]);

  // 处理页面变化
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // 创建新收藏夹
  const handleCreateFavorite = async () => {
    if (!newFavoriteName.trim()) {
      message.error('收藏夹名称不能为空');
      return;
    }
    
    try {
      const response = await api.post('/api/favorites', {
        name: newFavoriteName.trim()
      });
      
      message.success('收藏夹创建成功');
      setFavorites([response.data, ...favorites]);
      setTotal(prev => prev + 1);
      setCreateModalVisible(false);
      setNewFavoriteName('');
    } catch (error) {
      console.error('创建收藏夹失败:', error);
      message.error('创建收藏夹失败，请重试');
    }
  };

  // 编辑收藏夹
  const handleEditFavorite = async () => {
    if (!newFavoriteName.trim()) {
      message.error('收藏夹名称不能为空');
      return;
    }
    
    try {
      const response = await api.put(`/api/favorites/${currentFavorite.id}`, {
        name: newFavoriteName.trim()
      });
      
      message.success('收藏夹更新成功');
      
      // 更新列表
      setFavorites(favorites.map(item => 
        item.id === currentFavorite.id ? response.data : item
      ));
      
      setEditModalVisible(false);
      setCurrentFavorite(null);
      setNewFavoriteName('');
    } catch (error) {
      console.error('更新收藏夹失败:', error);
      message.error('更新收藏夹失败，请重试');
    }
  };

  // 删除收藏夹
  const handleDeleteFavorite = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个收藏夹吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await api.delete(`/api/favorites/${id}`);
          message.success('收藏夹删除成功');
          
          // 刷新列表
          setFavorites(favorites.filter(item => item.id !== id));
          setTotal(prev => prev - 1);
        } catch (error) {
          console.error('删除收藏夹失败:', error);
          message.error('删除收藏夹失败，请重试');
        }
      }
    });
  };

  // 加载收藏夹中的提示词
  const loadFavoritePrompts = async (favoriteId: string) => {
    if (favoritePrompts[favoriteId]) {
      return; // 已经加载过
    }
    
    setLoadingPrompts(prev => ({ ...prev, [favoriteId]: true }));
    
    try {
      const response = await api.get(`/api/favorites/${favoriteId}/prompts`);
      setFavoritePrompts(prev => ({
        ...prev,
        [favoriteId]: response.data
      }));
    } catch (error) {
      console.error('加载收藏夹提示词失败:', error);
      message.error('加载收藏夹提示词失败，请重试');
    } finally {
      setLoadingPrompts(prev => ({ ...prev, [favoriteId]: false }));
    }
  };

  // 从收藏夹中移除提示词
  const handleRemovePrompt = async (favoriteId: string, promptId: string) => {
    try {
      await api.delete(`/api/favorites/${favoriteId}/prompts/${promptId}`);
      message.success('提示词已从收藏夹中移除');
      
      // 更新列表
      if (favoritePrompts[favoriteId]) {
        setFavoritePrompts(prev => ({
          ...prev,
          [favoriteId]: prev[favoriteId].filter((item: any) => item.id !== promptId)
        }));
      }
    } catch (error) {
      console.error('移除提示词失败:', error);
      message.error('移除提示词失败，请重试');
    }
  };

  // 查看提示词
  const handleViewPrompt = (id: string) => {
    router.push(`/prompts/${id}`);
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          创建新收藏夹
        </Button>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : favorites.length > 0 ? (
        <>
          <Collapse 
            accordion 
            onChange={(key) => {
              if (key) loadFavoritePrompts(key as string);
            }}
          >
            {favorites.map(favorite => (
              <Panel 
                key={favorite.id} 
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>
                      <FolderOutlined style={{ marginRight: 8 }} />
                      {favorite.name} ({favorite.prompt_count || 0})
                    </span>
                    <Space>
                      <Tooltip title="编辑收藏夹">
                        <Button 
                          type="text" 
                          icon={<EditOutlined />} 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentFavorite(favorite);
                            setNewFavoriteName(favorite.name);
                            setEditModalVisible(true);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="删除收藏夹">
                        <Button 
                          type="text" 
                          danger
                          icon={<DeleteOutlined />} 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFavorite(favorite.id);
                          }}
                        />
                      </Tooltip>
                    </Space>
                  </div>
                }
              >
                {loadingPrompts[favorite.id] ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Spin />
                  </div>
                ) : favoritePrompts[favorite.id]?.length > 0 ? (
                  <List
                    dataSource={favoritePrompts[favorite.id]}
                    renderItem={(prompt: any) => (
                      <List.Item
                        actions={[
                          <Button 
                            key="view" 
                            type="link" 
                            icon={<EyeOutlined />}
                            onClick={() => handleViewPrompt(prompt.id)}
                          >
                            查看
                          </Button>,
                          <Button 
                            key="remove" 
                            type="link" 
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemovePrompt(favorite.id, prompt.id)}
                          >
                            移除
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<FileTextOutlined style={{ fontSize: 20 }} />}
                          title={prompt.title}
                          description={prompt.description || '无描述'}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty 
                    description="收藏夹为空" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Panel>
            ))}
          </Collapse>
          
          {total > pageSize && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      ) : (
        <Empty 
          description="您还没有创建任何收藏夹" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            onClick={() => setCreateModalVisible(true)}
          >
            立即创建
          </Button>
        </Empty>
      )}
      
      {/* 创建收藏夹对话框 */}
      <Modal
        title="创建新收藏夹"
        open={createModalVisible}
        onOk={handleCreateFavorite}
        onCancel={() => {
          setCreateModalVisible(false);
          setNewFavoriteName('');
        }}
        okText="创建"
        cancelText="取消"
      >
        <Input
          placeholder="收藏夹名称"
          value={newFavoriteName}
          onChange={(e) => setNewFavoriteName(e.target.value)}
          maxLength={30}
          showCount
        />
      </Modal>
      
      {/* 编辑收藏夹对话框 */}
      <Modal
        title="编辑收藏夹"
        open={editModalVisible}
        onOk={handleEditFavorite}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentFavorite(null);
          setNewFavoriteName('');
        }}
        okText="保存"
        cancelText="取消"
      >
        <Input
          placeholder="收藏夹名称"
          value={newFavoriteName}
          onChange={(e) => setNewFavoriteName(e.target.value)}
          maxLength={30}
          showCount
        />
      </Modal>
    </div>
  );
};

export default MyFavoritesList;
