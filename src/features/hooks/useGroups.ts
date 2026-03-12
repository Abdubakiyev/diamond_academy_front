import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, handleApiError } from '../api/api';
import { CreateGroupDto, Group, UpdateGroupDto } from '../types';

export const useGroups = (isActive?: boolean) => {
  return useQuery({
    queryKey: ['groups', isActive],
    queryFn: async () => {
      const params = isActive !== undefined ? { isActive: isActive.toString() } : {};
      const { data } = await api.get<Group[]>('/group', { params });
      return data;
    },
  });
};

export const useGroup = (id: string) => {
  return useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      const { data } = await api.get<Group>(`/group/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateGroupDto) => {
      const { data } = await api.post<Group>('/group', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Guruh yaratildi');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateGroupDto }) => {
      const { data } = await api.patch<Group>(`/group/${id}`, dto);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', data.id] });
      toast.success('Guruh yangilandi');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/group/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Guruh o\'chirildi');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};