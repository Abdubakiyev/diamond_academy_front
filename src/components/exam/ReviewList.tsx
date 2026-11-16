'use client';

import { useState } from 'react';
import { Check, ChevronDown, Minus, X } from 'lucide-react';
import Segmented from '../admin/Segmented';
import { SKILL_META } from '../../lib/exam-rules';
import { TFNG_LABELS } from '../../lib/question-rules';
import { cn } from '../../lib/format';
import type { ResultSection, ReviewQuestion, ReviewSection } from '../../features/types/exam-result';

type Filter = 'ALL' | 'WRONG' | 'EMPTY';

const tfng = (v: string) => (v in TFNG_LABELS ? TFNG_LABELS[v as keyof typeof TFNG_LABELS] : v);

function yourAnswer(q: ReviewQuestion): string {
  const a = q.yourAnswer;
  if (!a) return '';
  if (a.option) return `${a.option.label}) ${a.option.text}`;
  if (a.partOption) return `${a.partOption.label}. ${a.partOption.text}`;
  if (a.text) return q.type === 'TRUE_FALSE_NG' ? tfng(a.text) : a.text;
  return '';
}

function correctAnswer(q: ReviewQuestion): string {
  const c = q.correct;
  if (!c) return '';
  if (c.options.length) return c.options.map((o) => `${o.label}) ${o.text}`).join(' / ');
  if (c.partOption) return `${c.partOption.label}. ${c.partOption.text}`;
  if (c.acceptedAnswers.length) return c.acceptedAnswers.map((a) => (q.type === 'TRUE_FALSE_NG' ? tfng(a) : a)).join(' / ');
  return '';
}

function Row({ q }: { q: ReviewQuestion }) {
  const state = !q.answered ? 'empty' : q.isCorrect ? 'ok' : 'bad';
  const mine = yourAnswer(q);
  const right = correctAnswer(q);
  return (
    <li className={cn('rounded-xl p-3 ring-1', state === 'ok' ? 'bg-emerald-50/50 ring-emerald-100' : state === 'bad' ? 'bg-red-50/50 ring-red-100' : 'bg-gray-50 ring-gray-100')}>
      <div className="flex items-start gap-3">
        <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white', state === 'ok' ? 'bg-emerald-500' : state === 'bad' ? 'bg-red-500' : 'bg-gray-400')}>
          {state === 'ok' ? <Check className="h-3.5 w-3.5" /> : state === 'bad' ? <X className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-medium text-gray-900">
            <span className="mr-1.5 text-gray-400">{q.number}.</span>
            {q.text}
          </p>
          <div className="mt-1.5 space-y-0.5 text-xs">
            <p className="text-gray-600">
              Sizning javobingiz: <b className={cn(state === 'bad' ? 'text-red-700' : state === 'ok' ? 'text-emerald-700' : 'text-gray-400')}>{mine || 'javob berilmagan'}</b>
            </p>
            {state !== 'ok' && right && (
              <p className="text-gray-600">
                To‘g‘ri javob: <b className="text-emerald-700">{right}</b>
              </p>
            )}
            {q.explanation && <p className="pt-1 text-gray-500">💡 {q.explanation}</p>}
          </div>
        </div>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-400">
          {q.pointsAwarded}/{q.points}
        </span>
      </div>
    </li>
  );
}

export default function ReviewList({ review, sections }: { review: ReviewSection[]; sections: ResultSection[] }) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [closed, setClosed] = useState<Set<string>>(new Set());

  if (review.length === 0) return <p className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm ring-1 ring-gray-100">Listening / Reading tahlili yo‘q.</p>;

  const show = (q: ReviewQuestion) => (filter === 'ALL' ? true : filter === 'WRONG' ? q.answered && !q.isCorrect : !q.answered);

  return (
    <div className="space-y-5">
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'ALL', label: 'Hammasi' },
          { value: 'WRONG', label: 'Xatolar' },
          { value: 'EMPTY', label: 'Javobsiz' },
        ]}
      />

      {review.map((sec) => {
        const meta = SKILL_META[sec.skill];
        const title = sections.find((s) => s.sectionId === sec.sectionId)?.title || meta.label;
        const all = sec.parts.flatMap((p) => p.questions);
        const right = all.filter((q) => q.isCorrect).length;
        const isClosed = closed.has(sec.sectionId);
        return (
          <section key={sec.sectionId} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setClosed((s) => { const n = new Set(s); if (n.has(sec.sectionId)) n.delete(sec.sectionId); else n.add(sec.sectionId); return n; })}
              className="flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50"
              aria-expanded={!isClosed}
            >
              <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white', meta.grad)}>
                <meta.icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-gray-900">{title}</span>
                <span className="text-xs text-gray-500">
                  {right} / {all.length} to‘g‘ri
                </span>
              </span>
              <ChevronDown className={cn('h-5 w-5 text-gray-400 transition-transform', isClosed && '-rotate-90')} />
            </button>

            {!isClosed && (
              <div className="space-y-5 border-t border-gray-100 p-4">
                {sec.parts.map((p, pi) => {
                  const qs = p.questions.filter(show);
                  if (qs.length === 0) return null;
                  return (
                    <div key={p.partId}>
                      {sec.parts.length > 1 && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{p.title || `Part ${pi + 1}`}</p>}
                      <ul className="space-y-2">
                        {qs.map((q) => (
                          <Row key={q.questionId} q={q} />
                        ))}
                      </ul>
                    </div>
                  );
                })}
                {sec.parts.every((p) => p.questions.filter(show).length === 0) && <p className="text-center text-sm text-gray-400">Bu filtr bo‘yicha savol yo‘q.</p>}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
