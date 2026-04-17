import React, { useState, useEffect } from 'react';
import { Typography, Card, Select, Pagination, Empty, Spin, Radio, Row, Col, message } from 'antd';
import { FireOutlined, RiseOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Layout from '../../components/ui/Layout';
import PromptCard from '../../components/prompts/PromptCard';
import { getPopularPrompts, PopularPrompt } from '../../services/usage';
import { getPromptById, Prompt } from '../../services/prompts';
import { useAuth } from '../../utils/AuthContext';

const { Title } = Typography;
const { Option } = Select;

const PopularPromptsPage: React.FC = () => {
  console.log('[PopularPage] ====== 组件渲染开始 ======');
  
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  console.log('[PopularPage] 路由状态:', {
    pathname: router.pathname,
    query: router.query,
    isReady: router.isReady
  });
  
  console.log('[PopularPage] 认证状态:', {
    isAuthenticated,
    authLoading,
    hasUser: !!user,
    username: user?.username,
    userRole: user?.is_superuser ? 'admin' : 'user'
  });
  
  console.log('[PopularPage] 本地存储状态:', {
    hasToken: typeof window !== 'undefined' ? !!Cookies.get('token') : false,
    hasCachedUser: typeof window !== 'undefined' ? !!localStorage.getItem('cachedUser') : false,
    cachedUsername: typeof window !== 'undefined' && localStorage.getItem('cachedUser') ? 
      JSON.parse(localStorage.getItem('cachedUser') || '{}').username : null
  });
  
  const [prompts, setPrompts] = useState<PopularPrompt[]>([]);
  // 扩展PopularPrompt类型，添加从getPromptById获取的字段
  interface ExtendedPopularPrompt extends PopularPrompt {
    fullContent?: string;
    fullPromptCreatedAt?: string;
    fullPromptUpdatedAt?: string;
  }
  const [promptsWithContent, setPromptsWithContent] = useState<ExtendedPopularPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number | undefined>(undefined); // undefined表示全部时间
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    const fetchPopularPrompts = async () => {
      try {
        setLoading(true);
        const response = await getPopularPrompts(timeRange, page, pageSize);
        setPrompts(response.data);
        setTotal(response.total);
        
        // 获取每个提示词的完整内容
        const promptsWithContentData = [...response.data];
        const fetchContentPromises = promptsWithContentData.map(async (prompt) => {
          try {
            const fullPrompt = await getPromptById(prompt.prompt_id);
            return {
              ...prompt,
              fullContent: fullPrompt.content,
              fullPromptCreatedAt: fullPrompt.created_at,
              fullPromptUpdatedAt: fullPrompt.updated_at
            };
          } catch (error) {
            console.error(`获取提示词 ${prompt.prompt_id} 内容失败:`, error);
            return prompt; // 如果获取失败，返回原始提示词
          }
        });
        
        const results = await Promise.all(fetchContentPromises);
        setPromptsWithContent(results);
      } catch (error) {
        console.error('获取热门提示词失败:', error);
        message.error('获取热门提示词失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPrompts();
  }, [timeRange, page, pageSize]);

  const handleTimeRangeChange = (value: number | undefined) => {
    setTimeRange(value);
    setPage(1); // 重置页码
  };

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  return (
    <Layout>
      <div style={{ padding: '24px 0' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>
              <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
              热门提示词
            </Title>
            
            <Radio.Group 
              value={timeRange} 
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value={undefined}>全部时间</Radio.Button>
              <Radio.Button value={7}>
                <FieldTimeOutlined /> 最近7天
              </Radio.Button>
              <Radio.Button value={30}>
                <FieldTimeOutlined /> 最近30天
              </Radio.Button>
              <Radio.Button value={90}>
                <FieldTimeOutlined /> 最近90天
              </Radio.Button>
            </Radio.Group>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
            </div>
          ) : promptsWithContent.length === 0 ? (
            <Empty description="暂无热门提示词" />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {promptsWithContent.map((prompt, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={prompt.prompt_id}>
                    <div style={{ position: 'relative' }}>
                      {(() => {
                        const rankIndex = index + (page - 1) * pageSize;
                        const rankColors: Record<number, string> = {
                          0: '#d48806', // 金色 - No.1
                          1: '#8c8c8c', // 银色 - No.2
                          2: '#ad6800', // 铜色 - No.3
                        };
                        const bgColor = rankColors[rankIndex] ?? '#595959';
                        const rankLabel = rankIndex === 0 ? '🏆 No.1' : `No.${rankIndex + 1}`;
                        return (
                          <div
                            style={{
                              position: 'absolute',
                              top: '-10px',
                              left: '10px',
                              zIndex: 1,
                              backgroundColor: bgColor,
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          >
                            {rankIndex > 0 && <RiseOutlined style={{ marginRight: 2 }} />}{rankLabel}
                          </div>
                        );
                      })()}
                      <PromptCard 
                        prompt={{
                          id: prompt.prompt_id,
                          title: prompt.title,
                          description: prompt.description || '',
                          content: prompt.fullContent || prompt.description || prompt.title, // 优先使用完整内容，其次是描述，最后是标题
                          tags: [],
                          creator: { 
                            id: '', 
                            username: prompt.creator_username,
                            email: '',
                            is_active: true,
                            is_superuser: false,
                            created_at: '',
                            updated_at: ''
                          },
                          creator_id: '', // 添加缺少的属性
                          parent_id: null, // 添加缺少的属性
                          version: 1,
                          created_at: prompt.fullPromptCreatedAt || '',
                          updated_at: prompt.fullPromptUpdatedAt || '',
                          average_rating: prompt.average_rating !== null ? prompt.average_rating : undefined,
                          rating_count: prompt.rating_count !== null ? prompt.rating_count : 0
                        }} 
                        showActions={true}
                      />
                      <div style={{ 
                        position: 'absolute', 
                        top: '-10px', 
                        right: '10px', 
                        zIndex: 1, 
                        backgroundColor: '#faad14',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        <FireOutlined /> {prompt.usage_count}次
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
              
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Pagination 
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(t) => `共 ${t} 条`}
                />
              </div>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default PopularPromptsPage;

