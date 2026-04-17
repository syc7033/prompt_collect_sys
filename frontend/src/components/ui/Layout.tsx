import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { useAuth } from '../../utils/AuthContext';
import SideNav from './SideNav';
import InfoPanel from './InfoPanel';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'AI提示词知识库' }) => {
  console.log('[Layout] ====== 组件渲染开始 ======');
  console.log('[Layout] title:', title);
  
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  
  // 调试输出用户信息
  useEffect(() => {
    console.log('[Layout] 用户信息更新:', { 
      isAuthenticated, 
      username: user?.username,
      authLoading
    });
  }, [user, isAuthenticated, authLoading]);
  
  console.log('[Layout] 认证状态:', {
    isAuthenticated,
    authLoading,
    hasUser: !!user,
    username: user?.username,
    userRole: user?.is_superuser ? 'admin' : 'user'
  });
  console.log('[Layout] 本地存储状态:', {
    hasToken: typeof window !== 'undefined' ? !!Cookies.get('token') : false,
    hasCachedUser: typeof window !== 'undefined' ? !!localStorage.getItem('cachedUser') : false
  });
  const router = useRouter();

  // 侧边导航栏折叠状态
  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);
  // 信息面板折叠状态（默认收起，让主内容区更宽）
  const [infoPanelCollapsed, setInfoPanelCollapsed] = useState(true);

  // 添加日志，跟踪三栏布局的初始状态
  console.log('[Layout] 初始化状态:', { sideNavCollapsed, infoPanelCollapsed });

  useEffect(() => {
    console.log('Layout组件已加载');
    console.log('当前路径:', router.pathname);
    console.log('认证状态:', isAuthenticated);
    
    // 添加全局样式
    const style = document.createElement('style');
    style.innerHTML = `
      html, body {
        direction: ltr !important;
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f0f2f5;
      }
      
      .simple-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      
      .simple-header {
        background-color: #001529;
        color: white;
        padding: 0;
        height: 64px;
      }
      
      .simple-header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
        display: flex;
        align-items: center;
        height: 100%;
      }
      
      .simple-logo {
        font-size: 18px;
        font-weight: bold;
        margin-right: 20px;
      }
      
      .simple-nav {
        flex: 1;
        display: flex;
      }
      
      .simple-nav-item {
        color: white;
        text-decoration: none;
        padding: 0 15px;
        line-height: 64px;
        transition: color 0.3s;
      }
      
      .simple-nav-item:hover {
        color: #1890ff;
      }
      
      .simple-user-actions {
        margin-left: auto;
      }
      
      .simple-user-info {
        display: flex;
        align-items: center;
      }
      
      .simple-username {
        margin-right: 10px;
      }
      
      .simple-auth-buttons {
        display: flex;
        align-items: center;
      }
      
      .simple-button {
        display: inline-block;
        padding: 4px 15px;
        background: transparent;
        color: white;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        text-decoration: none;
        margin-left: 8px;
      }
      
      .simple-button-primary {
        background-color: #1890ff;
      }
      
      .layout-container {
        display: flex;
        flex: 1;
        min-height: calc(100vh - 64px - 80px); /* 减去header和footer的高度 */
        position: relative; /* 为绝对定位元素提供参考点 */
      }
      
      .simple-content {
        flex: 1;
        padding: 20px;
        transition: all 0.3s;
        overflow-x: hidden;
        margin-left: 250px; /* 为左侧导航栏留出空间 */
        margin-right: 300px; /* 为右侧信息面板留出空间 */
      }
      
      .simple-content.side-nav-collapsed {
        margin-left: 80px; /* 左侧导航栏折叠时的边距 */
      }
      
      .simple-content.info-panel-collapsed {
        margin-right: 80px; /* 右侧信息面板折叠时的边距 */
      }
    `;
    document.head.appendChild(style);
    
    console.log('[Layout] 添加全局样式');
    
    return () => {
      console.log('[Layout] 移除全局样式');
      document.head.removeChild(style);
    };
  }, [isAuthenticated, router.pathname]);

  // 处理侧边导航栏折叠/展开
  const handleSideNavCollapse = () => {
    const newState = !sideNavCollapsed;
    console.log('[Layout] 切换侧边导航栏状态:', { oldState: sideNavCollapsed, newState });
    setSideNavCollapsed(newState);
  };
  
  // 处理信息面板折叠/展开
  const handleInfoPanelCollapse = () => {
    const newState = !infoPanelCollapsed;
    console.log('[Layout] 切换信息面板状态:', { oldState: infoPanelCollapsed, newState });
    setInfoPanelCollapsed(newState);
  };
  
  // 响应式布局处理
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      console.log('[Layout] 检测到窗口大小变化:', { width });
      
      if (width < 768) {
        console.log('[Layout] 小屏幕模式 (<768px)，折叠两侧面板');
        setSideNavCollapsed(true);
        setInfoPanelCollapsed(true);
      } else if (width < 1200) {
        console.log('[Layout] 中屏幕模式 (768-1200px)，折叠右侧面板');
        setInfoPanelCollapsed(true);
      } else {
        console.log('[Layout] 大屏幕模式 (>1200px)，展开左侧面板，右侧默认折叠');
        setSideNavCollapsed(false);
        setInfoPanelCollapsed(true);
      }
    };

    // 初始化时执行一次
    console.log('[Layout] 初始化响应式布局');
    handleResize();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    return () => {
      console.log('[Layout] 移除窗口大小变化监听器');
      window.removeEventListener('resize', handleResize);
    };
  }, []); 

  console.log('[Layout] 渲染布局组件:', { 
    sideNavCollapsed, 
    infoPanelCollapsed,
    hasChildren: !!children
  });
  
  return (
    <div className="simple-container">
      <header className="simple-header">
        <div className="simple-header-content">
          <div className="simple-logo">{title}</div>
          <nav className="simple-nav">
            <Link href="/"><a className="simple-nav-item">首页</a></Link>
            <Link href="/prompts"><a className="simple-nav-item">浏览提示词</a></Link>
            <Link href="/prompts/popular"><a className="simple-nav-item">热门提示词</a></Link>
            {isAuthenticated ? (
              <Link href="/prompts/create"><a className="simple-nav-item simple-nav-create-btn">+ 创建提示词</a></Link>
            ) : (
              <a 
                className="simple-nav-item simple-nav-create-btn" 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  // 保存当前要访问的路径，以便登录后重定向
                  sessionStorage.setItem('redirectAfterLogin', '/prompts/create');
                  console.log('[Layout] 保存重定向路径: /prompts/create');
                  router.push('/auth/login');
                }}
              >
                + 创建提示词
              </a>
            )}
          </nav>
          <div className="simple-user-actions">
            {isAuthenticated ? (
              <div className="simple-user-info">
                <span className="simple-username">{user?.username}</span>
                <Link href="/profile">
                  <a className="simple-button simple-button-primary">个人中心</a>
                </Link>
                <button className="simple-button" onClick={logout}>退出登录</button>
              </div>
            ) : (
              <div className="simple-auth-buttons">
                <Link href="/auth/login"><a className="simple-button">登录</a></Link>
                <Link href="/auth/register"><a className="simple-button simple-button-primary">注册</a></Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="layout-container">
        {/* 左侧导航栏 */}
        <SideNav 
          collapsed={sideNavCollapsed} 
          onCollapse={(collapsed) => {
            console.log('[Layout] 切换左侧导航栏状态:', { collapsed });
            setSideNavCollapsed(collapsed);
          }} 
        />
        
        {/* 主内容区 */}
        <main className={`simple-content ${sideNavCollapsed ? 'side-nav-collapsed' : ''} ${infoPanelCollapsed ? 'info-panel-collapsed' : ''}`}>
          {children}
        </main>
        
        {/* 右侧信息面板 */}
        <InfoPanel 
          collapsed={infoPanelCollapsed} 
          onCollapse={(collapsed) => {
            console.log('[Layout] 切换右侧信息面板状态:', { collapsed });
            setInfoPanelCollapsed(collapsed);
          }} 
        />
      </div>
      
      <footer className="simple-footer">
        <div className="simple-footer-content">
          <span className="footer-text">AI提示词知识库</span> <span className="footer-text">©{new Date().getFullYear()}</span> <span className="footer-text">Created by syc</span>
        </div>
      </footer>
      
      <style jsx global>{`
        html, body {
          direction: ltr !important;
          writing-mode: horizontal-tb !important;
          text-orientation: mixed !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f0f2f5;
        }
        
        .simple-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .simple-header {
          background-color: #001529;
          color: white;
          padding: 0;
          height: 64px;
        }
        
        .simple-header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          height: 100%;
        }
        
        .simple-logo {
          font-size: 18px;
          font-weight: bold;
          margin-right: 20px;
        }
        
        .simple-nav {
          flex: 1;
          display: flex;
        }
        
        .simple-nav-item {
          color: white;
          text-decoration: none;
          padding: 0 15px;
          line-height: 64px;
          transition: color 0.3s;
        }
        
        .simple-nav-item:hover {
          color: #1890ff;
        }

        .simple-nav-create-btn {
          background-color: #1890ff;
          border-radius: 4px;
          margin: 12px 0 12px 8px;
          line-height: 40px;
          padding: 0 16px;
          font-weight: 500;
          color: white !important;
        }

        .simple-nav-create-btn:hover {
          background-color: #40a9ff !important;
          color: white !important;
        }
        
        .simple-user-actions {
          margin-left: auto;
        }
        
        .simple-user-info {
          display: flex;
          align-items: center;
        }
        
        .simple-username {
          margin-right: 10px;
        }
        
        .simple-auth-buttons {
          display: flex;
          align-items: center;
        }
        
        .simple-button {
          display: inline-block;
          padding: 4px 15px;
          background: transparent;
          color: white;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          text-decoration: none;
          margin-left: 8px;
        }
        
        .simple-button-primary {
          background-color: #1890ff;
        }
        
        .layout-container {
          display: flex;
          flex: 1;
          min-height: calc(100vh - 64px - 80px); /* 减去header和footer的高度 */
        }
        
        .simple-content {
          flex: 1;
          padding: 20px;
          transition: all 0.3s;
          overflow-x: hidden;
        }
        
        .simple-content.side-nav-collapsed {
          margin-left: 80px;
        }
        
        .simple-content.side-nav-collapsed.info-panel-collapsed {
          margin-right: 0;
        }
        
        .simple-content.info-panel-collapsed {
          margin-right: 0;
        }
        
        @media (max-width: 768px) {
          .layout-container {
            flex-direction: column;
          }
          
          .simple-content.side-nav-collapsed {
            margin-left: 0;
          }
        }
        
        .simple-footer {
          background-color: #f0f2f5;
          padding: 30px 0;
          text-align: center;
          color: rgba(0, 0, 0, 0.65);
        }
        
        .simple-footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .footer-text {
          font-size: 16px;
          letter-spacing: 0.5px;
          padding: 0 5px;
        }
        
        .simple-card {
          background: white;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .simple-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 16px;
        }
        
        .simple-paragraph {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default Layout;
