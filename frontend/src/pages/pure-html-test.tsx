import React, { useEffect } from 'react';
import Head from 'next/head';

const PureHtmlTest: React.FC = () => {
  useEffect(() => {
    console.log('纯HTML测试页面加载');
    
    // 强制设置文档方向和书写模式
    document.documentElement.style.direction = 'ltr';
    document.documentElement.style.writingMode = 'horizontal-tb';
    document.documentElement.style.textOrientation = 'mixed';
    document.body.style.writingMode = 'horizontal-tb';
    document.body.style.textAlign = 'left';
  }, []);

  return (
    <>
      <Head>
        <title>纯HTML中文测试</title>
        <style>{`
          * {
            direction: ltr !important;
            writing-mode: horizontal-tb !important;
            text-orientation: mixed !important;
          }
          body {
            font-family: "Microsoft YaHei", "PingFang SC", "SimSun", sans-serif;
            padding: 20px;
            background: white;
          }
          .test-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #eee;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          h1, h2, h3, p {
            direction: ltr !important;
            writing-mode: horizontal-tb !important;
            text-orientation: mixed !important;
          }
        `}</style>
      </Head>
      
      <div className="test-container" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
        <h1 style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>中文显示测试页面</h1>
        <p style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
          这是一个测试页面，用于验证中文文本是否能够正确水平显示。
          这个页面不使用任何React组件或Ant Design组件，只使用基本的HTML元素。
        </p>
        
        <h2 style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>测试不同字体</h2>
        <p style={{ fontFamily: '"Microsoft YaHei", sans-serif', direction: 'ltr', writingMode: 'horizontal-tb' }}>
          微软雅黑字体测试：这是使用微软雅黑字体的中文文本。
        </p>
        <p style={{ fontFamily: '"PingFang SC", sans-serif', direction: 'ltr', writingMode: 'horizontal-tb' }}>
          苹方字体测试：这是使用苹方字体的中文文本。
        </p>
        <p style={{ fontFamily: '"SimSun", serif', direction: 'ltr', writingMode: 'horizontal-tb' }}>
          宋体测试：这是使用宋体的中文文本。
        </p>
        
        <h2 style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>测试不同样式</h2>
        <p style={{ fontWeight: 'bold', direction: 'ltr', writingMode: 'horizontal-tb' }}>
          粗体测试：这是粗体中文文本。
        </p>
        <p style={{ fontStyle: 'italic', direction: 'ltr', writingMode: 'horizontal-tb' }}>
          斜体测试：这是斜体中文文本。
        </p>
        <p style={{ textDecoration: 'underline', direction: 'ltr', writingMode: 'horizontal-tb' }}>
          下划线测试：这是带下划线的中文文本。
        </p>
        
        <h2 style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>测试不同大小</h2>
        <p style={{ fontSize: '12px', direction: 'ltr', writingMode: 'horizontal-tb' }}>
          小号文本：这是12px大小的中文文本。
        </p>
        <p style={{ fontSize: '18px', direction: 'ltr', writingMode: 'horizontal-tb' }}>
          中号文本：这是18px大小的中文文本。
        </p>
        <p style={{ fontSize: '24px', direction: 'ltr', writingMode: 'horizontal-tb' }}>
          大号文本：这是24px大小的中文文本。
        </p>
        
        <div style={{ marginTop: '20px', textAlign: 'center', direction: 'ltr', writingMode: 'horizontal-tb' }}>
          <a href="/" style={{ color: '#1890ff', textDecoration: 'none', direction: 'ltr', writingMode: 'horizontal-tb' }}>
            返回首页
          </a>
        </div>
      </div>
    </>
  );
};

export default PureHtmlTest;
