import React, { useState, useEffect } from 'react';
import { Typography, Card, message, Skeleton } from 'antd';
import { useRouter } from 'next/router';
import Layout from '../../../components/ui/Layout';
import PromptForm from '../../../components/prompts/PromptForm';
import { getPromptById, updatePrompt, getPopularTags, Prompt, PromptUpdate, TagCount } from '../../../services/prompts';
import { getCategoryTree, Category } from '../../../services/categories';
import { useAuth } from '../../../utils/AuthContext';

const { Title, Paragraph } = Typography;

const EditPromptPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // 获取提示词详情
  useEffect(() => {
    const fetchPrompt = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getPromptById(id as string);
        setPrompt(data);
        
        // 检查是否有权限编辑
        if (user && data.creator_id !== user.id && !user.is_superuser) {
          message.error('您没有权限编辑此提示词');
          router.push(`/prompts/${id}`);
        }
      } catch (error) {
        console.error('获取提示词详情失败:', error);
        message.error('获取提示词详情失败，请稍后重试');
        router.push('/prompts');
      } finally {
        setLoading(false);
      }
    };

    // 获取热门标签
    const fetchTags = async () => {
      try {
        const tags = await getPopularTags();
        setPopularTags(tags.map(tag => tag.tag));
      } catch (error) {
        console.error('获取热门标签失败:', error);
      }
    };
    
    // 获取分类树
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategoryTree();
        console.log('[EditPromptPage] 获取到分类树:', categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('获取分类树失败:', error);
      }
    };

    if (router.isReady && user) {
      fetchPrompt();
      fetchTags();
      fetchCategories();
    }
  }, [id, router, user]);

  // 处理提交
  const handleSubmit = async (values: PromptUpdate) => {
    if (!prompt || !id) return;

    setSubmitting(true);
    try {
      await updatePrompt(id as string, values);
      message.success('提示词更新成功');
      router.push(`/prompts/${id}`);
    } catch (error) {
      console.error('更新提示词失败:', error);
      message.error('更新提示词失败，请稍后重试');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Card style={{ marginTop: 24 }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </Layout>
    );
  }

  if (!prompt) {
    return (
      <Layout>
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>提示词不存在</Title>
          <Paragraph>
            您要编辑的提示词不存在或已被删除。
          </Paragraph>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card style={{ marginTop: 24 }}>
        <Title level={2}>编辑提示词</Title>
        <Paragraph>
          在这里您可以编辑提示词的标题、内容、描述和标签。
        </Paragraph>
        
        <PromptForm
          initialValues={prompt}
          onSubmit={handleSubmit}
          loading={submitting}
          tags={popularTags}
          categories={categories}
        />
      </Card>
    </Layout>
  );
};

export default EditPromptPage;
