import type { AnswerDraft, SectionState, SessionQuestion } from '../features/types/exam-session';

export const formatClock = (sec: number) => {
  const s = Math.max(0, Math.ceil(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(r).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export const countWords = (text: string) => (text.trim().match(/\S+/g) ?? []).length;

export function isAnswered(q: SessionQuestion, a?: AnswerDraft): boolean {
  if (!a) return false;
  switch (q.type) {
    case 'MULTIPLE_CHOICE':
      return !!a.selectedOptionId;
    case 'MATCHING':
      return !!a.selectedPartOptionId;
    case 'SPEAKING_PROMPT':
      return !!a.audioKey || !!a.hasAudio;
    default:
      return !!a.textAnswer?.trim();
  }
}

export const STATE_META: Record<SectionState, { label: string; cls: string }> = {
  NOT_STARTED: { label: 'Boshlanmagan', cls: 'bg-gray-100 text-gray-600 ring-gray-200' },
  IN_PROGRESS: { label: 'Davom etmoqda', cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
  SUBMITTED: { label: 'Topshirildi', cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  GRADING: { label: 'AI tekshirmoqda', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  COMPLETED: { label: 'Yakunlangan', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  EXPIRED: { label: 'Vaqt tugagan', cls: 'bg-red-50 text-red-700 ring-red-200' },
};
