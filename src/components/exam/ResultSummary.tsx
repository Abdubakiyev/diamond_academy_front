import { CheckCircle2, Hourglass, MinusCircle } from 'lucide-react';
import { CEFR_META, fmtScore, scoreBar } from '../../lib/exam-result';
import { SKILL_META, SKILL_ORDER } from '../../lib/exam-rules';
import { fmtDateTime } from '../../lib/payment';
import { cn } from '../../lib/format';
import type { ExamResult } from '../../features/types/exam-result';

const ZONES = [
  { to: 38, cls: 'bg-amber-300' },
  { to: 51, cls: 'bg-sky-400' },
  { to: 65, cls: 'bg-indigo-400' },
  { to: 75, cls: 'bg-emerald-400' },
];

export default function ResultSummary({ result }: { result: ExamResult }) {
  const { scores } = result;
  const cefr = scores.cefr ? CEFR_META[scores.cefr] : null;
  const total = scores.total;

  return (
    <div className="space-y-6">
      {/* Asosiy natija */}
      <section className="da-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-800 p-6 text-white shadow-xl sm:p-8">
        <div className="da-blob absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">{result.exam.title}</p>
            {result.user && <p className="mt-1 text-sm text-white/80">{result.user.name} · {result.user.phone}</p>}
            <div className="mt-3 flex items-end gap-2">
              <span className="text-6xl font-black tracking-tight tabular-nums">{fmtScore(total)}</span>
              <span className="pb-2 text-xl font-semibold text-white/60">/ 75</span>
            </div>
            <p className="mt-1 text-xs text-white/60">{fmtDateTime(result.finishedAt ?? result.startedAt)}</p>
          </div>

          <div className="text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">CEFR darajasi</p>
            <div className={cn('flex h-24 min-w-24 items-center justify-center rounded-2xl bg-gradient-to-br px-4 text-3xl font-black shadow-lg', cefr?.grad ?? 'from-slate-600 to-slate-700')}>
              {cefr?.label ?? '—'}
            </div>
            {cefr && <p className="mt-1.5 text-xs text-white/60">{cefr.range} ball</p>}
          </div>
        </div>

        {/* Shkala */}
        <div className="relative mt-8">
          <div className="flex h-2.5 overflow-hidden rounded-full">
            {ZONES.map((z, i) => (
              <div key={z.to} className={z.cls} style={{ width: `${((z.to - (ZONES[i - 1]?.to ?? 0)) / 75) * 100}%` }} />
            ))}
          </div>
          {total != null && (
            <div className="absolute -top-1.5 -translate-x-1/2 transition-all duration-700" style={{ left: `${Math.min(100, (total / 75) * 100)}%` }}>
              <div className="h-5 w-5 rounded-full border-4 border-white bg-indigo-600 shadow-lg" />
            </div>
          )}
          <div className="mt-2 flex justify-between text-[10px] font-medium text-white/50">
            <span>0</span>
            <span>B1 · 38</span>
            <span>B2 · 51</span>
            <span>C1 · 65</span>
            <span>75</span>
          </div>
        </div>

        {result.pending && (
          <p className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/90">
            <Hourglass className="h-4 w-4 animate-pulse" /> Writing / Speaking tekshirilmoqda. Natija tayyor bo‘lganda sahifa o‘zi yangilanadi.
          </p>
        )}
      </section>

      {/* Ko'nikmalar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SKILL_ORDER.map((skill, i) => {
          const sec = result.sections.find((s) => s.skill === skill);
          if (!sec) return null;
          const m = SKILL_META[skill];
          const value = scores[skill.toLowerCase() as 'listening' | 'reading' | 'writing' | 'speaking'];
          const grading = sec.status !== 'COMPLETED';
          return (
            <div key={skill} className={cn('da-fade-up rounded-2xl border border-gray-100 bg-white p-4 shadow-sm', `da-delay-${Math.min(i + 1, 4)}`)}>
              <div className="flex items-center justify-between">
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white', m.grad)}>
                  <m.icon className="h-5 w-5" />
                </span>
                {sec.skipped ? (
                  <MinusCircle className="h-4 w-4 text-gray-300" />
                ) : grading ? (
                  <Hourglass className="h-4 w-4 animate-pulse text-amber-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
              </div>
              <p className="mt-3 text-sm font-medium text-gray-500">{m.label}</p>
              <p className="mt-0.5 text-3xl font-bold tabular-nums text-gray-900">
                {sec.skipped ? '0' : grading ? '…' : fmtScore(value)}
                <span className="ml-1 text-sm font-medium text-gray-400">/ 75</span>
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className={cn('h-full rounded-full transition-all duration-700', scoreBar(value ?? 0))} style={{ width: `${grading || sec.skipped ? 0 : ((value ?? 0) / 75) * 100}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {sec.skipped ? 'Topshirilmagan' : grading ? 'Tekshirilmoqda' : sec.rawScore != null && (skill === 'LISTENING' || skill === 'READING') ? `${sec.rawScore} ta to‘g‘ri javob` : 'AI baholadi'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
