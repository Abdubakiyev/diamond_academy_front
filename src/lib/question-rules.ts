import { CheckCheck, Link2, ListChecks, Mic, PenLine, TextCursorInput } from 'lucide-react';
import type { ElementType } from 'react';
import type { PartFormat } from '../features/types/exam';
import type { QuestionType, TfngValue } from '../features/types/question';

/** Backenddagi FORMAT_QUESTION_TYPES bilan bir xil */
export const FORMAT_QUESTION_TYPES: Record<PartFormat, QuestionType[]> = {
  MCQ: ['MULTIPLE_CHOICE'],
  MATCHING_BANK: ['MATCHING'],
  MAP_LABELING: ['MATCHING'],
  TRUE_FALSE_NG: ['TRUE_FALSE_NG'],
  GAP_FILL: ['SHORT_ANSWER'],
  MIXED: ['MULTIPLE_CHOICE', 'TRUE_FALSE_NG', 'SHORT_ANSWER', 'MATCHING'],
  WRITING_TASK: ['WRITING_PROMPT'],
  SPEAKING_INTERVIEW: ['SPEAKING_PROMPT'],
  SPEAKING_PICTURE: ['SPEAKING_PROMPT'],
  SPEAKING_DISCUSSION: ['SPEAKING_PROMPT'],
};

export const QUESTION_TYPE_META: Record<QuestionType, { label: string; icon: ElementType; chip: string }> = {
  MULTIPLE_CHOICE: { label: 'Ko‘p variantli', icon: ListChecks, chip: 'bg-blue-50 text-blue-700 ring-blue-200' },
  TRUE_FALSE_NG: { label: 'True / False / NG', icon: CheckCheck, chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  SHORT_ANSWER: { label: 'Qisqa javob', icon: TextCursorInput, chip: 'bg-amber-50 text-amber-700 ring-amber-200' },
  MATCHING: { label: 'Moslashtirish', icon: Link2, chip: 'bg-violet-50 text-violet-700 ring-violet-200' },
  WRITING_PROMPT: { label: 'Yozma topshiriq', icon: PenLine, chip: 'bg-rose-50 text-rose-700 ring-rose-200' },
  SPEAKING_PROMPT: { label: 'Og‘zaki savol', icon: Mic, chip: 'bg-sky-50 text-sky-700 ring-sky-200' },
};

export const TFNG_LABELS: Record<TfngValue, string> = {
  TRUE: 'True',
  FALSE: 'False',
  NOT_GIVEN: 'Not Given',
};

export const BULK_HELP: Record<QuestionType, { title: string; example: string }> = {
  MULTIPLE_CHOICE: {
    title: 'Savollar bo‘sh qator bilan ajratiladi. To‘g‘ri variant oldiga * qo‘ying.',
    example: '1. What does Anna do?\nA) She teaches\n*B) She studies\nC) She cooks\n\n2. Where is the library?\n*A) Near the park\nB) Next to the bank',
  },
  TRUE_FALSE_NG: {
    title: 'Har qatorda: savol => T, F yoki NG',
    example: 'The museum opens at nine. => T\nTickets are free for students. => NG\nParking is available. => F',
  },
  SHORT_ANSWER: {
    title: 'Har qatorda: savol => javob (bir nechta javob | bilan ajratiladi)',
    example: 'The bus leaves at ____ pm. => 5 | five\nThe speaker’s name is ____. => Mr Brown',
  },
  MATCHING: {
    title: 'Har qatorda: savol => bankdagi harf (A–J)',
    example: 'Speaker 1 => C\nSpeaker 2 => A\nSpeaker 3 => F',
  },
  WRITING_PROMPT: {
    title: 'Har qator — alohida topshiriq',
    example: 'Write a letter to a friend about your last holiday (120–150 words).',
  },
  SPEAKING_PROMPT: {
    title: 'Har qator — alohida savol',
    example: 'Tell me about your hometown.\nWhat do you do in your free time?',
  },
};
