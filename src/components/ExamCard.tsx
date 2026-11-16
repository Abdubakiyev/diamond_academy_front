import Link from 'next/link';
import { ArrowRight, Banknote, Clock, Gem } from 'lucide-react';
import { SKILL_META } from '../lib/exam-rules';
import { cn, formatPrice } from '../lib/format';
import type { ExamListItem } from '../features/types/exam';

export default function ExamCard({ exam }: { exam: ExamListItem }) {
  const full = exam.type === 'FULL_MULTILEVEL';
  return (
    <Link
      href={`/exams/${exam.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className={cn('relative flex h-28 items-end justify-between bg-gradient-to-br p-4', full ? 'from-indigo-600 via-blue-600 to-sky-500' : 'from-slate-700 via-slate-800 to-indigo-900')}>
        <Gem className="absolute -right-2 -top-2 h-24 w-24 rotate-12 text-white/10 transition duration-500 group-hover:rotate-45" />
        <span className="relative rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-indigo-700">{full ? 'Multilevel' : 'Alohida test'}</span>
        <span className={cn('relative rounded-full px-2.5 py-1 text-xs font-bold', exam.isFree ? 'bg-emerald-400 text-emerald-950' : 'bg-white/90 text-gray-900')}>
          {exam.isFree ? 'Bepul' : formatPrice(exam.price)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-gray-900">{exam.title}</h3>
        {exam.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{exam.description}</p>}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {exam.sections.map((s) => {
            const m = SKILL_META[s.skill];
            return (
              <span key={s.skill} className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1', m.chip)}>
                <m.icon className="h-3 w-3" /> {m.label}
              </span>
            );
          })}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-gray-500">
          <span className="inline-flex items-center gap-3">
            {exam.durationMinutes && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {exam.durationMinutes} daq
              </span>
            )}
            {!exam.isFree && (
              <span className="inline-flex items-center gap-1">
                <Banknote className="h-3.5 w-3.5" /> pullik
              </span>
            )}
            {exam.level && <span className="font-semibold text-indigo-600">{exam.level.type}</span>}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 transition group-hover:gap-2">
            Batafsil <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
