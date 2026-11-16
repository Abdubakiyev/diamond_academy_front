import type { AttemptStatus, Paginated, Skill } from './common';
import type { ExamAttemptListItem } from './exam-attempt';
import type { QuestionType } from './question';

export type CefrLevel = 'BELOW_B1' | 'B1' | 'B2' | 'C1';
export type EvalStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';

export interface ResultScores {
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
  total: number | null;
  cefr: CefrLevel | null;
}

export interface ResultSection {
  sectionId: string;
  skill: Skill;
  title: string | null;
  status: AttemptStatus;
  rawScore: number | null;
  score: number | null;
  maxScore: number;
  /** Boshlanmagan / bo'sh topshirilgan bo'lim */
  skipped: boolean;
  startedAt: string | null;
  finishedAt: string | null;
}

interface Labeled {
  id: string;
  label: string;
  text: string;
}

export interface ReviewQuestion {
  questionId: string;
  number: number;
  type: QuestionType;
  text: string;
  points: number;
  answered: boolean;
  yourAnswer: { option: Labeled | null; partOption: Labeled | null; text: string | null } | null;
  isCorrect: boolean;
  pointsAwarded: number;
  /** Backendda EXAM_SHOW_CORRECT_ANSWERS=false bo'lsa kelmaydi */
  correct?: { options: Labeled[]; partOption: Labeled | null; acceptedAnswers: string[] };
  explanation?: string | null;
}

export interface ReviewSection {
  sectionId: string;
  skill: Skill;
  parts: { partId: string; title: string | null; questions: ReviewQuestion[] }[];
}

export interface ResultEvaluation {
  skill: Skill;
  questionId: string;
  questionNumber: number;
  questionText: string;
  status: EvalStatus;
  /** O'qituvchi bahosi bo'lsa, o'sha; bo'lmasa AI bahosi */
  score: number | null;
  aiScore: number | null;
  reviewed: boolean;
  /** { task_achievement: { score, comment }, ... } */
  criteria: Record<string, unknown> | null;
  feedback: string | null;
  suggestions: string[];
  wordCount: number | null;
  transcript: string | null;
}

/** GET /exam-attempt/:id/result */
export interface ExamResult {
  attemptId: string;
  status: AttemptStatus;
  /** Writing / Speaking hali tekshirilmoqda */
  pending: boolean;
  user?: { id: string; name: string; phone: string };
  exam: { id: string; title: string; type: 'FULL_MULTILEVEL' | 'CUSTOM' };
  startedAt: string;
  finishedAt: string | null;
  scores: ResultScores;
  sections: ResultSection[];
  review: ReviewSection[];
  evaluations: ResultEvaluation[];
}

/* ── Admin: urinishlar ── */

export interface AdminAttemptListItem extends ExamAttemptListItem {
  user: { id: string; name: string; phone: string };
}
export type AdminAttemptList = Paginated<AdminAttemptListItem>;

export interface AdminAttemptQuery {
  status?: AttemptStatus;
  examId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

/* ── Admin: AI baholash ── */

export interface EvaluationListItem {
  id: string;
  status: EvalStatus;
  score: number | null;
  finalScore: number | null;
  errorMessage: string | null;
  createdAt: string;
  answer: {
    id: string;
    question: { id: string; number: number; type: QuestionType };
    sectionAttempt: {
      id: string;
      section: { skill: Skill };
      attempt: { id: string; user: { id: string; name: string }; exam: { id: string; title: string } };
    };
  };
}
export type EvaluationList = Paginated<EvaluationListItem> & { pages: number };

export interface EvaluationQuery {
  status?: EvalStatus;
  skill?: Extract<Skill, 'WRITING' | 'SPEAKING'>;
  examId?: string;
  page?: number;
  limit?: number;
}

export interface EvaluationDetail {
  id: string;
  status: EvalStatus;
  model: string | null;
  score: number | null;
  finalScore: number | null;
  criteria: Record<string, unknown> | null;
  feedback: string | null;
  suggestions: string[];
  errorMessage: string | null;
  reviewedAt: string | null;
  createdAt: string;
  answer: {
    id: string;
    textAnswer: string | null;
    wordCount: number | null;
    transcript: string | null;
    durationSec: number | null;
    audioUrl: string | null;
    question: {
      id: string;
      number: number;
      type: QuestionType;
      text: string;
      minWords: number | null;
      maxWords: number | null;
    };
    sectionAttempt: {
      id: string;
      section: { skill: Skill };
      attempt: { id: string; user: { id: string; name: string; phone: string }; exam: { id: string; title: string } };
    };
  };
}

export interface EvaluationStats {
  queueSize: number;
  byStatus: Partial<Record<EvalStatus, number>>;
}
