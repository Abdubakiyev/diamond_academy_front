import apiClient from './client';
import type {
  AdminPayment,
  AdminPaymentList,
  CenterStudent,
  CenterStudentList,
  CenterStudentQuery,
  CheckoutResult,
  ExamAccessInfo,
  ExamPayment,
  ManualPaymentInput,
  PaymentAction,
  PaymentListQuery,
  PaymentProvider,
  PublicExam,
  StartAttemptResult,
} from '../types/exam-payment';

/* ── Foydalanuvchi ── */

export const getPublicExam = (id: string) => apiClient.get<PublicExam>(`/exam/${id}`).then((r) => r.data);

export const getExamAccess = (examId: string) =>
  apiClient.get<ExamAccessInfo>(`/exam-payment/access/${examId}`).then((r) => r.data);

export const checkout = (examId: string, provider: PaymentProvider) =>
  apiClient.post<CheckoutResult>('/exam-payment/checkout', { examId, provider }).then((r) => r.data);

export const getMyPayments = () => apiClient.get<ExamPayment[]>('/exam-payment/my').then((r) => r.data);

/** Urinishni boshlash (tugallanmagani bo'lsa, davom ettiradi). To'lov kerak bo'lsa 402 qaytadi. */
export const startAttempt = (examId: string) =>
  apiClient.post<StartAttemptResult>('/exam-attempt/start', { examId }).then((r) => r.data);

/* ── Admin ── */

export const listPayments = (params: PaymentListQuery) =>
  apiClient.get<AdminPaymentList>('/exam-payment', { params }).then((r) => r.data);

export const createManualPayment = (input: ManualPaymentInput) =>
  apiClient.post<ExamPayment>('/exam-payment/manual', input).then((r) => r.data);

export const runPaymentAction = (id: string, action: PaymentAction, note?: string) =>
  apiClient.post<AdminPayment>(`/exam-payment/${id}/${action}`, { note }).then((r) => r.data);

export const listCenterStudents = (params: CenterStudentQuery) =>
  apiClient.get<CenterStudentList>('/center-student', { params }).then((r) => r.data);

export const setCenterStudent = (userId: string, isCenterStudent: boolean) =>
  apiClient.patch<CenterStudent>(`/center-student/${userId}`, { isCenterStudent }).then((r) => r.data);

export const bulkCenterStudents = (userIds: string[], isCenterStudent: boolean) =>
  apiClient.put<{ updated: number; requested: number }>('/center-student/bulk', { userIds, isCenterStudent }).then((r) => r.data);
