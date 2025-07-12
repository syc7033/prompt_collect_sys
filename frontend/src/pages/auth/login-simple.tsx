import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { login, UserLoginData, isAuthenticated } from '../../services/auth';

const SimpleLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // 如果用户已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/');
    }
    
    // 强制设置文档方向和书写模式
    document.documentElement.style.direction = 'ltr';
    document.documentElement.style.writingMode = 'horizontal-tb';
    document.documentElement.style.textOrientation = 'mixed';
    document.body.style.writingMode = 'horizontal-tb';
    document.body.style.textAlign = 'left';
    
    console.log('简化登录页面加载');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login({ username, password });
      router.push('/');
    } catch (err) {
      console.error('登录失败:', err);
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

export default SimpleLoginPage;
