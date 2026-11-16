export interface LessonWithProgress {
  id: string;
  progress?: { completed: boolean }[];
}

export const isLessonDone = (l: LessonWithProgress) => !!l.progress?.[0]?.completed;

/** Kurs bo'yicha progress va "keyingi dars" (birinchi tugatilmagani, hammasi tugagan bo'lsa birinchisi) */
export function courseProgress<T extends LessonWithProgress>(lessons: T[]) {
  const total = lessons.length;
  const done = lessons.filter(isLessonDone).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const nextLesson = lessons.find((l) => !isLessonDone(l)) ?? lessons[0] ?? null;
  return { total, done, percent, nextLesson, finished: total > 0 && done === total };
}

const GRADIENTS = [
  'from-blue-600 via-indigo-600 to-violet-600',
  'from-sky-500 via-blue-600 to-indigo-700',
  'from-emerald-500 via-teal-600 to-cyan-700',
  'from-fuchsia-500 via-purple-600 to-indigo-700',
  'from-amber-500 via-orange-500 to-rose-600',
  'from-slate-700 via-slate-800 to-indigo-900',
];

/** Muqova bo'lmagan kurs uchun id ga qarab doim bir xil gradient */
export const gradientFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
};
