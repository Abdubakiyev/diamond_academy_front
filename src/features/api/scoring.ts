import apiClient from './client';
import type { ConversionRow, ConversionScope, ConversionTable } from '../types/scoring';

export const getConversion = ({ examId, skill }: ConversionScope) =>
  apiClient.get<ConversionTable>('/score-conversion', { params: { examId, skill } }).then((r) => r.data);

export const setConversion = (body: ConversionScope & { rows: ConversionRow[] }) =>
  apiClient.put<ConversionTable>('/score-conversion', body).then((r) => r.data);

export const generateLinearConversion = (body: ConversionScope & { maxRaw?: number }) =>
  apiClient.post<ConversionTable>('/score-conversion/generate-linear', body).then((r) => r.data);

export const deleteConversion = ({ examId, skill }: ConversionScope) =>
  apiClient.delete<{ deleted: number }>('/score-conversion', { params: { examId, skill } }).then((r) => r.data);
