import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Popconfirm, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
// @ts-ignore - 忽略类型检查错误
import FavoriteForm from '../../components/favorites/FavoriteForm';
import { getFavorites, deleteFavorite, Favorite } from '../../services/favorites';
// @ts-ignore - 忽略类型检查错误
import MainLayout from '../../components/layouts/MainLayout';

const { Title } = Typography;

const FavoritesPage: React.FC = () => {
  console.log('[FAVORITES_PAGE] 页面初始化');
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);
  
  // 记录页面加载时间
  useEffect(() => {
    console.log('[FAVORITES_PAGE] 页面加载完成，路径:', router.pathname);
    console.log('[FAVORITES_PAGE] 完整URL:', typeof window !== 'undefined' ? window.location.href : 'SSR模式');
    console.log('[FAVORITES_PAGE] 来源页面:', document.referrer);
    
    // 保存当前页面路径到会话存储，用于登录后重定向
    if (typeof window !== 'undefined') {
      console.log('[FAVORITES_PAGE] 保存当前路径到会话存储');
      sessionStorage.setItem('redirectAfterLogin', router.pathname);
    }
  }, [router.pathname]);

  // 获取收藏夹列表
  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('获取收藏夹列表失败:', error);
      message.error('获取收藏夹列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // 处理删除收藏夹
  const handleDelete = async (id: string) => {
    try {
      await deleteFavorite(id);
      message.success('收藏夹删除成功');
      fetchFavorites(); // 重新加载收藏夹列表
    } catch (error) {
      console.error('删除收藏夹失败:', error);
      message.error('删除收藏夹失败，请稍后重试');
    }
  };

  // 打开创建收藏夹模态框
  const showCreateModal = () => {
    setEditingFavorite(null);
    setModalVisible(true);
  };

  // 打开编辑收藏夹模态框
  const showEditModal = (favorite: Favorite) => {
    setEditingFavorite(favorite);
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
    setEditingFavorite(null);
  };

  // 创建或更新收藏夹后的回调
  const handleFormSuccess = () => {
    setModalVisible(false);
    
    // 延迟一下再获取数据，确保后端有时间处理
    setTimeout(() => {
      fetchFavorites();
    }, 500);
    
    message.success(editingFavorite ? '收藏夹更新成功' : '收藏夹创建成功');
  };

  // 查看收藏夹详情
  const viewFavoriteDetails = (id: string) => {
    router.push(`/favorites/${id}`);
  };

  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '提示词数量',
      dataIndex: 'prompt_count',
      key: 'prompt_count',
      render: (count: number) => count || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Favorite) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<FolderOpenOutlined />} 
            onClick={() => viewFavoriteDetails(record.id)}
          >
            查看
          </Button>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个收藏夹吗？删除后无法恢复，收藏夹中的提示词将不再被收藏。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="favorites-page">
        <div className="page-header">
          <Title level={2}>收藏夹管理</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showCreateModal}
          >
            创建收藏夹
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={favorites} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingFavorite ? '编辑收藏夹' : '创建收藏夹'}
          open={modalVisible}
          onCancel={handleCancel}
          footer={null}
          destroyOnClose
        >
          <FavoriteForm 
            favorite={editingFavorite} 
            onSuccess={handleFormSuccess} 
            onCancel={handleCancel} 
          />
        </Modal>

        <style jsx>{`
          .favorites-page {
            padding: 24px;
          }
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default FavoritesPage;
