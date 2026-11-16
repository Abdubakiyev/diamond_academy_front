import apiClient from './client';
import type { CourseDetail, CourseListItem,CreateCourseInput, ListCoursesQuery,UpdateCourseInput } from '../types/course';

export const getCourses = async (params: ListCoursesQuery = {}): Promise<CourseListItem[]> => {
  const { data } = await apiClient.get<CourseListItem[]>('/course', { params });
  return data;
};

export const getCourse = async (id: string): Promise<CourseDetail> => {
  const { data } = await apiClient.get<CourseDetail>(`/course/${id}`);
  return data;
};

export const createCourse = async (input: CreateCourseInput): Promise<CourseListItem> =>
  (await apiClient.post<CourseListItem>('/course', input)).data;

export const updateCourse = async (id: string, input: UpdateCourseInput): Promise<CourseListItem> =>
  (await apiClient.patch<CourseListItem>(`/course/${id}`, input)).data;

export const deleteCourse = async (id: string) => (await apiClient.delete<{ deleted: boolean }>(`/course/${id}`)).data;

export const setCourseGroups = async (id: string, groupIds: string[]): Promise<CourseDetail> =>
  (await apiClient.put<CourseDetail>(`/course/${id}/groups`, { groupIds })).data;
