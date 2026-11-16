'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Circle,
  FileText,
  Loader2,
  Paperclip,
} from 'lucide-react';
import PageShell from '../../../components/PageShell';
import VideoPlayer from '../../../components/VideoPlayer';
import ResourceList from '../../../components/ResourceList';
import EmptyState from '../../../components/ui/EmptyState';
import { useLesson, useSetLessonProgress } from '../../../features/hooks/useLesson';
import { useCourse } from '../../../features/hooks/useCourse';
import { useMe } from '../../../features/hooks/useAuth';
import { getErrorStatus, handleApiError } from '../../../features/api/api';
import type { LessonAssignmentSummary } from '../../../features/types/lesson';
import { isLessonDone } from '../../../lib/course';
import { cn, formatDateTime, formatMinutes } from '../../../lib/format';

function AssignmentCard({ a }: { a: LessonAssignmentSummary }) {
  const sub = a.submissions?.[0];
  const overdue = !sub && !!a.dueDate && new Date(a.dueDate) < new Date();

  let badge = { text: 'Topshirilmagan', cls: 'bg-gray-100 text-gray-600' };
  if (sub) {
    badge =
      sub.score != null
        ? { text: `${sub.score} / ${a.maxScore} ball`, cls: 'bg-emerald-50 text-emerald-700' }
        : { text: 'Tekshirilmoqda', cls: 'bg-sky-50 text-sky-700' };
  } else if (overdue) {
    badge = { text: 'Muddati o‘tgan', cls: 'bg-red-50 text-red-600' };
  }

  return (
    <Link
      href={`/assignment/${a.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 text-orange-600">
        <ClipboardCheck className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{a.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
          <span>Maksimal: {a.maxScore} ball</span>
          {a.dueDate && (
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3 w-3" /> {formatDateTime(a.dueDate)} gacha
            </span>
          )}
        </p>
      </div>
      <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-medium', badge.cls)}>{badge.text}</span>
      <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
    </Link>
  );
}

function LessonContent() {
  const { id } = useParams<{ id: string }>();
  const { data: lesson, isLoading, isError, error } = useLesson(id);
  const { data: course } = useCourse(lesson?.courseId);
  const { data: me } = useMe();
  const progress = useSetLessonProgress(id, lesson?.courseId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6">
        <div className="aspect-video max-w-3xl animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-8 w-1/2 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (isError || !lesson) {
    const denied = [403, 404].includes(getErrorStatus(error) ?? 0);
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          title={denied ? 'Dars topilmadi yoki ruxsat yo‘q' : 'Darsni yuklab bo‘lmadi'}
          description={denied ? undefined : handleApiError(error)}
          action={
            <Link href="/courses" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
              <ArrowLeft className="h-4 w-4" /> Kurslarga qaytish
            </Link>
          }
        />
      </div>
    );
  }

  const isStudent = me?.role === 'USER';
  const completed = !!lesson.progress?.[0]?.completed;

  const toggle = () =>
    progress.mutate(!completed, {
      onSuccess: () => toast.success(completed ? 'Belgi olib tashlandi' : 'Dars tugatildi!'),
      onError: (e) => toast.error(handleApiError(e)),
    });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Link
        href={`/courses/${lesson.courseId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" /> {course?.title ?? 'Kursga qaytish'}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* ───── Asosiy qism ───── */}
        <div className="da-fade-up min-w-0 space-y-6">
          <VideoPlayer video={lesson.video} title={lesson.title} />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{lesson.order}-dars</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{lesson.title}</h1>
            {lesson.video.durationSec ? (
              <p className="mt-1 text-sm text-gray-500">{formatMinutes(lesson.video.durationSec)}</p>
            ) : null}
          </div>

          {lesson.description && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <FileText className="h-4 w-4 text-indigo-500" /> Dars matni
              </h2>
              <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-gray-700">{lesson.description}</div>
            </section>
          )}

          {lesson.resources.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Paperclip className="h-4 w-4 text-indigo-500" /> Materiallar
              </h2>
              <ResourceList resources={lesson.resources} />
            </section>
          )}

          {lesson.assignments.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <ClipboardCheck className="h-4 w-4 text-indigo-500" /> Vazifalar
              </h2>
              <div className="space-y-2.5">
                {lesson.assignments.map((a) => (
                  <AssignmentCard key={a.id} a={a} />
                ))}
              </div>
            </section>
          )}

          {/* pastki boshqaruv */}
          <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-lg shadow-black/5 backdrop-blur">
            {lesson.prev ? (
              <Link
                href={`/lesson/${lesson.prev.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Oldingi</span>
              </Link>
            ) : (
              <span className="w-10" />
            )}

            {isStudent ? (
              <button
                type="button"
                onClick={toggle}
                disabled={progress.isPending}
                className={cn(
                  'inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md transition active:scale-[0.98] disabled:opacity-60 sm:flex-none sm:px-8',
                  completed
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400',
                )}
              >
                {progress.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                {completed ? 'Tugatilgan' : 'Tugatdim'}
              </button>
            ) : (
              <span className="flex-1" />
            )}

            {lesson.next ? (
              <Link
                href={`/lesson/${lesson.next.id}`}
                className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:from-blue-500 hover:to-indigo-500"
              >
                <span className="hidden sm:inline">Keyingi</span> <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href={`/courses/${lesson.courseId}`}
                className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Kursga qaytish
              </Link>
            )}
          </div>
        </div>

        {/* ───── Yon panel: kurs darslari ───── */}
        <aside className="da-fade-up da-delay-1 lg:sticky lg:top-20 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white px-4 py-3.5">
              <p className="truncate text-sm font-semibold text-gray-900">{course?.title ?? 'Kurs darslari'}</p>
              {course && <p className="text-xs text-gray-500">{course.lessons.length} ta dars</p>}
            </div>
            <ol className="max-h-[28rem] divide-y divide-gray-50 overflow-y-auto">
              {course?.lessons.map((l, i) => {
                const current = l.id === lesson.id;
                const done = isLessonDone(l);
                return (
                  <li key={l.id}>
                    <Link
                      href={`/lesson/${l.id}`}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-sm transition',
                        current ? 'bg-indigo-50/80' : 'hover:bg-gray-50',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          done
                            ? 'bg-emerald-100 text-emerald-600'
                            : current
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-500',
                        )}
                      >
                        {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                      </span>
                      <span className={cn('min-w-0 flex-1 truncate', current ? 'font-semibold text-indigo-900' : 'text-gray-700')}>
                        {l.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function LessonPage() {
  return (
    <PageShell>
      <LessonContent />
    </PageShell>
  );
}
