import React, { useEffect } from 'react';
import { Typography, Card, Row, Col } from 'antd';
import Head from 'next/head';
import LoginForm from '../../components/auth/LoginForm';

const { Title, Paragraph } = Typography;

// 这是一个修复版的登录页面，不使用Layout组件
const LoginFixedPage: React.FC = () => {
  useEffect(() => {
    // 打印调试信息
    console.log('登录修复页面加载');
    console.log('窗口尺寸:', window.innerWidth, 'x', window.innerHeight);
    console.log('文档方向:', document.dir || getComputedStyle(document.documentElement).direction);
    console.log('文本对齐:', getComputedStyle(document.documentElement).textAlign);
    console.log('书写模式:', getComputedStyle(document.documentElement).writingMode);
    
    // 强制设置文档方向和书写模式
    document.documentElement.style.direction = 'ltr';
    document.documentElement.style.writingMode = 'horizontal-tb';
    document.documentElement.style.textOrientation = 'mixed';
    document.body.style.writingMode = 'horizontal-tb';
    document.body.style.textAlign = 'left';
    
    // 添加内联样式
    const style = document.createElement('style');
    style.textContent = `
      body, html, div, p, span, h1, h2, h3, h4, h5, h6, button, input, textarea, select, option {
        direction: ltr !important;
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
        text-align: left !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Head>
        <title>登录 - AI提示词知识库</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Language" content="zh-CN" />
      </Head>
      
      <div style={{ 
        padding: '50px 0', 
        maxWidth: '1200px', 
        margin: '0 auto',
        direction: 'ltr',
        writingMode: 'horizontal-tb'
      }}>
        <Row justify="center" align="middle">
          <Col xs={22} sm={16} md={12} lg={8}>
            <Card style={{ 
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              direction: 'ltr',
              writingMode: 'horizontal-tb'
            }}>
              <Title level={2} style={{ textAlign: 'center', writingMode: 'horizontal-tb' }}>
                用户登录
              </Title>
              <Paragraph style={{ textAlign: 'center', writingMode: 'horizontal-tb' }}>
                登录AI提示词知识库，管理和分享您的提示词
              </Paragraph>
              <LoginForm />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default LoginFixedPage;
