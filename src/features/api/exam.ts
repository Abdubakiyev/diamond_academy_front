import apiClient from './client';
import type {
  CreateExamInput,
  CreateSectionInput,
  ExamAction,
  ExamDetail,
  ExamList,
  ExamListQuery,
  UpdateExamInput,
  UpdateSectionInput,
} from '../types/exam';

export const getExams = async (params: ExamListQuery = {}): Promise<ExamList> =>
  (await apiClient.get<ExamList>('/exam', { params })).data;

export const getExam = async (id: string): Promise<ExamDetail> => (await apiClient.get<ExamDetail>(`/exam/${id}`)).data;

export const createExam = async (input: CreateExamInput) => (await apiClient.post<{ id: string }>('/exam', input)).data;

export const updateExam = async (id: string, input: UpdateExamInput) => (await apiClient.patch(`/exam/${id}`, input)).data;

export const deleteExam = async (id: string) => (await apiClient.delete(`/exam/${id}`)).data;

export const examAction = async (id: string, action: ExamAction) => (await apiClient.post(`/exam/${id}/${action}`)).data;

export const addSection = async (examId: string, input: CreateSectionInput) =>
  (await apiClient.post(`/exam/${examId}/sections`, input)).data;

export const updateSection = async (sectionId: string, input: UpdateSectionInput) =>
  (await apiClient.patch(`/exam/sections/${sectionId}`, input)).data;

export const deleteSection = async (sectionId: string) => (await apiClient.delete(`/exam/sections/${sectionId}`)).data;
