'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAssignment,
  deleteAssignment,
  getAssignment,
  getSubmission,
  getSubmissions,
  gradeSubmission,
  submitAssignment,
  updateAssignment,
} from '../api/assignment';
import { lessonKeys } from './useLesson';
import type {
  CreateAssignmentInput,
  GradeInput,
  ListSubmissionsQuery,
  SubmitAssignmentInput,
  UpdateAssignmentInput,
} from '../types/assignment';

export const assignmentKeys = {
  all: ['assignment'] as const,
  detail: (id: string) => [...assignmentKeys.all, 'detail', id] as const,
  submissions: (id: string, q: ListSubmissionsQuery) => [...assignmentKeys.all, 'submissions', id, q] as const,
  submission: (id: string) => [...assignmentKeys.all, 'submission', id] as const,
};

export const useAssignment = (id?: string) =>
  useQuery({
    queryKey: assignmentKeys.detail(id ?? ''),
    queryFn: () => getAssignment(id as string),
    enabled: !!id,
    retry: false,
  });

export const useSubmitAssignment = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitAssignmentInput) => submitAssignment(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assignmentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
};

/* ───── Admin / o'qituvchi ───── */

export const useCreateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAssignmentInput) => createAssignment(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: lessonKeys.all }),
  });
};

export const useUpdateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAssignmentInput }) => updateAssignment(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assignmentKeys.all });
      qc.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
};

export const useDeleteAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssignment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assignmentKeys.all });
      qc.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
};

export const useSubmissions = (id: string, query: ListSubmissionsQuery) =>
  useQuery({
    queryKey: assignmentKeys.submissions(id, query),
    queryFn: () => getSubmissions(id, query),
    placeholderData: (prev) => prev,
  });

export const useSubmission = (submissionId?: string) =>
  useQuery({
    queryKey: assignmentKeys.submission(submissionId ?? ''),
    queryFn: () => getSubmission(submissionId as string),
    enabled: !!submissionId,
  });

export const useGradeSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: GradeInput }) => gradeSubmission(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: assignmentKeys.all }),
  });
};
