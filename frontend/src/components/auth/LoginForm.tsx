import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { login, UserLoginData } from '../../services/auth';
import { useAuth } from '../../utils/AuthContext';

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();
  
  // 强制设置表单内文本方向
  useEffect(() => {
    console.log('登录表单组件加载');
    
    // 添加内联样式
    const style = document.createElement('style');
    style.textContent = `
      .ant-form, .ant-form-item, .ant-input, .ant-checkbox-wrapper, .ant-btn, a {
        direction: ltr !important;
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const onFinish = async (values: UserLoginData) => {
    setLoading(true);
    try {
      await login(values);
      message.success('登录成功');
      router.push('/');
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="login_form"
      className="login-form"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="用户名" />
      </Form.Item>
      
      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>
      
      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>记住我</Checkbox>
        </Form.Item>
        
        <Link href="/auth/forgot-password">
          <a style={{ float: 'right' }}>忘记密码</a>
        </Link>
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button" loading={loading}>
          登录
        </Button>
        或者 <Link href="/auth/register"><a>立即注册</a></Link>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
