import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { changePassword, ChangePasswordData } from '../../services/auth';

interface ChangePasswordProps {
  onSuccess?: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: ChangePasswordData) => {
    // 验证两次输入的新密码是否一致
    if (values.new_password !== form.getFieldValue('confirm_password')) {
      message.error('两次输入的新密码不一致');
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        old_password: values.old_password,
        new_password: values.new_password
      });
      
      message.success('密码修改成功');
      form.resetFields();
      
      // 如果提供了成功回调，则调用
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('修改密码失败:', error);
      if (error.response && error.response.data) {
        message.error(`修改密码失败: ${error.response.data.detail || '请稍后重试'}`);
      } else {
        message.error('修改密码失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 验证器：确认两次输入的新密码一致
  const validateConfirmPassword = (_: any, value: string) => {
    const newPassword = form.getFieldValue('new_password');
    if (!value || newPassword === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('两次输入的新密码不一致'));
  };

  return (
    <Card title="修改密码" bordered={false}>
      <Form
        form={form}
        name="change_password"
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="old_password"
          label="当前密码"
          rules={[{ required: true, message: '请输入当前密码' }]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="请输入当前密码" 
          />
        </Form.Item>

        <Form.Item
          name="new_password"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码长度不能小于6个字符' }
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="请输入新密码" 
          />
        </Form.Item>

        <Form.Item
          name="confirm_password"
          label="确认新密码"
          dependencies={['new_password']}
          rules={[
            { required: true, message: '请再次输入新密码' },
            { validator: validateConfirmPassword }
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="请再次输入新密码" 
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePassword;
