import React, { useState, useEffect } from 'react';
import { 
  List, Card, Tag, Space, Button, Pagination, 
  Empty, Spin, Select, message, Modal
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, EyeOutlined,
  SortAscendingOutlined, SortDescendingOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { getUserPrompts } from '../../services/profileService';
import api from '../../services/api';

const { Option } = Select;

const MyPromptsList: React.FC = () => {
  const router = useRouter();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // 获取用户创建的提示词列表
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        console.log('开始获取用户提示词列表，参数:', {
          skip: (page - 1) * pageSize,
          limit: pageSize,
          sort_by: sortBy,
          sort_order: sortOrder
        });
        setLoading(true);
        
        try {
          const result = await getUserPrompts({
            skip: (page - 1) * pageSize,
            limit: pageSize,
            sort_by: sortBy,
            sort_order: sortOrder as 'asc' | 'desc'
          });
          
          console.log('获取到的提示词数据:', result);
          
          // 确保数据结构正确
          if (result && result.items) {
            setPrompts(result.items || []);
            setTotal(result.total || 0);
          } else {
            console.warn('响应数据结构不符合预期:', result);
            setPrompts([]);
            setTotal(0);
          }
          
          // 检查是否有错误信息
          if (result && result.error) {
            console.error('服务器返回错误:', result.error);
            message.warning(`提示词加载异常: ${result.error}`);
          }
        } catch (apiError) {
          console.error('调用API出错:', apiError);
          message.error('获取提示词列表失败，请重试');
          setPrompts([]);
          setTotal(0);
        }
      } catch (error) {
        console.error('获取提示词列表失败:', error);
        message.error('获取提示词列表失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [page, pageSize, sortBy, sortOrder]);

  // 处理页面变化
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // 处理排序变化
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  // 处理排序顺序变化
  const handleOrderChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // 查看提示词
  const handleView = (id: string) => {
    router.push(`/prompts/${id}`);
  };

  // 编辑提示词
  const handleEdit = (id: string) => {
      router.push(`/prompts/${id}/edit`);
};

  // 删除提示词
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个提示词吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await api.delete(`/api/prompts/${id}`);
          message.success('提示词删除成功');
          
          // 刷新列表
          setPrompts(prompts.filter(item => item.id !== id));
          
          // 更新总数
          setTotal(prev => prev - 1);
        } catch (error) {
          console.error('删除提示词失败:', error);
          message.error('删除提示词失败，请重试');
        }
      }
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          type="primary" 
          onClick={() => router.push('/prompts/create')}
        >
          创建新提示词
        </Button>
        
        <Space>
          <Select 
            value={sortBy} 
            onChange={handleSortChange}
            style={{ width: 120 }}
          >
            <Option value="created_at">创建时间</Option>
            <Option value="updated_at">更新时间</Option>
            <Option value="title">标题</Option>
            <Option value="average_rating">评分</Option>
          </Select>
          
          <Button 
            icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />} 
            onClick={handleOrderChange}
          />
        </Space>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : prompts.length > 0 ? (
        <>
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 4, xxl: 4 }}
            dataSource={prompts}
            renderItem={item => (
              <List.Item>
                <Card
                  title={item.title}
                  hoverable
                  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      height: '80px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {item.description || '无描述'}
                    </p>
                    
                    <div style={{ minHeight: '30px', marginBottom: '10px' }}>
                      {item.tags && item.tags.map((tag: string) => (
                        <Tag key={tag} style={{ marginBottom: '5px' }}>{tag}</Tag>
                      ))}
                    </div>
                    
                    <div style={{ marginTop: 'auto' }}>
                      <p><small>版本: {item.version}</small></p>
                      <p><small>更新于: {new Date(item.updated_at).toLocaleString()}</small></p>
                      {item.usage_count > 0 && (
                        <p><small>使用次数: {item.usage_count}</small></p>
                      )}
                      {item.average_rating > 0 && (
                        <p><small>评分: {item.average_rating.toFixed(1)}/5</small></p>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ 
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: '10px',
                    marginTop: '10px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />} 
                      onClick={() => handleView(item.id)}
                    >
                      查看
                    </Button>
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={() => handleEdit(item.id)}
                    >
                      编辑
                    </Button>
                    <Button 
                      type="text" 
                      danger
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDelete(item.id)}
                    >
                      删除
                    </Button>
                  </div>
                </Card>
              </List.Item>
            )}
          />
          
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <Empty 
          description="您还没有创建任何提示词" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            onClick={() => router.push('/prompts/create')}
          >
            立即创建
          </Button>
        </Empty>
      )}
    </div>
  );
};

export default MyPromptsList;
