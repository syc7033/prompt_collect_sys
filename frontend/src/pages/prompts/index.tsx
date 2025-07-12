import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, message, Modal, Divider } from 'antd';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Layout from '../../components/ui/Layout';
import PromptList from '../../components/prompts/PromptList';
import SearchForm from '../../components/prompts/SearchForm';
import TagCloud from '../../components/prompts/TagCloud';
import { getPrompts, searchPrompts, getPopularTags, deletePrompt, Prompt, TagCount } from '../../services/prompts';
import { useAuth } from '../../utils/AuthContext';

const { Title, Paragraph } = Typography;
const { confirm } = Modal;

const PromptsPage: React.FC = () => {
  console.log('[PromptsPage] ====== 组件渲染开始 ======');
  
  const router = useRouter();
  const { q, query, tags: queryTags } = router.query;  // 同时获取q和query参数
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  console.log('[PromptsPage] 路由状态:', {
    pathname: router.pathname,
    query: router.query,
    isReady: router.isReady
  });
  
  console.log('[PromptsPage] 认证状态:', {
    isAuthenticated,
    authLoading,
    hasUser: !!user,
    username: user?.username,
    userRole: user?.is_superuser ? 'admin' : 'user'
  });
  
  console.log('[PromptsPage] 本地存储状态:', {
    hasToken: typeof window !== 'undefined' ? !!Cookies.get('token') : false,
    hasCachedUser: typeof window !== 'undefined' ? !!localStorage.getItem('cachedUser') : false,
    cachedUsername: typeof window !== 'undefined' && localStorage.getItem('cachedUser') ? 
      JSON.parse(localStorage.getItem('cachedUser') || '{}').username : null
  });
  
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [popularTags, setPopularTags] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagLoading, setTagLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8); // 修改为8个，与首页保持一致
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 处理URL查询参数
  useEffect(() => {
    if (router.isReady) {
      console.log('路由已就绪，查询参数:', router.query);
      
      // 处理标签参数
      const tags = queryTags ? 
        (Array.isArray(queryTags) ? queryTags : [queryTags]) : 
        [];
      
      console.log('解析后的标签:', tags);
      setSelectedTags(tags as string[]);
      
      // 处理搜索查询参数
      // 先检查q参数，再检查query参数（兼容两种参数名）
      let searchText = '';
      if (typeof q === 'string') {
        searchText = q;
      } else if (typeof query === 'string') {
        searchText = query;
      }
      console.log('搜索查询文本:', searchText);
      setSearchQuery(searchText);
      
      // 重置页码
      setPage(1);
    }
  }, [router.isReady, q, query, queryTags]);
  // 获取提示词
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        console.log('开始获取提示词，参数:', {
          searchQuery,
          selectedTags,
          page,
          pageSize
        });
        
        let result;
        if (searchQuery || selectedTags.length > 0) {
          console.log('使用搜索API获取提示词');
          result = await searchPrompts(
            searchQuery, // 不需要额外的空字符串检查，searchPrompts函数已经处理了这种情况
            selectedTags, 
            page, 
            pageSize
          );
        } else {
          console.log('使用普通API获取提示词');
          result = await getPrompts(page, pageSize);
        }
        
        console.log('获取提示词成功:', result);
        setPrompts(result.data);
        setTotal(result.total);
      } catch (error) {
        console.error('获取提示词失败:', error);
        message.error('获取提示词失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      fetchPrompts();
    }
  }, [page, pageSize, searchQuery, selectedTags, router.isReady]);

  // 获取热门标签
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setTagLoading(true);
        const tags = await getPopularTags();
        setPopularTags(tags);
      } catch (error) {
        console.error('获取热门标签失败:', error);
      } finally {
        setTagLoading(false);
      }
    };

    fetchTags();
  }, []);

  // 处理搜索
  const handleSearch = (query: string, tags: string[]) => {
    console.log('搜索表单提交:', { query, tags });
    
    const queryParams: any = {
      q: query || ''  // 使用q作为参数名，与后端API保持一致
    };
    
    if (tags && tags.length > 0) {
      queryParams.tags = tags;
    }
    
    console.log('搜索跳转参数:', queryParams);
    
    router.push({
      pathname: '/prompts',
      query: queryParams,
    });
  };

  // 处理页码变化 - 固定使用8条/页
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // 固定使用8条/页，不再处理pageSize变化
  };

  // 处理标签点击
  const handleTagClick = (tag: string) => {
    console.log('标签点击:', tag);
    console.log('当前选中标签:', selectedTags);
    
    // 切换标签选中状态
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    console.log('新的标签列表:', newTags);
    
    // 构建查询参数
    const queryParams: any = {};
    
    // 判断是否需要重置搜索
    const shouldResetSearch = newTags.length === 0 && searchQuery && tag === selectedTags[0] && selectedTags.length === 1;
    
    // 如果有搜索查询且不需要重置，则使用它
    if (searchQuery && !shouldResetSearch) {
      queryParams.q = searchQuery;
    }
    
    // 如果有选中标签，则添加到查询参数
    if (newTags.length > 0) {
      queryParams.tags = newTags;
    }
    
    console.log('将跳转到的查询参数:', queryParams);
    console.log('是否重置搜索:', shouldResetSearch);
    
    // 跳转到新的URL
    router.push({
      pathname: '/prompts',
      query: queryParams,
    });
  };

  // 处理删除提示词
  const handleDeletePrompt = (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    
    if (!prompt) return;
    
    // 检查是否有权限删除
    if (user?.id !== prompt.creator_id && !user?.is_superuser) {
      message.error('您没有权限删除此提示词');
      return;
    }
    
    confirm({
      title: '确认删除',
      content: `确定要删除提示词 "${prompt.title}" 吗？此操作不可撤销。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deletePrompt(id);
          message.success('提示词已删除');
          
          // 刷新提示词列表
          setPrompts(prompts.filter(p => p.id !== id));
          setTotal(total - 1);
        } catch (error) {
          console.error('删除提示词失败:', error);
          message.error('删除提示词失败，请稍后重试');
        }
      },
    });
  };

  return (
    <Layout>
      <div className="prompts-container">
        <Card style={{ marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Title 
            level={2} 
            style={{ 
              fontSize: '24px', 
              marginBottom: '16px'
            }}
          >
            浏览提示词
          </Title>
          
          <SearchForm
            onSearch={handleSearch}
            popularTags={popularTags}
            loading={searchLoading}
            initialValues={{
              query: searchQuery,
              tags: selectedTags,
            }}
          />
        </Card>

        <Card 
          title={
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {searchQuery || selectedTags.length > 0 
                ? `搜索结果 (${total})` 
                : `所有提示词 (${total})`}
            </div>
          }
          style={{ 
            marginBottom: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}
        >
          <PromptList
            prompts={prompts}
            loading={loading}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onDelete={handleDeletePrompt}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default PromptsPage;

