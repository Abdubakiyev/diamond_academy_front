import apiClient from './client';
import type {
  CreateMediaInput,
  PartOptionInput,
  Question,
  QuestionInput,
  QuestionMedia,
  SetPartOptionsResult,
  UpdateQuestionInput,
} from '../types/question';

export const createQuestion = (partId: string, input: QuestionInput) =>
  apiClient.post<Question>('/question', { partId, ...input }).then((r) => r.data);

export const createQuestionsBulk = (partId: string, questions: QuestionInput[]) =>
  apiClient.post<Question[]>('/question/bulk', { partId, questions }).then((r) => r.data);

export const updateQuestion = (id: string, input: UpdateQuestionInput) =>
  apiClient.patch<Question>(`/question/${id}`, input).then((r) => r.data);

export const deleteQuestion = (id: string) => apiClient.delete<{ deleted: boolean }>(`/question/${id}`).then((r) => r.data);

/** Partdagi BARCHA savollar id si yangi tartibda */
export const reorderQuestions = (partId: string, questionIds: string[]) =>
  apiClient.put('/question/reorder', { partId, questionIds }).then((r) => r.data);

export const addQuestionMedia = (questionId: string, input: CreateMediaInput) =>
  apiClient.post<QuestionMedia>(`/question/${questionId}/media`, input).then((r) => r.data);

export const removeQuestionMedia = (mediaId: string) =>
  apiClient.delete<{ deleted: boolean }>(`/question/media/${mediaId}`).then((r) => r.data);

/** A–J variantlar banki */
export const setPartOptions = (partId: string, options: PartOptionInput[]) =>
  apiClient.put<SetPartOptionsResult>(`/exam-part/${partId}/options`, { options }).then((r) => r.data);
