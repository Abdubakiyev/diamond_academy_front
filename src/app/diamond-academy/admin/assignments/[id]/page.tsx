'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarClock, Inbox, Paperclip, Pencil, Trash2 } from 'lucide-react';
import AdminShell from '../../../../../components/admin/AdminShell';
import Segmented from '../../../../../components/admin/Segmented';
import SubmissionStatusBadge from '../../../../../components/SubmissionStatus';
import ConfirmModal from '../../../../../components/ui/ConfirmModal';
import EmptyState from '../../../../../components/ui/EmptyState';
import Pagination from '../../../../../components/ui/Pagination';
import Spinner from '../../../../../components/ui/Spinner';
import { useAssignment, useDeleteAssignment, useSubmissions } from '../../../../../features/hooks/useAssignment';
import { useAssignmentModal } from '../../../../../features/modals/useCreateAssignmentModal';
import { useGradeSubmissionModal } from '../../../../../features/modals/useGradeSubmissionModal';
import { handleApiError } from '../../../../../features/api/api';
import { isStaffAssignment, type SubmissionStatus } from '../../../../../features/types/assignment';
import { ADMIN_HOME } from '../../../../../lib/config';
import { formatDateTime, formatPhone } from '../../../../../lib/format';

type Filter = 'ALL' | SubmissionStatus;
const LIMIT = 20;

function Manager() {
  const { id } = useParams<{ id: string }>();
  const { data: a, isLoading, isError, error } = useAssignment(id);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [page, setPage] = useState(1);
  const { data: list, isLoading: listLoading } = useSubmissions(id, { status: filter === 'ALL' ? undefined : filter, page, limit: LIMIT });
  const grade = useGradeSubmissionModal();
  const edit = useAssignmentModal();
  const remove = useDeleteAssignment();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <Spinner className="py-24" />;
  if (isError || !a || !isStaffAssignment(a)) return <EmptyState title="Vazifa topilmadi" description={handleApiError(error)} />;

  return (
    <>
      <section className="da-fade-up mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`${ADMIN_HOME}/lessons/${a.lesson.id}`} className="text-xs font-medium text-indigo-600 hover:underline">
              {a.lesson.title}
            </Link>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>Maksimal ball: {a.maxScore}</span>
              {a.dueDate && (
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-4 w-4" /> {formatDateTime(a.dueDate)}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => edit.openEdit(a.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Pencil className="h-4 w-4" /> Tahrirlash
            </button>
            <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" /> O‘chirish
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-sm">
          <div className="rounded-xl bg-indigo-50 p-3">
            <p className="text-2xl font-bold text-indigo-700">{a.stats.total}</p>
            <p className="text-xs text-indigo-600/80">Topshirilgan</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-2xl font-bold text-amber-700">{a.stats.pending}</p>
            <p className="text-xs text-amber-700/80">Tekshirilmagan</p>
          </div>
        </div>
      </section>

      <div className="mb-4">
        <Segmented
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
          options={[
            { value: 'ALL', label: 'Hammasi' },
            { value: 'SUBMITTED', label: 'Kutilmoqda' },
            { value: 'GRADED', label: 'Baholangan' },
            { value: 'RETURNED', label: 'Qaytarilgan' },
          ]}
        />
      </div>

      {listLoading ? (
        <Spinner />
      ) : !list || list.items.length === 0 ? (
        <EmptyState icon={Inbox} title="Ishlar yo‘q" description="Bu filtr bo‘yicha topshirilgan ish topilmadi." />
      ) : (
        <div className="da-fade-up overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <ul className="divide-y divide-gray-50">
            {list.items.map((s) => (
              <li key={s.id}>
                <button onClick={() => grade.open(s.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 text-left transition hover:bg-indigo-50/40">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{s.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatPhone(s.user.phone)} · {formatDateTime(s.submittedAt)}
                    </p>
                  </div>
                  {s._count.files > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <Paperclip className="h-3.5 w-3.5" /> {s._count.files}
                    </span>
                  )}
                  <span className="w-16 text-right text-sm font-bold tabular-nums text-gray-800">
                    {s.score != null ? `${s.score}/${a.maxScore}` : '—'}
                  </span>
                  <SubmissionStatusBadge status={s.status} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {list && <Pagination page={page} limit={LIMIT} total={list.total} onChange={setPage} />}

      {grade.modal}
      {edit.modal}
      <ConfirmModal
        open={confirmDelete}
        title="Vazifani o‘chirasizmi?"
        message="Barcha topshirilgan ishlar va baholar ham o‘chadi."
        isPending={remove.isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          remove.mutate(a.id, {
            onSuccess: () => {
              toast.success('Vazifa o‘chirildi');
              window.location.href = `${ADMIN_HOME}/lessons/${a.lesson.id}`;
            },
            onError: (e) => toast.error(handleApiError(e)),
          })
        }
      />
    </>
  );
}

export default function AdminAssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useAssignment(id);
  return (
    <AdminShell title={data?.title ?? 'Vazifa'} subtitle="Topshirilgan ishlarni ko‘rish va baholash" back={{ href: `${ADMIN_HOME}/assignments`, label: 'Vazifalar' }}>
      <Manager />
    </AdminShell>
  );
}
