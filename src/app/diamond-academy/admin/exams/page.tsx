'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Archive, ArchiveRestore, Banknote, Clock, Eye, EyeOff, FileText, Gem, Plus, Search, Settings2, Trash2 } from 'lucide-react';
import AdminShell from '../../../../components/admin/AdminShell';
import Segmented from '../../../../components/admin/Segmented';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import EmptyState from '../../../../components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';
import { useDeleteExam, useExamAction, useExams } from '../../../../features/hooks/useExam';
import { useDebounce } from '../../../../features/hooks/useDebounce';
import { useCreateExamModal } from '../../../../features/modals/useCreateExamModal';
import { getErrorProblems, handleApiError } from '../../../../features/api/api';
import type { ExamListItem, ExamListQuery } from '../../../../features/types/exam';
import type { ExamType } from '../../../../features/types/common';
import { SKILL_META } from '../../../../lib/exam-rules';
import { ADMIN_HOME } from '../../../../lib/config';
import { cn, formatPrice } from '../../../../lib/format';

type Tab = 'active' | 'draft' | 'published' | 'archived';
const LIMIT = 12;

const TAB_QUERY: Record<Tab, Partial<ExamListQuery>> = {
  active: {},
  draft: { published: false },
  published: { published: true },
  archived: { archived: true },
};

function ExamCard({ exam, onDelete }: { exam: ExamListItem; onDelete: (e: ExamListItem) => void }) {
  const action = useExamAction();
  const archived = !!exam.archivedAt;
  const full = exam.type === 'FULL_MULTILEVEL';

  const run = (a: 'publish' | 'unpublish' | 'archive' | 'restore', ok: string) =>
    action.mutate(
      { id: exam.id, action: a },
      {
        onSuccess: () => toast.success(ok),
        onError: (e) => {
          const problems = getErrorProblems(e);
          toast.error(problems.length ? `Imtihon tayyor emas: ${problems[0]}${problems.length > 1 ? ` (+${problems.length - 1})` : ''}` : handleApiError(e));
        },
      },
    );

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg">
      <div className={cn('relative flex h-24 items-end justify-between bg-gradient-to-br p-4', full ? 'from-indigo-600 via-blue-600 to-sky-500' : 'from-slate-700 via-slate-800 to-indigo-900')}>
        <Gem className="absolute right-3 top-3 h-14 w-14 rotate-12 text-white/10" />
        <span className="relative rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-indigo-700">{full ? 'Multilevel' : 'Alohida test'}</span>
        <span
          className={cn(
            'relative inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
            archived ? 'bg-gray-200 text-gray-700' : exam.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
          )}
        >
          {archived ? <Archive className="h-3 w-3" /> : exam.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {archived ? 'Arxivda' : exam.isPublished ? 'E’lon qilingan' : 'Qoralama'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-gray-900">{exam.title}</h3>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {exam.sections.map((s) => {
            const m = SKILL_META[s.skill];
            return (
              <span key={s.skill} className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1', m.chip)}>
                <m.icon className="h-3 w-3" /> {m.label}
              </span>
            );
          })}
          {exam.sections.length === 0 && <span className="text-xs text-gray-400">Bo‘limlar yo‘q</span>}
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Banknote className="h-3.5 w-3.5" /> {exam.isFree ? 'Bepul' : formatPrice(exam.price)}
          </span>
          {exam.durationMinutes && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {exam.durationMinutes} daq
            </span>
          )}
          {exam.level && <span className="font-semibold text-indigo-600">{exam.level.type}</span>}
        </p>

        <div className="mt-auto flex items-center gap-1.5 pt-4">
          <Link
            href={`${ADMIN_HOME}/exams/${exam.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
          >
            <Settings2 className="h-4 w-4" /> Konstruktor
          </Link>
          {archived ? (
            <button onClick={() => run('restore', 'Arxivdan chiqarildi')} disabled={action.isPending} title="Arxivdan chiqarish" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50">
              <ArchiveRestore className="h-4 w-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => (exam.isPublished ? run('unpublish', 'Qoralamaga o‘tkazildi') : run('publish', 'E’lon qilindi'))}
                disabled={action.isPending}
                title={exam.isPublished ? 'Qoralamaga o‘tkazish' : 'E’lon qilish'}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                {exam.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button onClick={() => run('archive', 'Arxivlandi')} disabled={action.isPending} title="Arxivlash" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50">
                <Archive className="h-4 w-4" />
              </button>
            </>
          )}
          <button onClick={() => onDelete(exam)} title="O‘chirish" className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AdminExamsPage() {
  const [tab, setTab] = useState<Tab>('active');
  const [type, setType] = useState<ExamType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);

  const { data, isLoading, isError, error } = useExams({
    ...TAB_QUERY[tab],
    type: type === 'ALL' ? undefined : type,
    search: debounced.trim() || undefined,
    page,
    limit: LIMIT,
  });
  const create = useCreateExamModal();
  const remove = useDeleteExam();
  const [toDelete, setToDelete] = useState<ExamListItem | null>(null);

  return (
    <AdminShell
      title="Imtihonlar"
      subtitle="Multilevel va alohida testlar konstruktori"
      actions={
        <button
          onClick={create.open}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:from-blue-500 hover:to-indigo-500 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Yangi imtihon
        </button>
      }
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Segmented
            value={tab}
            onChange={(v) => {
              setTab(v);
              setPage(1);
            }}
            options={[
              { value: 'active', label: 'Faol' },
              { value: 'draft', label: 'Qoralama' },
              { value: 'published', label: 'E’lon qilingan' },
              { value: 'archived', label: 'Arxiv' },
            ]}
          />
          <Segmented
            value={type}
            onChange={(v) => {
              setType(v);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'Hammasi' },
              { value: 'FULL_MULTILEVEL', label: 'Multilevel' },
              { value: 'CUSTOM', label: 'Alohida' },
            ]}
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Qidirish..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-60 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="Imtihonlarni yuklab bo‘lmadi" description={handleApiError(error)} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState icon={FileText} title="Imtihon topilmadi" description="“Yangi imtihon” tugmasi bilan birinchi imtihonni yarating." />
      ) : (
        <>
          <div className="da-fade-up grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((e) => (
              <ExamCard key={e.id} exam={e} onDelete={setToDelete} />
            ))}
          </div>
          <Pagination page={page} limit={LIMIT} total={data.total} onChange={setPage} />
        </>
      )}

      {create.modal}
      <ConfirmModal
        open={!!toDelete}
        title={`“${toDelete?.title}” imtihonini o‘chirasizmi?`}
        message="Barcha bo‘lim, part va savollar o‘chadi. Urinish yoki to‘lov bor imtihonni o‘chirib bo‘lmaydi, uni arxivlang."
        isPending={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          remove.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success('Imtihon o‘chirildi');
              setToDelete(null);
            },
            onError: (e) => {
              toast.error(handleApiError(e));
              setToDelete(null);
            },
          })
        }
      />
    </AdminShell>
  );
}
