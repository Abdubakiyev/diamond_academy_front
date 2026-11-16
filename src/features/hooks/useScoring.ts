import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteConversion, generateLinearConversion, getConversion, setConversion } from '../api/scoring';
import type { ConversionRow, ConversionScope } from '../types/scoring';

export const scoringKeys = {
  all: ['score-conversion'] as const,
  table: (s: ConversionScope) => [...scoringKeys.all, s.examId ?? 'default', s.skill] as const,
};

export const useConversion = (scope: ConversionScope) =>
  useQuery({
    queryKey: scoringKeys.table(scope),
    queryFn: () => getConversion(scope),
    // Tahrirlanayotgan jadval fokus almashganda qayta yuklanib, o'zgarishlarni o'chirib yubormasligi uchun
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: scoringKeys.all });
};

export const useSetConversion = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: ConversionScope & { rows: ConversionRow[] }) => setConversion(body),
    onSuccess: invalidate,
  });
};

export const useGenerateLinear = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: ConversionScope & { maxRaw?: number }) => generateLinearConversion(body),
    onSuccess: invalidate,
  });
};

export const useDeleteConversion = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (scope: ConversionScope) => deleteConversion(scope), onSuccess: invalidate });
};
