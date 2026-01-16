import { CreateTestResultDto, TestResult } from '../types/test-result';
import api from './auth'; // auth.ts da yaratilgan axios instance


const getToken = () => {
  const token = localStorage.getItem('access_token'); // access_token ishlatiladi
  if (!token) throw new Error('No access token found');
  return token;
};

// Submit test answers
export const submitTestResult = async (data: CreateTestResultDto): Promise<TestResult> => {
  const token = getToken();
  const response = await api.post<TestResult>('/test-result', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get all test results (admin: all, user: own only)
export const getTestResults = async (): Promise<TestResult[]> => {
  const token = getToken();
  const response = await api.get<TestResult[]>('/test-result', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get single test result
export const getTestResult = async (id: string): Promise<TestResult> => {
  const token = getToken();
  const response = await api.get<TestResult>(`/test-result/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
