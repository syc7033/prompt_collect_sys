import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lightTheme, darkTheme, generateCssVariables } from '../styles/theme';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof lightTheme;
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: lightTheme,
});

// 主题提供器组件
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 检查用户之前的主题偏好
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      // 检查系统偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedTheme ? savedTheme === 'dark' : prefersDark;
    }
    return false;
  });

  // 当前主题对象
  const theme = isDarkMode ? darkTheme : lightTheme;

  // 切换主题函数
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // 当主题改变时，更新本地存储和应用CSS变量
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 保存到本地存储
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      
      // 应用CSS变量到文档根元素
      const cssVars = generateCssVariables(theme);
      document.documentElement.setAttribute('style', cssVars);
      
      // 添加或移除dark类
      if (isDarkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    }
  }, [isDarkMode, theme]);

  // 监听系统主题变化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        // 只有当用户没有明确设置主题时才跟随系统
        if (!localStorage.getItem('theme')) {
          setIsDarkMode(e.matches);
        }
      };
      
      // 添加监听器
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // 兼容旧版浏览器
        mediaQuery.addListener(handleChange);
      }
      
      // 清理监听器
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          // 兼容旧版浏览器
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 自定义钩子，方便在组件中使用主题
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
