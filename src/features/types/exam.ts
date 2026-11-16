import type { ExamType, Paginated, Skill } from './common';
import type { Question } from './question';


export type PartFormat =
  | 'MCQ'
  | 'MATCHING_BANK'
  | 'MAP_LABELING'
  | 'TRUE_FALSE_NG'
  | 'GAP_FILL'
  | 'MIXED'
  | 'WRITING_TASK'
  | 'SPEAKING_INTERVIEW'
  | 'SPEAKING_PICTURE'
  | 'SPEAKING_DISCUSSION';

export interface ExamLevel {
  id: string;
  type: string;
}

export interface ExamSectionBrief {
  skill: Skill;
  order: number;
  timeLimitSec: number | null;
}

/** GET /exam (admin / o'qituvchi) */
export interface ExamListItem {
  id: string;
  title: string;
  description: string | null;
  type: ExamType;
  isPublished: boolean;
  archivedAt: string | null;
  durationMinutes: number | null;
  price: number;
  isFree: boolean;
  createdAt: string;
  level: ExamLevel | null;
  sections: ExamSectionBrief[];
}

export type ExamList = Paginated<ExamListItem> & { pages: number };

export interface ExamListQuery {
  type?: ExamType;
  levelId?: string;
  search?: string;
  published?: boolean;
  archived?: boolean;
  page?: number;
  limit?: number;
}

export interface ExamPartBrief {
  id: string;
  order: number;
  title: string | null;
  format: PartFormat;
  timeLimitSec: number | null;
  _count: { questions: number };
}

export interface ExamSection {
  id: string;
  examId: string;
  skill: Skill;
  order: number;
  title: string | null;
  instructions: string | null;
  timeLimitSec: number | null;
  maxScore: number;
  parts: ExamPartBrief[];
  questionCount: number;
}

/** GET /exam/:id (admin / o'qituvchi) */
export interface ExamDetail {
  id: string;
  title: string;
  description: string | null;
  type: ExamType;
  levelId: string | null;
  isPublished: boolean;
  questions: Question[];
  archivedAt: string | null;
  durationMinutes: number | null;
  price: number;
  isFree: boolean;
  createdById: string;
  createdAt: string;
  level: ExamLevel | null;
  sections: ExamSection[];
  stats: { attempts: number; payments: number };
}

export interface PartOption {
  id: string;
  partId: string;
  label: string;
  text: string;
  imageUrl: string | null;
}

/** GET /exam-part/:id: savollar 7-bo'limda to'liq tiplanadi */
export interface ExamPartDetail {
  id: string;
  sectionId: string;
  order: number;
  title: string | null;
  instructions: string | null;
  format: PartFormat;
  audioKey: string | null;
  audioUrl: string | null;
  audioPlayLimit: number;
  passageText: string | null;
  imageKey: string | null;
  imageUrl: string | null;
  timeLimitSec: number | null;
  prepTimeSec: number | null;
  answerTimeSec: number | null;
  meta: Record<string, unknown> | null;
  options: PartOption[];
  questions: Array<{ id: string; number: number; order: number; type: string }>;
}

export type ExamAction = 'publish' | 'unpublish' | 'archive' | 'restore';

/* ───── kirish ma'lumotlari ───── */

export interface CreateExamInput {
  title: string;
  description?: string;
  type?: ExamType;
  levelId?: string;
  price?: number;
  durationMinutes?: number;
  skills?: Skill[];
}

export interface UpdateExamInput {
  title?: string;
  description?: string | null;
  levelId?: string | null;
  price?: number;
  durationMinutes?: number;
}

export interface CreateSectionInput {
  skill: Skill;
  title?: string;
  instructions?: string;
  timeLimitSec?: number;
}

export interface UpdateSectionInput {
  title?: string | null;
  instructions?: string | null;
  timeLimitSec?: number | null;
  maxScore?: number;
}

export interface CreatePartInput {
  sectionId: string;
  format: PartFormat;
  title?: string;
  instructions?: string;
  audioKey?: string;
  audioPlayLimit?: number;
  passageText?: string;
  imageKey?: string;
  timeLimitSec?: number;
  prepTimeSec?: number;
  answerTimeSec?: number;
}

/** null yuborilsa maydon tozalanadi (audioKey / imageKey null bo'lsa fayl ham o'chadi) */
export interface UpdatePartInput {
  format?: PartFormat;
  title?: string | null;
  instructions?: string | null;
  audioKey?: string | null;
  audioPlayLimit?: number;
  passageText?: string | null;
  imageKey?: string | null;
  timeLimitSec?: number | null;
  prepTimeSec?: number | null;
  answerTimeSec?: number | null;
}
