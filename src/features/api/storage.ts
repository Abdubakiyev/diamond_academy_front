import apiClient from './client';
import type { PresignRequest, PresignResponse } from '../types/storage';

export const presignUpload = async (body: PresignRequest): Promise<PresignResponse> => {
  const { data } = await apiClient.post<PresignResponse>('/storage/presign', body);
  return data;
};
