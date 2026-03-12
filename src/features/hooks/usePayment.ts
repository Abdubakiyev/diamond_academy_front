import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'react-hot-toast';
import { CreatePaymentDto, PaymentFilter, PaymentStatus, UpdatePaymentDto } from '../types/payment';
import { paymentApi } from '../api/payment';

const QUERY_KEY = 'payments';

// Barcha to'lovlar
export const usePayments = (filter?: PaymentFilter) => {
  return useQuery({
    queryKey: [QUERY_KEY, filter],
    queryFn: () => paymentApi.getAll(filter),
  });
};

// ID bo'yicha
export const usePayment = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => paymentApi.getOne(id),
    enabled: !!id,
  });
};

// Talaba bo'yicha
export const usePaymentsByStudent = (studentName: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'student', studentName],
    queryFn: () => paymentApi.getByStudent(studentName),
    enabled: !!studentName,
  });
};

// Guruh bo'yicha
export const usePaymentsByGroup = (groupName: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'group', groupName],
    queryFn: () => paymentApi.getByGroup(groupName),
    enabled: !!groupName,
  });
};

// Status bo'yicha
export const usePaymentsByStatus = (status: PaymentStatus) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'status', status],
    queryFn: () => paymentApi.getByStatus(status),
    enabled: !!status,
  });
};

// Statistika
export const usePaymentStats = (group?: string, student?: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats', group, student],
    queryFn: () => paymentApi.getStats(group, student),
  });
};

// Oylik hisobot
export const useMonthlyReport = (year: number, month: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'report', year, month],
    queryFn: () => paymentApi.getMonthlyReport(year, month),
    enabled: !!year && !!month,
  });
};

// Yaratish
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePaymentDto) => paymentApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('To\'lov muvaffaqiyatli qo\'shildi');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    },
  });
};

// Yangilash
export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePaymentDto }) =>
      paymentApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('To\'lov yangilandi');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    },
  });
};

// To'langan deb belgilash
export const useMarkAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentApi.markAsPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('To\'lov to\'langan deb belgilandi');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    },
  });
};

// O'chirish
export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('To\'lov o\'chirildi');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    },
  });
};

// Muddati o'tgan to'lovlarni belgilash
export const useMarkOverdue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => paymentApi.markOverdue(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    },
  });
};