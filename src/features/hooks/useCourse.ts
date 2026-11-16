'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCourse, deleteCourse, getCourse, getCourses, setCourseGroups, updateCourse } from '../api/course';
import { getGroups, getLevels } from '../api/options';
import type { CreateCourseInput, ListCoursesQuery, UpdateCourseInput } from '../types/course';


export const courseKeys = {
  all: ['course'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (q: ListCoursesQuery) => [...courseKeys.lists(), q] as const,
  detail: (id: string) => [...courseKeys.all, 'detail', id] as const,
};

export const useCourses = (query: ListCoursesQuery = {}) =>
  useQuery({ queryKey: courseKeys.list(query), queryFn: () => getCourses(query) });

export const useCourse = (id?: string) =>
  useQuery({
    queryKey: courseKeys.detail(id ?? ''),
    queryFn: () => getCourse(id as string),
    enabled: !!id,
    retry: false,
  });
  
export const useLevelOptions = () =>
  useQuery({ queryKey: ['options', 'levels'], queryFn: getLevels, staleTime: 5 * 60 * 1000 });

export const useGroupOptions = () =>
  useQuery({ queryKey: ['options', 'groups'], queryFn: getGroups, staleTime: 5 * 60 * 1000 });

export const useCreateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCourseInput) => createCourse(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: courseKeys.all }),
  });
};

export const useUpdateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCourseInput }) => updateCourse(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: courseKeys.all }),
  });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: courseKeys.all }),
  });
};

export const useSetCourseGroups = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, groupIds }: { id: string; groupIds: string[] }) => setCourseGroups(id, groupIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: courseKeys.all }),
  });
};
