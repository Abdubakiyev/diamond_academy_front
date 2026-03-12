import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, handleApiError } from '../api/api';
import { Attendance, AttendanceStats, CreateAttendanceDto } from '../types';

export const useAttendanceByGroupAndDate = (groupId: string, date: string) => {
  return useQuery({
    queryKey: ['attendance', groupId, date],
    queryFn: async () => {
      const { data } = await api.get<any[]>(`/attendance/group/${groupId}/date/${date}`);
      return data;
    },
    enabled: !!groupId && !!date,
  });
};

export const useAttendanceByStudent = (studentId: string, limit = 20) => {
  return useQuery({
    queryKey: ['attendance', 'student', studentId, limit],
    queryFn: async () => {
      const { data } = await api.get<Attendance[]>(`/attendance/student/${studentId}`, {
        params: { limit },
      });
      return data;
    },
    enabled: !!studentId,
  });
};

export const useAttendanceStats = (groupId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['attendance', 'stats', groupId, startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<AttendanceStats[]>(`/attendance/stats/${groupId}`, {
        params: { startDate, endDate },
      });
      return data;
    },
    enabled: !!groupId,
  });
};

export const useCreateAttendanceBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateAttendanceDto) => {
      const { data } = await api.post<Attendance[]>('/attendance/bulk', dto);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.groupId] });
      toast.success('Davomat saqlandi');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};