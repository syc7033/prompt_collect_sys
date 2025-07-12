import React, { useState, useEffect } from 'react';
import { Tabs, Spin, message, Button, Modal } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';
import { useRouter } from 'next/router';
import ProfileInfo from '../../components/profile/ProfileInfo';
import ProfileEdit from '../../components/profile/ProfileEdit';
import ChangePassword from '../../components/profile/ChangePassword';
import StatisticsCards from '../../components/profile/StatisticsCards';
import { getUserProfile, getUserStatistics } from '../../services/profileService';
import { UserProfile, ProfileStatistics } from '../../types/profile';
import { logout } from '../../services/auth';
import styles from './Profile.module.css';

const { TabPane } = Tabs;

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [statistics, setStatistics] = useState<ProfileStatistics | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        getUserProfile(),
        getUserStatistics()
      ]);
      setProfile(profileData);
      setStatistics(statsData);
    } catch (error) {
      console.error('获取个人资料失败:', error);
      message.error('获取个人资料失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdated = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
    message.success('个人资料已更新');
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  if (!isAuthenticated) {
    return <div className={styles.notAuthenticated}>请先登录以访问个人中心</div>;
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <Button type="primary" onClick={() => router.push('/')} style={{ marginBottom: 16 }}>
          返回首页
        </Button>
        <h1>个人中心</h1>
      </div>

      {statistics && (
        <div className={styles.statisticsSection}>
          <StatisticsCards statistics={statistics} />
        </div>
      )}

      <Tabs 
        activeKey={activeTab}
        onChange={setActiveTab} 
        className={styles.tabs}
      >
        <TabPane 
          tab={<span><UserOutlined />个人资料</span>} 
          key="info"
        >
          {profile && (
            isEditing ? (
              <ProfileEdit 
                profile={profile} 
                onSave={handleProfileUpdated} 
                onCancel={() => setIsEditing(false)} 
              />
            ) : (
              <ProfileInfo 
                profile={profile} 
                onEdit={toggleEditMode} 
              />
            )
          )}
        </TabPane>
        <TabPane
          tab={<span><LockOutlined />修改密码</span>}
          key="password"
        >
          <ChangePassword 
            onSuccess={() => {
              Modal.success({
                title: '密码修改成功',
                content: '为了您的账号安全，请重新登录',
                okText: '确定',
                onOk: () => {
                  logout(true); // 登出并重定向到登录页面
                }
              });
            }} 
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
