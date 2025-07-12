import React from 'react';
import { Form, Input, Button, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { TagCount } from '../../services/prompts';

const { Option } = Select;

interface SearchFormProps {
  onSearch: (query: string, tags: string[]) => void;
  popularTags: TagCount[];
  loading: boolean;
  initialValues?: {
    query?: string;
    tags?: string[];
  };
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  popularTags,
  loading,
  initialValues = {},
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: { query: string; tags: string[] }) => {
    onSearch(values.query || '', values.tags || []);
  };

  return (
    <Form
      form={form}
      name="search_form"
      className="search-form"
      layout="inline"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Form.Item name="query" style={{ flex: 1 }}>
        <Input
          placeholder="搜索提示词..."
          prefix={<SearchOutlined />}
          allowClear
        />
      </Form.Item>

      <Form.Item name="tags">
        <Select
          mode="multiple"
          placeholder="选择标签"
          style={{ minWidth: 200 }}
          allowClear
        >
          {popularTags.map((tag) => (
            <Option key={tag.tag} value={tag.tag}>
              {tag.tag} ({tag.count})
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
          搜索
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SearchForm;
