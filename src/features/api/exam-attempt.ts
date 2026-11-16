import apiClient from './client';
import type { AttemptListQuery, ExamAttemptList } from '../types/exam-attempt';

export const getMyAttempts = async (params: AttemptListQuery = {}): Promise<ExamAttemptList> => {
  const { data } = await apiClient.get<ExamAttemptList>('/exam-attempt/my', { params });
  return data;
};
