'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Pencil, Plus, Save, Trash2, Users, Video } from 'lucide-react';
import AdminShell from '../../../../../components/admin/AdminShell';
import SortableList from '../../../../../components/admin/SortableList';
import ConfirmModal from '../../../../../components/ui/ConfirmModal';
import EmptyState from '../../../../../components/ui/EmptyState';
import Spinner from '../../../../../components/ui/Spinner';
import { useCourse, useGroupOptions, useSetCourseGroups, useUpdateCourse } from '../../../../../features/hooks/useCourse';
import { useDeleteLesson, useReorderLessons, useUpdateLesson } from '../../../../../features/hooks/useLesson';
import { useCreateLessonModal } from '../../../../../features/modals/useCreateLessonModal';
import { useEditCourseModal } from '../../../../../features/modals/useEditCourseModal';
import { handleApiError } from '../../../../../features/api/api';
import type { CourseDetail, CourseLessonItem } from '../../../../../features/types/course';
import { ADMIN_HOME } from '../../../../../lib/config';
import { cn, formatMinutes } from '../../../../../lib/format';

function GroupsPanel({ course }: { course: CourseDetail }) {
  const { data: groups, isLoading } = useGroupOptions();
  const setGroups = useSetCourseGroups();
  const initial = (course.groups ?? []).map((g) => g.group.id);
  const [selected, setSelected] = useState<string[]>(initial);

  useEffect(() => {
    setSelected((course.groups ?? []).map((g) => g.group.id));
  }, [course.groups]);

  const dirty = selected.length !== initial.length || selected.some((id) => !initial.includes(id));
  const toggle = (id: string) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const save = () =>
    setGroups.mutate(
      { id: course.id, groupIds: selected },
      { onSuccess: () => toast.success('Guruhlar saqlandi'), onError: (e) => toast.error(handleApiError(e)) },
    );

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Users className="h-4 w-4 text-indigo-500" /> Qaysi guruhlar ko‘radi
      </h2>
      <p className="mb-4 text-xs text-gray-500">Talaba faqat o‘z guruhiga biriktirilgan, e’lon qilingan kursni ko‘radi.</p>

      {isLoading ? (
        <Spinner />
      ) : !groups || groups.length === 0 ? (
        <p className="text-sm text-gray-400">Guruhlar topilmadi.</p>
      ) : (
        <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {groups.map((g) => (
            <li key={g.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selected.includes(g.id)}
                  onChange={() => toggle(g.id)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700">{g.name}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={save}
        disabled={!dirty || setGroups.isPending}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        {setGroups.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Saqlash ({selected.length})
      </button>
    </section>
  );
}

function CourseManager() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, isError, error } = useCourse(id);
  const reorder = useReorderLessons();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const updateCourse = useUpdateCourse();
  const createLesson = useCreateLessonModal();
  const editCourse = useEditCourseModal();
  const [toDelete, setToDelete] = useState<CourseLessonItem | null>(null);

  if (isLoading) return <Spinner className="py-24" />;
  if (isError || !course) return <EmptyState title="Kurs topilmadi" description={handleApiError(error)} />;

  const onReorder = (lessonIds: string[]) =>
    reorder.mutate({ courseId: course.id, lessonIds }, { onError: (e) => toast.error(handleApiError(e)) });

  const togglePublishLesson = (l: CourseLessonItem) =>
    updateLesson.mutate(
      { id: l.id, input: { isPublished: !l.isPublished } },
      { onError: (e) => toast.error(handleApiError(e)) },
    );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            course.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
          )}
        >
          {course.isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {course.isPublished ? 'E’lon qilingan' : 'Qoralama'}
        </span>
        {course.level && <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{course.level.type}</span>}
        <button
          onClick={() =>
            updateCourse.mutate(
              { id: course.id, input: { isPublished: !course.isPublished } },
              { onError: (e) => toast.error(handleApiError(e)) },
            )
          }
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50"
        >
          {course.isPublished ? 'Qoralamaga o‘tkazish' : 'E’lon qilish'}
        </button>
        <button
          onClick={() => editCourse.open(course)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50"
        >
          <Pencil className="h-3.5 w-3.5" /> Tahrirlash
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* darslar */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Darslar ({course.lessons.length})</h2>
            <button
              onClick={() => createLesson.open(course.id)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 active:scale-95"
            >
              <Plus className="h-4 w-4" /> Dars qo‘shish
            </button>
          </div>

          {course.lessons.length === 0 ? (
            <EmptyState icon={Video} title="Hali dars yo‘q" description="Birinchi darsni qo‘shing, so‘ng video va materiallarni yuklaysiz." />
          ) : (
            <>
              <p className="mb-3 text-xs text-gray-400">Tartibni o‘zgartirish uchun darsni sudrang yoki ↑↓ tugmalaridan foydalaning.</p>
              <SortableList
                items={course.lessons}
                onReorder={onReorder}
                disabled={reorder.isPending}
                renderRow={(l, i) => (
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <Link href={`${ADMIN_HOME}/lessons/${l.id}`} className="block truncate font-medium text-gray-900 hover:text-indigo-600">
                        {l.title}
                      </Link>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                        {l.videoSource !== 'NONE' && <span>Video</span>}
                        {l.durationSec ? <span>{formatMinutes(l.durationSec)}</span> : null}
                        <span className={l.isPublished ? 'text-emerald-600' : 'text-amber-600'}>{l.isPublished ? 'E’lon qilingan' : 'Qoralama'}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => togglePublishLesson(l)}
                      title={l.isPublished ? 'Qoralamaga o‘tkazish' : 'E’lon qilish'}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      {l.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <Link href={`${ADMIN_HOME}/lessons/${l.id}`} title="Tahrirlash" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button onClick={() => setToDelete(l)} title="O‘chirish" className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              />
            </>
          )}
        </section>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <GroupsPanel course={course} />
        </aside>
      </div>

      {createLesson.modal}
      {editCourse.modal}
      <ConfirmModal
        open={!!toDelete}
        title={`“${toDelete?.title}” darsini o‘chirasizmi?`}
        message="Darsning materiallari va vazifalari ham o‘chadi."
        isPending={deleteLesson.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          deleteLesson.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success('Dars o‘chirildi');
              setToDelete(null);
            },
            onError: (e) => toast.error(handleApiError(e)),
          })
        }
      />
    </>
  );
}

export default function AdminCoursePage() {
  const { id } = useParams<{ id: string }>();
  const { data: course } = useCourse(id);
  return (
    <AdminShell title={course?.title ?? 'Kurs'} subtitle="Darslar, tartib va guruhlar" back={{ href: `${ADMIN_HOME}/courses`, label: 'Kurslar' }}>
      <CourseManager />
    </AdminShell>
  );
}
