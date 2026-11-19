import apiClient from './client';
import type { MyStatsResponse } from '../types/student-stats';

export const getMyStats = async (): Promise<MyStatsResponse> => {
  const { data } = await apiClient.get<MyStatsResponse>('/student/me/stats');
  return data;
};