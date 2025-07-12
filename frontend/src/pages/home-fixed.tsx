import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import SimpleLayout from '../components/ui/SimpleLayout';
import { getPrompts, getPopularTags, Prompt, TagCount } from '../services/prompts';

// 使用新的SimpleLayout组件的首页
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

  // 处理标签点击
  const handleTagClick = (tag: string) => {
    router.push(`/prompts?tags=${tag}`);
  };

  return (
    <>
      <Head>
        <title>AI提示词知识库 - 首页</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <SimpleLayout>
        <div className="simple-card">
          <h2 className="simple-title">AI提示词知识库</h2>
          <p className="simple-paragraph">
            欢迎使用AI提示词知识库，这里收集了各种高质量的AI提示词，帮助您更高效地使用人工智能工具。
            您可以浏览、搜索、创建和分享提示词，也可以根据自己的需求对现有提示词进行修改和定制。
          </p>
        </div>

        <div className="simple-card">
          <h2 className="simple-title">热门标签</h2>
          <div className="simple-tags">
            {tagLoading ? (
              <p>加载中...</p>
            ) : (
              popularTags.map(tag => (
                <a 
                  key={tag.tag} 
                  className="simple-tag" 
                  onClick={() => handleTagClick(tag.tag)}
                  style={{ 
                    marginRight: '8px', 
                    marginBottom: '8px',
                    padding: '4px 8px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-block',
                    fontSize: `${Math.max(12, Math.min(18, 12 + tag.count))}px`
                  }}
                >
                  {tag.tag} ({tag.count})
                </a>
              ))
            )}
          </div>
        </div>

        <div className="simple-card">
          <h2 className="simple-title">最新提示词</h2>
          {loading ? (
            <p>加载中...</p>
          ) : (
            <div className="simple-prompts">
              {prompts.map(prompt => (
                <div key={prompt.id} className="simple-prompt-item" style={{ marginBottom: '16px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                  <h3 style={{ margin: '0 0 8px' }}>
                    <a 
                      href={`/prompts/${prompt.id}`}
                      style={{ color: '#1890ff', textDecoration: 'none' }}
                    >
                      {prompt.title}
                    </a>
                  </h3>
                  <p style={{ margin: '0 0 8px', color: 'rgba(0, 0, 0, 0.65)' }}>{prompt.description}</p>
                  <div>
                    {prompt.tags.map(tag => (
                      <span 
                        key={tag} 
                        style={{ 
                          marginRight: '8px',
                          padding: '2px 6px',
                          backgroundColor: '#f0f0f0',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <div className="simple-pagination">
              {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => (
                <button 
                  key={i} 
                  onClick={() => setPage(i + 1)}
                  style={{ 
                    margin: '0 4px',
                    padding: '4px 10px',
                    border: page === i + 1 ? '1px solid #1890ff' : '1px solid #d9d9d9',
                    backgroundColor: page === i + 1 ? '#1890ff' : 'white',
                    color: page === i + 1 ? 'white' : 'rgba(0, 0, 0, 0.65)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="simple-card">
          <h2 className="simple-title">调试信息</h2>
          <div id="debug-info">加载中...</div>
          
          <div style={{ marginTop: '16px' }}>
            <a href="/simple" style={{ marginRight: '16px', color: '#1890ff' }}>简化版页面</a>
            <a href="/test.html" style={{ marginRight: '16px', color: '#1890ff' }}>HTML测试页面</a>
            <a href="/" style={{ color: '#1890ff' }}>原始首页</a>
          </div>
        </div>
      </SimpleLayout>
      
      <script dangerouslySetInnerHTML={{ __html: `
        // 显示调试信息
        window.onload = function() {
          const debugInfo = document.getElementById('debug-info');
          if (debugInfo) {
            const info = [
              '窗口尺寸: ' + window.innerWidth + ' x ' + window.innerHeight,
              '文档元素: ' + document.documentElement.clientWidth + ' x ' + document.documentElement.clientHeight,
              '文档方向: ' + (document.dir || getComputedStyle(document.documentElement).direction),
              '文本对齐: ' + getComputedStyle(document.documentElement).textAlign,
              '书写模式: ' + getComputedStyle(document.documentElement).writingMode,
              'HTML书写模式: ' + getComputedStyle(document.documentElement).writingMode,
              'BODY书写模式: ' + getComputedStyle(document.body).writingMode
            ];
            
            debugInfo.innerHTML = info.join('<br>');
          }
        };
      `}} />
    </>
  );
};

export default HomeFixedPage;
