'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BookOpen, Eye, EyeOff, Gem, Pencil, Plus, Search, Settings2, Trash2, Users } from 'lucide-react';
import AdminShell from '../../../../components/admin/AdminShell';
import Segmented from '../../../../components/admin/Segmented';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import EmptyState from '../../../../components/ui/EmptyState';
import { useCourses, useDeleteCourse, useUpdateCourse } from '../../../../features/hooks/useCourse';
import { useCreateCourseModal } from '../../../../features/modals/useCreateCourseModal';
import { useEditCourseModal } from '../../../../features/modals/useEditCourseModal';
import { handleApiError } from '../../../../features/api/api';
import type { CourseListItem } from '../../../../features/types/course';
import { ADMIN_HOME } from '../../../../lib/config';
import { gradientFor } from '../../../../lib/course';
import { cn } from '../../../../lib/format';

type Filter = 'all' | 'published' | 'draft';

export default function AdminCoursesPage() {
  const { data: courses, isLoading, isError, error } = useCourses();
  const update = useUpdateCourse();
  const remove = useDeleteCourse();
  const create = useCreateCourseModal();
  const edit = useEditCourseModal();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [toDelete, setToDelete] = useState<CourseListItem | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (courses ?? []).filter(
      (c) =>
        (filter === 'all' || (filter === 'published' ? c.isPublished : !c.isPublished)) &&
        (!q || c.title.toLowerCase().includes(q)),
    );
  }, [courses, search, filter]);

  const togglePublish = (c: CourseListItem) =>
    update.mutate(
      { id: c.id, input: { isPublished: !c.isPublished } },
      {
        onSuccess: () => toast.success(c.isPublished ? 'Qoralamaga o‘tkazildi' : 'E’lon qilindi'),
        onError: (e) => toast.error(handleApiError(e)),
      },
    );

  return (
    <AdminShell
      title="Kurslar"
      subtitle="Kurslar, darslar va guruhlarga biriktirish"
      actions={
        <button
          onClick={create.open}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:from-blue-500 hover:to-indigo-500 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Yangi kurs
        </button>
      }
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Hammasi' },
            { value: 'published', label: 'E’lon qilingan' },
            { value: 'draft', label: 'Qoralama' },
          ]}
        />
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="Kurslarni yuklab bo‘lmadi" description={handleApiError(error)} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={courses?.length ? 'Hech narsa topilmadi' : 'Hali kurs yo‘q'}
          description="“Yangi kurs” tugmasi bilan birinchi kursni yarating."
        />
      ) : (
        <div className="da-fade-up grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <article key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg">
              <Link href={`${ADMIN_HOME}/courses/${c.id}`} className="relative block aspect-[16/8] overflow-hidden">
                {c.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientFor(c.id)}`}>
                    <Gem className="h-10 w-10 text-white/30" />
                  </div>
                )}
                <span
                  className={cn(
                    'absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm',
                    c.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
                  )}
                >
                  {c.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {c.isPublished ? 'E’lon qilingan' : 'Qoralama'}
                </span>
                {c.level && <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-indigo-700">{c.level.type}</span>}
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 font-semibold text-gray-900">{c.title}</h3>
                <p className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" /> {c._count.lessons} dars
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {c.groups?.length ?? 0} guruh
                  </span>
                </p>
                {c.groups && c.groups.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.groups.slice(0, 3).map((g) => (
                      <span key={g.group.id} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                        {g.group.name}
                      </span>
                    ))}
                    {c.groups.length > 3 && <span className="text-[11px] text-gray-400">+{c.groups.length - 3}</span>}
                  </div>
                )}

                <div className="mt-auto flex items-center gap-1.5 pt-4">
                  <Link
                    href={`${ADMIN_HOME}/courses/${c.id}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <Settings2 className="h-4 w-4" /> Boshqarish
                  </Link>
                  <button
                    onClick={() => togglePublish(c)}
                    disabled={update.isPending}
                    title={c.isPublished ? 'Qoralamaga o‘tkazish' : 'E’lon qilish'}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
                  >
                    {c.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => edit.open(c)} title="Tahrirlash" className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setToDelete(c)} title="O‘chirish" className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {create.modal}
      {edit.modal}
      <ConfirmModal
        open={!!toDelete}
        title={`“${toDelete?.title}” kursini o‘chirasizmi?`}
        message="Kursning barcha darslari, vazifalari va talabalar topshirgan ishlar ham o‘chadi. Bu amalni qaytarib bo‘lmaydi."
        confirmLabel="Ha, o‘chirish"
        isPending={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          remove.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success('Kurs o‘chirildi');
              setToDelete(null);
            },
            onError: (e) => toast.error(handleApiError(e)),
          })
        }
      />
    </AdminShell>
  );
}
