import React, { useState } from 'react';
import { Modal, Button, Typography } from 'antd';
import { useRouter } from 'next/router';
import { useAuth } from '../../utils/AuthContext';

const { Title, Paragraph } = Typography;

interface LoginRequiredModalProps {
  visible: boolean;
  onCancel: () => void;
  onLogin: () => void;
  title?: string;
  message?: string;
  actionName?: string;
}

/**
 * 登录提示对话框组件
 * 当用户尝试执行需要登录的操作时显示
 */
const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  visible,
  onCancel,
  onLogin,
  title = '需要登录',
  message = '您需要登录后才能执行此操作',
  actionName = '登录'
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // 如果用户已登录，自动关闭对话框
  React.useEffect(() => {
    if (isAuthenticated && visible) {
      onCancel();
    }
  }, [isAuthenticated, visible, onCancel]);

  const handleLogin = () => {
    // 将当前URL保存到sessionStorage，登录后可以返回
    if (typeof window !== 'undefined') {
      const redirectUrl = window.location.pathname + window.location.search;
      console.log('[LOGIN_MODAL] 保存重定向URL:', redirectUrl);
      sessionStorage.setItem('redirectAfterLogin', redirectUrl);
      console.log('[LOGIN_MODAL] 验证保存的URL:', sessionStorage.getItem('redirectAfterLogin'));
    }
    onLogin();
    console.log('[LOGIN_MODAL] 跳转到登录页面');
    router.push('/auth/login');
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="login" type="primary" onClick={handleLogin}>
          {actionName}
        </Button>
      ]}
      centered
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Title level={4}>{title}</Title>
        <Paragraph>{message}</Paragraph>
      </div>
    </Modal>
  );
};

export default LoginRequiredModal;
