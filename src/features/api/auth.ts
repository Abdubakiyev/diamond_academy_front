import axios from 'axios';
import { RegisterDto, AuthResponse } from '../types/auth';

// Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000', // NestJS backend URL
  headers: { 'Content-Type': 'application/json' },
});

// Register function
export const register = async (data: RegisterDto): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  // Tokenni localStorage da saqlash
  localStorage.setItem('access_token', response.data.accessToken);
  return response.data;
};

// Get current user profile
export const getProfile = async (): Promise<AuthResponse['user']> => {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No token found');

  const response = await api.get<AuthResponse['user']>('/user/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// JWT token bilan boshqa endpointlarni chaqirish uchun helper
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
