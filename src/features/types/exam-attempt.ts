import type { AttemptStatus, ExamType, Paginated } from './common';

export interface ExamAttemptListItem {
  id: string;
  status: AttemptStatus;
  startedAt: string;
  finishedAt: string | null;
  totalScore: number | null;
  cefrLevel: string | null;
  listeningScore: number | null;
  readingScore: number | null;
  writingScore: number | null;
  speakingScore: number | null;
  exam: { id: string; title: string; type: ExamType };
}

export type ExamAttemptList = Paginated<ExamAttemptListItem>;

export interface AttemptListQuery {
  page?: number;
  limit?: number;
  status?: AttemptStatus;
  examId?: string;
}
