import type { AttemptStatus, Skill } from './common';
import type { PartFormat } from './exam';
import type { QuestionType } from './question';

export type SectionState = AttemptStatus | 'NOT_STARTED';

export interface LobbySection {
  sectionId: string;
  skill: Skill;
  order: number;
  title: string | null;
  timeLimitSec: number | null;
  state: SectionState;
  startedAt: string | null;
  expiresAt: string | null;
  remainingSec: number | null;
  canStart: boolean;
}

/** GET /exam-attempt/:id */
export interface AttemptOverview {
  attemptId: string;
  status: AttemptStatus;
  startedAt: string;
  finishedAt: string | null;
  serverTime: string;
  /** Butun imtihon uchun umumiy muddat (CUSTOM + durationMinutes), bo'lmasa null */
  deadline: string | null;
  exam: { id: string; title: string; type: 'FULL_MULTILEVEL' | 'CUSTOM'; durationMinutes: number | null };
  sections: LobbySection[];
}

export interface PartAudio {
  playLimit: number;
  played: number;
}

export interface SessionOption {
  id: string;
  label: string;
  text: string;
}

export interface SessionPartOption extends SessionOption {
  imageUrl: string | null;
}

export interface SessionMedia {
  id: string;
  kind: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'OTHER';
  caption: string | null;
  url: string | null;
}

export interface SessionQuestion {
  id: string;
  number: number;
  order: number;
  type: QuestionType;
  text: string;
  points: number;
  minWords: number | null;
  maxWords: number | null;
  prepTimeSec: number | null;
  answerTimeSec: number | null;
  meta: Record<string, unknown> | null;
  audio: PartAudio | null;
  options: SessionOption[];
  media: SessionMedia[];
}

export interface SessionPart {
  id: string;
  order: number;
  title: string | null;
  instructions: string | null;
  format: PartFormat;
  passageText: string | null;
  imageUrl: string | null;
  timeLimitSec: number | null;
  prepTimeSec: number | null;
  answerTimeSec: number | null;
  meta: Record<string, unknown> | null;
  audio: PartAudio | null;
  options: SessionPartOption[];
  questions: SessionQuestion[];
}

export interface SavedAnswer {
  questionId: string;
  selectedOptionId: string | null;
  selectedPartOptionId: string | null;
  textAnswer: string | null;
  hasAudio: boolean;
  durationSec: number | null;
}

/** POST .../sections/:sectionId/start va GET .../content */
export interface SectionPayload {
  attemptId: string;
  sectionAttemptId: string;
  startedAt: string;
  expiresAt: string | null;
  remainingSec: number | null;
  serverTime: string;
  section: { id: string; skill: Skill; title: string | null; instructions: string | null; timeLimitSec: number | null };
  parts: SessionPart[];
  answers: SavedAnswer[];
}

/** Formadagi (mahalliy) javob holati */
export interface AnswerDraft {
  selectedOptionId?: string | null;
  selectedPartOptionId?: string | null;
  textAnswer?: string | null;
  audioKey?: string | null;
  durationSec?: number | null;
  /** Serverda allaqachon yozilgan audio javob bor (kalit qaytmaydi) */
  hasAudio?: boolean;
}

export interface AnswerInput {
  questionId: string;
  selectedOptionId: string | null;
  selectedPartOptionId: string | null;
  textAnswer: string | null;
  audioKey: string | null;
  durationSec: number | null;
}

export interface SaveAnswersResult {
  saved: number;
  remainingSec: number | null;
  serverTime: string;
}

export interface AudioIssue {
  url: string | null;
  played: number;
  playLimit: number;
  remaining: number;
  urlExpiresInSec: number;
}

export interface SubmitSectionResult {
  sectionId: string;
  submitted: boolean;
  attemptFinished: boolean;
}

export interface FinishResult {
  attemptId: string;
  status: AttemptStatus;
}
