import api from './auth'; // auth.ts da yaratilgan axios instance
import { Test } from '../types/test';

const getToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No access token found');
  return token;
};

// Get all tests by level
export const getTestsByLevel = async (levelId: string): Promise<Test[]> => {
  const token = getToken();
  const response = await api.get<Test[]>(`/test/level/${levelId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get single test
export const getTest = async (id: string): Promise<Test> => {
  const token = getToken();
  const response = await api.get<Test>(`/test/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Create new test
export const createTest = async (data: Partial<Test>): Promise<Test> => {
  const token = getToken();
  const response = await api.post<Test>('/test', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Update test
export const updateTest = async (id: string, data: Partial<Test>): Promise<Test> => {
  const token = getToken();
  const response = await api.patch<Test>(`/test/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Delete test
export const deleteTest = async (id: string): Promise<Test> => {
  const token = getToken();
  const response = await api.delete<Test>(`/test/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
