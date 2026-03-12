// src/features/hooks/useAccess.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AccessCode, AccessCodeResponse, CheckAccessDto, CheckAccessResponse } from '../types/access';
import * as api from '../api/access';

// Get current access code (admin)
export const useCurrentAccessCode = () => {
  return useQuery<AccessCode>({
    queryKey: ['access', 'current'],
    queryFn: api.getCurrentAccessCode,
    refetchInterval: 60000, // Har 1 minutda yangilash
    refetchOnWindowFocus: true,
  });
};

// Generate new access code (admin)
export const useGenerateAccessCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.generateAccessCode,
    onSuccess: (data) => {
      // Update cache with new code
      queryClient.setQueryData(['access', 'current'], data);
      queryClient.invalidateQueries({ queryKey: ['access', 'current'] });
    },
  });
};

// Check access code (public)
export const useCheckAccessCode = () => {
  return useMutation({
    mutationFn: api.checkAccessCode,
  });
};