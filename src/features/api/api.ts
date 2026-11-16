import axios from 'axios';
import apiClient from './client';

/** Eski importlar (`import { api } from './api'`) ishlashda davom etadi: endi bitta umumiy klient */
export const api = apiClient;

/** Backend xatosidan o'qiladigan matn chiqaradi (NestJS `message` string yoki massiv bo'lishi mumkin) */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string' && message) return message;
    if (!error.response) return 'Server bilan aloqa yo‘q. Internetni tekshiring';
    return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Xatolik yuz berdi';
};

/** HTTP status kodini olish (402 = to'lov kerak, 409 = holat mos emas va h.k.) */
export const getErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;
/** Backend 400 javobidagi `problems` massivi (imtihonni e'lon qilishda) */
export const getErrorProblems = (error: unknown): string[] => {
  if (axios.isAxiosError(error)) {
    const p = error.response?.data?.problems;
    if (Array.isArray(p)) return p.filter((x): x is string => typeof x === 'string');
  }
  return [];
};
