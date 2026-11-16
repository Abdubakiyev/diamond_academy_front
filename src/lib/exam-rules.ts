import { BookOpen, Headphones, Mic, PenLine, type LucideIcon } from 'lucide-react';
import type { Skill } from '../features/types/common';
import type { PartFormat } from '../features/types/exam';

export const SKILL_ORDER: Skill[] = ['LISTENING', 'READING', 'WRITING', 'SPEAKING'];

export const SKILL_META: Record<Skill, { label: string; icon: LucideIcon; chip: string; grad: string }> = {
  LISTENING: { label: 'Listening', icon: Headphones, chip: 'bg-sky-50 text-sky-700 ring-sky-200', grad: 'from-sky-500 to-blue-600' },
  READING: { label: 'Reading', icon: BookOpen, chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200', grad: 'from-emerald-500 to-teal-600' },
  WRITING: { label: 'Writing', icon: PenLine, chip: 'bg-violet-50 text-violet-700 ring-violet-200', grad: 'from-violet-500 to-indigo-600' },
  SPEAKING: { label: 'Speaking', icon: Mic, chip: 'bg-amber-50 text-amber-700 ring-amber-200', grad: 'from-amber-500 to-orange-600' },
};

/** Qaysi bo'limda qaysi part formatlari ruxsat etiladi (backend bilan bir xil) */
export const SKILL_FORMATS: Record<Skill, PartFormat[]> = {
  LISTENING: ['MCQ', 'MATCHING_BANK', 'MAP_LABELING', 'TRUE_FALSE_NG', 'GAP_FILL', 'MIXED'],
  READING: ['MCQ', 'MATCHING_BANK', 'TRUE_FALSE_NG', 'GAP_FILL', 'MIXED'],
  WRITING: ['WRITING_TASK'],
  SPEAKING: ['SPEAKING_INTERVIEW', 'SPEAKING_PICTURE', 'SPEAKING_DISCUSSION'],
};

export const FORMAT_LABELS: Record<PartFormat, string> = {
  MCQ: 'Ko‘p variantli (MCQ)',
  MATCHING_BANK: 'Moslashtirish (A–J bank)',
  MAP_LABELING: 'Xarita / reja belgilash',
  TRUE_FALSE_NG: 'True / False / Not Given',
  GAP_FILL: 'Bo‘sh joyni to‘ldirish',
  MIXED: 'Aralash savollar',
  WRITING_TASK: 'Yozma topshiriq',
  SPEAKING_INTERVIEW: 'Suhbat (interview)',
  SPEAKING_PICTURE: 'Rasm tavsifi',
  SPEAKING_DISCUSSION: 'Muhokama',
};

export const FORMAT_HINTS: Record<PartFormat, string> = {
  MCQ: 'Har savolga 3–4 ta variant, bittasi to‘g‘ri.',
  MATCHING_BANK: 'Umumiy A–J variantlar bankidan har savolga mos javob tanlanadi.',
  MAP_LABELING: 'Xarita yoki reja rasmi va A–J belgilar banki.',
  TRUE_FALSE_NG: 'Fikr matnga mosmi: True, False yoki Not Given.',
  GAP_FILL: 'Qisqa javob: talaba bo‘sh joyga so‘z yozadi.',
  MIXED: 'Bir partda turli savol turlari.',
  WRITING_TASK: 'Talaba insho yozadi, AI baholaydi.',
  SPEAKING_INTERVIEW: 'Shaxsiy savollar, talaba ovoz yozadi.',
  SPEAKING_PICTURE: 'Rasmni tasvirlash topshirig‘i.',
  SPEAKING_DISCUSSION: 'Mavzu bo‘yicha uzunroq nutq.',
};

/** Rasm biriktirish mumkin bo'lgan formatlar */
export const supportsImage = (f: PartFormat) => f !== 'SPEAKING_INTERVIEW' && f !== 'SPEAKING_DISCUSSION';

export const BANK_FORMATS: PartFormat[] = ['MATCHING_BANK', 'MAP_LABELING', 'MIXED'];
