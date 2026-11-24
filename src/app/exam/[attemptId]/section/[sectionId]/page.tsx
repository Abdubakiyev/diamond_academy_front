'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCheck, CloudOff, Loader2, Send } from 'lucide-react';
import RequireRole from '../../../../../components/RequireRole';
import ExamTimer from '../../../../../components/exam/ExamTimer';
import PartView from '../../../../../components/exam/PartView';
import SectionNav from '../../../../../components/exam/SectionNav';
import Spinner from '../../../../../components/ui/Spinner';
import EmptyState from '../../../../../components/ui/EmptyState';
import ConfirmModal from '../../../../../components/ui/ConfirmModal';
import { useSectionContent, useSubmitSection } from '../../../../../features/hooks/useExamSession';
import { useCountdown } from '../../../../../features/hooks/useCountdown';
import { useAnswerSync, type SyncStatus } from '../../../../../features/hooks/useAnswerSync';
import { handleApiError } from '../../../../../features/api/api';
import { SKILL_META } from '../../../../../lib/exam-rules';
import { isAnswered } from '../../../../../lib/exam-session';
import { clearAllHighlights } from '../../../../../lib/highlight';
import { cn } from '../../../../../lib/format';
import type { AnswerDraft, SectionPayload } from '../../../../../features/types/exam-session';

const SYNC_UI: Record<SyncStatus, { text: string; cls: string }> = {
  saved: { text: 'Saqlandi', cls: 'text-emerald-600' },
  saving: { text: 'Saqlanmoqda...', cls: 'text-gray-500' },
  dirty: { text: 'Saqlanmagan o‘zgarish', cls: 'text-amber-600' },
  error: { text: 'Internet muammosi: qayta urinilmoqda', cls: 'text-red-600' },
};

