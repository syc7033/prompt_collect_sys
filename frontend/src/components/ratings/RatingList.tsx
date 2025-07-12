import React, { useState, useEffect } from 'react';
import { List, Comment, Rate, Typography, Button, Pagination, Spin, Empty, message, Modal } from 'antd';
import { LikeOutlined, LikeFilled, DeleteOutlined } from '@ant-design/icons';
import { getRatingsByPrompt, markRatingHelpful, deleteRating, Rating } from '../../services/ratings';
import { useAuth } from '../../utils/AuthContext';

const { Text } = Typography;

interface RatingListProps {
  promptId: string;
  refresh: number; // 用于触发刷新的计数器
}

const RatingList: React.FC<RatingListProps> = ({ promptId, refresh }) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 获取评分列表
  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await getRatingsByPrompt(promptId, currentPage, pageSize);
      setRatings(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('获取评分列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 当promptId, currentPage或refresh变化时，重新获取评分列表
  useEffect(() => {
    if (promptId) {
      fetchRatings();
    }
  }, [promptId, currentPage, refresh]);

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 标记评分为有用
  const handleMarkHelpful = async (ratingId: string) => {
    if (!user) {
      message.warning('请先登录后再标记评论为有用');
      return;
    }

    try {
      const result = await markRatingHelpful(ratingId);
      
      // 更新本地状态
      setRatings(prevRatings => 
        prevRatings.map(rating => {
          if (rating.id === ratingId) {
            return {
              ...rating,
              is_helpful: result.is_helpful,
              helpful_count: result.helpful_count
            };
          }
          return rating;
        })
      );
      
      const action = result.is_helpful ? '标记为有用' : '取消标记为有用';
      message.success(`${action}成功`);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('操作失败，请稍后重试');
      }
    }
  };
  
  // 处理删除评论
  const handleDeleteRating = async (ratingId: string) => {
    if (!user) {
      message.warning('请先登录');
      return;
    }
    
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条评论吗？此操作不可逆。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteRating(ratingId);
          
          // 更新本地状态，删除已删除的评论
          setRatings(prevRatings => prevRatings.filter(rating => rating.id !== ratingId));
          setTotal(prevTotal => prevTotal - 1);
          
          message.success('评论已删除');
        } catch (error: any) {
          if (error.response && error.response.data && error.response.data.detail) {
            message.error(error.response.data.detail);
          } else {
            message.error('删除失败，请稍后重试');
          }
        }
      }
    });
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && ratings.length === 0) {
    return <Spin tip="加载评分中..." />;
  }

  return (
    <div>
      {ratings.length === 0 ? (
        <Empty description="暂无评分和评论" />
      ) : (
        <>
          <List
            dataSource={ratings}
            header={`${total} 条评论`}
            itemLayout="horizontal"
            renderItem={(rating) => (
              <List.Item>
                <Comment
                  author={<Text strong>{rating.user_username}</Text>}
                  avatar={<div style={{ width: 32, height: 32, background: '#f0f0f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{rating.user_username.charAt(0).toUpperCase()}</div>}
                  content={
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Rate disabled defaultValue={rating.score} />
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          {rating.score} 分
                        </Text>
                      </div>
                      {rating.comment && <p>{rating.comment}</p>}
                    </div>
                  }
                  datetime={formatDate(rating.created_at)}
                  actions={[
                    <Button 
                      key="helpful" 
                      type="text" 
                      size="small"
                      onClick={() => handleMarkHelpful(rating.id)}
                      icon={rating.is_helpful ? <LikeFilled /> : <LikeOutlined />}
                      disabled={user?.id === rating.user_id}
                    >
                      有用 ({rating.helpful_count})
                    </Button>,
                    // 仅当用户是评论作者或者管理员时，显示删除按钮
                    (user && (user.id === rating.user_id || user.is_superuser)) && (
                      <Button
                        key="delete"
                        type="text"
                        danger
                        size="small"
                        onClick={() => handleDeleteRating(rating.id)}
                        icon={<DeleteOutlined />}
                      >
                        删除
                      </Button>
                    )
                  ]}
                />
              </List.Item>
            )}
          />
          {total > pageSize && (
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RatingList;

