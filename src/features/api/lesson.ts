import apiClient from './client';
import type {
  CreateLessonInput,
  CreateResourceInput,
  LessonDetail,
  LessonProgressResult,
  LessonResource,
  UpdateLessonInput,
} from '../types/lesson';

export const getLesson = async (id: string): Promise<LessonDetail> => {
  const { data } = await apiClient.get<LessonDetail>(`/lesson/${id}`);
  return data;
};

/** completed=true -> POST /lesson/:id/complete, false -> DELETE */
export const setLessonCompleted = async (id: string, completed: boolean): Promise<LessonProgressResult> => {
  const { data } = completed
    ? await apiClient.post<LessonProgressResult>(`/lesson/${id}/complete`)
    : await apiClient.delete<LessonProgressResult>(`/lesson/${id}/complete`);
  return data;
};

export const createLesson = async (input: CreateLessonInput): Promise<{ id: string; courseId: string }> =>
  (await apiClient.post<{ id: string; courseId: string }>('/lesson', input)).data;

export const updateLesson = async (id: string, input: UpdateLessonInput) =>
  (await apiClient.patch<LessonDetail>(`/lesson/${id}`, input)).data;

export const deleteLesson = async (id: string) => (await apiClient.delete<{ deleted: boolean }>(`/lesson/${id}`)).data;

/** Kursdagi BARCHA darslarning yangi tartibi */
export const reorderLessons = async (courseId: string, lessonIds: string[]) =>
  (await apiClient.put('/lesson/reorder', { courseId, lessonIds })).data;

export const addLessonResource = async (lessonId: string, input: CreateResourceInput): Promise<LessonResource> =>
  (await apiClient.post<LessonResource>(`/lesson/${lessonId}/resources`, input)).data;

export const removeLessonResource = async (resourceId: string) =>
  (await apiClient.delete(`/lesson/resources/${resourceId}`)).data;
