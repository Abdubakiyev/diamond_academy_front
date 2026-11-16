'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { AuthResponse, MeUser, RegisterDto } from '../types/auth';
import { register as registerApi, getProfile } from '../api/auth';
import { tokenStore } from '../../lib/token';
import { LOGIN_PATH } from '../../lib/config';

export const ME_KEY = ['me'] as const;

/** Eski interfeys: register() sahifalari uchun (orqaga moslik) */
export const useAuth = () => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterDto) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerApi(data);
      setUser(res.user);
      setLoading(false);
      return res;
    } catch (err: unknown) {
      setError((err as Error).message || 'Something went wrong');
      setLoading(false);
      throw err;
    }
  };

  return { user, loading, error, register };
};

/** Joriy foydalanuvchi (rol bilan). Token bo'lmasa so'rov yuborilmaydi. */
export const useMe = (enabled = true) =>
  useQuery<MeUser>({
    queryKey: ME_KEY,
    queryFn: getProfile,
    enabled: enabled && !!tokenStore.getAccess(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

/** Kirish / ro'yxatdan o'tish mutatsiyasi; muvaffaqiyatda profil keshga yoziladi */
export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegisterDto) => registerApi(dto),
    onSuccess: (res) => {
      queryClient.setQueryData(ME_KEY, res.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return () => {
    tokenStore.clear();
    queryClient.clear();
    router.replace(LOGIN_PATH);
  };
};
