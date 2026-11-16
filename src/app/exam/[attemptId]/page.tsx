'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2, Clock, Flag, Hourglass, Loader2, PlayCircle } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import ExamTimer from '../../../components/exam/ExamTimer';
import Spinner from '../../../components/ui/Spinner';
import EmptyState from '../../../components/ui/EmptyState';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { useFinishAttempt, useOverview, useStartSection } from '../../../features/hooks/useExamSession';
import { useCountdown } from '../../../features/hooks/useCountdown';
import { handleApiError } from '../../../features/api/api';
import { SKILL_META } from '../../../lib/exam-rules';
import { STATE_META, formatClock } from '../../../lib/exam-session';
import { cn } from '../../../lib/format';
import type { AttemptOverview, LobbySection } from '../../../features/types/exam-session';

function Lobby({ data }: { data: AttemptOverview }) {
  const router = useRouter();
  const start = useStartSection();
  const finish = useFinishAttempt();
  const [toStart, setToStart] = useState<LobbySection | null>(null);
  const [confirmFinish, setConfirmFinish] = useState(false);

  const active = data.status === 'IN_PROGRESS';
  const deadlineSec = data.deadline ? (new Date(data.deadline).getTime() - new Date(data.serverTime).getTime()) / 1000 : null;
  const { left, sync } = useCountdown(deadlineSec);
  useEffect(() => sync(deadlineSec), [deadlineSec, sync]);

  const go = (sectionId: string) => router.push(`/exam/${data.attemptId}/section/${sectionId}`);

  const begin = (s: LobbySection) =>
    start.mutate(
      { attemptId: data.attemptId, sectionId: s.sectionId },
      {
        onSuccess: () => go(s.sectionId),
        onError: (e) => {
          toast.error(handleApiError(e));
          setToStart(null);
        },
      },
    );

  const allDone = data.sections.every((s) => s.state !== 'NOT_STARTED' && s.state !== 'IN_PROGRESS');

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="da-fade-up rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Imtihon</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{data.exam.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {left != null && active && (
            <span className="inline-flex items-center gap-2 text-sm text-white/90">
              Umumiy vaqt: <ExamTimer left={left} className="!bg-white/15 !text-white !ring-white/20" />
            </span>
          )}
          {!active && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
              {data.status === 'GRADING' ? <Hourglass className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />} {STATE_META[data.status].label}
            </span>
          )}
        </div>
      </div>

      {!active && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-600">
            {data.status === 'GRADING' ? 'Writing va Speaking AI tomonidan tekshirilmoqda. Natija tayyor bo‘lganda ko‘rasiz.' : 'Imtihon yakunlangan.'}
          </p>
          <Link href={`/exam/${data.attemptId}/result`} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            Natijani ko‘rish <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <ol className="mt-6 space-y-3">
        {data.sections.map((s, i) => {
          const m = SKILL_META[s.skill];
          const st = STATE_META[s.state];
          const running = s.state === 'IN_PROGRESS';
          return (
            <li key={s.sectionId} className={cn('flex flex-wrap items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm', running ? 'border-blue-200 ring-2 ring-blue-100' : 'border-gray-100')}>
              <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white', m.grad)}>
                <m.icon className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">
                  {i + 1}. {s.title || m.label}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                  {s.timeLimitSec && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {Math.round(s.timeLimitSec / 60)} daqiqa
                    </span>
                  )}
                  {running && s.remainingSec != null && <span className="font-semibold text-blue-700">qoldi {formatClock(s.remainingSec)}</span>}
                </p>
              </div>
              <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', st.cls)}>{st.label}</span>

              {running && (
                <button type="button" onClick={() => go(s.sectionId)} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 hover:bg-blue-500 active:scale-95">
                  <PlayCircle className="h-4 w-4" /> Davom etish
                </button>
              )}
              {s.state === 'NOT_STARTED' && active && (
                <button
                  type="button"
                  disabled={!s.canStart}
                  onClick={() => setToStart(s)}
                  title={s.canStart ? undefined : 'Avval oldingi bo‘limni topshiring'}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  <PlayCircle className="h-4 w-4" /> Boshlash
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {active && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-500">{allDone ? 'Barcha bo‘limlar topshirilgan. Imtihonni yakunlang.' : 'Bo‘limlar ketma-ket topshiriladi. Boshlangan bo‘lim taymerini to‘xtatib bo‘lmaydi.'}</p>
          <button type="button" onClick={() => setConfirmFinish(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 active:scale-95">
            <Flag className="h-4 w-4" /> Imtihonni yakunlash
          </button>
        </div>
      )}

      <ConfirmModal
        open={!!toStart}
        danger={false}
        title={`${toStart ? SKILL_META[toStart.skill].label : ''} bo‘limini boshlaysizmi?`}
        message={`Taymer darhol ishga tushadi${toStart?.timeLimitSec ? ` (${Math.round(toStart.timeLimitSec / 60)} daqiqa)` : ''} va to‘xtatilmaydi. Sahifani yopsangiz ham vaqt ketaveradi. Tayyor bo‘lsangiz davom eting.`}
        confirmLabel="Ha, boshlash"
        isPending={start.isPending}
        onClose={() => setToStart(null)}
        onConfirm={() => toStart && begin(toStart)}
      />

      <ConfirmModal
        open={confirmFinish}
        title="Imtihonni yakunlaysizmi?"
        message="Boshlanmagan bo‘limlar 0 ball bilan yopiladi, davom etayotgan bo‘lim topshiriladi. Bu amalni qaytarib bo‘lmaydi."
        confirmLabel="Ha, yakunlash"
        isPending={finish.isPending}
        onClose={() => setConfirmFinish(false)}
        onConfirm={() =>
          finish.mutate(data.attemptId, {
            onSuccess: () => router.replace(`/exam/${data.attemptId}/result`),
            onError: (e) => {
              toast.error(handleApiError(e));
              setConfirmFinish(false);
            },
          })
        }
      />
      {start.isPending && <Loader2 className="sr-only" />}
    </div>
  );
}

export default function ExamLobbyPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { data, isLoading, isError, error } = useOverview(attemptId);

  return (
    <PageShell>
      {isLoading ? (
        <Spinner className="py-32" />
      ) : isError || !data ? (
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState title="Urinish topilmadi" description={handleApiError(error)} />
        </div>
      ) : (
        <Lobby key={data.attemptId} data={data} />
      )}
    </PageShell>
  );
}
