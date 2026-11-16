import apiClient from './client';
import { tokenStore } from '../../lib/token';
import type { AuthResponse, MeUser, RegisterDto } from '../types/auth';

/** Kirish yoki ro'yxatdan o'tish (backend bitta endpoint). Tokenlar saqlanadi. */
export const register = async (data: RegisterDto): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/auth/register', data);
  tokenStore.set(res.data.accessToken, res.data.refreshToken);
  return res.data;
};

export const getProfile = async (): Promise<MeUser> => {
  const res = await apiClient.get<MeUser>('/user/me');
  return res.data;
};

export const setAuthToken = (token: string | null) => {
  if (token) tokenStore.set(token);
  else tokenStore.clear();
};

export default apiClient;
