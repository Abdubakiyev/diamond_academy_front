'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, History } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import Segmented from '../../../components/admin/Segmented';
import ScoreBadge from '../../../components/exam/ScoreBadge';
import Spinner from '../../../components/ui/Spinner';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';
import { useMyAttempts } from '../../../features/hooks/useExamAttempt';
import { handleApiError } from '../../../features/api/api';
import { cefrLabel, fmtScore } from '../../../lib/exam-result';
import { STATE_META } from '../../../lib/exam-session';
import { fmtDateTime } from '../../../lib/payment';
import { cn } from '../../../lib/format';
import type { AttemptStatus } from '../../../features/types/common';

const LIMIT = 10;

export default function MyAttemptsPage() {
  const [status, setStatus] = useState<AttemptStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useMyAttempts({ status: status === 'ALL' ? undefined : status, page, limit: LIMIT });

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="da-fade-up text-2xl font-bold tracking-tight text-gray-900">Mening urinishlarim</h1>
        <p className="mt-1 text-sm text-gray-500">Topshirgan imtihonlaringiz va natijalar tarixi</p>

        <div className="mt-6">
          <Segmented
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'Hammasi' },
              { value: 'IN_PROGRESS', label: 'Davom etayotgan' },
              { value: 'GRADING', label: 'Tekshirilmoqda' },
              { value: 'COMPLETED', label: 'Yakunlangan' },
            ]}
          />
        </div>

        <div className="mt-6">
          {isLoading ? (
            <Spinner />
          ) : isError || !data ? (
            <EmptyState title="Urinishlarni yuklab bo‘lmadi" description={handleApiError(error)} />
          ) : data.items.length === 0 ? (
            <EmptyState icon={History} title="Urinish yo‘q" description="Imtihon topshirganingizda shu yerda ko‘rinadi." />
          ) : (
            <>
              <ul className="space-y-3">
                {data.items.map((a) => {
                  const st = STATE_META[a.status];
                  const active = a.status === 'IN_PROGRESS';
                  return (
                    <li key={a.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">{a.exam.title}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{fmtDateTime(a.startedAt)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', st.cls)}>{st.label}</span>
                          <Link
                            href={active ? `/exam/${a.id}` : `/exam/${a.id}/result`}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                          >
                            {active ? 'Davom etish' : 'Natija'} <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>

                      {!active && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-50 pt-3 text-xs">
                          {(
                            [
                              ['L', a.listeningScore],
                              ['R', a.readingScore],
                              ['W', a.writingScore],
                              ['S', a.speakingScore],
                            ] as const
                          ).map(([k, v]) => (
                            <span key={k} className="rounded-lg bg-gray-50 px-2 py-1 font-medium text-gray-600">
                              {k}: <b className="tabular-nums text-gray-900">{fmtScore(v)}</b>
                            </span>
                          ))}
                          <span className="ml-auto flex items-center gap-2">
                            <span className="font-semibold text-gray-500">Jami {fmtScore(a.totalScore)}/75</span>
                            <ScoreBadge level={cefrLabel(a.cefrLevel)} size="sm" />
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6">
                <Pagination page={page} limit={LIMIT} total={data.total} onChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
