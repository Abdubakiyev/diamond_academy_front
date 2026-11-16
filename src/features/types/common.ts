export type Role = 'ADMIN' | 'TEACHER' | 'USER';

export type Skill = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';

export type ExamType = 'FULL_MULTILEVEL' | 'CUSTOM';

export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADING' | 'COMPLETED';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PageQuery {
  page?: number;
  limit?: number;
}

export const SKILL_LABELS: Record<Skill, string> = {
  LISTENING: 'Listening',
  READING: 'Reading',
  WRITING: 'Writing',
  SPEAKING: 'Speaking',
};
