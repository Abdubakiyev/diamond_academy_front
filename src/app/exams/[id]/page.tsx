'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, ChevronLeft, Clock, CreditCard, ListChecks, Loader2, Lock, PlayCircle, ShieldCheck } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import Spinner from '../../../components/ui/Spinner';
import EmptyState from '../../../components/ui/EmptyState';
import { useExamAccess, usePublicExam, useStartAttempt } from '../../../features/hooks/useExamPayment';
import { useCheckoutModal } from '../../../features/modals/useCheckoutModal';
import { getErrorStatus, handleApiError } from '../../../features/api/api';
import { SKILL_META } from '../../../lib/exam-rules';
import { cn, formatPrice } from '../../../lib/format';
import type { ExamAccessType } from '../../../features/types/exam-payment';

const FREE_TEXT: Record<ExamAccessType, string> = {
  PAID: 'To‘langan',
  FREE_STAFF: 'Xodim sifatida bepul kirish',
  FREE_STUDENT: 'Markaz o‘quvchisi sifatida bepul',
  FREE_EXAM: 'Bu test bepul',
};

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: exam, isLoading, isError, error } = usePublicExam(id);
  const { data: access, refetch } = useExamAccess(id);
  const start = useStartAttempt();
  const checkout = useCheckoutModal();

  const onStart = () =>
    start.mutate(id, {
      onSuccess: ({ attemptId, resumed }) => {
        toast.success(resumed ? 'Tugallanmagan urinish davom ettirilmoqda' : 'Imtihon boshlandi');
        router.push(`/exam/${attemptId}`);
      },
      onError: (e) => {
        if (getErrorStatus(e) === 402) {
          refetch();
          toast.error('Avval to‘lovni amalga oshiring');
        } else toast.error(handleApiError(e));
      },
    });

  if (isLoading) return <PageShell><Spinner className="py-32" /></PageShell>;
  if (isError || !exam) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState title="Imtihon topilmadi" description={handleApiError(error)} />
        </div>
      </PageShell>
    );
  }

  const totalQuestions = exam.sections.reduce((s, x) => s + x.questionCount, 0);
  const pending = !!access?.pendingPaymentId && !access.canStart;

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link href="/exams" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-indigo-600">
          <ChevronLeft className="h-4 w-4" /> Imtihonlar
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          {/* Chap: ma'lumot */}
          <div className="space-y-5">
            <div className="da-fade-up rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 p-6 text-white shadow-lg">
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">{exam.type === 'FULL_MULTILEVEL' ? 'To‘liq Multilevel' : 'Alohida test'}</span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{exam.title}</h1>
              {exam.description && <p className="mt-2 text-white/85">{exam.description}</p>}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/90">
                {exam.durationMinutes && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {exam.durationMinutes} daqiqa
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <ListChecks className="h-4 w-4" /> {totalQuestions} ta savol
                </span>
                {exam.level && <span className="font-semibold">{exam.level.type}</span>}
              </div>
            </div>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-900">Imtihon tarkibi</h2>
              <ol className="space-y-2.5">
                {exam.sections.map((s, i) => {
                  const m = SKILL_META[s.skill];
                  return (
                    <li key={s.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white', m.grad)}>
                        <m.icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {i + 1}. {s.title || m.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {s.partCount} part · {s.questionCount} savol
                          {s.timeLimitSec ? ` · ${Math.round(s.timeLimitSec / 60)} daqiqa` : ''}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-600 shadow-sm">
              <h2 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                <ShieldCheck className="h-4 w-4 text-indigo-500" /> Qoidalar
              </h2>
              <ul className="list-inside list-disc space-y-1">
                <li>Bo‘limlar ketma-ket topshiriladi, har birining alohida vaqti bor.</li>
                <li>Vaqt serverda hisoblanadi: sahifani yangilash yoki yopish taymerni to‘xtatmaydi.</li>
                <li>Javoblaringiz avtomatik saqlanadi. Internet uzilsa, qaytib kirib davom ettirasiz.</li>
                <li>Listening audiosi cheklangan marta eshitiladi, Writing va Speaking AI orqali baholanadi.</li>
              </ul>
            </section>
          </div>

          {/* O'ng: kirish kartasi */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="da-fade-up da-delay-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              {!access ? (
                <Spinner className="py-6" />
              ) : (
                <>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Narxi</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{access.price === 0 ? 'Bepul' : formatPrice(access.price)}</p>

                  {!access.requiresPayment && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> {FREE_TEXT[access.accessType]}
                    </p>
                  )}
                  {access.requiresPayment && access.canStart && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> To‘lov tasdiqlangan
                    </p>
                  )}
                  {pending && (
                    <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-100">
                      To‘lovingiz kutilmoqda. Tasdiqlangach bu sahifa o‘zi yangilanadi. <Link href="/my/payments" className="font-semibold underline">To‘lovlarim</Link>
                    </p>
                  )}

                  {access.canStart ? (
                    <button
                      type="button"
                      onClick={onStart}
                      disabled={start.isPending}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/25 transition hover:brightness-105 active:scale-95 disabled:opacity-60"
                    >
                      {start.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-5 w-5" />} Imtihonni boshlash
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => checkout.open({ id: exam.id, title: exam.title, price: access.price })}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition hover:from-blue-500 hover:to-indigo-500 active:scale-95"
                    >
                      <CreditCard className="h-5 w-5" /> {pending ? 'Qayta to‘lash' : 'To‘lash'}
                    </button>
                  )}

                  {access.requiresPayment && !access.canStart && (
                    <p className="mt-3 flex items-start gap-1.5 text-xs text-gray-500">
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Bitta to‘lov bitta urinish uchun. Markaz o‘quvchilari uchun testlar bepul.
                    </p>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
      {checkout.modal}
    </PageShell>
  );
}
