import React, { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Button, Space, Dropdown } from 'antd';
import { 
  HomeOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  SettingOutlined,
  FolderOutlined,
  StarOutlined,
  LogoutOutlined,
  DownOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SideNav from '../ui/SideNav';
import { useAuth } from '../../utils/AuthContext';

const { Header, Content, Footer, Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  
  // 调试输出用户信息
  useEffect(() => {
    console.log('[MainLayout] 用户信息更新:', { 
      isAuthenticated, 
      username: user?.username,
      authLoading
    });
  }, [user, isAuthenticated, authLoading]);

  const handleCollapse = (value: boolean) => {
    setCollapsed(value);
  };

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = router.pathname;
    if (path.startsWith('/prompts')) return 'prompts';
    if (path.startsWith('/categories')) return 'categories';
    if (path.startsWith('/favorites')) return 'favorites';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={handleCollapse}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          zIndex: 1
        }}
      >
        <div className="logo">
          <Link href="/">
            <a>
              {collapsed ? 'PS' : '提示词系统'}
            </a>
          </Link>
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[getSelectedKey()]}
        >
          <Menu.Item key="home" icon={<HomeOutlined />}>
            <Link href="/">
              <a>首页</a>
            </Link>
          </Menu.Item>
          <Menu.Item key="prompts" icon={<FileTextOutlined />}>
            <Link href="/prompts">
              <a>提示词库</a>
            </Link>
          </Menu.Item>
          <Menu.Item key="categories" icon={<FolderOutlined />}>
            <Link href="/categories">
              <a>分类管理</a>
            </Link>
          </Menu.Item>
          <Menu.Item key="favorites" icon={<StarOutlined />}>
            <Link href="/favorites">
              <a>收藏夹</a>
            </Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.3s' }}>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>
                <Link href="/">
                  <a>首页</a>
                </Link>
              </Breadcrumb.Item>
              {router.pathname.startsWith('/prompts') && (
                <Breadcrumb.Item>
                  <Link href="/prompts">
                    <a>提示词库</a>
                  </Link>
                </Breadcrumb.Item>
              )}
              {router.pathname.startsWith('/categories') && (
                <Breadcrumb.Item>
                  <Link href="/categories">
                    <a>分类管理</a>
                  </Link>
                </Breadcrumb.Item>
              )}
              {router.pathname.startsWith('/favorites') && (
                <Breadcrumb.Item>
                  <Link href="/favorites">
                    <a>收藏夹</a>
                  </Link>
                </Breadcrumb.Item>
              )}
            </Breadcrumb>
          </div>
          
          {/* 用户信息显示区域 */}
          <div className="user-info">
            {isAuthenticated ? (
              <Space>
                <span className="username">{user?.username}</span>
                <Dropdown menu={{
                  items: [
                    {
                      key: 'profile',
                      icon: <UserOutlined />,
                      label: (
                        <Link href="/profile">
                          <a>个人中心</a>
                        </Link>
                      ),
                    },
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: (
                        <a onClick={() => {
                          logout();
                          router.push('/');
                        }}>退出登录</a>
                      ),
                    },
                  ],
                }}>
                  <Button type="text">
                    <Space>
                      {user?.username}
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </Space>
            ) : (
              <Space>
                <Link href="/auth/login">
                  <a><Button type="text">登录</Button></a>
                </Link>
                <Link href="/auth/register">
                  <a><Button type="primary">注册</Button></a>
                </Link>
              </Space>
            )}
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          AI提示词知识库系统 ©{new Date().getFullYear()} 版权所有
        </Footer>
      </Layout>

      <style jsx global>{`
        .logo {
          height: 32px;
          margin: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .logo a {
          color: white;
          font-size: 18px;
          font-weight: bold;
        }
        .user-info {
          display: flex;
          align-items: center;
        }
        .username {
          margin-right: 8px;
          font-weight: 500;
        }
      `}</style>
    </Layout>
  );
};

export default MainLayout;
