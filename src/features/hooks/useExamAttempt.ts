'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyAttempts } from '../api/exam-attempt';
import type { AttemptListQuery } from '../types/exam-attempt';

export const attemptKeys = {
  my: (q: AttemptListQuery) => ['exam-attempt', 'my', q] as const,
};

export const useMyAttempts = (query: AttemptListQuery = {}) =>
  useQuery({
    queryKey: attemptKeys.my(query),
    queryFn: () => getMyAttempts(query),
  });
  