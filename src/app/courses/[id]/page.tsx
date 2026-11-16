'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock, EyeOff, Gem, PlayCircle, Trophy, Video } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import EmptyState from '../../../components/ui/EmptyState';
import { useCourse } from '../../../features/hooks/useCourse';
import { getErrorStatus, handleApiError } from '../../../features/api/api';
import { courseProgress, gradientFor, isLessonDone } from '../../../lib/course';
import { cn, formatMinutes } from '../../../lib/format';

function CourseContent() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, isError, error } = useCourse(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-8 sm:px-6">
        <div className="h-56 animate-pulse rounded-3xl bg-gray-100" />
        <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (isError || !course) {
    const forbidden = getErrorStatus(error) === 403 || getErrorStatus(error) === 404;
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          title={forbidden ? 'Kurs topilmadi yoki ruxsat yo‘q' : 'Kursni yuklab bo‘lmadi'}
          description={forbidden ? 'Bu kurs sizning guruhingizga biriktirilmagan bo‘lishi mumkin.' : handleApiError(error)}
          action={
            <Link href="/courses" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
              <ArrowLeft className="h-4 w-4" /> Kurslarga qaytish
            </Link>
          }
        />
      </div>
    );
  }

  const progress = courseProgress(course.lessons);
  const totalSec = course.lessons.reduce((s, l) => s + (l.durationSec ?? 0), 0);
  const studentView = course.lessons.some((l) => l.progress !== undefined);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/courses" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" /> Kurslar
      </Link>

      {/* hero */}
      <section className="da-fade-up relative overflow-hidden rounded-3xl text-white shadow-xl shadow-indigo-900/20">
        {course.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientFor(course.id)}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f24]/95 via-[#0a0f24]/70 to-[#0a0f24]/30" />
        <Gem className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rotate-12 text-white/10" />

        <div className="relative flex min-h-[15rem] flex-col justify-end gap-4 p-6 sm:p-9">
          <div className="flex flex-wrap gap-2">
            {course.level && (
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-indigo-700">{course.level.type}</span>
            )}
            {!course.isPublished && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                <EyeOff className="h-3 w-3" /> Qoralama
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{course.title}</h1>
          {course.description && <p className="max-w-2xl text-sm leading-relaxed text-blue-100/80">{course.description}</p>}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-blue-100/80">
            <span className="inline-flex items-center gap-1.5">
              <Video className="h-4 w-4" /> {course.lessons.length} ta dars
            </span>
            {totalSec > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {formatMinutes(totalSec)}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* progress */}
      {studentView && course.lessons.length > 0 && (
        <section className="da-fade-up da-delay-1 mt-5 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 font-semibold text-gray-800">
                {progress.finished && <Trophy className="h-4 w-4 text-amber-500" />}
                {progress.finished ? 'Kurs tugatildi!' : 'Sizning progressingiz'}
              </span>
              <span className="tabular-nums text-gray-500">
                {progress.done}/{progress.total} · {progress.percent}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
          {progress.nextLesson && (
            <Link
              href={`/lesson/${progress.nextLesson.id}`}
              className="da-shimmer inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-500 hover:to-indigo-500 active:scale-95"
            >
              <PlayCircle className="h-4 w-4" />
              {progress.done === 0 ? 'Boshlash' : progress.finished ? 'Qayta ko‘rish' : 'Davom ettirish'}
            </Link>
          )}
        </section>
      )}

      {/* darslar */}
      <section className="da-fade-up da-delay-2 mt-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Darslar</h2>
        {course.lessons.length === 0 ? (
          <EmptyState icon={Video} title="Hali darslar qo‘shilmagan" description="Darslar paydo bo‘lishi bilan shu yerda ko‘rasiz." />
        ) : (
          <ol className="space-y-2.5">
            {course.lessons.map((l, i) => {
              const done = isLessonDone(l);
              return (
                <li key={l.id}>
                  <Link
                    href={`/lesson/${l.id}`}
                    className={cn(
                      'group flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                      done ? 'border-emerald-100' : 'border-gray-100 hover:border-indigo-200',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition',
                        done
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-indigo-600 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white',
                      )}
                    >
                      {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">{l.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                        {l.videoSource !== 'NONE' && (
                          <span className="inline-flex items-center gap-1">
                            <Video className="h-3 w-3" /> Video
                          </span>
                        )}
                        {l.durationSec ? <span>{formatMinutes(l.durationSec)}</span> : null}
                        {!l.isPublished && <span className="font-semibold text-amber-600">Qoralama</span>}
                      </p>
                    </div>

                    {!done && studentView && <Circle className="hidden h-4 w-4 text-gray-200 sm:block" />}
                    <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

export default function CoursePage() {
  return (
    <PageShell>
      <CourseContent />
    </PageShell>
  );
}