function Session({ payload }: { payload: SectionPayload }) {
  const router = useRouter();
  const { attemptId } = payload;
  const sectionId = payload.section.id;
  const submit = useSubmitSection();

  const [activePartId, setActivePartId] = useState(payload.parts[0]?.id ?? '');
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const leaving = useRef(false);

  // Bo'lim yopilganda (topshirilganda, vaqt tugaganda yoki sahifadan chiqilganda) belgilar o'chadi
  useEffect(() => () => clearAllHighlights(), []);

  const initial = useMemo(() => {
    const map: Record<string, AnswerDraft> = {};
    for (const a of payload.answers) {
      map[a.questionId] = {
        selectedOptionId: a.selectedOptionId,
        selectedPartOptionId: a.selectedPartOptionId,
        textAnswer: a.textAnswer,
        hasAudio: a.hasAudio,
        durationSec: a.durationSec,
      };
    }
    return map;
    // faqat birinchi yuklanishda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timeSyncRef = useRef<(s: number | null) => void>(() => {});

  const sync = useAnswerSync({
    attemptId,
    sectionId,
    initial,
    onTimeSync: (s) => timeSyncRef.current(s),
    onLocked: (msg) => {
      if (leaving.current) return;
      leaving.current = true;
      toast.error(msg);
      router.replace(`/exam/${attemptId}`);
    },
  });

  const finishNavigation = useCallback(
    (attemptFinished: boolean) => router.replace(attemptFinished ? `/exam/${attemptId}/result` : `/exam/${attemptId}`),
    [router, attemptId],
  );

  const doSubmit = useCallback(
    async (auto: boolean) => {
      if (leaving.current) return;
      const saved = await sync.flush();
      if (!saved && !auto) {
        toast.error('Javoblar saqlanmadi. Internetni tekshirib, qayta urinib ko‘ring.');
        setConfirmOpen(false);
        return;
      }
      leaving.current = true;
      submit.mutate(
        { attemptId, sectionId },
        {
          onSuccess: (res) => {
            clearAllHighlights();
            finishNavigation(res.attemptFinished);
          },
          onError: (e) => {
            // Server vaqti tugagan bo'limni o'zi topshirib bo'lgan bo'lishi mumkin
            if (!auto) toast.error(handleApiError(e));
            router.replace(`/exam/${attemptId}`);
          },
        },
      );
    },
    [sync, submit, attemptId, sectionId, finishNavigation, router],
  );

  const { left, sync: syncTime } = useCountdown(payload.remainingSec, () => {
    setTimeUp(true);
    void doSubmit(true);
  });
  timeSyncRef.current = syncTime;

  const allQuestions = payload.parts.flatMap((p) => p.questions);
  const answeredCount = allQuestions.filter((q) => isAnswered(q, sync.answers[q.id])).length;
  const unanswered = allQuestions.length - answeredCount;

  const partIndex = payload.parts.findIndex((p) => p.id === activePartId);
  const part = payload.parts[partIndex] ?? payload.parts[0];
  const skill = SKILL_META[payload.section.skill];
  const syncUi = SYNC_UI[sync.status];

  const toggleFlag = (qid: string) =>
    setFlags((s) => {
      const n = new Set(s);
      if (n.has(qid)) n.delete(qid);
      else n.add(qid);
      return n;
    });

  const setQuestionBusy = useCallback((qid: string, b: boolean) => {
    setBusy((s) => {
      const n = new Set(s);
      if (b) n.add(qid);
      else n.delete(qid);
      return n;
    });
  }, []);

  const jump = (partId: string, qid: string) => {
    setActivePartId(partId);
    setTimeout(() => document.getElementById(`q-${qid}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };

  if (!part) return <EmptyState title="Bo‘limda savol yo‘q" description="Administratorga murojaat qiling." />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Yuqori panel */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white', skill.grad)}>
              <skill.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-gray-900">{payload.section.title || skill.label}</h1>
              <p className={cn('inline-flex items-center gap-1 text-xs font-medium', syncUi.cls)}>
                {sync.status === 'saving' ? <Loader2 className="h-3 w-3 animate-spin" /> : sync.status === 'error' ? <CloudOff className="h-3 w-3" /> : sync.status === 'saved' ? <CheckCheck className="h-3 w-3" /> : null}
                {syncUi.text}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ExamTimer left={left} />
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={busy.size > 0 || submit.isPending}
              title={busy.size > 0 ? 'Audio yuklanishini kuting' : undefined}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/25 transition hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Topshirish
            </button>
          </div>
        </div>

        {payload.parts.length > 1 && (
          <div className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 pb-2 sm:px-6">
            {payload.parts.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePartId(p.id)}
                className={cn('shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition', p.id === part.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
              >
                Part {i + 1}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_16rem]">
        <main className="min-w-0">
          {payload.section.instructions && partIndex <= 0 && (
            <p className="mb-4 whitespace-pre-wrap rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-900 ring-1 ring-indigo-100">{payload.section.instructions}</p>
          )}

          <PartView key={part.id} attemptId={attemptId} part={part} answers={sync.answers} onAnswer={sync.setAnswer} flags={flags} onFlag={toggleFlag} onBusy={setQuestionBusy} />

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              disabled={partIndex <= 0}
              onClick={() => {
                setActivePartId(payload.parts[partIndex - 1].id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" /> Oldingi part
            </button>
            {partIndex < payload.parts.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  setActivePartId(payload.parts[partIndex + 1].id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95"
              >
                Keyingi part <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={() => setConfirmOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 active:scale-95">
                <Send className="h-4 w-4" /> Topshirish
              </button>
            )}
          </div>
        </main>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SectionNav parts={payload.parts} answers={sync.answers} flags={flags} activePartId={part.id} onJump={jump} />
        </aside>
      </div>

      <ConfirmModal
        open={confirmOpen}
        danger={unanswered > 0}
        title="Bo‘limni topshirasizmi?"
        message={`${unanswered > 0 ? `${unanswered} ta savolga javob berilmagan. ` : 'Barcha savollarga javob berilgan. '}${flags.size > 0 ? `${flags.size} ta savol belgilangan. ` : ''}Topshirgandan keyin bu bo‘limga qaytib bo‘lmaydi.`}
        confirmLabel="Ha, topshirish"
        isPending={submit.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void doSubmit(false)}
      />

      {timeUp && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-slate-900/90 text-white backdrop-blur">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
          <p className="text-xl font-bold">Vaqt tugadi</p>
          <p className="flex items-center gap-2 text-sm text-white/80">
            <Loader2 className="h-4 w-4 animate-spin" /> Javoblaringiz topshirilmoqda...
          </p>
        </div>
      )}
    </div>
  );
}

export default function SectionPage() {
  const { attemptId, sectionId } = useParams<{ attemptId: string; sectionId: string }>();
  const { data, isLoading, isError, error } = useSectionContent(attemptId, sectionId);

  return (
    <RequireRole>
      {isLoading ? (
        <Spinner className="min-h-screen" label="Bo‘lim yuklanmoqda..." />
      ) : isError || !data ? (
        <div className="mx-auto max-w-lg px-4 py-24">
          <EmptyState title="Bo‘limni ochib bo‘lmadi" description={handleApiError(error)} />
          <div className="mt-6 text-center">
            <Link href={`/exam/${attemptId}`} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
              <ArrowLeft className="h-4 w-4" /> Lobiga qaytish
            </Link>
          </div>
        </div>
      ) : (
        <Session key={data.sectionAttemptId} payload={data} />
      )}
    </RequireRole>
  );
}
