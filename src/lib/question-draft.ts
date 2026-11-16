import type { PartOption } from '../features/types/exam';
import type {
  Question,
  QuestionInput,
  QuestionOptionInput,
  QuestionType,
  TfngValue,
  UpdateQuestionInput,
} from '../features/types/question';

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export interface DraftOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

/** Formadagi holat: hammasi matn ko'rinishida, yuborishdan oldin tekshiriladi */
export interface QuestionDraft {
  type: QuestionType;
  text: string;
  points: string;
  options: DraftOption[];
  tfng: TfngValue;
  answers: string[];
  caseSensitive: boolean;
  matchLabel: string;
  minWords: string;
  maxWords: string;
  prepTimeSec: string;
  answerTimeSec: string;
  explanation: string;
}

export type BuildResult<T> = { ok: true; value: T } | { ok: false; error: string };
const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });

export const blankOptions = (n = 4): DraftOption[] =>
  LABELS.slice(0, n).map((label) => ({ label, text: '', isCorrect: false }));

export const blankDraft = (type: QuestionType): QuestionDraft => ({
  type,
  text: '',
  points: '1',
  options: blankOptions(),
  tfng: 'TRUE',
  answers: [''],
  caseSensitive: false,
  matchLabel: '',
  minWords: '',
  maxWords: '',
  prepTimeSec: '',
  answerTimeSec: '',
  explanation: '',
});

const isTfng = (v: string | undefined): v is TfngValue => v === 'TRUE' || v === 'FALSE' || v === 'NOT_GIVEN';

export const draftFromQuestion = (q: Question): QuestionDraft => ({
  type: q.type,
  text: q.text,
  points: String(q.points ?? 1),
  options:
    q.type === 'MULTIPLE_CHOICE' && q.options.length
      ? q.options.map((o) => ({ label: o.label, text: o.text, isCorrect: o.isCorrect }))
      : blankOptions(),
  tfng: q.type === 'TRUE_FALSE_NG' && isTfng(q.acceptedAnswers[0]) ? q.acceptedAnswers[0] : 'TRUE',
  answers: q.type === 'SHORT_ANSWER' && q.acceptedAnswers.length ? [...q.acceptedAnswers] : [''],
  caseSensitive: q.caseSensitive,
  matchLabel: q.correctPartOption?.label ?? '',
  minWords: q.minWords != null ? String(q.minWords) : '',
  maxWords: q.maxWords != null ? String(q.maxWords) : '',
  prepTimeSec: q.prepTimeSec != null ? String(q.prepTimeSec) : '',
  answerTimeSec: q.answerTimeSec != null ? String(q.answerTimeSec) : '',
  explanation: q.explanation ?? '',
});

const optInt = (s: string, label: string, min: number, max: number): BuildResult<number | undefined> => {
  if (!s.trim()) return { ok: true, value: undefined };
  const n = Number(s);
  if (!Number.isInteger(n) || n < min || n > max) return fail(`${label}: ${min} dan ${max} gacha butun son kiriting`);
  return { ok: true, value: n };
};

/** Forma -> backend kirishi (client tomonda backend qoidalari takrorlangan) */
export function buildInput(d: QuestionDraft, bank: PartOption[]): BuildResult<QuestionInput> {
  const text = d.text.trim();
  if (!text) return fail('Savol matnini kiriting');

  const points = d.points.trim() === '' ? 1 : Number(d.points);
  if (Number.isNaN(points) || points < 0 || points > 100) return fail('Ball 0 dan 100 gacha bo‘lishi kerak');

  const input: QuestionInput = { type: d.type, text, points, explanation: d.explanation.trim() || undefined };

  switch (d.type) {
    case 'MULTIPLE_CHOICE': {
      const filled = d.options.filter((o) => o.text.trim());
      if (filled.length < 2) return fail('Kamida 2 ta variant matnini kiriting');
      if (filled.filter((o) => o.isCorrect).length !== 1) return fail('Aynan bitta variantni to‘g‘ri deb belgilang');
      input.options = filled.map<QuestionOptionInput>((o, i) => ({
        label: LABELS[i],
        text: o.text.trim(),
        isCorrect: o.isCorrect,
      }));
      break;
    }
    case 'TRUE_FALSE_NG':
      input.acceptedAnswers = [d.tfng];
      break;
    case 'SHORT_ANSWER': {
      const answers = [...new Set(d.answers.map((a) => a.trim()).filter(Boolean))];
      if (answers.length === 0) return fail('Kamida bitta to‘g‘ri javob kiriting');
      input.acceptedAnswers = answers;
      input.caseSensitive = d.caseSensitive;
      break;
    }
    case 'MATCHING': {
      if (!d.matchLabel) return fail('Bankdan to‘g‘ri javobni tanlang');
      if (!bank.some((o) => o.label === d.matchLabel)) return fail(`${d.matchLabel} varianti bankda yo‘q`);
      input.correctPartOptionLabel = d.matchLabel;
      break;
    }
    case 'WRITING_PROMPT': {
      const min = optInt(d.minWords, 'Min so‘z', 1, 5000);
      if (!min.ok) return min;
      const max = optInt(d.maxWords, 'Max so‘z', 1, 5000);
      if (!max.ok) return max;
      if (min.value && max.value && min.value > max.value) return fail('Min so‘z max so‘zdan katta bo‘lmasligi kerak');
      input.minWords = min.value;
      input.maxWords = max.value;
      break;
    }
    case 'SPEAKING_PROMPT': {
      const prep = optInt(d.prepTimeSec, 'Tayyorlanish vaqti', 0, 3600);
      if (!prep.ok) return prep;
      const ans = optInt(d.answerTimeSec, 'Javob vaqti', 0, 3600);
      if (!ans.ok) return ans;
      input.prepTimeSec = prep.value;
      input.answerTimeSec = ans.value;
      break;
    }
  }
  return { ok: true, value: input };
}

