import apiClient from './client';
import type {
  AnswerInput,
  AttemptOverview,
  AudioIssue,
  FinishResult,
  SaveAnswersResult,
  SectionPayload,
  SubmitSectionResult,
} from '../types/exam-session';

const base = (attemptId: string) => `/exam-attempt/${attemptId}`;

export const getOverview = (attemptId: string) => apiClient.get<AttemptOverview>(base(attemptId)).then((r) => r.data);

/** Bo'limni boshlaydi (taymer ishga tushadi). Allaqachon boshlangan bo'lsa, davom ettiradi. */
export const startSection = (attemptId: string, sectionId: string) =>
  apiClient.post<SectionPayload>(`${base(attemptId)}/sections/${sectionId}/start`).then((r) => r.data);

export const getSectionContent = (attemptId: string, sectionId: string) =>
  apiClient.get<SectionPayload>(`${base(attemptId)}/sections/${sectionId}/content`).then((r) => r.data);

/** Faqat o'zgargan javoblar yuboriladi. Hamma maydon null bo'lsa, javob o'chadi. */
export const saveAnswers = (attemptId: string, sectionId: string, answers: AnswerInput[]) =>
  apiClient.put<SaveAnswersResult>(`${base(attemptId)}/sections/${sectionId}/answers`, { answers }).then((r) => r.data);

export const submitSection = (attemptId: string, sectionId: string) =>
  apiClient.post<SubmitSectionResult>(`${base(attemptId)}/sections/${sectionId}/submit`).then((r) => r.data);

/** Har chaqiruv eshittirish sonini 1 ga oshiradi (limit tugasa 409) */
export const issueAudio = (attemptId: string, target: { partId: string } | { questionId: string }) =>
  apiClient.post<AudioIssue>(`${base(attemptId)}/audio`, target).then((r) => r.data);

export const finishAttempt = (attemptId: string) => apiClient.post<FinishResult>(`${base(attemptId)}/finish`).then((r) => r.data);
