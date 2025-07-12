import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { login, UserLoginData, isAuthenticated } from '../../services/auth';

const LoginPage: React.FC = () => {
  console.log('[LOGIN_PAGE] 页面初始化');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // 如果用户已登录，重定向到首页或之前的页面
  useEffect(() => {
    console.log('[LOGIN_PAGE] ====== 登录页面加载 ======');
    console.log('[LOGIN_PAGE] 检查是否已登录:', isAuthenticated());
    
    // 检查本地缓存的用户信息
    const cachedUser = localStorage.getItem('cachedUser');
    console.log('[LOGIN_PAGE] 本地缓存的用户信息:', cachedUser ? JSON.parse(cachedUser).username : '无');
    console.log('[LOGIN_PAGE] 当前URL:', window.location.href);
    console.log('[LOGIN_PAGE] 当前路径:', router.pathname);
    console.log('[LOGIN_PAGE] 来源路径:', document.referrer);
    
    // 检查是否有重定向路径
    const redirectPath = sessionStorage.getItem('redirectAfterLogin');
    console.log('[LOGIN_PAGE] 保存的重定向路径:', redirectPath || '无');
    console.log('[LOGIN_PAGE] sessionStorage内容:', Object.keys(sessionStorage).map(key => `${key}: ${sessionStorage.getItem(key)}`));
    
    // 如果用户已登录，进行重定向
    if (isAuthenticated()) {
      if (redirectPath) {
        console.log('[LOGIN_PAGE] 用户已登录，重定向到:', redirectPath);
        // 先复制一份路径，再清除存储
        const pathToRedirect = redirectPath;
        sessionStorage.removeItem('redirectAfterLogin'); // 清除重定向路径
        
        // 使用window.location而不是router进行完全刷新式跳转
        window.location.href = pathToRedirect;
      } else {
        console.log('[LOGIN_PAGE] 用户已登录，重定向到首页');
        window.location.href = '/';
      }
    } else {
      console.log('[LOGIN_PAGE] 用户未登录，不进行重定向');
      // 注意: 不要使用document.referrer覆盖现有的redirectAfterLogin
      // 只有在redirectAfterLogin不存在时，才考虑使用referrer
      if (!redirectPath && document.referrer) {
        try {
          const referrerUrl = new URL(document.referrer);
          if (referrerUrl.pathname !== '/auth/login' && referrerUrl.pathname !== '/') {
            console.log('[LOGIN_PAGE] 从来源页面保存重定向路径:', referrerUrl.pathname);
            sessionStorage.setItem('redirectAfterLogin', referrerUrl.pathname);
          }
        } catch (e) {
          console.error('[LOGIN_PAGE] 解析来源URL失败:', e);
        }
      }
    }
    
    // 强制设置文档方向和书写模式
    document.documentElement.style.direction = 'ltr';
    document.documentElement.style.writingMode = 'horizontal-tb';
    document.documentElement.style.textOrientation = 'mixed';
    document.body.style.writingMode = 'horizontal-tb';
    document.body.style.textAlign = 'left';
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LOGIN_PAGE] ====== 开始登录过程 ======');
    console.log('[LOGIN_PAGE] 用户名:', username);
    setLoading(true);
    setError('');
    
    try {
      // 登录前再次检查重定向路径
      const beforeLoginRedirectPath = sessionStorage.getItem('redirectAfterLogin');
      console.log('[LOGIN_PAGE] 登录前保存的重定向路径:', beforeLoginRedirectPath || '无');
      
      console.log('[LOGIN_PAGE] 调用登录API');
      await login({ username, password });
      console.log('[LOGIN_PAGE] 登录API调用成功');
      
      // 直接处理重定向，不使用延迟
      console.log('[LOGIN_PAGE] ====== 登录成功，开始处理重定向 ======');
      console.log('[LOGIN_PAGE] sessionStorage内容:', Object.keys(sessionStorage).map(key => `${key}: ${sessionStorage.getItem(key)}`));
      
      // 检查是否有登录后需要重定向的页面
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      console.log('[LOGIN_PAGE] 登录成功后检查重定向路径:', redirectPath || '无');
      
      // 再次检查用户认证状态
      console.log('[LOGIN_PAGE] 用户认证状态:', isAuthenticated() ? '已登录' : '未登录');
      const cachedUser = localStorage.getItem('cachedUser');
      console.log('[LOGIN_PAGE] 本地缓存的用户信息:', cachedUser ? JSON.parse(cachedUser).username : '无');
      
      if (redirectPath) {
        console.log('[LOGIN_PAGE] 准备重定向到:', redirectPath);
        // 先复制一份路径，再清除存储
        const pathToRedirect = redirectPath;
        sessionStorage.removeItem('redirectAfterLogin'); // 清除重定向路径
        console.log('[LOGIN_PAGE] 已清除重定向路径，准备跳转到:', pathToRedirect);
        
        // 使用window.location而不是router进行完全刷新式跳转
        window.location.href = pathToRedirect;
      } else {
        console.log('[LOGIN_PAGE] 没有重定向路径，跳转到首页');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('[LOGIN_PAGE] 登录失败:', err);
      setError('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>登录 - AI提示词知识库</title>
        <style>{`
          * {
            direction: ltr !important;
            writing-mode: horizontal-tb !important;
            text-orientation: mixed !important;
          }
          body {
            font-family: "Microsoft YaHei", "PingFang SC", "SimSun", sans-serif;
            padding: 20px;
            background: #f0f2f5;
            margin: 0;
          }
          .login-container {
            max-width: 400px;
            margin: 100px auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 30px;
          }
          .login-title {
            text-align: center;
            margin-bottom: 30px;
            color: #333;
          }
          .login-form {
            display: flex;
            flex-direction: column;
          }
          .form-item {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
          }
          input {
            width: 100%;
            padding: 10px;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            font-size: 14px;
          }
          button {
            background: #1890ff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          }
          button:hover {
            background: #40a9ff;
          }
          button:disabled {
            background: #bae7ff;
            cursor: not-allowed;
          }
          .error-message {
            color: #ff4d4f;
            margin-bottom: 15px;
          }
          .links {
            margin-top: 15px;
            text-align: center;
          }
          a {
            color: #1890ff;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        `}</style>
      </Head>
      
      <div className="login-container" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
        <h1 className="login-title" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
          AI提示词知识库
        </h1>
        <h2 className="login-title" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
          用户登录
        </h2>
        
        {error && <div className="error-message" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>{error}</div>}
        
        <form className="login-form" onSubmit={handleSubmit} style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
          <div className="form-item">
            <label htmlFor="username" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>用户名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}
            />
          </div>
          
          <div className="form-item">
            <label htmlFor="password" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div className="links" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
          <Link href="/auth/register">
            <a style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>还没有账号？立即注册</a>
          </Link>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
