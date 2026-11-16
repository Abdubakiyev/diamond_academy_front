'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Layers3,
  Lock,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import AdminShell from '../../../../../components/admin/AdminShell';
import ConfirmModal from '../../../../../components/ui/ConfirmModal';
import EmptyState from '../../../../../components/ui/EmptyState';
import Spinner from '../../../../../components/ui/Spinner';
import { useDeleteExam, useDeleteSection, useExam, useExamAction } from '../../../../../features/hooks/useExam';
import { useEditExamModal } from '../../../../../features/modals/useEditExamModal';
import { useSectionModal } from '../../../../../features/modals/useSectionModal';
import { getErrorProblems, handleApiError } from '../../../../../features/api/api';
import type { ExamSection } from '../../../../../features/types/exam';
import { SKILL_META } from '../../../../../lib/exam-rules';
import { ADMIN_HOME } from '../../../../../lib/config';
import { cn, formatMinutes, formatPrice } from '../../../../../lib/format';

function Builder() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: exam, isLoading, isError, error } = useExam(id);
  const action = useExamAction();
  const deleteExam = useDeleteExam();
  const deleteSection = useDeleteSection();
  const editExam = useEditExamModal();
  const sectionModal = useSectionModal();

  const [problems, setProblems] = useState<string[]>([]);
  const [confirmExam, setConfirmExam] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<ExamSection | null>(null);

  if (isLoading) return <Spinner className="py-24" />;
  if (isError || !exam) return <EmptyState title="Imtihon topilmadi" description={handleApiError(error)} />;

  const archived = !!exam.archivedAt;
  const locked = exam.stats.attempts > 0;
  const custom = exam.type === 'CUSTOM';

  const run = (a: 'publish' | 'unpublish' | 'archive' | 'restore', ok: string) =>
    action.mutate(
      { id: exam.id, action: a },
      {
        onSuccess: () => {
          setProblems([]);
          toast.success(ok);
        },
        onError: (e) => {
          const list = getErrorProblems(e);
          if (list.length) {
            setProblems(list);
            toast.error('Imtihon hali tayyor emas');
          } else toast.error(handleApiError(e));
        },
      },
    );

  const btn = 'inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50';

  return (
    <>
      {/* holat va amallar */}
      <div className="da-fade-up mb-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{custom ? 'Alohida test' : 'Multilevel'}</span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            archived ? 'bg-gray-200 text-gray-700' : exam.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
          )}
        >
          {archived ? 'Arxivda' : exam.isPublished ? 'E’lon qilingan' : 'Qoralama'}
        </span>

        <div className="ml-auto flex flex-wrap gap-2">
          <button className={btn} onClick={() => editExam.open(exam)}>
            <Pencil className="h-4 w-4" /> Tahrirlash
          </button>
          {archived ? (
            <button className={btn} disabled={action.isPending} onClick={() => run('restore', 'Arxivdan chiqarildi')}>
              <ArchiveRestore className="h-4 w-4" /> Arxivdan chiqarish
            </button>
          ) : (
            <>
              {exam.isPublished ? (
                <button className={btn} disabled={action.isPending} onClick={() => run('unpublish', 'Qoralamaga o‘tkazildi')}>
                  <EyeOff className="h-4 w-4" /> Qoralamaga
                </button>
              ) : (
                <button
                  disabled={action.isPending}
                  onClick={() => run('publish', 'Imtihon e’lon qilindi')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-teal-400 active:scale-95 disabled:opacity-50"
                >
                  <Eye className="h-4 w-4" /> E’lon qilish
                </button>
              )}
              <button className={btn} disabled={action.isPending} onClick={() => run('archive', 'Arxivlandi')}>
                <Archive className="h-4 w-4" /> Arxivlash
              </button>
            </>
          )}
          <button className={`${btn} text-red-600 hover:bg-red-50`} onClick={() => setConfirmExam(true)}>
            <Trash2 className="h-4 w-4" /> O‘chirish
          </button>
        </div>
      </div>

      {/* e'lon qilishdagi muammolar */}
      {problems.length > 0 && (
        <section className="da-fade-up mb-6 rounded-2xl border border-red-100 bg-red-50 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-red-800">
            <AlertTriangle className="h-4 w-4" /> E’lon qilishdan oldin tuzating ({problems.length})
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      )}

      {locked && (
        <section className="mb-6 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Bu imtihonda {exam.stats.attempts} ta urinish bor, shuning uchun tuzilma (bo‘lim, part, tartib) o‘zgartirilmaydi. Yangi versiya kerak bo‘lsa, imtihonni arxivlab, yangisini yarating.
          </p>
        </section>
      )}

      {/* umumiy ma'lumot */}
      <section className="da-fade-up da-delay-1 mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Banknote, label: 'Narx', value: exam.isFree ? 'Bepul' : formatPrice(exam.price), tone: 'bg-emerald-50 text-emerald-600' },
          { icon: Clock, label: custom ? 'Umumiy vaqt' : 'Jami bo‘lim vaqti', value: custom ? (exam.durationMinutes ? `${exam.durationMinutes} daq` : '—') : formatMinutes(exam.sections.reduce((s, x) => s + (x.timeLimitSec ?? 0), 0)) || '—', tone: 'bg-sky-50 text-sky-600' },
          { icon: Users, label: 'Urinishlar', value: String(exam.stats.attempts), tone: 'bg-indigo-50 text-indigo-600' },
          { icon: Layers3, label: 'To‘lovlar', value: String(exam.stats.payments), tone: 'bg-amber-50 text-amber-600' },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', c.tone)}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold tracking-tight text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
          </div>
        ))}
      </section>

      {exam.description && <p className="mb-8 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{exam.description}</p>}

      {/* bo'limlar */}
      <section className="da-fade-up da-delay-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Bo‘limlar</h2>
          {custom && !locked && (
            <button
              onClick={() => sectionModal.openCreate(exam.id, exam.sections.map((s) => s.skill))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 active:scale-95"
            >
              <Plus className="h-4 w-4" /> Bo‘lim qo‘shish
            </button>
          )}
        </div>

        {exam.sections.length === 0 ? (
          <EmptyState icon={Layers3} title="Hali bo‘lim yo‘q" description="Alohida testga kamida bitta bo‘lim qo‘shing." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {exam.sections.map((s) => {
              const m = SKILL_META[s.skill];
              const noParts = s.parts.length === 0;
              const noQuestions = !noParts && s.questionCount === 0;
              return (
                <article key={s.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg">
                  <div className={cn('flex items-center gap-3 bg-gradient-to-r p-4 text-white', m.grad)}>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
                      <m.icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{s.title || m.label}</h3>
                      <p className="text-xs text-white/80">
                        {s.timeLimitSec ? formatMinutes(s.timeLimitSec) : 'Vaqt cheklovsiz'} · maks. {s.maxScore} ball
                      </p>
                    </div>
                    {custom && !locked && (
                      <button onClick={() => setSectionToDelete(s)} title="Bo‘limni o‘chirish" className="rounded-lg p-2 text-white/70 hover:bg-white/15 hover:text-white">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center gap-5 text-sm text-gray-600">
                      <span>
                        <b className="text-gray-900">{s.parts.length}</b> part
                      </span>
                      <span>
                        <b className="text-gray-900">{s.questionCount}</b> savol
                      </span>
                      {!noParts && !noQuestions && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />}
                    </div>

                    {noParts && <p className="mt-2 text-xs font-medium text-amber-600">Part qo‘shilmagan</p>}
                    {noQuestions && <p className="mt-2 text-xs font-medium text-amber-600">Savollar qo‘shilmagan</p>}

                    <div className="mt-auto flex gap-2 pt-4">
                      <Link
                        href={`${ADMIN_HOME}/exams/${exam.id}/section/${s.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                      >
                        Partlar <ArrowRight className="h-4 w-4" />
                      </Link>
                      <button onClick={() => sectionModal.openEdit(s)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50" aria-label="Sozlamalar">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {editExam.modal}
      {sectionModal.modal}

      <ConfirmModal
        open={confirmExam}
        title="Imtihonni o‘chirasizmi?"
        message="Barcha bo‘lim, part va savollar o‘chadi. Urinish yoki to‘lov bor bo‘lsa, o‘chirib bo‘lmaydi (arxivlang)."
        isPending={deleteExam.isPending}
        onClose={() => setConfirmExam(false)}
        onConfirm={() =>
          deleteExam.mutate(exam.id, {
            onSuccess: () => {
              toast.success('Imtihon o‘chirildi');
              router.replace(`${ADMIN_HOME}/exams`);
            },
            onError: (e) => {
              toast.error(handleApiError(e));
              setConfirmExam(false);
            },
          })
        }
      />
      <ConfirmModal
        open={!!sectionToDelete}
        title={`“${sectionToDelete ? sectionToDelete.title || SKILL_META[sectionToDelete.skill].label : ''}” bo‘limini o‘chirasizmi?`}
        message="Bo‘limdagi barcha part, savol va fayllar o‘chadi."
        isPending={deleteSection.isPending}
        onClose={() => setSectionToDelete(null)}
        onConfirm={() =>
          sectionToDelete &&
          deleteSection.mutate(sectionToDelete.id, {
            onSuccess: () => {
              toast.success('Bo‘lim o‘chirildi');
              setSectionToDelete(null);
            },
            onError: (e) => {
              toast.error(handleApiError(e));
              setSectionToDelete(null);
            },
          })
        }
      />
    </>
  );
}

export default function AdminExamPage() {
  const { id } = useParams<{ id: string }>();
  const { data: exam } = useExam(id);
  return (
    <AdminShell title={exam?.title ?? 'Imtihon'} subtitle={exam?.level ? `Level: ${exam.level.type}` : undefined} back={{ href: `${ADMIN_HOME}/exams`, label: 'Imtihonlar' }}>
      <Builder />
    </AdminShell>
  );
}
