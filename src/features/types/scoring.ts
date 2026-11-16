import type { Skill } from './common';

/** Jadval faqat Listening va Reading uchun (Writing / Speaking AI orqali to'g'ridan-to'g'ri 0–75 oladi) */
export type ConvertibleSkill = Extract<Skill, 'LISTENING' | 'READING'>;

export interface ConversionRow {
  rawScore: number;
  scaledScore: number;
}

export interface ConversionTable {
  examId: string | null;
  skill: Skill;
  rows: ConversionRow[];
}

export interface ConversionScope {
  /** Berilmasa — umumiy (default) jadval */
  examId?: string;
  skill: ConvertibleSkill;
}
