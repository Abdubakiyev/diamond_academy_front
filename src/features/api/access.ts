// src/features/api/access.ts
import axios from 'axios';
import { AccessCode, AccessCodeResponse, CheckAccessDto, CheckAccessResponse } from '../types/access';

const BASE_URL = 'http://localhost:3000/access';

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

// Get current access code (admin only)
export const getCurrentAccessCode = async (): Promise<AccessCode> => {
  const token = getToken();
  const { data } = await axios.get(`${BASE_URL}/current`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
};

// Generate new access code (admin only)
export const generateAccessCode = async (): Promise<AccessCodeResponse> => {
  const token = getToken();
  const { data } = await axios.get(`${BASE_URL}/generate`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
};

// Check access code (public)
export const checkAccessCode = async (dto: CheckAccessDto): Promise<CheckAccessResponse> => {
  const { data } = await axios.post(`${BASE_URL}/check`, dto);
  return data;
};