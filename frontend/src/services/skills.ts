import api from './api';
import { User } from './auth';

export interface SkillPrompt {
  id: string;
  skill_id: string;
  prompt_id: string;
  order_index: number;
  role: 'system' | 'instruction' | 'example';
}

export interface Skill {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  target_tools: string[];
  is_public: boolean;
  fork_from: string | null;
  author_id: string;
  author: User;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  skill_prompts: SkillPrompt[];
}

export interface SkillCreate {
  title: string;
  description?: string;
  tags?: string[];
  target_tools?: string[];
  is_public?: boolean;
  category_id?: string;
  skill_prompts?: { prompt_id: string; order_index: number; role: string }[];
}

export interface SkillUpdate {
  title?: string;
  description?: string;
  tags?: string[];
  target_tools?: string[];
  is_public?: boolean;
  category_id?: string;
  skill_prompts?: { prompt_id: string; order_index: number; role: string }[];
}

export interface SkillListResult {
  data: Skill[];
  total: number;
  page: number;
  size: number;
}

export const getSkills = async (page = 1, size = 12): Promise<SkillListResult> => {
  const response = await api.get<SkillListResult>(`/api/skills?skip=${(page - 1) * size}&limit=${size}`);
  return response.data;
};

export const getSkillById = async (id: string): Promise<Skill> => {
  const response = await api.get<Skill>(`/api/skills/${id}`);
  return response.data;
};

export const createSkill = async (data: SkillCreate): Promise<Skill> => {
  const response = await api.post<Skill>('/api/skills', data);
  return response.data;
};

export const updateSkill = async (id: string, data: SkillUpdate): Promise<Skill> => {
  const response = await api.put<Skill>(`/api/skills/${id}`, data);
  return response.data;
};

export const deleteSkill = async (id: string): Promise<void> => {
  await api.delete(`/api/skills/${id}`);
};

export const searchSkills = async (
  query = '',
  tags?: string[],
  page = 1,
  size = 12
): Promise<SkillListResult> => {
  let url = `/api/skills?skip=${(page - 1) * size}&limit=${size}`;
  if (query) url += `&search=${encodeURIComponent(query)}`;
  if (tags && tags.length > 0) tags.forEach(t => { url += `&tags=${encodeURIComponent(t)}`; });
  const response = await api.get<SkillListResult>(url);
  return response.data;
};

export const exportSkill = (id: string, format: 'cursor' | 'claude' | 'copilot' | 'markdown') => {
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
  if (baseUrl.endsWith('/api')) baseUrl = baseUrl.slice(0, -4);
  window.open(`${baseUrl}/api/skills/${id}/export?format=${format}`, '_blank');
};
