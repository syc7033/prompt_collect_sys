import React, { useState, useEffect, useRef } from 'react';
import { Typography, Row, Col, Card, Divider, message, Modal, Button, Spin } from 'antd';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/AuthContext';
import Cookies from 'js-cookie';
import { FireOutlined, StarOutlined, LineChartOutlined, ForkOutlined, AppstoreOutlined, SettingOutlined, UserOutlined, FileTextOutlined, TagsOutlined } from '@ant-design/icons';
import Layout from '../components/ui/Layout';
import PromptList from '../components/prompts/PromptList';
import TagCloud from '../components/prompts/TagCloud';
import PromptCard from '../components/prompts/PromptCard';
import { getPrompts, getPopularTags, deletePrompt, Prompt, TagCount, getPromptById } from '../services/prompts';
import { getPopularPrompts, PopularPrompt } from '../services/usage';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  console.log('[HomePage] ====== 组件开始渲染 ======');
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const initialRenderRef = useRef(true);
  
  // 防止首次渲染时的重定向
  useEffect(() => {
    console.log('[HomePage] 首页组件初始化，设置访问标记');
    // 设置一个标记，表示用户已经访问过首页
    sessionStorage.setItem('visitedHomePage', 'true');
  }, []);
  
  // 添加详细调试日志
  console.log('[HomePage] 认证状态:', { 
    isAuthenticated, 
    authLoading, 
    userExists: !!user,
    username: user?.username,
    userRole: user?.is_superuser ? 'admin' : 'user'
  });
  console.log('[HomePage] 当前路由状态:', {
    pathname: router.pathname,
    asPath: router.asPath,
    query: router.query,
    isReady: router.isReady
  });
  console.log('[HomePage] 本地存储状态:', {
    hasToken: typeof window !== 'undefined' ? !!Cookies.get('token') : false,
    hasCachedUser: typeof window !== 'undefined' ? !!localStorage.getItem('cachedUser') : false,
    cachedUsername: typeof window !== 'undefined' && localStorage.getItem('cachedUser') ? 
      JSON.parse(localStorage.getItem('cachedUser') || '{}').username : null
  });

  // 管理员欢迎标语组件
  const AdminWelcomeBanner = () => {
    if (!user?.is_superuser) return null;

    return (
      <Card 
        style={{ 
          marginBottom: 24,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: 'none'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ 
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          height: '100%'
        }}>
          {/* 左侧彩色条 */}
          <div style={{ 
            width: '6px', 
            background: 'linear-gradient(180deg, #1890ff 0%, #69c0ff 100%)',
            height: '100%'
          }}></div>
          
          {/* 主要内容区 */}
          <div style={{ 
            flex: 1,
            padding: '24px 30px',
            background: 'linear-gradient(145deg, #f0f7ff 0%, #e6f7ff 100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
              }}>
                <SettingOutlined style={{ color: 'white', fontSize: 20 }} />
              </div>
              <Title level={3} style={{ margin: 0, color: '#096dd9', fontWeight: 600 }}>
                欢迎，管理员！
              </Title>
            </div>
            
            <Paragraph style={{ 
              fontSize: '15px', 
              color: '#444', 
              marginBottom: 20,
              fontWeight: 500
            }}>
              您可以使用以下管理功能：
            </Paragraph>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ 
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                width: 'calc(33.33% - 8px)'
              }}>
                <div style={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: '50%', 
                  background: 'rgba(24, 144, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8
                }}>
                  <UserOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                </div>
                <span style={{ color: '#333', fontWeight: 500 }}>管理用户和权限</span>
              </div>
              
              <div style={{ 
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                width: 'calc(33.33% - 8px)'
              }}>
                <div style={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: '50%', 
                  background: 'rgba(82, 196, 26, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8
                }}>
                  <FileTextOutlined style={{ color: '#52c41a', fontSize: 14 }} />
                </div>
                <span style={{ color: '#333', fontWeight: 500 }}>审核提示词内容</span>
              </div>
              
              <div style={{ 
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                width: 'calc(33.33% - 8px)'
              }}>
                <div style={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: '50%', 
                  background: 'rgba(250, 140, 22, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8
                }}>
                  <TagsOutlined style={{ color: '#fa8c16', fontSize: 14 }} />
                </div>
                <span style={{ color: '#333', fontWeight: 500 }}>维护分类和标签</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [popularTags, setPopularTags] = useState<TagCount[]>([]);
  const [popularPrompts, setPopularPrompts] = useState<PopularPrompt[]>([]);
  // 扩展PopularPrompt类型，添加fullContent字段
  type PopularPromptWithContent = PopularPrompt & { 
  fullContent?: string;
  fullPromptCreatedAt?: string;
  fullPromptUpdatedAt?: string;
};
  const [popularPromptsWithContent, setPopularPromptsWithContent] = useState<PopularPromptWithContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagLoading, setTagLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  // 将pageSize改为状态变量，这样可以在handlePageChange中更新它
  const [pageSize, setPageSize] = useState(8);
  
  // 添加调试日志
  useEffect(() => {
    console.log('首页组件加载');
    console.log('窗口尺寸:', window.innerWidth, 'x', window.innerHeight);
    console.log('文档元素:', document.documentElement.clientWidth, 'x', document.documentElement.clientHeight);
    console.log('文档方向:', document.dir);
    console.log('文本对齐:', getComputedStyle(document.documentElement).textAlign);
    console.log('书写模式:', getComputedStyle(document.documentElement).writingMode);
    
    // 调试CSS问题
    document.documentElement.style.direction = 'ltr';
    document.documentElement.style.writingMode = 'horizontal-tb';
    document.documentElement.style.textOrientation = 'mixed';
    document.body.style.writingMode = 'horizontal-tb';
    document.body.style.textAlign = 'left';
    
    // 打印所有样式表
    console.log('加载的样式表:');
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        console.log(`- ${i}:`, document.styleSheets[i].href);
      } catch (e) {
        console.log(`- ${i}: 无法访问`);
      }
    }
  }, []);

  // 将fetchPrompts提取为组件级别的函数，固定使用8条/页
  const fetchPrompts = async (currentPage = page) => {
    try {
      setLoading(true);
      console.log(`获取提示词: 页码=${currentPage}, 每页条数=8`);
      
      // 获取最新提示词
      const result = await getPrompts(currentPage, 8);
      
      // 获取评分数据（从热门提示词 API 获取）
      const ratingDataResponse = await getPopularPrompts(30, 1, 100); // 获取足够多的提示词，以确保液盖所有最新提示词
      
      // 创建评分数据映射
      const ratingMap: Record<string, {average_rating: number, rating_count: number}> = {};
      ratingDataResponse.data.forEach(item => {
        ratingMap[item.prompt_id] = {
          average_rating: item.average_rating !== null ? item.average_rating : 0,
          rating_count: item.rating_count !== null ? item.rating_count : 0
        };
      });
      
      // 合并最新提示词和评分数据
      const processedPrompts = result.data.map(prompt => {
        const ratingData = ratingMap[prompt.id] || { average_rating: 0, rating_count: 0 };
        return {
          ...prompt,
          average_rating: ratingData.average_rating,
          rating_count: ratingData.rating_count
        };
      });
      
      console.log('处理后的最新提示词数据:', processedPrompts);
      console.log('评分数据映射:', ratingMap);
      setPrompts(processedPrompts);
      setTotal(result.total);
    } catch (error) {
      console.error('获取提示词失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取最新提示词
  useEffect(() => {
    fetchPrompts();
  }, [page, pageSize]);

  // 获取热门标签
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setTagLoading(true);
        const tags = await getPopularTags(10);
        setPopularTags(tags);
      } catch (error) {
        console.error('获取热门标签失败:', error);
      } finally {
        setTagLoading(false);
      }
    };

    fetchTags();
  }, []);
  // 获取热门提示词
  useEffect(() => {
    const fetchPopularPrompts = async () => {
      try {
        setPopularLoading(true);
        console.log('[HomePage] 开始获取热门提示词');
        const response = await getPopularPrompts(undefined, 1, 4);
        console.log('[HomePage] 获取热门提示词成功:', response.data);
        setPopularPrompts(response.data);
        
        // 获取每个热门提示词的完整内容
        console.log('[HomePage] 开始获取热门提示词完整内容');
        const promptsWithContentData = [...response.data];
        const fetchContentPromises = promptsWithContentData.map(async (prompt) => {
          try {
            console.log(`[HomePage] 获取提示词 ${prompt.prompt_id} 的完整内容`);
            const fullPrompt = await getPromptById(prompt.prompt_id);
            console.log(`[HomePage] 获取提示词 ${prompt.prompt_id} 完整内容成功:`, {
              title: fullPrompt.title,
              hasContent: !!fullPrompt.content,
              contentLength: fullPrompt.content?.length || 0
            });
            return {
              ...prompt,
              fullContent: fullPrompt.content,
              fullPromptCreatedAt: fullPrompt.created_at,
              fullPromptUpdatedAt: fullPrompt.updated_at
            } as PopularPromptWithContent;
          } catch (error) {
            console.error(`[HomePage] 获取提示词 ${prompt.prompt_id} 内容失败:`, error);
            return prompt as PopularPromptWithContent; // 如果获取失败，返回原始提示词
          }
        });
        
        const results = await Promise.all(fetchContentPromises);
        console.log('[HomePage] 所有热门提示词内容获取完成:', results.map(p => ({
          id: p.prompt_id,
          title: p.title,
          hasDescription: !!p.description,
          hasFullContent: !!(p as PopularPromptWithContent).fullContent,
          fullContentLength: (p as PopularPromptWithContent).fullContent?.length || 0
        })));
        setPopularPromptsWithContent(results);
      } catch (error) {
        console.error('[HomePage] 获取热门提示词失败:', error);
        message.error('获取热门提示词失败');
      } finally {
        setPopularLoading(false);
      }
    };

    fetchPopularPrompts();
  }, []);

