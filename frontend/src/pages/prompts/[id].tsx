import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Typography, Card, Button, Space, Tag, Divider, message, Skeleton, Row, Col, Tooltip, Dropdown, Menu, Select, Alert, Result } from 'antd';
import { EditOutlined, DeleteOutlined, ForkOutlined, HistoryOutlined, UserOutlined, StarOutlined, CopyOutlined, SendOutlined, HeartOutlined, HeartFilled, FolderOutlined, LoginOutlined } from '@ant-design/icons';
import PlatformSelectModal from '../../components/prompts/PlatformSelectModal';
import Layout from '../../components/ui/Layout';
import { getPromptById, getSimilarPrompts, deletePrompt, Prompt, updatePrompt } from '../../services/prompts';
import { recordUsage, UsageType } from '../../services/usage';
import { useAuth } from '../../utils/AuthContext';
import { useAuthCheck } from '../../utils/withAuth';
import LoginRequiredModal from '../../components/auth/LoginRequiredModal';
import PromptCard from '../../components/prompts/PromptCard';
import RatingSection from '../../components/ratings/RatingSection';
import UsageStats from '../../components/usage/UsageStats';
import { getFavorites, addPromptToFavorite, checkPromptInAnyFavorite, unfavoritePrompt, Favorite } from '../../services/favorites';
import { getCategories, Category, getCategory } from '../../services/categories';

const { Title, Paragraph, Text } = Typography;

const PromptDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  // 修改：使用useState代替useAuthCheck，只在特定操作时显示登录模态框
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState<string>('');
  
  console.log('AUTH_DEBUG: PromptDetailPage 初始化, isAuthenticated:', isAuthenticated, 'user:', user);
  
  // 自定义的权限检查函数，不会自动重定向
  const checkAuth = (action: string): boolean => {
    console.log('AUTH_DEBUG: checkAuth 被调用, action:', action, 'isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('AUTH_DEBUG: 用户已登录，允许操作');
      return true;
    } else {
      console.log('AUTH_DEBUG: 用户未登录，显示登录模态框');
      setLoginAction(action);
      setShowLoginModal(true);
      return false;
    }
  };
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [similarPrompts, setSimilarPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const viewRecorded = useRef(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [addingToFavorite, setAddingToFavorite] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [checkingFavoriteStatus, setCheckingFavoriteStatus] = useState(false);
  
  // 平台选择对话框状态
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  
  // 分类相关状态
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [updatingCategory, setUpdatingCategory] = useState(false);

  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('获取分类列表失败:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // 路由变化监听
  useEffect(() => {
    console.log('AUTH_DEBUG: 路由参数变化, query:', router.query);
  }, [router.query]);
  
  // 获取提示词详情
  useEffect(() => {
    const fetchPrompt = async () => {
      if (!id) return;
      
      console.log('AUTH_DEBUG: 开始获取提示词详情, id:', id);
      try {
        setLoading(true);
        const data = await getPromptById(id as string);
        console.log('AUTH_DEBUG: 获取提示词成功:', data ? '成功' : '失败');
        setPrompt(data);
        
        // 如果提示词有分类ID，获取分类信息
        if (data.category_id) {
          try {
            const categoryData = await getCategory(data.category_id);
            setCategory(categoryData);
          } catch (categoryError) {
            console.error('获取分类信息失败:', categoryError);
          }
        } else {
          setCategory(null);
        }
        
        // 记录查看行为，使用useRef确保只记录一次
        if (!viewRecorded.current) {
          try {
            await recordUsage(id as string, UsageType.VIEW);
            viewRecorded.current = true;
            console.log('记录查看行为成功');
          } catch (usageError) {
            console.error('记录查看行为失败:', usageError);
            console.log('AUTH_DEBUG: 记录查看行为出错:', usageError);
          }
        }
      } catch (error) {
        console.error('获取提示词详情失败:', error);
        console.log('AUTH_DEBUG: 获取提示词详情出错:', error);
        message.error('获取提示词详情失败');
      } finally {
        setLoading(false);
        console.log('AUTH_DEBUG: 加载状态结束');
      }
    };

    if (router.isReady) {
      fetchPrompt();
    }
  }, [id, router.isReady]);

  // 获取用户收藏夹列表
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoadingFavorites(true);
        const data = await getFavorites();
        setFavorites(data);
      } catch (error) {
        console.error('获取收藏夹失败:', error);
      } finally {
        setLoadingFavorites(false);
      }
    };
    
    fetchFavorites();
  }, [isAuthenticated]);
  
  // 检查提示词是否已被收藏
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!prompt || !prompt.id) return;
      
      try {
        setCheckingFavoriteStatus(true);
        const status = await checkPromptInAnyFavorite(prompt.id);
        setIsFavorited(status.is_favorited || false);
        console.log(`[PromptDetail] 提示词收藏状态:`, status);
      } catch (error) {
        console.error('[PromptDetail] 检查收藏状态失败:', error);
      } finally {
        setCheckingFavoriteStatus(false);
      }
    };
    
    if (prompt) {
      checkFavoriteStatus();
    }
  }, [prompt]);

  // 添加到收藏夹
  const handleAddToFavorite = async (favoriteId: string) => {
    if (!prompt) return;
    
    // 检查用户是否已登录
    if (!checkAuth('添加到收藏夹')) {
      return; // checkAuth会自动显示登录对话框
    }
    
    try {
      setAddingToFavorite(true);
      await addPromptToFavorite(favoriteId, prompt.id);
      message.success('已添加到收藏夹');
      // 更新收藏状态
      setIsFavorited(true);
    } catch (error) {
      console.error('添加到收藏夹失败:', error);
      message.error('添加到收藏夹失败，请稍后重试');
    } finally {
      setAddingToFavorite(false);
    }
  };
  
  // 取消收藏
  const handleUnfavorite = async () => {
    if (!prompt) return;
    
    // 检查用户是否已登录
    if (!checkAuth('取消收藏')) {
      return; // checkAuth会自动显示登录对话框
    }
    
    try {
      setAddingToFavorite(true);
      const result = await unfavoritePrompt(prompt.id);
      if (result.success) {
        message.success('已取消收藏');
        setIsFavorited(false);
      } else {
        message.info(result.message || '提示词未被收藏');
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
      message.error('取消收藏失败，请稍后重试');
    } finally {
      setAddingToFavorite(false);
    }
  };

  // 处理收藏按钮点击
  const handleFavoriteClick = () => {
    if (!checkAuth('收藏提示词')) return;

    if (isFavorited) {
      handleUnfavorite();
    } else {
      // 如果有收藏夹，显示下拉菜单
      // 如果没有收藏夹，创建默认收藏夹并添加
      if (favorites.length === 0) {
        message.info('您还没有创建收藏夹，请先创建收藏夹');
      }
    }
  };

  // 处理更新分类
  const handleCategoryChange = async (categoryId: string | undefined) => {
    if (!prompt) return;

    // 检查用户是否已登录
    if (!checkAuth('修改分类')) {
      return; // checkAuth会自动显示登录对话框
    }

    // 检查是否有权限更新分类
    if (user && user.id !== prompt.creator_id && !user.is_superuser) {
      message.error('您没有权限修改此提示词的分类');
      return;
    }

    try {
      setUpdatingCategory(true);

      // 更新提示词分类
      await updatePrompt(prompt.id, { category_id: categoryId });

      // 如果选择了分类，获取分类信息
      if (categoryId) {
        const categoryData = await getCategory(categoryId);
        setCategory(categoryData);
      } else {
        setCategory(null);
      }

      // 更新提示词对象中的分类 ID
      setPrompt(prev => prev ? { ...prev, category_id: categoryId } : null);

      message.success('分类已更新');
    } catch (error) {
      console.error('更新分类失败:', error);
      message.error('更新分类失败，请稍后重试');
    } finally {
      setUpdatingCategory(false);
    }
  };

  // 获取相似提示词
  useEffect(() => {
    const fetchSimilarPrompts = async () => {
      if (!id) return;

      try {
        setSimilarLoading(true);
        const data = await getSimilarPrompts(id as string);
        setSimilarPrompts(data);
      } catch (error) {
        console.error('获取相似提示词失败:', error);
      } finally {
        setSimilarLoading(false);
      }
    };

    if (router.isReady && prompt) {
      fetchSimilarPrompts();
    }
  }, [id, router.isReady, prompt]);

  // 处理删除提示词
  const handleDelete = async () => {
    if (!checkAuth('删除提示词')) return;

    if (!prompt) return;

    // 检查是否有权限删除
    if (user?.id !== prompt.creator_id && !user?.is_superuser) {
      message.error('您没有权限删除此提示词');
      return;
    }

    try {
      await deletePrompt(prompt.id);
      message.success('提示词已删除');
      router.push('/prompts');
    } catch (error) {
      console.error('删除提示词失败:', error);
      message.error('删除提示词失败，请稍后重试');
    }
  };

  // 处理Fork提示词
  const handleFork = async () => {
    if (!checkAuth('Fork提示词')) return;

    if (!prompt) return;

    // 记录Fork行为
    try {
      await recordUsage(prompt.id, UsageType.FORK);
      console.log('记录Fork行为成功');
    } catch (error) {
      console.error('记录Fork行为失败:', error);
    }
    
    router.push(`/prompts/${prompt.id}/fork`);
  };
  
  // 处理复制提示词
  const handleCopy = async () => {
    if (!prompt) return;
    
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopySuccess(true);
      message.success('提示词已复制到剪贴板');
      
      // 记录复制行为
      try {
        await recordUsage(prompt.id, UsageType.COPY);
        console.log('记录复制行为成功');
      } catch (error) {
        console.error('记录复制行为失败:', error);
      }
      
      // 2秒后重置复制成功状态
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败，请手动复制');
    }
  };
  
  // 处理应用提示词（打开到AI平台）
  const handleApply = async () => {
    if (!prompt) return;
    
    // 记录应用行为
    try {
      await recordUsage(prompt.id, UsageType.APPLY);
      console.log('记录应用行为成功');
    } catch (error) {
      console.error('记录应用行为失败:', error);
    }
    
    // 显示平台选择对话框
    setShowPlatformModal(true);
  };
  
  // 处理应用到选定平台
  const handleApplyToPlatform = (platformUrl: string) => {
    setShowPlatformModal(false);
    window.open(platformUrl, '_blank');
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

  // 处理加载中状态
  if (loading) {
    return (
      <Layout>
        <Card style={{ marginTop: 24 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
          <div style={{ display: 'none' }}>{console.log('AUTH_DEBUG: 正在加载提示词详情...')}</div>
        </Card>
      </Layout>
    );
  }
  
  // 处理提示词不存在的情况
  if (!prompt) {
    return (
      <Layout>
        <Card style={{ marginTop: 24 }}>
          <Result
            status="404"
            title="提示词不存在"
            subTitle="您查找的提示词不存在或已被删除"
            extra={<Button type="primary" onClick={() => router.push('/prompts')}>返回提示词列表</Button>}
          />
          <div style={{ display: 'none' }}>{console.log('AUTH_DEBUG: 提示词不存在或加载失败')}</div>
        </Card>
      </Layout>
    );
  }

  console.log('AUTH_DEBUG: 渲染提示词详情页面, loading:', loading, 'prompt:', prompt ? '存在' : '不存在');

  return (
    <Layout>
      <Card style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2}>{prompt.title}</Title>
            {prompt.average_rating !== undefined && (
              <div style={{ marginTop: -8, marginBottom: 8 }}>
                <StarOutlined style={{ color: '#fadb14', marginRight: 4 }} />
                <Text strong>{prompt.average_rating.toFixed(1)}</Text>
                <Text type="secondary"> ({prompt.rating_count} 条评分)</Text>
              </div>
            )}
          </div>
          
          <Space>
            {isAuthenticated && (user?.id === prompt.creator_id || user?.is_superuser) && (
              <>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => router.push(`/prompts/${prompt.id}/edit`)}>
                  编辑
                </Button>
                <Button 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  删除
                </Button>
              </>
            )}
            
            <Button 
              icon={<ForkOutlined />}
              onClick={handleFork}
            >
              Fork
            </Button>
            
            <Button 
              icon={<HistoryOutlined />}
              onClick={() => router.push(`/prompts/${prompt.id}/history`)}
            >
              历史
            </Button>
            
            <Dropdown 
              overlay={
                <Menu>
                  {!isAuthenticated ? (
                    <Menu.Item key="login" onClick={() => setShowLoginModal(true)}>
                      <LoginOutlined /> 登录后收藏
                    </Menu.Item>
                  ) : loadingFavorites ? (
                    <Menu.Item key="loading" disabled>
                      加载中...
                    </Menu.Item>
                  ) : favorites.length > 0 ? (
                    favorites.map(favorite => (
                      <Menu.Item 
                        key={favorite.id} 
                        onClick={() => handleAddToFavorite(favorite.id)}
                      >
                        {favorite.name}
                      </Menu.Item>
                    ))
                  ) : (
                    <Menu.Item key="none" disabled>
                      没有收藏夹
                    </Menu.Item>
                  )}
                  {isAuthenticated && (
                    <>
                      <Menu.Divider />
                      <Menu.Item 
                        key="create" 
                        onClick={() => router.push('/favorites/create')}
                      >
                        创建收藏夹
                      </Menu.Item>
                    </>
                  )}
                </Menu>
              }
              trigger={['click']}
              disabled={isFavorited}
            >
              <Button 
                icon={isFavorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} 
                loading={addingToFavorite || checkingFavoriteStatus}
              >
                收藏
              </Button>
            </Dropdown>
          </Space>
        </div>
        
        <div style={{ margin: '16px 0' }}>
          {prompt.tags && prompt.tags.map(tag => (
            <Tag key={tag} color="blue">{tag}</Tag>
          ))}
          
          {/* 分类信息 */}
          {category && (
            <Tag color="green" icon={<FolderOutlined />}>{category.name}</Tag>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <UserOutlined style={{ marginRight: 8 }} />
          <Text>{prompt.creator.username}</Text>
          <Divider type="vertical" />
          <Text type="secondary">版本: {prompt.version}</Text>
          <Divider type="vertical" />
          <Text type="secondary">创建于: {formatDate(prompt.created_at)}</Text>
          <Divider type="vertical" />
          <Text type="secondary">更新于: {formatDate(prompt.updated_at)}</Text>
          
          {/* 分类选择器（仅对创建者或管理员显示） */}
          {(user?.id === prompt.creator_id || user?.is_superuser) && (
            <>
              <Divider type="vertical" />
              <Text type="secondary">分类:</Text>
              <Select 
                style={{ width: 150, marginLeft: 8 }}
                placeholder="选择分类"
                value={prompt.category_id || undefined}
                onChange={handleCategoryChange}
                loading={loadingCategories || updatingCategory}
                allowClear
              >
                {categories.map(cat => (
                  <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                ))}
              </Select>
            </>
          )}
        </div>
        
        {prompt.description && (
          <div style={{ marginBottom: 24 }}>
            <Title level={4}>描述</Title>
            <Paragraph>{prompt.description}</Paragraph>
          </div>
        )}
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Title level={4} style={{ margin: 0 }}>提示词内容</Title>
            <Space>
              <Tooltip title="复制到剪贴板">
                <Button 
                  type="primary" 
                  icon={<CopyOutlined />} 
                  onClick={handleCopy}
                  loading={copySuccess}
                >
                  复制
                </Button>
              </Tooltip>
              <Tooltip title="应用到ChatGPT">
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={handleApply}
                >
                  应用
                </Button>
              </Tooltip>
            </Space>
          </div>
          <Card>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {prompt.content}
            </pre>
          </Card>
        </div>
        
        {/* 使用统计区域 */}
        <UsageStats promptId={prompt.id} />
        
        {/* 评分和评论区域 */}
        <RatingSection 
          promptId={prompt.id} 
          averageRating={prompt.average_rating} 
          ratingCount={prompt.rating_count} 
        />
        
        {similarPrompts.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <Divider orientation="left">相似提示词</Divider>
            <Row gutter={[16, 16]}>
              {similarPrompts.map(similarPrompt => (
                <Col xs={24} sm={12} md={8} key={similarPrompt.id}>
                  <PromptCard prompt={similarPrompt} showActions={false} />
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Card>
      {/* 登录提示对话框 */}
      <LoginRequiredModal
        visible={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        onLogin={() => setShowLoginModal(false)}
        title="需要登录"
        message={`您需要登录后才能${loginAction || '执行此操作'}`}
        actionName="登录"
      />
      
      {/* AI平台选择对话框 */}
      {prompt && (
        <PlatformSelectModal
          visible={showPlatformModal}
          prompt={prompt.content}
          preview={prompt.content}
          onCancel={() => setShowPlatformModal(false)}
          onApply={handleApplyToPlatform}
        />
      )}
    </Layout>
  );
};

export default PromptDetailPage;
