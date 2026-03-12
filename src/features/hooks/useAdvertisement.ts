// src/features/hooks/useAdvertisement.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Advertisement, CreateAdvertisementDto, UpdateAdvertisementDto } from '../types/advertisement';
import * as api from '../api/advertisement';

export const useAdvertisements = () => {
  return useQuery<Advertisement[]>({
    queryKey: ['advertisements'],
    queryFn: api.getAdvertisements,
  });
};

export const useActiveAdvertisement = () => {
  return useQuery<Advertisement | null>({
    queryKey: ['advertisement', 'active'],
    queryFn: api.getActiveAdvertisement,
  });
};

export const useAdvertisement = (id: string) => {
  return useQuery<Advertisement>({
    queryKey: ['advertisement', id],
    queryFn: () => api.getAdvertisement(id),
    enabled: !!id,
  });
};

export const useCreateAdvertisement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createAdvertisement,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['advertisements'] }),
  });
};

export const useUpdateAdvertisement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAdvertisementDto }) =>
      api.updateAdvertisement(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['advertisement', 'active'] });
    },
  });
};

export const useDeleteAdvertisement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteAdvertisement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['advertisement', 'active'] });
    },
  });
};