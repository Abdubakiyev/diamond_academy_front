'use client';

import { useMemo, useState } from 'react';
import { GraduationCap, Search } from 'lucide-react';
import PageShell from '../../components/PageShell';
import CourseCard from '../../components/CourseCard';
import EmptyState from '../../components/ui/EmptyState';
import { useCourses } from '../../features/hooks/useCourse';
import { handleApiError } from '../../features/api/api';
import { useMe } from '../../features/hooks/useAuth';

function CoursesContent() {
  const { data: courses, isLoading, isError, error, refetch } = useCourses();
  const { data: me } = useMe();
  const [search, setSearch] = useState('');
  const [levelId, setLevelId] = useState<string | null>(null);

  const levels = useMemo(() => {
    const map = new Map<string, string>();
    courses?.forEach((c) => c.level && map.set(c.level.id, c.level.type));
    return [...map.entries()].map(([id, type]) => ({ id, type }));
  }, [courses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (courses ?? []).filter(
      (c) => (!levelId || c.levelId === levelId) && (!q || c.title.toLowerCase().includes(q)),
    );
  }, [courses, search, levelId]);

  const chip = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition ${
      active
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
        : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
    }`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* sarlavha */}
      <section className="da-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0f24] via-indigo-950 to-blue-900 p-6 text-white shadow-xl shadow-indigo-900/20 sm:p-9">
        <div className="da-blob pointer-events-none absolute -right-10 -top-16 h-60 w-60 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/15">
              <GraduationCap className="h-3.5 w-3.5" /> {me?.role === 'USER' ? 'Mening kurslarim' : 'Barcha kurslar'}
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Kurslar</h1>
            <p className="mt-1 text-sm text-blue-100/70">Darslarni davom ettiring, materiallar va vazifalarni oching.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/70" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kursni qidirish..."
              className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white outline-none backdrop-blur placeholder:text-blue-100/50 focus:border-blue-300/60 focus:ring-4 focus:ring-blue-400/15"
            />
          </div>
        </div>
      </section>

      {/* level filtri */}
      {levels.length > 1 && (
        <div className="da-fade-up da-delay-1 mt-5 flex flex-wrap gap-2">
          <button type="button" className={chip(levelId === null)} onClick={() => setLevelId(null)}>
            Hammasi
          </button>
          {levels.map((l) => (
            <button key={l.id} type="button" className={chip(levelId === l.id)} onClick={() => setLevelId(l.id)}>
              {l.type}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            title="Kurslarni yuklab bo‘lmadi"
            description={handleApiError(error)}
            action={
              <button onClick={() => refetch()} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                Qayta urinish
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={courses?.length ? 'Hech narsa topilmadi' : 'Hali kurs biriktirilmagan'}
            description={
              courses?.length
                ? 'Qidiruv yoki filtrni o‘zgartirib ko‘ring.'
                : 'Kurslar guruhingizga biriktirilgach shu yerda paydo bo‘ladi. Guruh o‘qituvchisiga murojaat qiling.'
            }
          />
        ) : (
          <div className="da-fade-up da-delay-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <PageShell>
      <CoursesContent />
    </PageShell>
  );
}
