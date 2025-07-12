import React, { useState, useEffect, useCallback, ComponentType } from 'react';
import { useAuth } from './AuthContext';
import LoginRequiredModal from '../components/auth/LoginRequiredModal';

interface WithAuthProps {
  onRequireLogin?: () => void;
  loginModalTitle?: string;
  loginModalMessage?: string;
  loginModalActionName?: string;
}

/**
 * 高阶组件：为需要登录的操作提供认证检查
 * 如果用户未登录，将显示登录提示对话框
 * 
 * @param WrappedComponent 被包装的组件
 * @param requireAuth 是否强制要求登录（默认为true）
 * @returns 包装后的组件
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  requireAuth: boolean = true
) {
  return function WithAuthComponent(props: P & WithAuthProps) {
    const { isAuthenticated } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { 
      onRequireLogin,
      loginModalTitle,
      loginModalMessage,
      loginModalActionName,
      ...componentProps 
    } = props;

    // 处理需要登录的操作
    const handleAuthCheck = (callback?: () => void) => {
      if (isAuthenticated) {
        // 已登录，直接执行回调
        callback && callback();
      } else if (requireAuth) {
        // 未登录且需要登录，显示登录提示
        setShowLoginModal(true);
        onRequireLogin && onRequireLogin();
      } else {
        // 未登录但不强制要求登录，直接执行回调
        callback && callback();
      }
    };

    return (
      <>
        <WrappedComponent 
          {...componentProps as P} 
          isAuthenticated={isAuthenticated}
          onAuthCheck={handleAuthCheck}
        />
        <LoginRequiredModal
          visible={showLoginModal}
          onCancel={() => setShowLoginModal(false)}
          onLogin={() => setShowLoginModal(false)}
          title={loginModalTitle}
          message={loginModalMessage}
          actionName={loginModalActionName}
        />
      </>
    );
  };
}

/**
 * 自定义Hook：用于在函数组件中检查用户是否已登录
 * 如果未登录，可以显示登录提示对话框
 * 
 * @returns 包含认证状态和检查函数的对象
 */
export function useAuthCheck() {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  console.log('[useAuthCheck] 初始化，认证状态:', isAuthenticated);

  const checkAuth = useCallback((callback?: () => void) => {
    console.log('[useAuthCheck.checkAuth] 检查认证:', { isAuthenticated });
    if (isAuthenticated) {
      // 已登录，直接执行回调
      console.log('[useAuthCheck.checkAuth] 已登录，继续执行回调');
      callback && callback();
      return true;
    } else {
      // 未登录，显示登录提示
      console.log('[useAuthCheck.checkAuth] 未登录，显示登录提示');
      setShowLoginModal(true);
      return false;
    }
  }, [isAuthenticated]);
  
  return {
    isAuthenticated,
    checkAuth,
    showLoginModal,
    setShowLoginModal
  };
}

/**
 * 登录检查组件：用于包装需要登录的按钮或链接
 */
export const AuthCheck: React.FC<{
  children: React.ReactNode;
  onCheck?: () => void;
  fallback?: React.ReactNode;
  loginModalTitle?: string;
  loginModalMessage?: string;
  loginModalActionName?: string;
}> = ({ 
  children, 
  onCheck, 
  fallback = null,
  loginModalTitle,
  loginModalMessage,
  loginModalActionName
}) => {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      setShowLoginModal(true);
      return;
    }
    
    onCheck && onCheck();
  };
  
  return (
    <>
      {isAuthenticated ? (
        children
      ) : (
        <div onClick={handleClick} style={{ display: 'inline-block' }}>
          {fallback || children}
        </div>
      )}
      <LoginRequiredModal
        visible={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        onLogin={() => setShowLoginModal(false)}
        title={loginModalTitle}
        message={loginModalMessage}
        actionName={loginModalActionName}
      />
    </>
  );
};
