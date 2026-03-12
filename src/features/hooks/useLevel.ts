// src/features/hooks/useLevel.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '../api/api';
import { Level } from '../types/index'; // ✅ index.ts dan import

export const useLevels = () => {
  return useQuery<Level[]>({
    queryKey: ['levels'],
    queryFn: async () => {
      const { data } = await api.get<Level[]>('/level');
      return data;
    },
  });
};

export const useLevel = (id: string) => {
  return useQuery<Level>({
    queryKey: ['level', id],
    queryFn: async () => {
      const { data } = await api.get<Level>(`/level/${id}`);
      return data;
    },
    enabled: !!id,
  });
};