import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { register, UserRegisterData, isAuthenticated } from '../../services/auth';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    
    console.log('注册页面加载');
  }, [router]);

  const validateForm = () => {
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    
    if (password.length < 6) {
      setError('密码至少6个字符');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 创建注册数据对象
      const registerData: UserRegisterData = { 
        username, 
        email, 
        password 
      };
      
      await register(registerData);
      router.push('/auth/login');
    } catch (err: any) {
      console.error('注册失败:', err);
      if (err.response && err.response.data) {
        setError(`注册失败: ${err.response.data.detail || '请检查输入信息'}`);
      } else {
        setError('注册失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>注册 - AI提示词知识库</title>
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
          .register-container {
            max-width: 400px;
            margin: 100px auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 30px;
          }
          .register-title {
            text-align: center;
            margin-bottom: 30px;
            color: #333;
          }
          .register-form {
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
      
      <div className="register-container" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
        <h1 className="register-title" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
          AI提示词知识库
        </h1>
        <h2 className="register-title" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
          用户注册
        </h2>
        
        {error && <div className="error-message" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>{error}</div>}
        
        <form className="register-form" onSubmit={handleSubmit} style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
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
            <label htmlFor="email" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>邮箱</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          
          <div className="form-item">
            <label htmlFor="confirmPassword" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>确认密码</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}
            />
          </div>
          
          {/* 邀请码功能已移除 */}
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        
        <div className="links" style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>
          <Link href="/auth/login">
            <a style={{ direction: 'ltr', writingMode: 'horizontal-tb' }}>已有账号？立即登录</a>
          </Link>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;

