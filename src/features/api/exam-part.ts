import apiClient from './client';
import type { CreatePartInput, ExamPartDetail, UpdatePartInput } from '../types/exam';

export const getExamPart = async (id: string): Promise<ExamPartDetail> =>
  (await apiClient.get<ExamPartDetail>(`/exam-part/${id}`)).data;

export const createExamPart = async (input: CreatePartInput) => (await apiClient.post<{ id: string }>('/exam-part', input)).data;

export const updateExamPart = async (id: string, input: UpdatePartInput) => (await apiClient.patch(`/exam-part/${id}`, input)).data;

export const deleteExamPart = async (id: string) => (await apiClient.delete(`/exam-part/${id}`)).data;

/** Bo'limdagi BARCHA partlarning yangi tartibi */
export const reorderExamParts = async (sectionId: string, partIds: string[]) =>
  (await apiClient.put('/exam-part/reorder', { sectionId, partIds })).data;
