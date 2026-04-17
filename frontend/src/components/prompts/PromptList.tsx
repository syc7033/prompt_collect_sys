import React from 'react';
import { List, Pagination, Empty, Spin } from 'antd';
import { Prompt } from '../../services/prompts';
import PromptCard from './PromptCard';

interface PromptListProps {
  prompts: Prompt[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onDelete?: (id: string) => void;
}

const PromptList: React.FC<PromptListProps> = ({
  prompts,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onDelete,
}) => {
  // 添加日志，打印提示词数据
  console.log('PromptList组件接收到的提示词数据:', prompts);
  
  // 检查提示词数据中是否包含评分相关字段
  if (prompts && prompts.length > 0) {
    console.log('第一个提示词的评分数据:', {
      id: prompts[0].id,
      title: prompts[0].title,
      average_rating: prompts[0].average_rating,
      rating_count: prompts[0].rating_count
    });
  }
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!prompts || prompts.length === 0) {
    return <Empty description="暂无提示词" />;
  }

  return (
    <>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
        dataSource={prompts}
        style={{ overflow: 'visible' }}
        renderItem={(prompt) => {
          // 为每个提示词添加日志
          console.log(`渲染提示词卡片 ID: ${prompt.id}, 标题: ${prompt.title}`);
          console.log(`评分数据: 平均评分=${prompt.average_rating}, 评论数量=${prompt.rating_count}`);
          
          return (
            <List.Item style={{ height: '100%' }}>
              <PromptCard prompt={prompt} onDelete={onDelete} />
            </List.Item>
          );)
        }}
      />
      
      {total > pageSize && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Pagination
            current={page}
            pageSize={8}
            total={total}
            onChange={(page) => {
              console.log(`Pagination onChange: page=${page}`);
              onPageChange(page, 8);
            }}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total) => `共 ${total} 条提示词`}
            style={{ marginBottom: '20px' }}
          />
        </div>
      )}
    </>
  );
};

export default PromptList;
