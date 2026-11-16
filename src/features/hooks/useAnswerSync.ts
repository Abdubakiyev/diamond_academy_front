import { useCallback, useEffect, useRef, useState } from 'react';
import { saveAnswers } from '../api/exam-session';
import { getErrorStatus, handleApiError } from '../api/api';
import type { AnswerDraft, AnswerInput } from '../types/exam-session';

export type SyncStatus = 'saved' | 'dirty' | 'saving' | 'error';

interface Options {
  attemptId: string;
  sectionId: string;
  initial: Record<string, AnswerDraft>;
  /** Serverdan kelgan qolgan vaqt (taymerni to'g'rilash uchun) */
  onTimeSync?: (sec: number | null) => void;
  /** Bo'lim yopilgan / vaqti tugagan: saqlash endi mumkin emas */
  onLocked?: (message: string) => void;
}

const toInput = (questionId: string, d?: AnswerDraft): AnswerInput => ({
  questionId,
  selectedOptionId: d?.selectedOptionId ?? null,
  selectedPartOptionId: d?.selectedPartOptionId ?? null,
  textAnswer: d?.textAnswer ?? null,
  audioKey: d?.audioKey ?? null,
  durationSec: d?.durationSec ?? null,
});

/**
 * Javoblar holati + avtosaqlash:
 *  - faqat o'zgargan savollar yuboriladi (debounce), bir vaqtda bitta so'rov;
 *  - xatoda javoblar yo'qolmaydi: 2s, 4s ... 15s oralig'ida qayta urinadi;
 *  - sahifa yopilganda / yashirilganda / internet qaytganda darhol saqlashga urinadi.
 */
export function useAnswerSync({ attemptId, sectionId, initial, onTimeSync, onLocked }: Options) {
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>(initial);
  const [status, setStatus] = useState<SyncStatus>('saved');

  const answersRef = useRef(initial);
  const dirty = useRef(new Map<string, number>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef<Promise<boolean> | null>(null);
  const failures = useRef(0);
  const locked = useRef(false);
  const flushRef = useRef<() => Promise<boolean>>(async () => true);
  const cbs = useRef({ onTimeSync, onLocked });

  useEffect(() => {
    cbs.current = { onTimeSync, onLocked };
  });

  const schedule = useCallback((ms: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void flushRef.current();
    }, ms);
  }, []);

  const flush = useCallback(async (): Promise<boolean> => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    while (inflight.current) await inflight.current;
    if (locked.current) return false;
    if (dirty.current.size === 0) return true;

    const batch = [...dirty.current.entries()].slice(0, 80);

    const run = async (): Promise<boolean> => {
      setStatus('saving');
      try {
        const res = await saveAnswers(
          attemptId,
          sectionId,
          batch.map(([id]) => toInput(id, answersRef.current[id])),
        );
        // Yuborish paytida yana o'zgargan savollar (versiya o'zgargan) dirty bo'lib qoladi
        for (const [id, v] of batch) if (dirty.current.get(id) === v) dirty.current.delete(id);
        failures.current = 0;
        cbs.current.onTimeSync?.(res.remainingSec);
        if (dirty.current.size > 0) {
          setStatus('dirty');
          schedule(300);
        } else {
          setStatus('saved');
        }
        return true;
      } catch (e) {
        const code = getErrorStatus(e);
        if (code === 409 || code === 404 || code === 403) {
          locked.current = true;
          cbs.current.onLocked?.(handleApiError(e));
          return false;
        }
        failures.current += 1;
        setStatus('error');
        schedule(Math.min(15000, 2000 * failures.current));
        return false;
      }
    };

    const p: Promise<boolean> = run().finally(() => {
      if (inflight.current === p) inflight.current = null;
    });
    inflight.current = p;
    return p;
  }, [attemptId, sectionId, schedule]);

  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  const setAnswer = useCallback(
    (questionId: string, patch: AnswerDraft) => {
      const next = { ...answersRef.current, [questionId]: { ...answersRef.current[questionId], ...patch } };
      answersRef.current = next;
      setAnswers(next);
      dirty.current.set(questionId, (dirty.current.get(questionId) ?? 0) + 1);
      setStatus((s) => (s === 'saving' ? s : 'dirty'));
      schedule(patch.textAnswer !== undefined ? 1000 : 300);
    },
    [schedule],
  );

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current.size > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') void flushRef.current();
    };
    const onOnline = () => void flushRef.current();

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
      if (timer.current) clearTimeout(timer.current);
      void flushRef.current();
    };
  }, []);

  return { answers, setAnswer, status, flush, hasPending: () => dirty.current.size > 0 };
}
