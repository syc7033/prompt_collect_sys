import React, { useEffect } from 'react';
import { Typography, Card, Row, Col, Button } from 'antd';

const { Title, Paragraph, Text } = Typography;

const DebugPage: React.FC = () => {
  useEffect(() => {
    // 打印调试信息
    console.log('调试页面加载');
    console.log('窗口尺寸:', window.innerWidth, 'x', window.innerHeight);
    console.log('文档元素:', document.documentElement.clientWidth, 'x', document.documentElement.clientHeight);
    console.log('文档方向:', getComputedStyle(document.documentElement).direction);
    console.log('文本对齐:', getComputedStyle(document.documentElement).textAlign);
    
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
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Title level={1}>调试页面</Title>
      <Paragraph>这是一个用于调试布局和样式问题的页面。</Paragraph>
      
      <Card title="布局测试" style={{ marginBottom: '20px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card>列 1</Card>
          </Col>
          <Col span={8}>
            <Card>列 2</Card>
          </Col>
          <Col span={8}>
            <Card>列 3</Card>
          </Col>
        </Row>
      </Card>
      
      <Card title="文本方向测试">
        <Paragraph>这是一段中文文本，用于测试文本方向和对齐方式。</Paragraph>
        <Paragraph>This is English text for testing direction and alignment.</Paragraph>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <Button type="primary">左侧按钮</Button>
          <Button>中间按钮</Button>
          <Button type="primary">右侧按钮</Button>
        </div>
      </Card>
    </div>
  );
};

export default DebugPage;
