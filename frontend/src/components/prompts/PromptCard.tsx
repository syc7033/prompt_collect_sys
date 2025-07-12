import React, { useEffect, useState } from 'react';
import { Card, Tag, Space, Button, Typography, Avatar, Rate, Tooltip, Row, Col, Divider, message, Dropdown, Menu } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, ForkOutlined, StarOutlined, CopyOutlined, SendOutlined, EyeOutlined, ShareAltOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Prompt } from '../../services/prompts';
import { recordUsage, UsageType, getUsageStats, UsageStat } from '../../services/usage';
import { getFavorites, addPromptToFavorite, Favorite, checkPromptInAnyFavorite, unfavoritePrompt } from '../../services/favorites';
import ApplyToAIModal from './ApplyToAIModal';

const { Title, Paragraph, Text } = Typography;

interface PromptCardProps {
  prompt: Prompt;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onDelete, showActions = true }) => {
  const router = useRouter();
  const { id, title, description, tags, creator, version, created_at, updated_at, average_rating, rating_count } = prompt;
  
  // 打印描述文本，查看是否包含换行符
  console.log('%c[PromptCard] 描述文本原始值', 'background: #FF9800; color: white', {
    promptId: id,
    description: description,
    hasNewlines: description?.includes('\n'),
    newlineCount: description?.split('\n').length - 1 || 0
  });
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [addingToFavorite, setAddingToFavorite] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [checkingFavoriteStatus, setCheckingFavoriteStatus] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);

  // 打印评分相关数据
  console.log('%c[PromptCard] 组件初始化', 'background: #9C27B0; color: white', {
    ID: id,
    标题: title,
    描述: description?.substring(0, 50) + (description?.length > 50 ? '...' : ''),
    标签: tags,
    创建者: creator,
    版本: version,
    创建时间: created_at,
    更新时间: updated_at,
    评分: average_rating,
    评分数: rating_count
  });

  // 使用状态管理实际的使用统计数据
  const [usageStats, setUsageStats] = useState({
    views: 0,
    copies: 0,
    applies: 0,
    forks: 0
  });
  
  // 处理评分显示
  const displayRating = average_rating !== undefined ? average_rating : 0;
  const displayRatingCount = rating_count !== undefined ? rating_count : 0;
  
  console.log('%c[PromptCard] 评分数据处理', 'background: #9C27B0; color: white', {
    原始评分: average_rating,
    原始评分数: rating_count,
    处理后评分: displayRating,
    处理后评分数: displayRatingCount
  });
  
  // 获取用户收藏夹列表
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoadingFavorites(true);
        const data = await getFavorites();
        setFavorites(data);
      } catch (error) {
        console.error('[PromptCard] 获取收藏夹列表失败:', error);
      } finally {
        setLoadingFavorites(false);
      }
    };
    
    fetchFavorites();
  }, []);
  
  // 检查提示词是否已被收藏
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!id) return;
      
      try {
        setCheckingFavoriteStatus(true);
        const status = await checkPromptInAnyFavorite(id);
        setIsFavorited(status.is_favorited || false);
        console.log(`[PromptCard] 提示词收藏状态:`, status);
      } catch (error) {
        console.error('[PromptCard] 检查收藏状态失败:', error);
      } finally {
        setCheckingFavoriteStatus(false);
      }
    };
    
    checkFavoriteStatus();
  }, [id]);
  
  // 添加到收藏夹
  const handleAddToFavorite = async (favoriteId: string) => {
    try {
      setAddingToFavorite(true);
      await addPromptToFavorite(favoriteId, id);
      message.success('已添加到收藏夹');
      // 更新收藏状态
      setIsFavorited(true);
    } catch (error) {
      console.error('[PromptCard] 添加到收藏夹失败:', error);
      message.error('添加到收藏夹失败，请稍后重试');
    } finally {
      setAddingToFavorite(false);
    }
  };
  
  // 取消收藏
  const handleUnfavorite = async () => {
    try {
      setAddingToFavorite(true);
      const result = await unfavoritePrompt(id);
      if (result.success) {
        message.success('已取消收藏');
        setIsFavorited(false);
      } else {
        message.info(result.message || '提示词未被收藏');
      }
    } catch (error) {
      console.error('[PromptCard] 取消收藏失败:', error);
      message.error('取消收藏失败，请稍后重试');
    } finally {
      setAddingToFavorite(false);
    }
  };
  
  // 处理收藏按钮点击
  const handleFavoriteClick = () => {
    if (isFavorited) {
      // 如果已收藏，点击取消收藏
      handleUnfavorite();
    }
    // 如果未收藏，不做任何操作，因为会显示下拉菜单
  };
  
  // 从后端API获取使用统计数据
  useEffect(() => {
    const fetchUsageStats = async () => {
      console.log('%c[PromptCard] 开始获取使用统计数据', 'background: #9C27B0; color: white', { promptId: id });
      try {
        const stats = await getUsageStats(id);
        console.log('%c[PromptCard] 获取使用统计数据成功', 'background: #4CAF50; color: white', { 
          promptId: id,
          stats: stats
        });
        
        setUsageStats({
          views: stats.view_count || 0,
          copies: stats.copy_count || 0,
          applies: stats.apply_count || 0,
          forks: stats.fork_count || 0
        });
      } catch (error) {
        console.error('%c[PromptCard] 获取使用统计数据失败', 'background: #F44336; color: white', { 
          promptId: id,
          error: error 
        });
        message.error('获取使用统计数据失败');
      }
    };
    
    fetchUsageStats();
  }, [id]);

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

  // 处理查看提示词
  const handleView = () => {
    console.log('%c[PromptCard] 查看按钮被点击，直接导航到详情页', 'background: #FF9800; color: white', { 
      promptId: id,
      timestamp: new Date().toISOString()
    });
    
    // 直接导航到详情页，不在卡片中记录查看行为
    // 详情页会自动记录查看行为，避免重复记录
    router.push(`/prompts/${id}`);
  };

  // 处理复制提示词
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('%c[PromptCard] 开始复制提示词内容', 'background: #9C27B0; color: white', { 
      promptId: id,
      contentLength: prompt.content?.length || 0,
      hasContent: !!prompt.content
    });

    try {
      // 如果提示词内容为空，先从服务器获取内容
      let contentToClipboard = prompt.content;
      
      if (!contentToClipboard || contentToClipboard.trim() === '') {
        console.log('%c[PromptCard] 提示词内容为空，从服务器获取', 'background: #FF9800; color: white', { promptId: id });
        
        try {
          // 动态导入服务以避免SSR问题
          const { getPromptById } = await import('../../services/prompts');
          const fullPrompt = await getPromptById(id);
          
          if (fullPrompt && fullPrompt.content) {
            contentToClipboard = fullPrompt.content;
            console.log('%c[PromptCard] 成功获取提示词内容', 'background: #4CAF50; color: white', { 
              contentLength: contentToClipboard.length 
            });
          } else {
            throw new Error('获取到的提示词内容为空');
          }
        } catch (fetchError) {
          console.error('%c[PromptCard] 获取提示词内容失败', 'background: #F44336; color: white', { 
            promptId: id,
            error: fetchError 
          });
          
          if (typeof window !== 'undefined') {
            const { message } = await import('antd');
            message.error('获取提示词内容失败，请刷新后重试');
          }
          return; // 如果获取失败，直接返回
        }
      }

      // 尝试使用现代 Clipboard API
      let copySuccess = false;
      
      // 方法1: 使用 navigator.clipboard.writeText API (现代浏览器)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(contentToClipboard);
          copySuccess = true;
          console.log('%c[PromptCard] 使用 Clipboard API 复制成功', 'background: #4CAF50; color: white');
        } catch (clipboardError) {
          console.warn('%c[PromptCard] Clipboard API 复制失败，尝试备用方法', 'background: #FF9800; color: white', {
            error: clipboardError
          });
          // 继续尝试备用方法
        }
      } else {
        console.warn('%c[PromptCard] Clipboard API 不可用，使用备用方法', 'background: #FF9800; color: white');
      }
      
      // 方法2: 使用 document.execCommand('copy') (兼容旧浏览器)
      if (!copySuccess && typeof document !== 'undefined') {
        try {
          // 创建临时文本区域
          const textArea = document.createElement('textarea');
          textArea.value = contentToClipboard;
          
          // 确保文本区域在视口之外
          textArea.style.position = 'fixed';
          textArea.style.top = '-9999px';
          textArea.style.left = '-9999px';
          textArea.style.opacity = '0';
          
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          // 执行复制命令
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
            copySuccess = true;
            console.log('%c[PromptCard] 使用 execCommand 复制成功', 'background: #4CAF50; color: white');
          } else {
            console.error('%c[PromptCard] execCommand 复制失败', 'background: #F44336; color: white');
          }
        } catch (execCommandError) {
          console.error('%c[PromptCard] execCommand 复制出错', 'background: #F44336; color: white', {
            error: execCommandError
          });
        }
      }
      
      // 处理复制结果
      if (copySuccess) {
        setCopySuccess(true);
        
        // 复制成功提示
        if (typeof window !== 'undefined') {
          const { message } = await import('antd');
          message.success('提示词已复制到剪贴板！');
        }
        console.log('%c[PromptCard] 复制内容到剪贴板成功', 'background: #4CAF50; color: white');

        // 记录复制行为
        try {
          console.log('%c[PromptCard] 开始记录复制行为', 'background: #9C27B0; color: white', { 
            promptId: id,
            action: 'COPY' 
          });
          await recordUsage(id, UsageType.COPY);
          console.log('%c[PromptCard] 记录复制行为成功', 'background: #4CAF50; color: white', { 
            promptId: id,
            action: 'COPY' 
          });
        } catch (error) {
          console.error('%c[PromptCard] 记录复制行为失败', 'background: #F44336; color: white', { 
            promptId: id,
            action: 'COPY',
            error: error 
          });
        }

        // 2秒后重置复制成功状态
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } else {
        throw new Error('所有复制方法均失败');
      }
    } catch (error) {
      console.error('%c[PromptCard] 复制内容失败', 'background: #F44336; color: white', { 
        promptId: id,
        error: error 
      });
      // 复制失败提示
      if (typeof window !== 'undefined') {
        const { message } = await import('antd');
        message.error('复制失败，请手动复制');
      }
    }
  };

  // 处理应用提示词
  const handleApply = async (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止默认行为
    e.stopPropagation();

    console.log('%c[PromptCard] 打开应用提示词对话框', 'background: #9C27B0; color: white', { 
      promptId: id,
      action: 'OPEN_APPLY_MODAL',
      contentLength: prompt.content ? prompt.content.length : 0
    });
    
    // 检查提示词内容是否为空，如果为空则先获取完整内容
    if (!prompt.content) {
      console.log('%c[PromptCard] 提示词内容为空，正在获取完整内容', 'background: #FF9800; color: white', {
        promptId: id,
        title: title
      });
      
      try {
        // 从API获取完整的提示词内容
        const { getPromptById } = await import('../../services/prompts');
        const fullPrompt = await getPromptById(id);
        
        // 更新本地提示词对象
        prompt.content = fullPrompt.content;
        
        console.log('%c[PromptCard] 成功获取完整提示词内容', 'background: #4CAF50; color: white', {
          promptId: id,
          contentLength: prompt.content.length
        });
      } catch (error) {
        console.error('%c[PromptCard] 获取提示词内容失败', 'background: #F44336; color: white', {
          promptId: id,
          error: error
        });
        message.error('获取提示词内容失败，请稍后重试');
        return;
      }
    }
    
    // 显示对话框而不是直接跳转
    setApplyModalVisible(true);
  };

  // 处理对话框确认应用
  const handleApplyConfirm = async (platformId: string) => {
    console.log('%c[PromptCard] 确认应用提示词', 'background: #9C27B0; color: white', { 
      promptId: id,
      action: 'APPLY',
      platformId: platformId,
      contentAvailable: !!prompt.content,
      contentLength: prompt.content ? prompt.content.length : 0
    });
    
    // 检查提示词内容是否存在
    if (!prompt.content) {
      console.error('%c[PromptCard] 提示词内容仍然为空', 'background: #F44336; color: white', {
        promptId: id
      });
      message.error('提示词内容获取失败，请刷新页面后重试');
      return;
    }
    
    // 记录应用行为
    try {
      await recordUsage(id, UsageType.APPLY);
      console.log('%c[PromptCard] 记录应用行为成功', 'background: #4CAF50; color: white', { 
        promptId: id,
        action: 'APPLY',
        platformId: platformId
      });
    } catch (error) {
      console.error('%c[PromptCard] 记录应用行为失败', 'background: #F44336; color: white', { 
        promptId: id,
        action: 'APPLY',
        platformId: platformId,
        error: error 
      });
    }
  };

  return (
    <>
      <Card
        hoverable
        style={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
  
      title={
        <Link href={`/prompts/${id}`}>
          <a style={{
            direction: 'ltr',
            writingMode: 'horizontal-tb',
            textAlign: 'left',
            display: 'block',
            width: '100%'
          }}>
            <Title
              level={4}
              style={{
                fontSize: '18px',
                marginBottom: '10px',
                direction: 'ltr',
                writingMode: 'horizontal-tb',
                textAlign: 'left',
                whiteSpace: 'pre-line',
                wordBreak: 'break-word'
              }}
            >
              {title}
            </Title>
          </a>
        </Link>
      }
      extra={
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <Text
            type="secondary"
            style={{
              fontSize: '14px',
              direction: 'ltr',
              writingMode: 'horizontal-tb'
            }}
          >
            {creator ? creator.username : '匿名'}
          </Text>
        </Space>
      }
      bodyStyle={{
        padding: '16px',
        paddingBottom: '0', // 移除底部padding，留给按钮区域
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 标签区域 - 固定高度 */}
      <div style={{ marginBottom: '12px', height: '32px', overflow: 'hidden' }}>
        <Space size={[0, 8]} wrap>
          {tags && tags.map((tag, index) => (
            <Tag key={index} color="blue">{tag}</Tag>
          ))}
        </Space>
      </div>

      {/* 描述区域 - 固定高度 */}
      <div style={{ height: '80px', marginBottom: '12px', overflow: 'hidden' }}>
        {/* 添加描述文本的调试信息 */}
        {description && console.log('%c[PromptCard] 描述文本渲染前处理', 'background: #4CAF50; color: white', {
          promptId: id,
          description: description,
          firstChars: description?.substring(0, 20),
          hasNewlines: description?.includes('\n'),
          newlinePositions: description?.split('').map((char, i) => char === '\n' ? i : -1).filter(i => i !== -1)
        })}
        
        {/* 方案B: 使用dangerouslySetInnerHTML将\n替换为<br/>标签 */}
        <div 
          className="prompt-description"
          style={{
            direction: 'ltr',
            writingMode: 'horizontal-tb',
            textAlign: 'left',
            wordBreak: 'break-word',
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.5715',
            color: 'rgba(0, 0, 0, 0.85)',
            maxHeight: '80px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}
          dangerouslySetInnerHTML={{
            __html: (description || prompt.content || '').replace(/\n/g, '<br/>')
          }}
          ref={(el) => {
            if (el) {
              // 渲染后检查DOM元素
              console.log('%c[PromptCard] 描述文本渲染后DOM (新方案)', 'background: #9C27B0; color: white', {
                promptId: id,
                innerHTML: el.innerHTML,
                hasNewlinesInHTML: el.innerHTML?.includes('<br'),
                textContent: el.textContent
              });
            }
          }}
        />
      </div>

      {/* 版本和日期信息 - 固定高度 */}
      <div style={{ marginBottom: '12px', fontSize: '12px', color: '#8c8c8c', height: '50px', overflow: 'hidden' }}>
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text type="secondary" style={{ marginRight: '8px', fontWeight: 500 }}>版本：</Text>
            <Text type="secondary">{version}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text type="secondary" style={{ marginRight: '8px', fontWeight: 500 }}>更新于：</Text>
            <Text type="secondary">{updated_at ? formatDate(updated_at) : '暂无更新时间'}</Text>
          </div>
        </Space>
      </div>

      {/* 评分区域 - 固定高度 */}
      <div style={{ marginBottom: '12px', height: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Rate disabled value={displayRating} allowHalf style={{ fontSize: '16px' }} />
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
            <Text style={{ fontSize: '14px' }}>
              {displayRating > 0 ? displayRating.toFixed(1) : '暂无'}
            </Text>
            <Text style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)', marginLeft: '5px' }}>
              ({displayRatingCount}条评价)
            </Text>
          </div>
        </div>
      </div>

      {/* 使用统计信息区域 - 固定高度 */}
      <div 
        style={{
          padding: '8px 0', 
          borderTop: '1px solid #f0f0f0',
          borderBottom: '1px solid #f0f0f0',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          fontSize: '12px',
          color: '#8c8c8c',
          width: '100%',
          height: '50px'
        }}
      >
        <Row gutter={0} style={{ width: '100%' }}>
          <Col span={6} style={{ textAlign: 'center' }}>
            <div style={{ padding: '4px 0' }}>
              <EyeOutlined style={{ marginRight: '4px' }} />
              <span>{usageStats.views} 查看</span>
            </div>
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <div style={{ padding: '4px 0' }}>
              <CopyOutlined style={{ marginRight: '4px' }} />
              <span>{usageStats.copies} 复制</span>
            </div>
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <div style={{ padding: '4px 0' }}>
              <SendOutlined style={{ marginRight: '4px' }} />
              <span>{usageStats.applies} 应用</span>
            </div>
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <div style={{ padding: '4px 0' }}>
              <ForkOutlined style={{ marginRight: '4px' }} />
              <span>{usageStats.forks} Fork</span>
            </div>
          </Col>
        </Row>
      </div>

      {/* 按钮区域 */}
      {showActions && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 16px',
            backgroundColor: '#fafafa',
            borderTop: '1px solid #f0f0f0',
            marginTop: 'auto',
            borderRadius: '0 0 8px 8px',
            overflow: 'hidden',
            boxSizing: 'border-box',
            marginLeft: '-16px',
            marginRight: '-16px',
            width: 'calc(100% + 32px)', // 覆盖卡片的左右内边距
            height: '50px' // 固定高度确保按钮有足够空间
          }}
        >
          {/* 左侧按钮组 - 查看、复制、应用 */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', width: '40%', gap: '8px' }}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={handleView}
              title="查看提示词"
              style={{
                fontSize: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '32px',
                width: '32px',
                padding: '0',
                minWidth: 'auto'
              }}
            />

            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={handleCopy}
              loading={copySuccess}
              title="复制到剪贴板"
              style={{
                fontSize: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '32px',
                width: '32px',
                padding: '0',
                minWidth: 'auto'
              }}
            />

            <Button
              type="text"
              icon={<SendOutlined />}
              onClick={handleApply}
              title="应用到AI平台"
              style={{
                fontSize: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '32px',
                width: '32px',
                padding: '0',
                minWidth: 'auto'
              }}
            />
          </div>

          {/* 中间空白区域 */}
          <div style={{ width: '10%' }}></div>

          {/* 右侧按钮组 - 收藏、fork、编辑、删除 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '50%', gap: '8px' }}>
            {/* 收藏按钮 */}
            {isFavorited ? (
              // 已收藏状态，显示红色心形，点击取消收藏
              <Button
                type="text"
                icon={<HeartFilled style={{ color: '#ff4d4f' }} />}
                loading={addingToFavorite || checkingFavoriteStatus}
                onClick={handleFavoriteClick}
                title="取消收藏"
                style={{
                  fontSize: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '32px',
                  width: '32px',
                  padding: '0',
                  minWidth: 'auto'
                }}
              />
            ) : (
              // 未收藏状态，显示白色心形，点击显示收藏夹选择
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key="title" disabled>
                      选择收藏夹
                    </Menu.Item>
                    <Menu.Divider />
                    {favorites.length > 0 ? (
                      favorites.map(favorite => (
                        <Menu.Item 
                          key={favorite.id} 
                          onClick={() => handleAddToFavorite(favorite.id)}
                        >
                          {favorite.name}
                        </Menu.Item>
                      ))
                    ) : (
                      <Menu.Item key="empty" disabled>
                        暂无收藏夹
                      </Menu.Item>
                    )}
                    <Menu.Divider />
                    <Menu.Item key="create" onClick={() => router.push('/favorites')}>
                      创建新收藏夹...
                    </Menu.Item>
                  </Menu>
                }
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<HeartOutlined />}
                  loading={addingToFavorite || checkingFavoriteStatus}
                  title="添加到收藏夹"
                  style={{
                    fontSize: '16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '32px',
                    width: '32px',
                    padding: '0',
                    minWidth: 'auto'
                  }}
                />
              </Dropdown>
            )}
            <Button
              type="text"
              icon={<ForkOutlined />}
              onClick={async (e) => {
                e.preventDefault(); // 阻止默认行为
                try {
                  // 先记录使用行为
                  await recordUsage(id, UsageType.FORK);
                  console.log('%c[PromptCard] 记录Fork行为成功', 'background: #4CAF50; color: white', { 
                    promptId: id,
                    action: 'FORK' 
                  });
                  // 成功后再跳转
                  router.push(`/prompts/${id}/fork`);
                } catch (error) {
                  console.error('%c[PromptCard] 记录Fork行为失败', 'background: #F44336; color: white', { 
                    promptId: id,
                    action: 'FORK',
                    error: error 
                  });
                  message.error('操作失败，请稍后重试');
                }
              }}
              title="复制并创建新版本"
              style={{
                fontSize: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '32px',
                width: '32px',
                padding: '0',
                minWidth: 'auto'
              }}
            />

            {creator && creator.id && (
              <Link href={`/prompts/${id}/edit`}>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  title="编辑提示词"
                  style={{
                    fontSize: '16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '32px',
                    width: '32px',
                    padding: '0',
                    minWidth: 'auto'
                  }}
                />
              </Link>
            )}

            {onDelete && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(id)}
                title="删除提示词"
                style={{
                  fontSize: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '32px',
                  width: '32px',
                  padding: '0',
                  minWidth: 'auto'
                }}
              />
            )}
          </div>
        </div>
      )}
    </Card>
      
      {/* 添加AI平台应用对话框 */}
      <ApplyToAIModal
        visible={applyModalVisible}
        promptId={id}
        promptContent={prompt.content}
        onCancel={() => setApplyModalVisible(false)}
        onApply={handleApplyConfirm}
      />
    </>
  );
};

export default PromptCard;

