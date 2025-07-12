import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Divider } from 'antd';
import { useRouter } from 'next/router';
import Head from 'next/head';
import PromptList from '../components/prompts/PromptList';
import TagCloud from '../components/prompts/TagCloud';
import { getPrompts, getPopularTags, Prompt, TagCount } from '../services/prompts';

const { Title, Paragraph } = Typography;

// 这是一个修复版的首页，不使用Layout组件
const HomeFixedPage: React.FC = () => {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [popularTags, setPopularTags] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagLoading, setTagLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  
  // 添加调试日志
  useEffect(() => {
    console.log('修复版首页加载');
    console.log('窗口尺寸:', window.innerWidth, 'x', window.innerHeight);
    console.log('文档元素:', document.documentElement.clientWidth, 'x', document.documentElement.clientHeight);
    console.log('文档方向:', document.dir || getComputedStyle(document.documentElement).direction);
    console.log('文本对齐:', getComputedStyle(document.documentElement).textAlign);
    console.log('书写模式:', getComputedStyle(document.documentElement).writingMode);
    
    // 强制设置文档方向和书写模式
    document.documentElement.style.direction = 'ltr';
    document.documentElement.style.writingMode = 'horizontal-tb';
    document.documentElement.style.textOrientation = 'mixed';
    document.body.style.writingMode = 'horizontal-tb';
    document.body.style.textAlign = 'left';
  }, []);

  // 获取最新提示词
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const result = await getPrompts(page, pageSize);
        setPrompts(result.data);
        setTotal(result.total);
      } catch (error) {
        console.error('获取提示词失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [page]);

  // 获取热门标签
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setTagLoading(true);
        const tags = await getPopularTags(10);
        setPopularTags(tags);
      } catch (error) {
        console.error('获取热门标签失败:', error);
      } finally {
        setTagLoading(false);
      }
    };

    fetchTags();
  }, []);

  // 处理页码变化
  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
  };

  // 处理标签点击
  const handleTagClick = (tag: string) => {
    router.push(`/prompts?tags=${tag}`);
  };

  return (
    <>
      <Head>
        <title>AI提示词知识库 - 首页</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          body, html {
            direction: ltr;
            writing-mode: horizontal-tb;
            text-orientation: mixed;
          }
        `}</style>
      </Head>
    
      <div style={{ 
        padding: '20px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        direction: 'ltr',
        writingMode: 'horizontal-tb'
      }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
              <Title level={2} style={{ writingMode: 'horizontal-tb' }}>AI提示词知识库</Title>
              <Paragraph style={{ writingMode: 'horizontal-tb' }}>
                欢迎使用AI提示词知识库，这里收集了各种高质量的AI提示词，帮助您更高效地使用人工智能工具。
                您可以浏览、搜索、创建和分享提示词，也可以根据自己的需求对现有提示词进行修改和定制。
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Divider orientation="left" style={{ writingMode: 'horizontal-tb' }}>热门标签</Divider>
        <Row>
          <Col span={24}>
            <Card style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
              <TagCloud
                tags={popularTags}
                loading={tagLoading}
                onTagClick={handleTagClick}
              />
            </Card>
          </Col>
        </Row>

        <Divider orientation="left" style={{ writingMode: 'horizontal-tb' }}>最新提示词</Divider>
        <PromptList
          prompts={prompts}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
        
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <a href="/auth/login-debug" style={{ marginRight: '20px' }}>登录调试页面</a>
          <a href="/auth/register-debug">注册调试页面</a>
        </div>
      </div>
    </>
  );
};

export default HomeFixedPage;
