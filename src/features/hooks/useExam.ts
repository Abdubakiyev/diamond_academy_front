'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addSection,
  createExam,
  deleteExam,
  deleteSection,
  examAction,
  getExam,
  getExams,
  updateExam,
  updateSection,
} from '../api/exam';
import type {
  CreateExamInput,
  CreateSectionInput,
  ExamAction,
  ExamListQuery,
  UpdateExamInput,
  UpdateSectionInput,
} from '../types/exam';

export const examKeys = {
  all: ['exam'] as const,
  lists: () => [...examKeys.all, 'list'] as const,
  list: (q: ExamListQuery) => [...examKeys.lists(), q] as const,
  detail: (id: string) => [...examKeys.all, 'detail', id] as const,
};

export const useExams = (query: ExamListQuery = {}) =>
  useQuery({ queryKey: examKeys.list(query), queryFn: () => getExams(query), placeholderData: keepPreviousData });

export const useExam = (id?: string) =>
  useQuery({ queryKey: examKeys.detail(id ?? ''), queryFn: () => getExam(id as string), enabled: !!id, retry: false });

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: examKeys.all });
};

export const useCreateExam = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: CreateExamInput) => createExam(input), onSuccess: invalidate });
};

export const useUpdateExam = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExamInput }) => updateExam(id, input),
    onSuccess: invalidate,
  });
};

export const useDeleteExam = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => deleteExam(id), onSuccess: invalidate });
};

/** publish | unpublish | archive | restore */
export const useExamAction = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: ExamAction }) => examAction(id, action),
    onSuccess: invalidate,
  });
};

export const useAddSection = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ examId, input }: { examId: string; input: CreateSectionInput }) => addSection(examId, input),
    onSuccess: invalidate,
  });
};

export const useUpdateSection = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ sectionId, input }: { sectionId: string; input: UpdateSectionInput }) => updateSection(sectionId, input),
    onSuccess: invalidate,
  });
};

export const useDeleteSection = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (sectionId: string) => deleteSection(sectionId), onSuccess: invalidate });
};
