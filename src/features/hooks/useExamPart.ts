'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createExamPart, deleteExamPart, getExamPart, reorderExamParts, updateExamPart } from '../api/exam-part';
import { examKeys } from './useExam';
import type { CreatePartInput, UpdatePartInput } from '../types/exam';

export const partKeys = {
  all: ['exam-part'] as const,
  detail: (id: string) => [...partKeys.all, 'detail', id] as const,
};

export const useExamPart = (id?: string) =>
  useQuery({ queryKey: partKeys.detail(id ?? ''), queryFn: () => getExamPart(id as string), enabled: !!id, retry: false });

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: examKeys.all });
    qc.invalidateQueries({ queryKey: partKeys.all });
  };
};

export const useCreatePart = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: CreatePartInput) => createExamPart(input), onSuccess: invalidate });
};

export const useUpdatePart = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePartInput }) => updateExamPart(id, input),
    onSuccess: invalidate,
  });
};

export const useDeletePart = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => deleteExamPart(id), onSuccess: invalidate });
};

export const useReorderParts = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, partIds }: { sectionId: string; partIds: string[] }) => reorderExamParts(sectionId, partIds),
    onSettled: () => qc.invalidateQueries({ queryKey: examKeys.all }),
  });
};
