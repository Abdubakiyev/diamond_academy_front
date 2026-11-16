'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { CalendarClock, ClipboardCheck, ExternalLink } from 'lucide-react';
import AdminShell from '../../../../components/admin/AdminShell';
import EmptyState from '../../../../components/ui/EmptyState';
import Spinner from '../../../../components/ui/Spinner';
import { useCourse, useCourses } from '../../../../features/hooks/useCourse';
import { lessonKeys } from '../../../../features/hooks/useLesson';
import { getLesson } from '../../../../features/api/lesson';
import { ADMIN_HOME } from '../../../../lib/config';
import { formatDateTime } from '../../../../lib/format';

export default function AdminAssignmentsPage() {
  const { data: courses, isLoading } = useCourses();
  const [courseId, setCourseId] = useState('');
  const activeId = courseId || courses?.[0]?.id || '';
  const { data: course } = useCourse(activeId || undefined);

  const lessonQueries = useQueries({
    queries: (course?.lessons ?? []).map((l) => ({
      queryKey: lessonKeys.detail(l.id),
      queryFn: () => getLesson(l.id),
    })),
  });

  const loading = lessonQueries.some((q) => q.isLoading);
  const groups = useMemo(
    () => lessonQueries.map((q) => q.data).filter((l): l is NonNullable<typeof l> => !!l && l.assignments.length > 0),
    [lessonQueries],
  );

  return (
    <AdminShell title="Vazifalar" subtitle="Kursni tanlang va topshirilgan ishlarni tekshirishga o‘ting">
      {isLoading ? (
        <Spinner />
      ) : !courses || courses.length === 0 ? (
        <EmptyState title="Hali kurs yo‘q" description="Avval kurs va dars yarating." />
      ) : (
        <>
          <select
            value={activeId}
            onChange={(e) => setCourseId(e.target.value)}
            className="mb-6 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:w-80"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {loading ? (
            <Spinner />
          ) : groups.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title="Bu kursda vazifa yo‘q" description="Vazifani dars muharririda qo‘shasiz." />
          ) : (
            <div className="da-fade-up space-y-6">
              {groups.map((l) => (
                <section key={l.id}>
                  <h2 className="mb-2 text-sm font-semibold text-gray-500">
                    {l.order}-dars · {l.title}
                  </h2>
                  <div className="space-y-2">
                    {l.assignments.map((a) => (
                      <Link
                        key={a.id}
                        href={`${ADMIN_HOME}/assignments/${a.id}`}
                        className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 text-orange-600">
                          <ClipboardCheck className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900">{a.title}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                            <span>{a.maxScore} ball</span>
                            {a.dueDate && (
                              <span className="inline-flex items-center gap-1">
                                <CalendarClock className="h-3 w-3" /> {formatDateTime(a.dueDate)}
                              </span>
                            )}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-300 transition group-hover:text-indigo-500" />
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
