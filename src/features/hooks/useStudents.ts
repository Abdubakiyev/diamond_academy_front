import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, handleApiError } from '../api/api';
import { CreateStudentDto, Student, UpdateStudentDto } from '../types';

export const useStudents = (groupId?: string) => {
  return useQuery({
    queryKey: ['students', groupId],
    queryFn: async () => {
      const params = groupId ? { groupId } : {};
      const { data } = await api.get<Student[]>('/student', { params });
      return data;
    },
  });
};

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const { data } = await api.get<Student>(`/student/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useStudentsByGroup = (groupId: string) => {
  return useQuery({
    queryKey: ['students', 'by-group', groupId],
    queryFn: async () => {
      const { data } = await api.get<Student[]>(`/student/by-group/${groupId}`);
      return data;
    },
    enabled: !!groupId,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateStudentDto) => {
      const { data } = await api.post<Student>('/student', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Talaba qo\'shildi');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateStudentDto }) => {
      const { data } = await api.patch<Student>(`/student/${id}`, dto);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', data.id] });
      toast.success('Talaba yangilandi');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/student/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Talaba o\'chirildi');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};