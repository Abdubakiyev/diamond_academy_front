'use client';

import { useState } from 'react';
import { Bot, Loader2, RefreshCw, Save, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { ModalShell } from './ui/ModalUI';
import Spinner from '../../components/ui/Spinner';
import { useEnqueueSection, useEvaluation, useRetryEvaluation, useReviewEvaluation } from '../hooks/useExamResult';
import { useMe } from '../hooks/useAuth';
import { handleApiError } from '../api/api';
import { EVAL_META, criterionLabel, fmtScore, normalizeCriteria, scoreBar } from '../../lib/exam-result';
import { SKILL_META } from '../../lib/exam-rules';
import { cn } from '../../lib/format';
import type { EvaluationDetail } from '../types/exam-result';

const field =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500';

function Form({ ev, onClose }: { ev: EvaluationDetail; onClose: () => void }) {
  const { data: me } = useMe();
  const review = useReviewEvaluation();
  const retry = useRetryEvaluation();
  const enqueue = useEnqueueSection();

  const [score, setScore] = useState(String(ev.finalScore ?? ev.score ?? ''));
  const [feedback, setFeedback] = useState(ev.feedback ?? '');
  const [error, setError] = useState<string | null>(null);

  const meta = SKILL_META[ev.answer.sectionAttempt.section.skill];
  const att = ev.answer.sectionAttempt.attempt;
  const busy = ev.status === 'PENDING' || ev.status === 'PROCESSING';
  const canReview = ev.status === 'DONE' || ev.status === 'FAILED';
  const criteria = normalizeCriteria(ev.criteria);

  const submit = () => {
    const n = Number(score);
    if (score.trim() === '' || Number.isNaN(n) || n < 0 || n > 75) return setError('Ball 0 dan 75 gacha bo‘lishi kerak');
    if (Math.abs(n * 10 - Math.round(n * 10)) > 1e-9) return setError('Ballda ko‘pi bilan 1 ta kasr raqam');
    setError(null);
    review.mutate(
      { id: ev.id, finalScore: n, feedback: feedback.trim() && feedback.trim() !== (ev.feedback ?? '') ? feedback.trim() : undefined },
      {
        onSuccess: () => {
          toast.success('Baho saqlandi, natija qayta hisoblandi');
          onClose();
        },
        onError: (e) => setError(handleApiError(e)),
      },
    );
  };

  return (
    <ModalShell
      maxWidth="max-w-2xl"
      icon={Bot}
      title={`${meta.label} · ${ev.answer.question.number}-savol`}
      subtitle={`${att.user.name} · ${att.exam.title}`}
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Bahoni saqlash"
      submitIcon={Save}
      submitDisabled={!canReview}
      isPending={review.isPending}
      errorMessage={error}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1', EVAL_META[ev.status].cls)}>
            {busy && <Loader2 className="h-3 w-3 animate-spin" />} {EVAL_META[ev.status].label}
          </span>
          {ev.model && <span className="text-xs text-gray-400">{ev.model}</span>}
          {ev.reviewedAt && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
              <UserCheck className="h-3.5 w-3.5" /> qo‘lda o‘zgartirilgan
            </span>
          )}
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Savol</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{ev.answer.question.text}</p>
        </div>

        <div className="rounded-xl bg-white p-3 ring-1 ring-gray-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Talaba javobi {ev.answer.wordCount != null && `· ${ev.answer.wordCount} so‘z`}
            {ev.answer.durationSec != null && `· ${ev.answer.durationSec}s`}
          </p>
          {ev.answer.audioUrl && <audio controls src={ev.answer.audioUrl} className="mt-2 w-full" preload="none" />}
          {ev.answer.transcript && <p className="mt-2 whitespace-pre-wrap text-sm italic text-gray-600">{ev.answer.transcript}</p>}
          {ev.answer.textAnswer && <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-gray-800">{ev.answer.textAnswer}</p>}
          {!ev.answer.audioUrl && !ev.answer.transcript && !ev.answer.textAnswer && <p className="mt-1 text-sm text-gray-400">Javob yo‘q</p>}
        </div>

        {ev.status === 'FAILED' && ev.errorMessage && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-100">{ev.errorMessage}</p>}

        {criteria.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">AI mezonlari (AI bahosi: {fmtScore(ev.score)})</p>
            {criteria.map((c) => (
              <div key={c.key}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-700">{criterionLabel(c.key)}</span>
                  <b className="tabular-nums">{fmtScore(c.score)}</b>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div className={cn('h-full rounded-full', scoreBar(c.score ?? 0))} style={{ width: `${((c.score ?? 0) / 75) * 100}%` }} />
                </div>
                {c.comment && <p className="mt-0.5 text-xs text-gray-500">{c.comment}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Yakuniy ball (0–75)</span>
            <input type="number" min={0} max={75} step="0.1" value={score} disabled={!canReview} onChange={(e) => setScore(e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Talabaga izoh</span>
            <textarea rows={4} maxLength={5000} value={feedback} disabled={!canReview} onChange={(e) => setFeedback(e.target.value)} className={`${field} resize-y`} />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            disabled={busy || retry.isPending}
            onClick={() =>
              retry.mutate(ev.id, {
                onSuccess: () => toast.success('Qayta baholashga yuborildi'),
                onError: (e) => toast.error(handleApiError(e)),
              })
            }
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            {retry.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Qayta baholash (AI)
          </button>
          {me?.role === 'ADMIN' && (
            <button
              type="button"
              disabled={enqueue.isPending}
              onClick={() =>
                enqueue.mutate(ev.answer.sectionAttempt.id, {
                  onSuccess: (r) => toast.success(`${r.queued} ta javob navbatga qo‘yildi`),
                  onError: (e) => toast.error(handleApiError(e)),
                })
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
              title="Shu bo‘limdagi barcha javoblarni qayta baholaydi"
            >
              {enqueue.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Butun bo‘limni qayta baholash
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function Content({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, isLoading, isError, error } = useEvaluation(id);
  if (isLoading || isError || !data) {
    return (
      <ModalShell icon={Bot} title="AI baholash" onClose={onClose} onSubmit={() => {}} submitLabel="Saqlash" submitDisabled errorMessage={isError ? handleApiError(error) : null}>
        {isLoading && <Spinner className="py-10" />}
      </ModalShell>
    );
  }
  // Holat o'zgarganda (masalan, qayta baholash tugaganda) forma yangi qiymatlar bilan qayta quriladi
  return <Form key={`${data.id}-${data.status}-${data.finalScore}-${data.score}`} ev={data} onClose={onClose} />;
}

export function useEvaluationModal() {
  const [id, setId] = useState<string | null>(null);
  return { open: (evalId: string) => setId(evalId), modal: id ? <Content id={id} onClose={() => setId(null)} /> : null };
}
