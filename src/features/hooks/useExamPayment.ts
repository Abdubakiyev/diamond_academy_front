import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bulkCenterStudents,
  checkout,
  createManualPayment,
  getExamAccess,
  getMyPayments,
  getPublicExam,
  listCenterStudents,
  listPayments,
  runPaymentAction,
  setCenterStudent,
  startAttempt,
} from '../api/exam-payment';
import type { CenterStudentQuery, ManualPaymentInput, PaymentAction, PaymentListQuery, PaymentProvider } from '../types/exam-payment';

export const paymentKeys = {
  all: ['exam-payment'] as const,
  access: (examId: string) => [...paymentKeys.all, 'access', examId] as const,
  my: () => [...paymentKeys.all, 'my'] as const,
  admin: (q: PaymentListQuery) => [...paymentKeys.all, 'admin', q] as const,
};
export const centerKeys = {
  all: ['center-student'] as const,
  list: (q: CenterStudentQuery) => [...['center-student'], 'list', q] as const,
};

export const usePublicExam = (id?: string) =>
  useQuery({ queryKey: ['exam', 'public', id], queryFn: () => getPublicExam(id as string), enabled: !!id, retry: false });

/** To'lov kutilayotgan bo'lsa, har 5 soniyada tekshiradi (Click / Payme dan qaytgach tugma o'zi yangilanadi) */
export const useExamAccess = (examId?: string) =>
  useQuery({
    queryKey: paymentKeys.access(examId ?? ''),
    queryFn: () => getExamAccess(examId as string),
    enabled: !!examId,
    refetchInterval: (query) => (query.state.data?.pendingPaymentId && !query.state.data.canStart ? 5000 : false),
  });

export const useCheckout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, provider }: { examId: string; provider: PaymentProvider }) => checkout(examId, provider),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentKeys.all }),
  });
};

export const useMyPayments = () => useQuery({ queryKey: paymentKeys.my(), queryFn: getMyPayments });

export const useStartAttempt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => startAttempt(examId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all });
      qc.invalidateQueries({ queryKey: ['exam-attempt'] });
    },
  });
};

/* ── Admin ── */

export const useAdminPayments = (query: PaymentListQuery) =>
  useQuery({ queryKey: paymentKeys.admin(query), queryFn: () => listPayments(query), placeholderData: keepPreviousData });

export const usePaymentAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: PaymentAction; note?: string }) => runPaymentAction(id, action, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentKeys.all }),
  });
};

export const useCreateManualPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ManualPaymentInput) => createManualPayment(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentKeys.all }),
  });
};

export const useCenterStudents = (query: CenterStudentQuery, enabled = true) =>
  useQuery({ queryKey: centerKeys.list(query), queryFn: () => listCenterStudents(query), placeholderData: keepPreviousData, enabled });

export const useSetCenterStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, value }: { userId: string; value: boolean }) => setCenterStudent(userId, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: centerKeys.all }),
  });
};

export const useBulkCenterStudents = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userIds, value }: { userIds: string[]; value: boolean }) => bulkCenterStudents(userIds, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: centerKeys.all }),
  });
};
