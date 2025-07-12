import api from './api';
import { AxiosResponse } from 'axios';

// 替代URL类型
export interface AlternativeUrl {
  name: string;
  url: string;
}

// AI平台类型定义
export interface AIPlatform {
  id: string;
  name: string;
  url: string;
  promptParam: string;
  supportsDirect: boolean; // 是否支持直接URL参数
  icon?: string;
  isDefault?: boolean;
  regionRestricted?: boolean; // 是否有地区限制
  alternativeUrls?: AlternativeUrl[]; // 替代访问方式
}

// 默认支持的AI平台列表
export const DEFAULT_PLATFORMS: AIPlatform[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chat.openai.com/',
    promptParam: 'prompt',
    supportsDirect: true, // 支持直接URL参数
    icon: 'openai',
    isDefault: true
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    url: 'https://gemini.google.com/',
    promptParam: 'text',
    supportsDirect: false, // 不支持直接URL参数
    icon: 'google',
    regionRestricted: false
  },
  {
    id: 'wenxin',
    name: '文心一言',
    url: 'https://yiyan.baidu.com/',
    promptParam: 'text',
    supportsDirect: false, // 不支持直接URL参数
    icon: 'baidu'
  },
  {
    id: 'qianwen',
    name: '通义千问',
    url: 'https://qianwen.aliyun.com/',
    promptParam: 'prompt',
    supportsDirect: false, // 不支持直接URL参数
    icon: 'alibaba'
  }
];

// 获取用户平台设置
export const getUserPlatformSettings = async (): Promise<AIPlatform[]> => {
  try {
    // 尝试从本地存储获取
    const storedSettings = localStorage.getItem('aiPlatformSettings');
    console.log('%c[aiPlatformService] 获取用户平台设置', 'background: #3F51B5; color: white', { 
      存储的设置: storedSettings ? '存在' : '不存在'
    });
    
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      console.log('%c[aiPlatformService] 解析用户平台设置', 'background: #3F51B5; color: white', { 
        平台数量: parsedSettings.length,
        平台列表: parsedSettings.map((p: AIPlatform) => `${p.name}${p.isDefault ? '(默认)' : ''}`)
      });
      return parsedSettings;
    }
    
    // 如果没有本地设置，返回默认平台
    console.log('%c[aiPlatformService] 使用默认平台设置', 'background: #3F51B5; color: white', { 
      平台数量: DEFAULT_PLATFORMS.length,
      平台列表: DEFAULT_PLATFORMS.map((p: AIPlatform) => `${p.name}${p.isDefault ? '(默认)' : ''}`)
    });
    return DEFAULT_PLATFORMS;
  } catch (error) {
    console.error('%c[aiPlatformService] 获取AI平台设置失败', 'background: #F44336; color: white', error);
    return DEFAULT_PLATFORMS;
  }
};

// 保存用户平台设置
export const saveUserPlatformSettings = async (platforms: AIPlatform[]): Promise<void> => {
  try {
    console.log('%c[aiPlatformService] 保存用户平台设置', 'background: #3F51B5; color: white', { 
      平台数量: platforms.length,
      平台列表: platforms.map((p: AIPlatform) => `${p.name}${p.isDefault ? '(默认)' : ''}`)
    });
    localStorage.setItem('aiPlatformSettings', JSON.stringify(platforms));
  } catch (error) {
    console.error('%c[aiPlatformService] 保存AI平台设置失败', 'background: #F44336; color: white', error);
  }
};

// 获取默认平台
export const getDefaultPlatform = async (): Promise<AIPlatform> => {
  const platforms = await getUserPlatformSettings();
  const defaultPlatform = platforms.find(p => p.isDefault) || platforms[0];
  
  console.log('%c[aiPlatformService] 获取默认平台', 'background: #3F51B5; color: white', { 
    默认平台: defaultPlatform.name,
    是否标记为默认: !!defaultPlatform.isDefault,
    平台ID: defaultPlatform.id
  });
  
  return defaultPlatform;
};

// 设置默认平台
export const setDefaultPlatform = async (platformId: string): Promise<void> => {
  const platforms = await getUserPlatformSettings();
  const updatedPlatforms = platforms.map(p => ({
    ...p,
    isDefault: p.id === platformId
  }));
  await saveUserPlatformSettings(updatedPlatforms);
};

// 获取最近使用的平台
export const getLastUsedPlatform = (): AIPlatform | null => {
  try {
    const lastUsed = localStorage.getItem('lastUsedAiPlatform');
    console.log('%c[aiPlatformService] 获取最近使用平台', 'background: #3F51B5; color: white', { 
      最近使用平台: lastUsed ? '存在' : '不存在'
    });
    
    if (lastUsed) {
      const parsedPlatform = JSON.parse(lastUsed);
      console.log('%c[aiPlatformService] 解析最近使用平台', 'background: #3F51B5; color: white', { 
        平台名称: parsedPlatform.name,
        平台ID: parsedPlatform.id
      });
      return parsedPlatform;
    }
    return null;
  } catch (error) {
    console.error('%c[aiPlatformService] 获取最近使用平台失败', 'background: #F44336; color: white', error);
    return null;
  }
};

// 保存最近使用的平台
export const saveLastUsedPlatform = (platform: AIPlatform): void => {
  try {
    console.log('%c[aiPlatformService] 保存最近使用平台', 'background: #3F51B5; color: white', { 
      平台名称: platform.name,
      平台ID: platform.id,
      是否默认: platform.isDefault
    });
    localStorage.setItem('lastUsedAiPlatform', JSON.stringify(platform));
  } catch (error) {
    console.error('%c[aiPlatformService] 保存最近使用平台失败', 'background: #F44336; color: white', error);
  }
};

// 构建AI平台URL
export const buildPlatformUrl = (platform: AIPlatform, promptContent: string): string => {
  // 只有支持直接URL参数的平台才添加提示词参数
  if (platform.supportsDirect) {
    const encodedPrompt = encodeURIComponent(promptContent);
    return `${platform.url}?${platform.promptParam}=${encodedPrompt}`;
  } else {
    // 不支持直接URL参数的平台返回基本URL
    return platform.url;
  }
};
