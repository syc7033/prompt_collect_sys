import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// 这是一个简化版的页面，不使用任何共享组件或布局
const SimplePage: React.FC = () => {
  useEffect(() => {
    console.log('简化版页面加载');
    console.log('窗口尺寸:', window.innerWidth, 'x', window.innerHeight);
    console.log('文档方向:', document.dir || getComputedStyle(document.documentElement).direction);
    console.log('书写模式:', getComputedStyle(document.documentElement).writingMode);
  }, []);

  return (
    <>
      <Head>
        <title>简化版页面 - AI提示词知识库</title>
        <style>{`
          html, body {
            direction: ltr !important;
            writing-mode: horizontal-tb !important;
            text-orientation: mixed !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f2f5;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .card {
            background: white;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 16px;
          }
          
          .paragraph {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 16px;
          }
          
          .button {
            display: inline-block;
            padding: 8px 16px;
            background-color: #1890ff;
            color: white;
            border-radius: 4px;
            text-decoration: none;
            margin-right: 8px;
          }
          
          .row {
            display: flex;
            flex-wrap: wrap;
            margin: 0 -10px;
          }
          
          .col {
            flex: 1;
            padding: 0 10px;
            min-width: 300px;
            margin-bottom: 20px;
          }
        `}</style>
      </Head>
      
      <div className="container">
        <div className="card">
          <div className="title">AI提示词知识库 - 简化版</div>
          <div className="paragraph">
            这是一个简化版的页面，用于测试中文文本的显示方式。这段文本应该是水平显示的，从左到右阅读。
            如果您看到这段文本是竖排显示的，那么说明存在应用程序配置问题。
          </div>
          <Link href="/test.html">
            <a className="button">查看HTML测试页面</a>
          </Link>
        </div>
        
        <div className="row">
          <div className="col">
            <div className="card">
              <div className="title">功能介绍</div>
              <div className="paragraph">
                AI提示词知识库是一个用于收集、整理和分享高质量AI提示词的平台。
                您可以浏览、搜索、创建和分享提示词，也可以根据自己的需求对现有提示词进行修改和定制。
              </div>
            </div>
          </div>
          
          <div className="col">
            <div className="card">
              <div className="title">最新提示词</div>
              <div className="paragraph">
                这里将显示最新添加的提示词列表。目前这是一个简化版页面，不包含实际数据。
                在完整版中，您可以查看、编辑和使用这些提示词。
              </div>
            </div>
          </div>
          
          <div className="col">
            <div className="card">
              <div className="title">热门标签</div>
              <div className="paragraph">
                这里将显示热门标签列表。通过标签，您可以快速找到相关领域的提示词。
                在完整版中，您可以点击标签查看相关提示词。
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="title">调试信息</div>
          <div className="paragraph">
            <div id="debug-info">加载中...</div>
          </div>
          <div>
            <Link href="/"><a className="button">返回首页</a></Link>
            <Link href="/auth/login"><a className="button">登录页面</a></Link>
          </div>
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{ __html: `
        // 显示调试信息
        window.onload = function() {
          const debugInfo = document.getElementById('debug-info');
          
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
        };
      `}} />
    </>
  );
};

export default SimplePage;
