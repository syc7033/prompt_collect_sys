import React, { useState } from 'react';
import { Typography, Divider, Card, Tabs, Button } from 'antd';
import { useAuth } from '../../utils/AuthContext';
import { useAuthCheck } from '../../utils/withAuth';
import LoginRequiredModal from '../auth/LoginRequiredModal';
import RatingForm from './RatingForm';
import RatingList from './RatingList';

const { Title } = Typography;
const { TabPane } = Tabs;

interface RatingSectionProps {
  promptId: string;
  averageRating?: number;
  ratingCount?: number;
}

const RatingSection: React.FC<RatingSectionProps> = ({ 
  promptId, 
  averageRating, 
  ratingCount 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [activeKey, setActiveKey] = useState<string>('list');
  const { checkAuth, showLoginModal, setShowLoginModal } = useAuthCheck();

  // 评分提交成功后刷新评分列表
  const handleRatingSuccess = () => {
    setRefreshCounter(prev => prev + 1);
  };
  
  // 切换到写评论模式
  const switchToCommentTab = () => {
    if(checkAuth()) {
      setActiveKey('form');
    }
    // 如果用户未登录，checkAuth会自动显示登录对话框
  };

  return (
    <Card style={{ marginTop: 24 }}>
      <Divider orientation="left">
        <Title level={4}>
          评分与评论
          {averageRating !== undefined && ratingCount !== undefined && (
            <span style={{ fontSize: '0.8em', marginLeft: 8, fontWeight: 'normal' }}>
              (平均 {averageRating.toFixed(1)} 分，共 {ratingCount} 条评分)
            </span>
          )}
        </Title>
      </Divider>

      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="查看评论" key="list">
          <RatingList promptId={promptId} refresh={refreshCounter} />
          
          {!isAuthenticated && (
            <div style={{ padding: 16, textAlign: 'center', marginTop: 16 }}>
              <Button type="primary" onClick={switchToCommentTab}>
                我也要评分
              </Button>
            </div>
          )}
        </TabPane>
        
        {/* 写评论模式 - 不设置禁用，而是在点击时提示登录 */}
        <TabPane tab="写评论" key="form">
          {isAuthenticated ? (
            <RatingForm promptId={promptId} onSuccess={handleRatingSuccess} />
          ) : (
            <div style={{ padding: 16, textAlign: 'center' }}>
              <Button type="primary" onClick={switchToCommentTab}>
                登录后评分
              </Button>
            </div>
          )}
        </TabPane>
      </Tabs>
      
      {/* 登录提示对话框 */}
      <LoginRequiredModal
        visible={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          setActiveKey('form'); // 登录成功后切换到评论模式
        }}
        title="需要登录"
        message="您需要登录后才能发表评论"
        actionName="登录"
      />
    </Card>
  );
};

export default RatingSection;
