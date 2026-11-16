import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  enqueueSection,
  getEvaluation,
  getEvaluationStats,
  getResult,
  listAllAttempts,
  listEvaluations,
  retryEvaluation,
  reviewEvaluation,
} from '../api/exam-result';
import type { AdminAttemptQuery, EvaluationQuery } from '../types/exam-result';

export const resultKeys = {
  result: (id: string) => ['exam-result', id] as const,
  attempts: (q: AdminAttemptQuery) => ['exam-attempt', 'admin', q] as const,
  evals: (q: EvaluationQuery) => ['ai-evaluation', 'list', q] as const,
  eval: (id: string) => ['ai-evaluation', 'one', id] as const,
  stats: ['ai-evaluation', 'stats'] as const,
};

/** Writing / Speaking tekshirilayotgan paytda har 5 soniyada yangilanadi */
export const useResult = (attemptId?: string) =>
  useQuery({
    queryKey: resultKeys.result(attemptId ?? ''),
    queryFn: () => getResult(attemptId as string),
    enabled: !!attemptId,
    retry: false,
    refetchInterval: (q) => (q.state.data?.pending ? 5000 : false),
  });

export const useAdminAttempts = (query: AdminAttemptQuery) =>
  useQuery({ queryKey: resultKeys.attempts(query), queryFn: () => listAllAttempts(query), placeholderData: keepPreviousData });

export const useEvaluations = (query: EvaluationQuery) =>
  useQuery({
    queryKey: resultKeys.evals(query),
    queryFn: () => listEvaluations(query),
    placeholderData: keepPreviousData,
    refetchInterval: 15000,
  });

export const useEvaluationStats = () => useQuery({ queryKey: resultKeys.stats, queryFn: getEvaluationStats, refetchInterval: 10000 });

export const useEvaluation = (id?: string) =>
  useQuery({
    queryKey: resultKeys.eval(id ?? ''),
    queryFn: () => getEvaluation(id as string),
    enabled: !!id,
    // Navbatda / jarayonda bo'lsa, tugaguncha kuzatamiz
    refetchInterval: (q) => (q.state.data && (q.state.data.status === 'PENDING' || q.state.data.status === 'PROCESSING') ? 4000 : false),
  });

const useInvalidateAll = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['ai-evaluation'] });
    qc.invalidateQueries({ queryKey: ['exam-result'] });
    qc.invalidateQueries({ queryKey: ['exam-attempt'] });
  };
};

export const useReviewEvaluation = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, finalScore, feedback }: { id: string; finalScore: number; feedback?: string }) => reviewEvaluation(id, { finalScore, feedback }),
    onSuccess: invalidate,
  });
};

export const useRetryEvaluation = () => {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: (id: string) => retryEvaluation(id), onSuccess: invalidate });
};

export const useEnqueueSection = () => {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: (sectionAttemptId: string) => enqueueSection(sectionAttemptId), onSuccess: invalidate });
};
