'use client';

import { useState } from 'react';
import { Gem, Search } from 'lucide-react';
import PageShell from '../../components/PageShell';
import ExamCard from '../../components/ExamCard';
import Segmented from '../../components/admin/Segmented';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { useExams } from '../../features/hooks/useExam';
import { useDebounce } from '../../features/hooks/useDebounce';
import { handleApiError } from '../../features/api/api';
import type { ExamType } from '../../features/types/common';

const LIMIT = 12;

export default function ExamsPage() {
  const [type, setType] = useState<ExamType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);

  const { data, isLoading, isError, error } = useExams({
    type: type === 'ALL' ? undefined : type,
    search: debounced.trim() || undefined,
    page,
    limit: LIMIT,
  });

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-700 to-sky-600 text-white">
        <Gem className="da-float absolute -right-6 top-4 h-48 w-48 rotate-12 text-white/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h1 className="da-fade-up text-3xl font-bold tracking-tight sm:text-4xl">Multilevel imtihonlar</h1>
          <p className="da-fade-up da-delay-1 mt-2 max-w-xl text-white/80">
            Listening, Reading, Writing va Speaking: real imtihon formatida mashq qiling va CEFR darajangizni bilib oling.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Segmented
            value={type}
            onChange={(v) => {
              setType(v);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'Hammasi' },
              { value: 'FULL_MULTILEVEL', label: 'To‘liq Multilevel' },
              { value: 'CUSTOM', label: 'Alohida testlar' },
            ]}
          />
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Imtihon qidirish..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : isError || !data ? (
          <EmptyState title="Imtihonlarni yuklab bo‘lmadi" description={handleApiError(error)} />
        ) : data.items.length === 0 ? (
          <EmptyState title="Imtihon topilmadi" description="Hozircha e’lon qilingan imtihonlar yo‘q yoki qidiruv natija bermadi." />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((e) => (
                <ExamCard key={e.id} exam={e} />
              ))}
            </div>
            <div className="mt-8">
              <Pagination page={page} limit={LIMIT} total={data.total} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
