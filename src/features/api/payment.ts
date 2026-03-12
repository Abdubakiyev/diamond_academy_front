import { CreatePaymentDto, MonthlyReport, Payment, PaymentFilter, PaymentStats, PaymentStatus, UpdatePaymentDto } from '../types/payment';
import { apiClient } from './client';


export const paymentApi = {
  // Barcha to'lovlar
  getAll: async (filter?: PaymentFilter): Promise<Payment[]> => {
    const params = new URLSearchParams();
    if (filter?.student) params.append('student', filter.student);
    if (filter?.group) params.append('group', filter.group);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.month) params.append('month', filter.month);

    const query = params.toString();
    const { data } = await apiClient.get<Payment[]>(
      `/payment${query ? `?${query}` : ''}`
    );
    return data;
  },

  // ID bo'yicha olish
  getOne: async (id: string): Promise<Payment> => {
    const { data } = await apiClient.get<Payment>(`/payment/${id}`);
    return data;
  },

  // Talaba bo'yicha
  getByStudent: async (studentName: string): Promise<Payment[]> => {
    const { data } = await apiClient.get<Payment[]>(
      `/payment/student/${encodeURIComponent(studentName)}`
    );
    return data;
  },

  // Guruh bo'yicha
  getByGroup: async (groupName: string): Promise<Payment[]> => {
    const { data } = await apiClient.get<Payment[]>(
      `/payment/group/${encodeURIComponent(groupName)}`
    );
    return data;
  },

  // Status bo'yicha
  getByStatus: async (status: PaymentStatus): Promise<Payment[]> => {
    const { data } = await apiClient.get<Payment[]>(`/payment/status/${status}`);
    return data;
  },

  // Yangi to'lov
  create: async (dto: CreatePaymentDto): Promise<Payment> => {
    const { data } = await apiClient.post<Payment>('/payment', dto);
    return data;
  },

  // Yangilash
  update: async (id: string, dto: UpdatePaymentDto): Promise<Payment> => {
    const { data } = await apiClient.patch<Payment>(`/payment/${id}`, dto);
    return data;
  },

  // To'langan deb belgilash
 markAsPaid: async (id: string): Promise<Payment> => {
  const { data } = await apiClient.patch<Payment>(`/payment/${id}`, {
    status: PaymentStatus.PAID,
  });
  return data;
},

  // O'chirish
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/payment/${id}`);
  },

  // Statistika
  getStats: async (group?: string, student?: string): Promise<PaymentStats> => {
    const params = new URLSearchParams();
    if (group) params.append('group', group);
    if (student) params.append('student', student);

    const query = params.toString();
    const { data } = await apiClient.get<PaymentStats>(
      `/payment/stats/summary${query ? `?${query}` : ''}`
    );
    return data;
  },

  // Muddati o'tgan to'lovlarni belgilash
  markOverdue: async (): Promise<{ message: string; count: number }> => {
    const { data } = await apiClient.post('/payment/mark-overdue');
    return data;
  },

  // Oylik hisobot
  getMonthlyReport: async (year: number, month: number): Promise<MonthlyReport> => {
    const { data } = await apiClient.get<MonthlyReport>(
      `/payment/report/monthly/${year}/${month}`
    );
    return data;
  },
};