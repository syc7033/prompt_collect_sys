import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Popconfirm, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
// @ts-ignore - 忽略类型检查错误
import CategoryForm from '../../components/categories/CategoryForm';
import { getCategories, deleteCategory, Category } from '../../services/categories';
// @ts-ignore - 忽略类型检查错误
import MainLayout from '../../components/layouts/MainLayout';

const { Title } = Typography;

const CategoriesPage: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // 获取分类列表
  const fetchCategories = async () => {
    console.log('[categories.page] 开始获取分类列表', new Date().toISOString());
    setLoading(true);
    try {
      const data = await getCategories();
      console.log('[categories.page] 获取到的分类数据:', data);
      console.log('[categories.page] 分类数据长度:', data.length);
      setCategories(data);
      console.log('[categories.page] 分类状态已更新', new Date().toISOString());
    } catch (error) {
      console.error('[categories.page] 获取分类列表失败:', error);
      message.error('获取分类列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 处理删除分类
  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      message.success('分类删除成功');
      fetchCategories(); // 重新加载分类列表
    } catch (error) {
      console.error('删除分类失败:', error);
      message.error('删除分类失败，请稍后重试');
    }
  };

  // 打开创建分类模态框
  const showCreateModal = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  // 打开编辑分类模态框
  const showEditModal = (category: Category) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
    setEditingCategory(null);
  };

  // 创建或更新分类后的回调
  const handleFormSuccess = () => {
    console.log('[categories.page] 表单提交成功，开始处理', editingCategory ? '更新' : '创建', new Date().toISOString());
    setModalVisible(false);
    
    // 添加延时，确保后端处理完成
    setTimeout(() => {
      console.log('[categories.page] 开始重新获取分类列表', new Date().toISOString());
      fetchCategories();
      console.log('[categories.page] 分类列表已刷新', new Date().toISOString());
    }, 500);
    
    message.success(editingCategory ? '分类更新成功' : '分类创建成功');
  };

  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Category) => (
        <a onClick={() => router.push(`/categories/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: '提示词数量',
      dataIndex: 'prompt_count',
      key: 'prompt_count',
      render: (count: number) => count || 0,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？删除后无法恢复，分类下的提示词将不再属于此分类。"
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
      <div className="categories-page">
        <div className="page-header">
          <Title level={2}>分类管理</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showCreateModal}
          >
            创建分类
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={categories} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingCategory ? '编辑分类' : '创建分类'}
          open={modalVisible}
          onCancel={handleCancel}
          footer={null}
          destroyOnClose
        >
          <CategoryForm 
            category={editingCategory} 
            onSuccess={handleFormSuccess} 
            onCancel={handleCancel} 
          />
        </Modal>

        <style jsx>{`
          .categories-page {
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

export default CategoriesPage;
