'use client';

import { useState } from 'react';
import { AlertTriangle, Lightbulb, Loader2, UserCheck } from 'lucide-react';
import { EVAL_META, criterionLabel, fmtScore, normalizeCriteria, scoreBar, scoreText } from '../../lib/exam-result';
import { SKILL_META } from '../../lib/exam-rules';
import { cn } from '../../lib/format';
import type { ResultEvaluation } from '../../features/types/exam-result';

export default function AiFeedbackCard({ ev }: { ev: ResultEvaluation }) {
  const [showText, setShowText] = useState(false);
  const meta = SKILL_META[ev.skill];
  const criteria = normalizeCriteria(ev.criteria);
  const waiting = ev.status === 'PENDING' || ev.status === 'PROCESSING';

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 p-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white', meta.grad)}>
            <meta.icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {meta.label} · {ev.questionNumber}-savol
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{ev.questionText}</p>
            {ev.wordCount != null && <p className="mt-1 text-xs text-gray-400">{ev.wordCount} so‘z</p>}
          </div>
        </div>

        <div className="text-right">
          {ev.status === 'DONE' ? (
            <>
              <p className={cn('text-3xl font-black tabular-nums', scoreText(ev.score ?? 0))}>
                {fmtScore(ev.score)}
                <span className="ml-0.5 text-sm font-medium text-gray-400">/75</span>
              </p>
              {ev.reviewed && (
                <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                  <UserCheck className="h-3 w-3" /> O‘qituvchi tasdiqlagan{ev.aiScore != null && ev.aiScore !== ev.score ? ` (AI: ${fmtScore(ev.aiScore)})` : ''}
                </p>
              )}
            </>
          ) : (
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1', EVAL_META[ev.status].cls)}>
              {waiting && <Loader2 className="h-3 w-3 animate-spin" />} {EVAL_META[ev.status].label}
            </span>
          )}
        </div>
      </header>

      {ev.status === 'FAILED' && (
        <p className="flex items-start gap-2 p-4 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> AI bu javobni baholay olmadi. Administrator qayta baholashni ishga tushiradi.
        </p>
      )}
      {waiting && <p className="p-4 text-sm text-gray-500">Javobingiz tekshirilmoqda, bir ozdan keyin natija chiqadi.</p>}

      {ev.status === 'DONE' && (
        <div className="space-y-5 p-4">
          {criteria.length > 0 && (
            <div className="space-y-3">
              {criteria.map((c) => (
                <div key={c.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700">{criterionLabel(c.key)}</span>
                    <span className="font-bold tabular-nums text-gray-900">{fmtScore(c.score)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div className={cn('h-full rounded-full transition-all duration-700', scoreBar(c.score ?? 0))} style={{ width: `${((c.score ?? 0) / 75) * 100}%` }} />
                  </div>
                  {c.comment && <p className="mt-1 text-xs text-gray-500">{c.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {ev.feedback && <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-gray-700">{ev.feedback}</p>}

          {ev.suggestions.length > 0 && (
            <div>
              <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-600">
                <Lightbulb className="h-3.5 w-3.5" /> Maslahatlar
              </p>
              <ul className="space-y-1.5 text-sm text-gray-700">
                {ev.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ev.transcript && (
            <div>
              <button type="button" onClick={() => setShowText((v) => !v)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                {showText ? 'Matnni yashirish' : 'Gapirgan matningizni ko‘rish'}
              </button>
              {showText && <p className="mt-2 whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm italic text-gray-600">{ev.transcript}</p>}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
