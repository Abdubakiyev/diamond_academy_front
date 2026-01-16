import api from './auth';
import { User } from '../types/user';

const getToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No access token found');
  return token;
};

// Get all users (admin only)
export const getUsers = async (): Promise<User[]> => {
  const token = getToken();
  const response = await api.get<User[]>('/user', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get current user profile
export const getProfile = async (): Promise<User> => {
  const token = getToken();
  const response = await api.get<User>('/user/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Update user (admin can update any user)
export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const token = getToken();
  const response = await api.patch<User>(`/user/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Deactivate / activate user
export const toggleUserActive = async (id: string): Promise<User> => {
  const token = getToken();
  const response = await api.patch<User>(`/user/${id}/toggle-active`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
