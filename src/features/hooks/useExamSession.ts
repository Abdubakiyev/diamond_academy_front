import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { finishAttempt, getOverview, getSectionContent, startSection, submitSection } from '../api/exam-session';

export const sessionKeys = {
  all: ['exam-session'] as const,
  overview: (attemptId: string) => [...sessionKeys.all, 'overview', attemptId] as const,
  content: (attemptId: string, sectionId: string) => [...sessionKeys.all, 'content', attemptId, sectionId] as const,
};

/** Lobby: faol urinish bo'lsa har 15 soniyada holatni yangilaydi */
export const useOverview = (attemptId?: string) =>
  useQuery({
    queryKey: sessionKeys.overview(attemptId ?? ''),
    queryFn: () => getOverview(attemptId as string),
    enabled: !!attemptId,
    retry: false,
    refetchInterval: (q) => (q.state.data?.status === 'IN_PROGRESS' ? 15000 : false),
  });

/**
 * Bo'lim mazmuni har kirganda yangidan olinadi (javoblar serverdan keladi) va fonda qayta yuklanmaydi:
 * tahrirlanayotgan javoblar ustidan yozilib ketmasligi uchun.
 */
export const useSectionContent = (attemptId?: string, sectionId?: string) =>
  useQuery({
    queryKey: sessionKeys.content(attemptId ?? '', sectionId ?? ''),
    queryFn: () => getSectionContent(attemptId as string, sectionId as string),
    enabled: !!attemptId && !!sectionId,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useStartSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, sectionId }: { attemptId: string; sectionId: string }) => startSection(attemptId, sectionId),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: sessionKeys.overview(v.attemptId) }),
  });
};

export const useSubmitSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, sectionId }: { attemptId: string; sectionId: string }) => submitSection(attemptId, sectionId),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: sessionKeys.overview(v.attemptId) });
      qc.invalidateQueries({ queryKey: ['exam-attempt'] });
    },
  });
};

export const useFinishAttempt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: string) => finishAttempt(attemptId),
    onSuccess: (_d, attemptId) => {
      qc.invalidateQueries({ queryKey: sessionKeys.overview(attemptId) });
      qc.invalidateQueries({ queryKey: ['exam-attempt'] });
    },
  });
};
