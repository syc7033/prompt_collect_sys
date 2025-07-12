// 主题配置文件
// 这个文件定义了应用的主题变量，可以在整个应用中使用

export const lightTheme = {
  // 主色调
  primary: '#4F46E5', // 靛青色作为主色调，现代感强
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  
  // 辅助色
  secondary: '#10B981', // 绿松石色作为辅助色
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  
  // 强调色
  accent: '#F59E0B', // 琥珀色作为强调色
  accentLight: '#FBBF24',
  accentDark: '#D97706',
  
  // 背景色
  background: '#F9FAFB',
  backgroundAlt: '#F3F4F6',
  backgroundCard: '#FFFFFF',
  
  // 文本色
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  
  // 边框色
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // 状态色
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // 阴影
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  
  // 圆角
  borderRadiusSm: '0.125rem',
  borderRadius: '0.25rem',
  borderRadiusMd: '0.375rem',
  borderRadiusLg: '0.5rem',
  borderRadiusXl: '1rem',
  
  // 过渡
  transition: 'all 0.3s ease',
  
  // 字体
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

export const darkTheme = {
  // 主色调
  primary: '#818CF8', // 更亮的靛青色适合暗色模式
  primaryLight: '#A5B4FC',
  primaryDark: '#4F46E5',
  
  // 辅助色
  secondary: '#34D399',
  secondaryLight: '#6EE7B7',
  secondaryDark: '#10B981',
  
  // 强调色
  accent: '#FBBF24',
  accentLight: '#FCD34D',
  accentDark: '#F59E0B',
  
  // 背景色
  background: '#111827',
  backgroundAlt: '#1F2937',
  backgroundCard: '#374151',
  
  // 文本色
  textPrimary: '#F9FAFB',
  textSecondary: '#E5E7EB',
  textTertiary: '#9CA3AF',
  
  // 边框色
  border: '#374151',
  borderLight: '#4B5563',
  
  // 状态色
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // 阴影
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
  shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.26)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.26)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.25)',
  
  // 圆角和过渡与亮色主题相同
  borderRadiusSm: '0.125rem',
  borderRadius: '0.25rem',
  borderRadiusMd: '0.375rem',
  borderRadiusLg: '0.5rem',
  borderRadiusXl: '1rem',
  
  transition: 'all 0.3s ease',
  
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

// 导出当前主题的函数
export const getTheme = (isDark: boolean) => {
  return isDark ? darkTheme : lightTheme;
};

// 导出CSS变量字符串生成函数
export const generateCssVariables = (theme: typeof lightTheme) => {
  return Object.entries(theme)
    .map(([key, value]) => `--${key}: ${value};`)
    .join('\n');
};
