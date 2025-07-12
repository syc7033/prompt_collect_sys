import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { register, UserRegisterData } from '../../services/auth';

const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // 强制设置表单内文本方向
  useEffect(() => {
    console.log('注册表单组件加载');
    
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

  const onFinish = async (values: UserRegisterData) => {
    setLoading(true);
    try {
      await register(values);
      message.success('注册成功，请登录');
      router.push('/auth/login');
    } catch (error: any) {
      console.error('注册失败:', error);
      if (error.response && error.response.data) {
        message.error(`注册失败: ${error.response.data.detail || '请检查输入信息'}`);
      } else {
        message.error('注册失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="register_form"
      className="register-form"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}
    >
      <Form.Item
        name="username"
        rules={[
          { required: true, message: '请输入用户名' },
          { min: 3, message: '用户名至少3个字符' },
          { max: 20, message: '用户名最多20个字符' }
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="用户名" />
      </Form.Item>
      
      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="邮箱" />
      </Form.Item>
      
      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少6个字符' }
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>
      
      <Form.Item
        name="confirm"
        dependencies={['password']}
        rules={[
          { required: true, message: '请确认密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button" loading={loading}>
          注册
        </Button>
        已有账号？ <Link href="/auth/login"><a>立即登录</a></Link>
      </Form.Item>
    </Form>
  );
};

export default RegisterForm;
