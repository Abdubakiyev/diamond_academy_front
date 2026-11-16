import apiClient from './client';
import type {
  AdminAttemptList,
  AdminAttemptQuery,
  EvaluationDetail,
  EvaluationList,
  EvaluationQuery,
  EvaluationStats,
  ExamResult,
} from '../types/exam-result';

export const getResult = (attemptId: string) => apiClient.get<ExamResult>(`/exam-attempt/${attemptId}/result`).then((r) => r.data);

/* ── Admin / o'qituvchi ── */

export const listAllAttempts = (params: AdminAttemptQuery) =>
  apiClient.get<AdminAttemptList>('/exam-attempt', { params }).then((r) => r.data);

export const listEvaluations = (params: EvaluationQuery) =>
  apiClient.get<EvaluationList>('/ai-evaluation', { params }).then((r) => r.data);

export const getEvaluationStats = () => apiClient.get<EvaluationStats>('/ai-evaluation/stats').then((r) => r.data);

export const getEvaluation = (id: string) => apiClient.get<EvaluationDetail>(`/ai-evaluation/${id}`).then((r) => r.data);

/** AI bahosini o'zgartirish: finalScore 0–75 (1 ta kasr) */
export const reviewEvaluation = (id: string, body: { finalScore: number; feedback?: string }) =>
  apiClient.patch<{ id: string; finalScore: number }>(`/ai-evaluation/${id}/review`, body).then((r) => r.data);

export const retryEvaluation = (id: string) => apiClient.post<{ id: string; status: string }>(`/ai-evaluation/${id}/retry`).then((r) => r.data);

/** Faqat ADMIN: bo'limdagi barcha javoblarni qayta baholashga qo'yadi */
export const enqueueSection = (sectionAttemptId: string) =>
  apiClient.post<{ sectionAttemptId: string; queued: number }>(`/ai-evaluation/section-attempts/${sectionAttemptId}/enqueue`).then((r) => r.data);
