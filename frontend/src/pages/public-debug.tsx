import React, { useEffect } from 'react';
import { Typography, Card, Row, Col, Button, Divider } from 'antd';
import Head from 'next/head';

const { Title, Paragraph, Text } = Typography;

// 这是一个公开的调试页面，不需要登录
const PublicDebugPage: React.FC = () => {
  useEffect(() => {
    // 打印调试信息
    console.log('公开调试页面加载');
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
    
    // 检查CSS加载情况
    const styles = document.styleSheets;
    console.log('加载的样式表数量:', styles.length);
    for (let i = 0; i < styles.length; i++) {
      try {
        console.log(`样式表 ${i}:`, styles[i].href);
      } catch (e) {
        console.log(`样式表 ${i}: 无法访问`);
      }
    }
    
    // 打印所有DOM元素的方向和对齐方式
    console.log('HTML元素方向:', getComputedStyle(document.documentElement).direction);
    console.log('BODY元素方向:', getComputedStyle(document.body).direction);
    console.log('HTML书写模式:', getComputedStyle(document.documentElement).writingMode);
    console.log('BODY书写模式:', getComputedStyle(document.body).writingMode);
  }, []);

  return (
    <>
      <Head>
        <title>调试页面 - AI提示词知识库</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Language" content="zh-CN" />
      </Head>
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={1}>调试页面</Title>
        <Paragraph>这是一个用于调试布局和样式问题的页面。</Paragraph>
        
        <Divider />
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card title="列 1" style={{ width: '100%' }}>
              <p>这是第一列的内容，用于测试布局。</p>
              <p>这是中文文本，应该水平显示。</p>
              <Button type="primary">按钮1</Button>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="列 2" style={{ width: '100%' }}>
              <p>这是第二列的内容，用于测试布局。</p>
              <p>这是中文文本，应该水平显示。</p>
              <Button>按钮2</Button>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="列 3" style={{ width: '100%' }}>
              <p>这是第三列的内容，用于测试布局。</p>
              <p>这是中文文本，应该水平显示。</p>
              <Button type="primary">按钮3</Button>
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        <Card title="文本方向测试" style={{ marginTop: '20px' }}>
          <Paragraph>
            这是一段中文文本，用于测试文本方向和对齐方式。这段文本应该从左到右水平显示，而不是竖排。
            如果您看到这段文本是竖排显示的，那么说明存在布局问题。
          </Paragraph>
          <Paragraph>
            This is English text for testing direction and alignment. This text should be displayed horizontally from left to right.
          </Paragraph>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <Button type="primary">左侧按钮</Button>
            <Button>中间按钮</Button>
            <Button type="primary">右侧按钮</Button>
          </div>
        </Card>
        
        <Divider />
        
        <Card title="CSS样式信息" style={{ marginTop: '20px' }}>
          <Paragraph>
            请打开浏览器控制台(F12)查看详细的调试信息，包括CSS样式、文档方向和书写模式等。
          </Paragraph>
          <Paragraph>
            <Text strong>控制台位置：</Text> 浏览器右键菜单 → 检查 → Console选项卡
          </Paragraph>
        </Card>
      </div>
    </>
  );
};

export default PublicDebugPage;
