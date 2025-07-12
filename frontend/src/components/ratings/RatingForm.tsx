import React, { useState } from 'react';
import { Form, Rate, Input, Button, message } from 'antd';
import { createRating, RatingCreate } from '../../services/ratings';

const { TextArea } = Input;

interface RatingFormProps {
  promptId: string;
  onSuccess: () => void;
}

const RatingForm: React.FC<RatingFormProps> = ({ promptId, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: RatingCreate) => {
    try {
      setSubmitting(true);
      await createRating(promptId, values);
      message.success('评分提交成功！');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('评分提交失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={{ score: 5 }}
      >
        <Form.Item
          name="score"
          label="评分"
          rules={[{ required: true, message: '请给出评分' }]}
        >
          <Rate allowHalf />
        </Form.Item>

        <Form.Item
          name="comment"
          label="评论"
        >
          <TextArea
            rows={4}
            placeholder="分享您对这个提示词的看法和使用体验..."
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            提交评分
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RatingForm;
