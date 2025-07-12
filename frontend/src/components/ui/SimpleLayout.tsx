import React, { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../utils/AuthContext';

interface SimpleLayoutProps {
  children: ReactNode;
  title?: string;
}

const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children, title = 'AI提示词知识库' }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('SimpleLayout组件已加载');
    console.log('当前路径:', router.pathname);
    console.log('认证状态:', isAuthenticated);
  }, [isAuthenticated, router.pathname]);

  return (
    <div className="simple-container">
      <header className="simple-header">
        <div className="simple-header-content">
          <div className="simple-logo">{title}</div>
          <nav className="simple-nav">
            <Link href="/"><a className="simple-nav-item">首页</a></Link>
            <Link href="/prompts"><a className="simple-nav-item">浏览提示词</a></Link>
            {isAuthenticated && (
              <Link href="/prompts/create"><a className="simple-nav-item">创建提示词</a></Link>
            )}
          </nav>
          <div className="simple-user-actions">
            {isAuthenticated ? (
              <div className="simple-user-info">
                <span className="simple-username">{user?.username}</span>
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
      
      <main className="simple-content">
        {children}
      </main>
      
      <footer className="simple-footer">
        <div className="simple-footer-content">
          AI提示词知识库 ©{new Date().getFullYear()} Created by Your Company
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
        
        .simple-content {
          flex: 1;
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        
        .simple-footer {
          background-color: #f0f2f5;
          padding: 24px 0;
          text-align: center;
          color: rgba(0, 0, 0, 0.65);
        }
        
        .simple-footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
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

export default SimpleLayout;
