import type { CefrLevel, EvalStatus } from '../features/types/exam-result';

export const CEFR_META: Record<CefrLevel, { label: string; range: string; cls: string; grad: string }> = {
  BELOW_B1: { label: 'B1 dan past', range: '0–37', cls: 'bg-amber-50 text-amber-700 ring-amber-200', grad: 'from-amber-500 to-orange-500' },
  B1: { label: 'B1', range: '38–50', cls: 'bg-sky-50 text-sky-700 ring-sky-200', grad: 'from-sky-500 to-blue-500' },
  B2: { label: 'B2', range: '51–64', cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200', grad: 'from-indigo-500 to-violet-500' },
  C1: { label: 'C1', range: '65–75', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', grad: 'from-emerald-500 to-teal-500' },
};

export const cefrLabel = (c?: string | null) => (c && c in CEFR_META ? CEFR_META[c as CefrLevel].label : null);

export const EVAL_META: Record<EvalStatus, { label: string; cls: string }> = {
  PENDING: { label: 'Navbatda', cls: 'bg-gray-100 text-gray-600 ring-gray-200' },
  PROCESSING: { label: 'Tekshirilmoqda', cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
  DONE: { label: 'Tayyor', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  FAILED: { label: 'Xato', cls: 'bg-red-50 text-red-700 ring-red-200' },
};

const CRITERION_LABELS: Record<string, string> = {
  task_achievement: 'Topshiriqni bajarish',
  coherence_cohesion: 'Izchillik va bog‘lanish',
  lexical_resource: 'Lug‘at boyligi',
  grammar: 'Grammatika',
  fluency_coherence: 'Ravonlik va izchillik',
  pronunciation: 'Talaffuz',
};

export const criterionLabel = (key: string) =>
  CRITERION_LABELS[key] ?? key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

/** criteria: { name: { score, comment } } (eski ko'rinishda { name: number } ham bo'lishi mumkin) */
export function normalizeCriteria(c: unknown): { key: string; score: number | null; comment: string }[] {
  if (!c || typeof c !== 'object') return [];
  return Object.entries(c as Record<string, unknown>).map(([key, v]) => {
    if (typeof v === 'number') return { key, score: v, comment: '' };
    const o = (v ?? {}) as { score?: unknown; comment?: unknown };
    return { key, score: typeof o.score === 'number' ? o.score : null, comment: typeof o.comment === 'string' ? o.comment : '' };
  });
}

/** 0–75 shkalasi bo'yicha rang */
export const scoreBar = (v: number) => (v >= 65 ? 'bg-emerald-500' : v >= 51 ? 'bg-indigo-500' : v >= 38 ? 'bg-sky-500' : 'bg-amber-500');
export const scoreText = (v: number) => (v >= 65 ? 'text-emerald-600' : v >= 51 ? 'text-indigo-600' : v >= 38 ? 'text-sky-600' : 'text-amber-600');

export const fmtScore = (v?: number | null) => (v == null ? '—' : Number.isInteger(v) ? String(v) : v.toFixed(1));
