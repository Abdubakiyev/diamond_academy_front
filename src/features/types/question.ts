import type { PartOption } from './exam';

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE_NG'
  | 'SHORT_ANSWER'
  | 'MATCHING'
  | 'WRITING_PROMPT'
  | 'SPEAKING_PROMPT';

export type TfngValue = 'TRUE' | 'FALSE' | 'NOT_GIVEN';

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionMedia {
  id: string;
  kind: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'OTHER';
  url: string;
  storageKey: string | null;
  caption: string | null;
  order: number;
}

/** GET /exam-part/:id ichidagi va GET /question/:id javobi (admin: to'g'ri javoblar bilan) */
export interface Question {
  id: string;
  partId: string;
  number: number;
  order: number;
  type: QuestionType;
  text: string;
  points: number;
  audioKey: string | null;
  audioUrl: string | null;
  correctPartOptionId: string | null;
  correctPartOption: { id: string; label: string } | null;
  acceptedAnswers: string[];
  caseSensitive: boolean;
  prepTimeSec: number | null;
  answerTimeSec: number | null;
  minWords: number | null;
  maxWords: number | null;
  rubric: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
  explanation: string | null;
  options: QuestionOption[];
  media: QuestionMedia[];
}

export interface QuestionOptionInput {
  label?: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionInput {
  type: QuestionType;
  text: string;
  points?: number;
  options?: QuestionOptionInput[];
  correctPartOptionLabel?: string;
  acceptedAnswers?: string[];
  caseSensitive?: boolean;
  audioKey?: string;
  prepTimeSec?: number;
  answerTimeSec?: number;
  minWords?: number;
  maxWords?: number;
  rubric?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  explanation?: string;
}

/** null yuborilsa maydon tozalanadi. options yuborilsa to'liq almashtiriladi. */
export interface UpdateQuestionInput {
  type?: QuestionType;
  text?: string;
  points?: number;
  options?: QuestionOptionInput[];
  correctPartOptionLabel?: string | null;
  acceptedAnswers?: string[];
  caseSensitive?: boolean;
  audioKey?: string | null;
  prepTimeSec?: number | null;
  answerTimeSec?: number | null;
  minWords?: number | null;
  maxWords?: number | null;
  rubric?: Record<string, unknown> | null;
  meta?: Record<string, unknown> | null;
  explanation?: string | null;
}

export interface CreateMediaInput {
  storageKey?: string;
  url?: string;
  caption?: string;
  order?: number;
}

export interface PartOptionInput {
  label: string;
  text: string;
  imageUrl?: string;
}

export interface SetPartOptionsResult {
  options: PartOption[];
  /** Banki o'zgargach javobi yo'qolgan MATCHING savollar soni */
  orphanedQuestions: number;
}
