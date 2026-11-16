'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClipboardList, ExternalLink } from 'lucide-react';
import AdminShell from '../../../../components/admin/AdminShell';
import Segmented from '../../../../components/admin/Segmented';
import ScoreBadge from '../../../../components/exam/ScoreBadge';
import Spinner from '../../../../components/ui/Spinner';
import EmptyState from '../../../../components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';
import { useAdminAttempts } from '../../../../features/hooks/useExamResult';
import { useExams } from '../../../../features/hooks/useExam';
import { handleApiError } from '../../../../features/api/api';
import { cefrLabel, fmtScore } from '../../../../lib/exam-result';
import { STATE_META } from '../../../../lib/exam-session';
import { fmtDateTime } from '../../../../lib/payment';
import { cn } from '../../../../lib/format';
import type { AttemptStatus } from '../../../../features/types/common';

const LIMIT = 20;

export default function AdminAttemptsPage() {
  const [status, setStatus] = useState<AttemptStatus | 'ALL'>('ALL');
  const [examId, setExamId] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useAdminAttempts({ status: status === 'ALL' ? undefined : status, examId: examId || undefined, page, limit: LIMIT });
  const { data: exams } = useExams({ limit: 50 });

  return (
    <AdminShell title="Urinishlar" subtitle="Talabalarning imtihon urinishlari va natijalari">
      <div className="mb-5 flex flex-wrap items-center gap-3">
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
        <select
          value={examId}
          onChange={(e) => {
            setExamId(e.target.value);
            setPage(1);
          }}
          aria-label="Imtihon bo‘yicha filtr"
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Barcha imtihonlar</option>
          {exams?.items.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError || !data ? (
        <EmptyState title="Urinishlarni yuklab bo‘lmadi" description={handleApiError(error)} />
      ) : data.items.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Urinish topilmadi" description="Tanlangan filtr bo‘yicha urinishlar yo‘q." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full min-w-[60rem] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Talaba</th>
                  <th className="px-4 py-3">Imtihon</th>
                  <th className="px-4 py-3">Holat</th>
                  <th className="px-3 py-3 text-center">L</th>
                  <th className="px-3 py-3 text-center">R</th>
                  <th className="px-3 py-3 text-center">W</th>
                  <th className="px-3 py-3 text-center">S</th>
                  <th className="px-4 py-3">Jami</th>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.items.map((a) => {
                  const st = STATE_META[a.status];
                  return (
                    <tr key={a.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{a.user.name}</p>
                        <p className="text-xs text-gray-500">{a.user.phone}</p>
                      </td>
                      <td className="max-w-[14rem] truncate px-4 py-3 text-gray-700">{a.exam.title}</td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', st.cls)}>{st.label}</span>
                      </td>
                      {[a.listeningScore, a.readingScore, a.writingScore, a.speakingScore].map((v, i) => (
                        <td key={i} className="px-3 py-3 text-center tabular-nums text-gray-700">
                          {fmtScore(v)}
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="mr-2 font-bold tabular-nums text-gray-900">{fmtScore(a.totalScore)}</span>
                        <ScoreBadge level={cefrLabel(a.cefrLevel)} size="sm" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{fmtDateTime(a.startedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/exam/${a.id}/result`} title="Natijani ochish" className="inline-flex rounded-lg p-2 text-indigo-600 hover:bg-indigo-50">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <Pagination page={page} limit={LIMIT} total={data.total} onChange={setPage} />
          </div>
        </>
      )}
    </AdminShell>
  );
}
