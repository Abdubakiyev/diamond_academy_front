'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseKeys } from './useCourse';
import {
  addLessonResource,
  createLesson,
  deleteLesson,
  getLesson,
  removeLessonResource,
  reorderLessons,
  setLessonCompleted,
  updateLesson,
} from '../api/lesson';
import type { CreateLessonInput, CreateResourceInput, UpdateLessonInput } from '../types/lesson';

export const lessonKeys = {
  all: ['lesson'] as const,
  detail: (id: string) => [...lessonKeys.all, 'detail', id] as const,
};

export const useLesson = (id?: string) =>
  useQuery({
    queryKey: lessonKeys.detail(id ?? ''),
    queryFn: () => getLesson(id as string),
    enabled: !!id,
    retry: false,
  });

export const useSetLessonProgress = (lessonId: string, courseId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (completed: boolean) => setLessonCompleted(lessonId, completed),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lessonKeys.detail(lessonId) });
      if (courseId) qc.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      qc.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
};

export const useCreateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLessonInput) => createLesson(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: courseKeys.all }),
  });
};

export const useUpdateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLessonInput }) => updateLesson(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lessonKeys.all });
      qc.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
};

export const useDeleteLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLesson(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lessonKeys.all });
      qc.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
};

export const useReorderLessons = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, lessonIds }: { courseId: string; lessonIds: string[] }) => reorderLessons(courseId, lessonIds),
    onSettled: () => qc.invalidateQueries({ queryKey: courseKeys.all }),
  });
};

export const useAddResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, input }: { lessonId: string; input: CreateResourceInput }) => addLessonResource(lessonId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: lessonKeys.all }),
  });
};

export const useRemoveResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (resourceId: string) => removeLessonResource(resourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: lessonKeys.all }),
  });
};
