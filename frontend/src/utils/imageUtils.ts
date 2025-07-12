/**
 * 图片工具函数
 */

// 获取API基础URL
const getApiBaseUrl = (): string => {
  // 从环境变量获取API URL，如果没有则使用默认值
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // 移除尾随的斜杠
  if (apiUrl.endsWith('/')) {
    apiUrl = apiUrl.slice(0, -1);
  }
  
  return apiUrl;
};

/**
 * 获取完整的头像URL
 * @param url 头像的相对URL或完整URL
 * @returns 完整的头像URL或undefined
 */
export const getFullAvatarUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  
  // 如果已经是完整URL则直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果是相对路径，添加API基础URL
  return `${getApiBaseUrl()}${url}`;
};
