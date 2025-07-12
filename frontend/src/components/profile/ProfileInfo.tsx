import React from 'react';
import { Card, Descriptions, Button, Tag, Divider } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { UserProfile } from '../../types/profile';
import styles from './ProfileInfo.module.css';

interface ProfileInfoProps {
  profile: UserProfile;
  onEdit: () => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile, onEdit }) => {
  // 处理兴趣标签
  const renderInterests = () => {
    if (!profile.interests) return null;
    
    const interestsList = profile.interests.split(',').map(item => item.trim());
    return (
      <>
        {interestsList.map(interest => (
          <Tag key={interest} color="blue">{interest}</Tag>
        ))}
      </>
    );
  };

  return (
    <Card className={styles.profileCard}>
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <h2>{profile.display_name || profile.username}</h2>
          <p className={styles.username}>@{profile.username}</p>
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={onEdit}
            className={styles.editButton}
          >
            编辑资料
          </Button>
        </div>
      </div>

      <Divider />

      <Descriptions title="个人信息" column={1} className={styles.descriptions}>
        <Descriptions.Item label="邮箱">{profile.email}</Descriptions.Item>
        {profile.location && (
          <Descriptions.Item label="位置">{profile.location}</Descriptions.Item>
        )}
        {profile.profession && (
          <Descriptions.Item label="职业">{profile.profession}</Descriptions.Item>
        )}
        {profile.website && (
          <Descriptions.Item label="网站">
            <a href={profile.website} target="_blank" rel="noopener noreferrer">
              {profile.website}
            </a>
          </Descriptions.Item>
        )}
        {profile.interests && (
          <Descriptions.Item label="兴趣">
            {renderInterests()}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="注册时间">
          {new Date(profile.created_at).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default ProfileInfo;