const sameOptions = (a: QuestionOptionInput[], b: Question['options']) =>
  a.length === b.length && a.every((o, i) => o.label === b[i].label && o.text === b[i].text && o.isCorrect === b[i].isCorrect);

/**
 * Tahrirlash uchun PATCH tanasi. `options` faqat o'zgargan bo'lsa yuboriladi:
 * backend options yuborilganda tuzilmani qulflaydi (urinishlar bor bo'lsa 409).
 * audioKey: undefined = tegmaymiz, null = olib tashlaymiz, string = yangi fayl.
 */
export function buildUpdate(
  input: QuestionInput,
  original: Question,
  audioKey: string | null | undefined,
): UpdateQuestionInput {
  const typeChanged = input.type !== original.type;
  const upd: UpdateQuestionInput = {
    text: input.text,
    points: input.points,
    explanation: input.explanation ?? null,
  };
  if (typeChanged) upd.type = input.type;
  if (input.options && (typeChanged || !sameOptions(input.options, original.options))) upd.options = input.options;
  if (input.type === 'MATCHING') upd.correctPartOptionLabel = input.correctPartOptionLabel;
  if (input.acceptedAnswers) upd.acceptedAnswers = input.acceptedAnswers;
  if (input.type === 'SHORT_ANSWER') upd.caseSensitive = input.caseSensitive;
  if (input.type === 'WRITING_PROMPT') {
    upd.minWords = input.minWords ?? null;
    upd.maxWords = input.maxWords ?? null;
  }
  if (input.type === 'SPEAKING_PROMPT') {
    upd.prepTimeSec = input.prepTimeSec ?? null;
    upd.answerTimeSec = input.answerTimeSec ?? null;
  }
  if (audioKey !== undefined) upd.audioKey = audioKey;
  return upd;
}

/* ───────────── Ommaviy qo'shish: matndan savollar ───────────── */

const stripNumber = (s: string) => s.replace(/^\s*\d+\s*[.)]\s*/, '').trim();

const TFNG_MAP: Record<string, TfngValue> = {
  T: 'TRUE',
  TRUE: 'TRUE',
  F: 'FALSE',
  FALSE: 'FALSE',
  NG: 'NOT_GIVEN',
  NOT_GIVEN: 'NOT_GIVEN',
  'NOT GIVEN': 'NOT_GIVEN',
};

export function parseBulk(
  type: QuestionType,
  raw: string,
  bank: PartOption[],
): { items: QuestionInput[]; errors: string[] } {
  const items: QuestionInput[] = [];
  const errors: string[] = [];
  const text = raw.replace(/\r/g, '').trim();
  if (!text) return { items, errors };

  if (type === 'MULTIPLE_CHOICE') {
    text.split(/\n\s*\n/).forEach((block, bi) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      const qText = stripNumber(lines[0] ?? '');
      const options: QuestionOptionInput[] = [];
      for (const line of lines.slice(1)) {
        const m = line.match(/^(\*?)\s*([A-Fa-f])\s*[).:]\s*(.+)$/);
        if (m) options.push({ label: m[2].toUpperCase(), text: m[3].trim(), isCorrect: m[1] === '*' });
      }
      const where = `${bi + 1}-savol`;
      if (!qText) return errors.push(`${where}: matn yo‘q`);
      if (options.length < 2) return errors.push(`${where}: kamida 2 ta variant kerak (A) ...)`);
      if (options.filter((o) => o.isCorrect).length !== 1) return errors.push(`${where}: aynan bitta variantga * qo‘ying`);
      items.push({ type, text: qText, points: 1, options });
    });
    return { items, errors };
  }

  text.split('\n').forEach((line, i) => {
    const l = line.trim();
    if (!l) return;
    const where = `${i + 1}-qator`;

    if (type === 'WRITING_PROMPT' || type === 'SPEAKING_PROMPT') {
      items.push({ type, text: stripNumber(l), points: 1 });
      return;
    }

    const idx = l.lastIndexOf('=>');
    if (idx < 0) return errors.push(`${where}: "=>" belgisi yo‘q`);
    const qText = stripNumber(l.slice(0, idx));
    const answer = l.slice(idx + 2).trim();
    if (!qText || !answer) return errors.push(`${where}: savol yoki javob bo‘sh`);

    if (type === 'TRUE_FALSE_NG') {
      const v = TFNG_MAP[answer.toUpperCase()];
      if (!v) return errors.push(`${where}: javob T, F yoki NG bo‘lishi kerak`);
      items.push({ type, text: qText, points: 1, acceptedAnswers: [v] });
    } else if (type === 'SHORT_ANSWER') {
      const answers = [...new Set(answer.split('|').map((a) => a.trim()).filter(Boolean))];
      items.push({ type, text: qText, points: 1, acceptedAnswers: answers, caseSensitive: false });
    } else if (type === 'MATCHING') {
      const label = answer.toUpperCase();
      if (!bank.some((o) => o.label === label)) return errors.push(`${where}: ${label} bankda yo‘q`);
      items.push({ type, text: qText, points: 1, correctPartOptionLabel: label });
    }
  });
  return { items, errors };
}
