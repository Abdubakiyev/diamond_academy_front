import apiClient from './client';
import type {
  AssignmentDetail,
  CreateAssignmentInput,
  GradeInput,
  ListSubmissionsQuery,
  Submission,
  SubmissionDetail,
  SubmissionList,
  SubmitAssignmentInput,
  UpdateAssignmentInput,
} from '../types/assignment';

export const getAssignment = async (id: string): Promise<AssignmentDetail> => {
  const { data } = await apiClient.get<AssignmentDetail>(`/assignment/${id}`);
  return data;
};

export const submitAssignment = async (id: string, input: SubmitAssignmentInput): Promise<Submission> => {
  const { data } = await apiClient.post<Submission>(`/assignment/${id}/submit`, input);
  return data;
};

export const createAssignment = async (input: CreateAssignmentInput) =>
  (await apiClient.post<{ id: string }>('/assignment', input)).data;

export const updateAssignment = async (id: string, input: UpdateAssignmentInput) =>
  (await apiClient.patch(`/assignment/${id}`, input)).data;

export const deleteAssignment = async (id: string) => (await apiClient.delete(`/assignment/${id}`)).data;

export const getSubmissions = async (id: string, params: ListSubmissionsQuery = {}): Promise<SubmissionList> =>
  (await apiClient.get<SubmissionList>(`/assignment/${id}/submissions`, { params })).data;

export const getSubmission = async (submissionId: string): Promise<SubmissionDetail> =>
  (await apiClient.get<SubmissionDetail>(`/assignment/submissions/${submissionId}`)).data;

export const gradeSubmission = async (submissionId: string, input: GradeInput) =>
  (await apiClient.patch(`/assignment/submissions/${submissionId}/grade`, input)).data;
