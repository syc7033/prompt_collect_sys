import React, { useState, useEffect } from 'react';
import { Typography, Card, Timeline, Button, Skeleton, Descriptions, Tag, message } from 'antd';
import { useRouter } from 'next/router';
import { ClockCircleOutlined, RollbackOutlined } from '@ant-design/icons';
import Layout from '../../../components/ui/Layout';
import { getPromptById, getPromptHistories, Prompt, PromptHistory } from '../../../services/prompts';

const { Title, Paragraph, Text } = Typography;

const PromptHistoryPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [histories, setHistories] = useState<PromptHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  // 获取提示词详情
  useEffect(() => {
    const fetchPrompt = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getPromptById(id as string);
        setPrompt(data);
      } catch (error) {
        console.error('获取提示词详情失败:', error);
        message.error('获取提示词详情失败，请稍后重试');
        router.push('/prompts');
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      fetchPrompt();
    }
  }, [id, router.isReady]);

  // 获取提示词历史记录
  useEffect(() => {
    const fetchHistories = async () => {
      if (!id) return;
      
      try {
        setHistoryLoading(true);
        const data = await getPromptHistories(id as string);
        setHistories(data);
      } catch (error) {
        console.error('获取提示词历史记录失败:', error);
        message.error('获取提示词历史记录失败，请稍后重试');
      } finally {
        setHistoryLoading(false);
      }
    };

    if (router.isReady) {
      fetchHistories();
    }
  }, [id, router.isReady]);

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

  if (loading || historyLoading) {
    return (
      <Layout>
        <Card style={{ marginTop: 24 }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </Layout>
    );
  }

  if (!prompt) {
    return (
      <Layout>
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>提示词不存在</Title>
          <Button type="primary" onClick={() => router.push('/prompts')}>
            返回提示词列表
          </Button>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <Button type="primary" onClick={() => router.push(`/prompts/${id}`)}>
            <RollbackOutlined /> 返回提示词详情
          </Button>
        </div>
        
        <Title level={2}>提示词历史记录</Title>
        <Paragraph>
          查看提示词 "{prompt.title}" 的修改历史记录。当前版本: {prompt.version}
        </Paragraph>
        
        {histories.length === 0 ? (
          <Paragraph>暂无历史记录</Paragraph>
        ) : (
          <Timeline mode="left" className="prompt-history-timeline">
            {histories.map((history) => (
              <Timeline.Item 
                key={history.id} 
                dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
                label={formatDate(history.created_at)}
              >
                <Card style={{ marginBottom: 16 }}>
                  <Descriptions title={`版本 ${history.version}`} bordered column={1}>
                    <Descriptions.Item label="标题">
                      {history.snapshot.title}
                    </Descriptions.Item>
                    <Descriptions.Item label="描述">
                      {history.snapshot.description || '无描述'}
                    </Descriptions.Item>
                    <Descriptions.Item label="标签">
                      {history.snapshot.tags && history.snapshot.tags.length > 0 ? (
                        history.snapshot.tags.map(tag => (
                          <Tag key={tag} color="blue">{tag}</Tag>
                        ))
                      ) : '无标签'}
                    </Descriptions.Item>
                    <Descriptions.Item label="内容">
                      <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {history.snapshot.content}
                        </pre>
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Card>
    </Layout>
  );
};

export default PromptHistoryPage;
