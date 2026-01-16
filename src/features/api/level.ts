import api from './auth';
import { Level } from '../types/level';

const getToken = (): string => {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No access token found');
  return token;
};

export const getLevels = async (): Promise<Level[]> => {
  const token = getToken();
  const { data } = await api.get<Level[]>('/level', {
    headers: { Authorization: `Bearer ${token}` }, // har sorovga token
  });
  return data;
};

export const getLevel = async (id: string): Promise<Level> => {
  const token = getToken();
  const { data } = await api.get<Level>(`/level/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createLevel = async (data: { type: string }): Promise<Level> => {
  const token = getToken();
  const { data: level } = await api.post<Level>('/level', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return level;
};

export const updateLevel = async (id: string, data: { type?: string }): Promise<Level> => {
  const token = getToken();
  const { data: level } = await api.patch<Level>(`/level/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return level;
};

export const deleteLevel = async (id: string): Promise<void> => {
  const token = getToken();
  await api.delete(`/level/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
