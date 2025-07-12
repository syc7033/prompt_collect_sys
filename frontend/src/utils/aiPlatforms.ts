// AI平台配置文件

export interface AIPlatform {
  id: string;
  name: string;
  icon?: string;
  buildUrl: (prompt: string) => string;
}

// AI平台列表
export const AI_PLATFORMS: AIPlatform[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    buildUrl: (prompt: string) => `https://chat.openai.com/?prompt=${encodeURIComponent(prompt)}`
  },
  {
    id: 'claude',
    name: 'Claude',
    buildUrl: (prompt: string) => `https://claude.ai/chat?prompt=${encodeURIComponent(prompt)}`
  },
  {
    id: 'wenxin',
    name: '文心一言',
    buildUrl: (prompt: string) => `https://yiyan.baidu.com/?prompt=${encodeURIComponent(prompt)}`
  },
  {
    id: 'qianwen',
    name: '通义千问',
    buildUrl: (prompt: string) => `https://qianwen.aliyun.com/?prompt=${encodeURIComponent(prompt)}`
  }
];

// 获取默认平台
export function getDefaultPlatform(): AIPlatform {
  // 从本地存储获取用户首选的平台
  const savedPlatformId = localStorage.getItem('preferredAIPlatform');
  if (savedPlatformId) {
    const platform = AI_PLATFORMS.find(p => p.id === savedPlatformId);
    if (platform) {
      return platform;
    }
  }
  // 默认返回第一个平台
  return AI_PLATFORMS[0];
}

// 保存用户首选平台
export function savePreferredPlatform(platformId: string): void {
  localStorage.setItem('preferredAIPlatform', platformId);
}

// 根据平台ID获取平台信息
export function getPlatformById(platformId: string): AIPlatform | undefined {
  return AI_PLATFORMS.find(p => p.id === platformId);
}
