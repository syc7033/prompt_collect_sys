import React from 'react';
import { Typography, Card, Row, Col, Button } from 'antd';

const { Title, Paragraph } = Typography;

// 这是一个最简单的测试页面，不使用任何布局组件或认证
const DirectTestPage = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title>直接测试页面</Title>
      <Paragraph>这是一个最简单的测试页面，用于测试中文文本显示。</Paragraph>
      
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="测试卡片1">
            <p>这是中文文本测试。这段文本应该水平显示。</p>
            <Button type="primary">按钮</Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="测试卡片2">
            <p>这是中文文本测试。这段文本应该水平显示。</p>
            <Button>按钮</Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="测试卡片3">
            <p>这是中文文本测试。这段文本应该水平显示。</p>
            <Button type="primary">按钮</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DirectTestPage;
