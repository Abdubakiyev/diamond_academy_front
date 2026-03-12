import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CreateMonthlyPaymentsDto, CreatePaymentDto, Payment, PaymentStats, PaymentStatus, UpdatePaymentDto } from '../types';
import { api, handleApiError } from '../api/api';

export const usePaymentsByGroup = (groupId: string, month?: string, status?: PaymentStatus) => {
  return useQuery({
    queryKey: ['payments', 'group', groupId, month, status],
    queryFn: async () => {
      const { data } = await api.get<Payment[]>(`/payment/group/${groupId}`, {
        params: { month, status },
      });
      return data;
    },
    enabled: !!groupId,
  });
};

export const usePaymentsByStudent = (studentId: string, limit = 12) => {
  return useQuery({
    queryKey: ['payments', 'student', studentId, limit],
    queryFn: async () => {
      const { data } = await api.get<Payment[]>(`/payment/student/${studentId}`, {
        params: { limit },
      });
      return data;
    },
    enabled: !!studentId,
  });
};

export const usePaymentStats = (groupId: string, startMonth?: string, endMonth?: string) => {
  return useQuery({
    queryKey: ['payments', 'stats', groupId, startMonth, endMonth],
    queryFn: async () => {
      const { data } = await api.get<PaymentStats>(`/payment/stats/${groupId}`, {
        params: { startMonth, endMonth },
      });
      return data;
    },
    enabled: !!groupId,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreatePaymentDto) => {
      const { data } = await api.post<Payment>('/payment', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('To\'lov qo\'shildi');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useCreateMonthlyPayments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateMonthlyPaymentsDto) => {
      const { data } = await api.post<Payment[]>('/payment/monthly', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Oylik to\'lovlar yaratildi');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdatePaymentDto }) => {
      const { data } = await api.patch<Payment>(`/payment/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('To\'lov yangilandi');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};