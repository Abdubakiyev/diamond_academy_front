'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Clock, ListChecks, Lock, Pencil, Plus, Settings2, Trash2 } from 'lucide-react';
import AdminShell from '../../../../../../../components/admin/AdminShell';
import SortableList from '../../../../../../../components/admin/SortableList';
import ConfirmModal from '../../../../../../../components/ui/ConfirmModal';
import EmptyState from '../../../../../../../components/ui/EmptyState';
import Spinner from '../../../../../../../components/ui/Spinner';
import { useExam } from '../../../../../../../features/hooks/useExam';
import { useDeletePart, useReorderParts } from '../../../../../../../features/hooks/useExamPart';
import { usePartModal } from '../../../../../../../features/modals/usePartModal';
import { useSectionModal } from '../../../../../../../features/modals/useSectionModal';
import { handleApiError } from '../../../../../../../features/api/api';
import type { ExamPartBrief } from '../../../../../../../features/types/exam';
import { FORMAT_LABELS, SKILL_META } from '../../../../../../../lib/exam-rules';
import { ADMIN_HOME } from '../../../../../../../lib/config';
import { cn, formatMinutes } from '../../../../../../../lib/format';

function SectionManager() {
  const { id, sectionId } = useParams<{ id: string; sectionId: string }>();
  const { data: exam, isLoading, isError, error } = useExam(id);
  const reorder = useReorderParts();
  const deletePart = useDeletePart();
  const partModal = usePartModal();
  const sectionModal = useSectionModal();
  const [toDelete, setToDelete] = useState<ExamPartBrief | null>(null);

  if (isLoading) return <Spinner className="py-24" />;
  const section = exam?.sections.find((s) => s.id === sectionId);
  if (isError || !exam || !section) return <EmptyState title="Bo‘lim topilmadi" description={error ? handleApiError(error) : undefined} />;

  const meta = SKILL_META[section.skill];
  const locked = exam.stats.attempts > 0;

  return (
    <>
      {/* bo'lim sozlamalari */}
      <section className={cn('da-fade-up mb-6 overflow-hidden rounded-2xl bg-gradient-to-r p-5 text-white shadow-lg', meta.grad)}>
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
            <meta.icon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">{section.title || meta.label}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-4 text-sm text-white/85">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" /> {section.timeLimitSec ? formatMinutes(section.timeLimitSec) : 'Vaqt cheklovsiz'}
              </span>
              <span>Maks. {section.maxScore} ball</span>
              <span>{section.questionCount} savol</span>
            </p>
            {section.instructions && <p className="mt-2 line-clamp-2 text-sm text-white/80">{section.instructions}</p>}
          </div>
          <button onClick={() => sectionModal.openEdit(section)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium ring-1 ring-white/25 transition hover:bg-white/25">
            <Settings2 className="h-4 w-4" /> Sozlamalar
          </button>
        </div>
      </section>

      {locked && (
        <section className="mb-6 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Imtihonda urinishlar bor, partlarni qo‘shish, o‘chirish va tartiblash mumkin emas.</p>
        </section>
      )}

      {/* partlar */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Partlar ({section.parts.length})</h2>
        {!locked && (
          <button
            onClick={() => partModal.openCreate({ id: section.id, skill: section.skill })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Part qo‘shish
          </button>
        )}
      </div>

      {section.parts.length === 0 ? (
        <EmptyState icon={ListChecks} title="Hali part yo‘q" description="Part qo‘shing, so‘ng unga savollarni kiritasiz (keyingi bo‘lim)." />
      ) : (
        <>
          {!locked && section.parts.length > 1 && <p className="mb-3 text-xs text-gray-400">Tartibni o‘zgartirish uchun partni sudrang yoki ↑↓ tugmalaridan foydalaning.</p>}
          <SortableList
            items={section.parts}
            disabled={locked || reorder.isPending}
            onReorder={(partIds) => reorder.mutate({ sectionId: section.id, partIds }, { onError: (e) => toast.error(handleApiError(e)) })}
            renderRow={(p, i) => (
              <div className="flex items-center gap-3">
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white', meta.grad)}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`${ADMIN_HOME}/exams/${exam.id}/part/${p.id}`} className="block truncate font-medium text-gray-900 hover:text-indigo-600">
                    {p.title || `Part ${i + 1}`}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">{FORMAT_LABELS[p.format]}</span>
                    <span className={p._count.questions === 0 ? 'font-medium text-amber-600' : ''}>{p._count.questions} savol</span>
                    {p.timeLimitSec ? <span>{formatMinutes(p.timeLimitSec)}</span> : null}
                  </p>
                </div>
                <Link
                  href={`${ADMIN_HOME}/exams/${exam.id}/part/${p.id}`}
                  className="hidden rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 sm:inline-flex"
                >
                  Savollar
                </Link>
                {!locked && (
                  <>
                    <button onClick={() => partModal.openEdit({ id: section.id, skill: section.skill }, p.id)} title="Tahrirlash" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setToDelete(p)} title="O‘chirish" className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          />
        </>
      )}

      {partModal.modal}
      {sectionModal.modal}
      <ConfirmModal
        open={!!toDelete}
        title={`“${toDelete?.title || 'Part'}” ni o‘chirasizmi?`}
        message="Partdagi barcha savollar va yuklangan fayllar o‘chadi. Savollar raqami qayta hisoblanadi."
        isPending={deletePart.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          deletePart.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success('Part o‘chirildi');
              setToDelete(null);
            },
            onError: (e) => {
              toast.error(handleApiError(e));
              setToDelete(null);
            },
          })
        }
      />
    </>
  );
}

export default function AdminSectionPage() {
  const { id, sectionId } = useParams<{ id: string; sectionId: string }>();
  const { data: exam } = useExam(id);
  const section = exam?.sections.find((s) => s.id === sectionId);
  return (
    <AdminShell
      title={section ? section.title || SKILL_META[section.skill].label : 'Bo‘lim'}
      subtitle={exam?.title}
      back={{ href: `${ADMIN_HOME}/exams/${id}`, label: 'Imtihon konstruktori' }}
    >
      <SectionManager />
    </AdminShell>
  );
}
