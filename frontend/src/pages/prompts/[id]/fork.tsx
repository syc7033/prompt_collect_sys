import React, { useState, useEffect } from 'react';
import { Typography, Card, message, Skeleton } from 'antd';
import { useRouter } from 'next/router';
import Layout from '../../../components/ui/Layout';
import PromptForm from '../../../components/prompts/PromptForm';
import { getPromptById, forkPrompt, getPopularTags, Prompt, PromptUpdate } from '../../../services/prompts';
import { useAuth } from '../../../utils/AuthContext';

const { Title, Paragraph } = Typography;

const ForkPromptPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [popularTags, setPopularTags] = useState<string[]>([]);

  // 获取提示词详情
  useEffect(() => {
    const fetchPrompt = async () => {
      if (!id) return;
      
      console.log(`[前端-Fork页面] 开始获取提示词详情: id=${id}`);
      try {
        setLoading(true);
        const data = await getPromptById(id as string);
        console.log(`[前端-Fork页面] 获取提示词详情成功:`, data);
        setPrompt(data);
      } catch (error: any) {
        console.error(`[前端-Fork页面] 获取提示词详情失败:`, error);
        console.error(`[前端-Fork页面] 错误详情:`, error.response?.data || error.message);
        console.error(`[前端-Fork页面] 错误状态码:`, error.response?.status);
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

    if (router.isReady) {
      fetchPrompt();
      fetchTags();
    }
  }, [id, router.isReady]);

  // 处理Fork并提交更改
  const handleSubmit = async (values: PromptUpdate) => {
    console.log(`[前端-Fork页面] 开始提交Fork请求: id=${id}`);
    console.log(`[前端-Fork页面] 提交数据:`, values);
    
    if (!prompt || !id || !user) {
      console.error(`[前端-Fork页面] Fork失败: 缺少必要数据, prompt=${!!prompt}, id=${!!id}, user=${!!user}`);
      message.error('请先登录');
      router.push('/auth/login');
      return;
    }

    setSubmitting(true);
    try {
      // 先Fork原始提示词
      console.log(`[前端-Fork页面] 开始调用forkPrompt API: id=${id}`);
      const forkedPrompt = await forkPrompt(id as string);
      console.log(`[前端-Fork页面] Fork成功, 新提示词ID: ${forkedPrompt.id}`);
      
      // 如果用户修改了内容，则更新Fork后的提示词
      const needsUpdate = 
        values.title !== prompt.title ||
        values.content !== prompt.content ||
        values.description !== prompt.description ||
        JSON.stringify(values.tags) !== JSON.stringify(prompt.tags);
      
      console.log(`[前端-Fork页面] 是否需要更新提示词内容: ${needsUpdate}`);
      
      if (needsUpdate) {
        console.log(`[前端-Fork页面] 开始更新Fork后的提示词: id=${forkedPrompt.id}`);
        await updatePrompt(forkedPrompt.id, values);
        console.log(`[前端-Fork页面] 提示词更新成功`);
      }
      
      console.log(`[前端-Fork页面] Fork操作全部完成, 准备跳转到新提示词页面: /prompts/${forkedPrompt.id}`);
      message.success('提示词Fork成功');
      router.push(`/prompts/${forkedPrompt.id}`);
    } catch (error: any) {
      console.error(`[前端-Fork页面] Fork提示词失败:`, error);
      console.error(`[前端-Fork页面] 错误详情:`, error.response?.data || error.message);
      console.error(`[前端-Fork页面] 错误状态码:`, error.response?.status);
      message.error('Fork提示词失败，请稍后重试');
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
            您要Fork的提示词不存在或已被删除。
          </Paragraph>
        </Card>
      </Layout>
    );
  }

  // 准备初始值，修改标题以表明这是一个Fork
  const initialValues = {
    ...prompt,
    title: `${prompt.title} (Fork)`,
  };

  return (
    <Layout>
      <Card style={{ marginTop: 24 }}>
        <Title level={2}>Fork提示词</Title>
        <Paragraph>
          您正在创建提示词 "{prompt.title}" 的个人副本。您可以修改标题、内容、描述和标签，使其更适合您的需求。
        </Paragraph>
        
        <PromptForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          loading={submitting}
          tags={popularTags}
        />
      </Card>
    </Layout>
  );
};

// 导入updatePrompt函数
import { updatePrompt } from '../../../services/prompts';

export default ForkPromptPage;
