import React, { useEffect } from 'react';
import { Typography, Card, Row, Col, Button, Form, Input, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

// 这是一个完全独立的登录页面，用于调试中文显示问题
const LoginDebugPage: React.FC = () => {
  const router = useRouter();
  
  useEffect(() => {
    // 打印调试信息
    console.log('登录调试页面加载');
    console.log('窗口尺寸:', window.innerWidth, 'x', window.innerHeight);
    console.log('文档元素:', document.documentElement.clientWidth, 'x', document.documentElement.clientHeight);
    console.log('文档方向:', document.dir || getComputedStyle(document.documentElement).direction);
    console.log('文本对齐:', getComputedStyle(document.documentElement).textAlign);
    console.log('书写模式:', getComputedStyle(document.documentElement).writingMode);
    
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
    
    // 检查所有元素的书写模式
    console.log('BODY书写模式:', getComputedStyle(document.body).writingMode);
    console.log('HTML书写模式:', getComputedStyle(document.documentElement).writingMode);
    
    // 强制设置文档方向和书写模式
    document.documentElement.style.direction = 'ltr';
    document.documentElement.style.writingMode = 'horizontal-tb';
    document.documentElement.style.textOrientation = 'mixed';
    document.body.style.writingMode = 'horizontal-tb';
    document.body.style.textAlign = 'left';
    
    // 添加内联样式
    const style = document.createElement('style');
    style.textContent = `
      * {
        direction: ltr !important;
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
      }
      
      body, html {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: #f0f2f5;
      }
      
      .ant-typography {
        direction: ltr !important;
        writing-mode: horizontal-tb !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const onFinish = (values: any) => {
    console.log('登录表单提交:', values);
    // 模拟登录成功
    setTimeout(() => {
      router.push('/index-fixed');
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>登录调试 - AI提示词知识库</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Language" content="zh-CN" />
        <style>{`
          body, html {
            direction: ltr;
            writing-mode: horizontal-tb;
            text-orientation: mixed;
          }
        `}</style>
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
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Title level={2} style={{ writingMode: 'horizontal-tb' }}>
                  用户登录
                </Title>
                <Paragraph style={{ writingMode: 'horizontal-tb' }}>
                  登录AI提示词知识库，管理和分享您的提示词
                </Paragraph>
              </div>
              
              <Form
                name="login_form"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: '请输入用户名!' }]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="用户名" 
                    style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码!' }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="密码"
                    style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}
                  />
                </Form.Item>
                
                <Form.Item>
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox style={{ writingMode: 'horizontal-tb' }}>记住我</Checkbox>
                  </Form.Item>
                  
                  <a href="#" style={{ float: 'right', writingMode: 'horizontal-tb' }}>
                    忘记密码?
                  </a>
                </Form.Item>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                    登录
                  </Button>
                  <div style={{ marginTop: '16px', textAlign: 'center', writingMode: 'horizontal-tb' }}>
                    还没有账号? <Link href="/auth/register"><a>立即注册</a></Link>
                  </div>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default LoginDebugPage;
