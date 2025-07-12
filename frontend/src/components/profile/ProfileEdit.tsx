import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Space, Select } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { UserProfile } from '../../types/profile';
import { updateUserProfile, uploadAvatar } from '../../services/profileService';
import type { RcFile } from 'antd/es/upload/interface';
import styles from './ProfileEdit.module.css';

const { TextArea } = Input;
const { Option } = Select;

interface ProfileEditProps {
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ profile, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);


  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const updatedProfile = await updateUserProfile(values);
      onSave(updatedProfile);
    } catch (error) {
      console.error('更新个人资料失败:', error);
      message.error('更新个人资料失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };





  // 处理兴趣标签的转换
  const getInterestsValue = () => {
    return profile.interests || '';
  };

  return (
    <Card className={styles.editCard}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          display_name: profile.display_name || '',
          bio: profile.bio || '',
          website: profile.website || '',
          location: profile.location || '',
          profession: profile.profession || '',
          interests: getInterestsValue(),
        }}
        onFinish={handleSubmit}
      >


        <Form.Item
          name="display_name"
          label="显示名称"
          rules={[{ max: 50, message: '显示名称不能超过50个字符' }]}
        >
          <Input placeholder="请输入您的显示名称" />
        </Form.Item>

        <Form.Item
          name="bio"
          label="个人简介"
          rules={[{ max: 200, message: '个人简介不能超过200个字符' }]}
        >
          <TextArea 
            placeholder="请输入您的个人简介" 
            autoSize={{ minRows: 3, maxRows: 6 }} 
          />
        </Form.Item>

        <Form.Item
          name="website"
          label="个人网站"
          rules={[
            { 
              type: 'url', 
              message: '请输入有效的网址' 
            }
          ]}
        >
          <Input placeholder="请输入您的个人网站" />
        </Form.Item>

        <Form.Item
          name="location"
          label="位置"
        >
          <Input placeholder="请输入您的位置" />
        </Form.Item>

        <Form.Item
          name="profession"
          label="职业"
        >
          <Input placeholder="请输入您的职业" />
        </Form.Item>

        <Form.Item
          name="interests"
          label="兴趣标签"
          extra="多个标签请用逗号分隔"
        >
          <Input placeholder="AI,编程,设计" />
        </Form.Item>

        <Form.Item className={styles.actionButtons}>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />} 
              loading={loading}
            >
              保存
            </Button>
            <Button 
              onClick={onCancel} 
              icon={<CloseOutlined />}
            >
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProfileEdit;
