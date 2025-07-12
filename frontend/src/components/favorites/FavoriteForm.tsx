import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, message } from 'antd';
import { createFavorite, updateFavorite, getFavorites, Favorite } from '../../services/favorites';

interface FavoriteFormProps {
  favorite?: Favorite | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const FavoriteForm: React.FC<FavoriteFormProps> = ({ favorite, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 编辑模式下，设置表单初始值
    if (favorite) {
      form.setFieldsValue({
        name: favorite.name
      });
    } else {
      // 创建模式下，重置表单
      form.resetFields();
    }
  }, [favorite, form]);

  // 提交表单
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 检查是否存在同名收藏夹
      const existingFavorites = await getFavorites();
      const nameExists = existingFavorites.some(
        (item: Favorite) => 
          item.name.toLowerCase() === values.name.toLowerCase() && 
          (!favorite || item.id !== favorite.id)
      );
      
      if (nameExists) {
        message.error('收藏夹名称已存在，请使用其他名称');
        return;
      }
      
      if (favorite) {
        // 更新收藏夹
        await updateFavorite(favorite.id, values);
      } else {
        // 创建收藏夹
        await createFavorite(values);
      }
      onSuccess();
    } catch (error) {
      console.error(favorite ? '更新收藏夹失败:' : '创建收藏夹失败:', error);
      message.error(favorite ? '更新收藏夹失败，请稍后重试' : '创建收藏夹失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="name"
        label="收藏夹名称"
        rules={[{ required: true, message: '请输入收藏夹名称' }]}
      >
        <Input placeholder="请输入收藏夹名称" maxLength={50} />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {favorite ? '更新收藏夹' : '创建收藏夹'}
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default FavoriteForm;
