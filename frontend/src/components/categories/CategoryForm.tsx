import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Space, message } from 'antd';
import { createCategory, updateCategory, getCategoryTree, getCategories, Category } from '../../services/categories';

const { Option } = Select;
const { TextArea } = Input;

interface CategoryFormProps {
  category?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // 获取所有分类，用于选择父分类
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await getCategoryTree();
      setCategories(data);
    } catch (error) {
      console.error('获取分类列表失败:', error);
      message.error('获取分类列表失败，请稍后重试');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // 编辑模式下，设置表单初始值
    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
        parent_id: category.parent_id || null
      });
    } else {
      // 创建模式下，重置表单
      form.resetFields();
    }
  }, [category, form]);

  // 提交表单
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 检查是否存在同名分类
      const existingCategories = await getCategories();
      
      // 在同一级别下检查名称是否重复
      const sameParentCategories = existingCategories.filter(
        (item: Category) => 
          // 筛选出同级别的分类
          (values.parent_id === null && item.parent_id === null) || 
          (values.parent_id !== null && item.parent_id === values.parent_id)
      );
      
      const nameExists = sameParentCategories.some(
        (item: Category) => 
          item.name.toLowerCase() === values.name.toLowerCase() && 
          (!category || item.id !== category.id)
      );
      
      if (nameExists) {
        message.error('分类名称在当前级别已存在，请使用其他名称');
        return;
      }
      
      if (category) {
        // 更新分类
        await updateCategory(category.id, values);
      } else {
        // 创建分类
        await createCategory(values);
      }
      onSuccess();
    } catch (error) {
      console.error(category ? '更新分类失败:' : '创建分类失败:', error);
      message.error(category ? '更新分类失败，请稍后重试' : '创建分类失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 递归渲染分类选项
  const renderCategoryOptions = (categories: Category[], level = 0, parentPath = '') => {
    return categories.map(cat => {
      // 编辑模式下，不能选择自己或自己的子分类作为父分类
      const disabled = category && (cat.id === category.id || (parentPath && parentPath.includes(category.id)));
      const prefix = level > 0 ? '└ '.padStart(level * 2 + 2, '　') : '';
      const currentPath = parentPath ? `${parentPath},${cat.id}` : cat.id;
      
      return (
        <React.Fragment key={cat.id}>
          <Option value={cat.id} disabled={disabled}>
            {prefix}{cat.name}
          </Option>
          {cat.children && cat.children.length > 0 && renderCategoryOptions(cat.children, level + 1, currentPath)}
        </React.Fragment>
      );
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ parent_id: null }}
    >
      <Form.Item
        name="name"
        label="分类名称"
        rules={[{ required: true, message: '请输入分类名称' }]}
      >
        <Input placeholder="请输入分类名称" maxLength={50} />
      </Form.Item>

      <Form.Item
        name="description"
        label="分类描述"
      >
        <TextArea 
          placeholder="请输入分类描述" 
          autoSize={{ minRows: 3, maxRows: 6 }}
          maxLength={200}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="parent_id"
        label="父分类"
        extra="可选，不选择则为顶级分类"
      >
        <Select
          placeholder="请选择父分类"
          allowClear
          loading={loadingCategories}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        >
          {renderCategoryOptions(categories)}
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {category ? '更新分类' : '创建分类'}
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CategoryForm;
