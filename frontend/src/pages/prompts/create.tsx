import React, { useState, useEffect } from 'react';
import { Typography, Card, message, Alert } from 'antd';
import { useRouter } from 'next/router';
import Layout from '../../components/ui/Layout';
import PromptForm from '../../components/prompts/PromptForm';
import { createPrompt, getPopularTags, PromptCreate, PromptUpdate, TagCount } from '../../services/prompts';
import { getCategoryTree, Category } from '../../services/categories';
import { useAuth } from '../../utils/AuthContext';
import { useAuthCheck } from '../../utils/withAuth';
import LoginRequiredModal from '../../components/auth/LoginRequiredModal';

const { Title, Paragraph } = Typography;

const CreatePromptPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { checkAuth, showLoginModal, setShowLoginModal } = useAuthCheck();
  const [loading, setLoading] = useState(false);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // 页面加载时检查用户是否已登录
  useEffect(() => {
    // 不立即显示登录对话框，而是在用户尝试提交时检查
    console.log('[CreatePromptPage] 页面加载，用户登录状态:', isAuthenticated ? '已登录' : '未登录');
  }, [isAuthenticated]);

  // 获取热门标签和分类
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取热门标签
        const tags = await getPopularTags();
        setPopularTags(tags.map(tag => tag.tag));
        
        // 获取分类树
        const categoriesData = await getCategoryTree();
        console.log('[CreatePromptPage] 获取到分类树:', categoriesData);
        
        // 简化处理方式，直接使用类型断言
        setCategories(categoriesData as Category[]);
      } catch (error) {
        console.error('获取数据失败:', error);
        // 出错时设置空数组
        setCategories([]);
      }
    };

    fetchData();
  }, []);

  // 处理提交
  const handleSubmit = async (values: PromptCreate | PromptUpdate) => {
    // 检查用户是否已登录
    if (!checkAuth()) {
      // checkAuth会自动显示登录对话框
      return;
    }

    setLoading(true);
    try {
      // 将values转换为PromptCreate类型
      // 在创建页面中，我们可以确保必填字段都存在
      const promptData: PromptCreate = {
        title: values.title || '',
        content: values.content || '',
        description: values.description,
        tags: values.tags,
        category_id: values.category_id,
        parent_id: values.parent_id
      };
      
      const newPrompt = await createPrompt(promptData);
      message.success('提示词创建成功');
      router.push(`/prompts/${newPrompt.id}`);
    } catch (error) {
      console.error('创建提示词失败:', error);
      message.error('创建提示词失败，请稍后重试');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Card style={{ marginTop: 24 }}>
        <Title level={2}>创建新提示词</Title>
        <Paragraph>
          在这里您可以创建新的提示词，填写标题、内容、描述和标签，帮助其他用户更好地理解和使用您的提示词。
        </Paragraph>
        
        {!isAuthenticated && (
          <Alert
            message="需要登录"
            description="创建提示词需要登录账号。填写表单并提交时，系统将提示您登录。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <PromptForm
          onSubmit={handleSubmit}
          loading={loading}
          tags={popularTags}
          categories={categories}
        />
        
        {/* 登录提示对话框 */}
        <LoginRequiredModal
          visible={showLoginModal}
          onCancel={() => setShowLoginModal(false)}
          onLogin={() => setShowLoginModal(false)}
          title="需要登录"
          message="创建提示词需要登录账号，请先登录。"
          actionName="去登录"
        />
      </Card>
    </Layout>
  );
};

export default CreatePromptPage;
