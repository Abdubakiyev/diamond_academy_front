'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyStats } from '../api/student-stats';

export const studentStatsKey = ['student', 'me', 'stats'] as const;

export const useMyStats = () =>
  useQuery({
    queryKey: studentStatsKey,
    queryFn: getMyStats,
    retry: false,
    staleTime: 60 * 1000,
  });
  