// ...
  // 处理页码变化 - 固定使用8条/页
  const handlePageChange = (newPage: number) => {
    console.log(`页面变化: 页码=${newPage}, 每页条数=8`);
    console.log(`当前状态: page=${page}`);
    
    try {
      // 更新页码
      setPage(newPage);
      console.log(`已设置新的页码: ${newPage}`);
      
      // 手动触发数据重新加载
      fetchPrompts(newPage);
    } catch (error) {
      console.error(`处理页面变化时出错:`, error);
    }
  };

  // 处理标签点击
  const handleTagClick = (tag: string) => {
    // 构建查询参数，确保传递空的q参数
    router.push({
      pathname: '/prompts',
      query: { 
        q: '',  // 显式传递空的查询参数
        tags: [tag] 
      }
    });
  };
  
  // 处理删除提示词
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这个提示词吗？此操作不可撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deletePrompt(id);
          message.success('提示词已成功删除');
          // 重新加载提示词列表
          const result = await getPrompts(page, pageSize);
          setPrompts(result.data);
          setTotal(result.total);
        } catch (error) {
          console.error('删除提示词失败:', error);
          message.error('删除提示词失败，请稍后重试');
        }
      }
    });
  };

  return (
    <Layout>
      <div className="home-container">
        {/* 管理员欢迎标语 */}
        <AdminWelcomeBanner />
        <div className="welcome-section">
          <Card 
            style={{ 
              marginBottom: '24px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: 'none',
              boxShadow: '0 10px 30px rgba(24, 144, 255, 0.1)'
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ 
              display: 'flex',
              flexDirection: 'row',
              minHeight: '180px'
            }}>
              {/* 左侧信息区 */}
              <div style={{ 
                flex: '1',
                padding: '32px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fcff 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  position: 'absolute',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(24,144,255,0.03) 0%, rgba(24,144,255,0) 70%)',
                  top: '-100px',
                  right: '-100px',
                  zIndex: 0
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    display: 'inline-block',
                    background: 'linear-gradient(90deg, #1890ff 0%, #69c0ff 100%)',
                    borderRadius: '20px',
                    padding: '6px 16px',
                    marginBottom: '16px',
                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)'
                  }}>
                    <span style={{ color: 'white', fontWeight: 500, fontSize: '14px' }}>2.0 版本</span>
                  </div>
                  
                  <Title level={2} style={{ 
                    margin: 0, 
                    color: '#0050b3', 
                    fontWeight: 600,
                    fontSize: '28px',
                    marginBottom: '8px'
                  }}>
                    AI提示词知识库
                  </Title>
                  
                  <div style={{ 
                    width: '40px', 
                    height: '4px', 
                    background: 'linear-gradient(90deg, #1890ff 0%, #69c0ff 100%)',
                    marginBottom: '16px',
                    borderRadius: '2px'
                  }}></div>
                  
                  <Paragraph style={{ 
                    fontSize: '15px', 
                    lineHeight: '1.8', 
                    color: '#333',
                    marginBottom: '24px',
                    maxWidth: '600px'
                  }}>
                    欢迎使用AI提示词知识库！本平台致力于为企业和开发者团队提供高效的AI提示词管理、协作与分享服务。在这里，您可以集中管理、分类、搜索和优化各类AI提示词，支持多平台应用和团队协作，共同提升AI使用效果与创新效率。
                  </Paragraph>
                  
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(24, 144, 255, 0.06)',
                      padding: '8px 16px',
                      borderRadius: '8px'
                    }}>
                      <StarOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                      <span style={{ fontWeight: 500, color: '#333' }}>高效管理</span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(82, 196, 26, 0.06)',
                      padding: '8px 16px',
                      borderRadius: '8px'
                    }}>
                      <ForkOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      <span style={{ fontWeight: 500, color: '#333' }}>团队协作</span>
                    </div>
                    
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(250, 140, 22, 0.06)',
                      padding: '8px 16px',
                      borderRadius: '8px'
                    }}>
                      <LineChartOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                      <span style={{ fontWeight: 500, color: '#333' }}>效果优化</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 右侧装饰区 */}
              <div style={{ 
                width: '180px',
                background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  position: 'absolute',
                  width: '240px',
                  height: '240px',
                  borderRadius: '50%',
                  border: '20px solid rgba(24, 144, 255, 0.1)',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}></div>
                
                <div style={{ 
                  position: 'absolute',
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  border: '15px solid rgba(24, 144, 255, 0.15)',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}></div>
                
                <div style={{ 
                  position: 'absolute',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  boxShadow: '0 8px 16px rgba(24, 144, 255, 0.3)',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FireOutlined style={{ color: 'white', fontSize: '32px' }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <Divider 
          orientation="left" 
          style={{ 
            margin: '20px 0', 
            fontSize: '18px', 
            fontWeight: 'bold'
          }}
        >
          热门提示词
        </Divider>
        
        <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          {popularLoading ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin />
            </div>
          ) : popularPromptsWithContent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p>暂无热门提示词</p>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {popularPromptsWithContent.slice(0, 4).map((prompt, index) => (
                <Col xs={24} sm={12} md={12} lg={12} key={prompt.prompt_id}>
                  <div style={{ position: 'relative' }}>
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: '-10px', 
                        right: '10px', 
                        zIndex: 1, 
                        backgroundColor: '#ff4d4f',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      <FireOutlined /> {prompt.usage_count}次
                    </div>
                    <PromptCard 
                      prompt={{
                        id: prompt.prompt_id,
                        title: prompt.title,
                        description: prompt.description || '',
                        content: (prompt as PopularPromptWithContent).fullContent || prompt.description || prompt.title, // 优先使用完整内容，其次是描述，最后是标题
                        tags: [],
                        creator: { 
                          id: '', 
                          username: prompt.creator_username,
                          email: '',
                          is_active: true,
                          is_superuser: false,
                          created_at: (prompt as PopularPromptWithContent).fullPromptCreatedAt || '',
                          updated_at: (prompt as PopularPromptWithContent).fullPromptUpdatedAt || ''
                        },
                        creator_id: '',
                        parent_id: null,
                        version: 1,
                        created_at: (prompt as PopularPromptWithContent).fullPromptCreatedAt || '',
                        updated_at: (prompt as PopularPromptWithContent).fullPromptUpdatedAt || '',
                        average_rating: prompt.average_rating !== null ? prompt.average_rating : undefined,
                        rating_count: prompt.rating_count !== null ? prompt.rating_count : 0
                      }} 
                      showActions={true}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Card>

        <Divider 
          orientation="left" 
          style={{ 
            margin: '20px 0', 
            fontSize: '18px', 
            fontWeight: 'bold'
          }}
        >
          最新提示词
        </Divider>
        <PromptList
          prompts={prompts}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
        />
      </div>
    </Layout>
  );
};

export default HomePage;

