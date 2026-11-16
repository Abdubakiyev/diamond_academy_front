'use client';

import { useState } from 'react';
import { Bot, Cpu, Eye } from 'lucide-react';
import AdminShell from '../../../../components/admin/AdminShell';
import Segmented from '../../../../components/admin/Segmented';
import Spinner from '../../../../components/ui/Spinner';
import EmptyState from '../../../../components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';
import { useEvaluations, useEvaluationStats } from '../../../../features/hooks/useExamResult';
import { useEvaluationModal } from '../../../../features/modals/useEvaluationModal';
import { handleApiError } from '../../../../features/api/api';
import { EVAL_META, fmtScore } from '../../../../lib/exam-result';
import { SKILL_META } from '../../../../lib/exam-rules';
import { fmtDateTime } from '../../../../lib/payment';
import { cn } from '../../../../lib/format';
import type { EvalStatus } from '../../../../features/types/exam-result';

const LIMIT = 20;
type Skill = 'ALL' | 'WRITING' | 'SPEAKING';

export default function AdminAiPage() {
  const [status, setStatus] = useState<EvalStatus | 'ALL'>('ALL');
  const [skill, setSkill] = useState<Skill>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useEvaluations({
    status: status === 'ALL' ? undefined : status,
    skill: skill === 'ALL' ? undefined : skill,
    page,
    limit: LIMIT,
  });
  const { data: stats } = useEvaluationStats();
  const modal = useEvaluationModal();

  const cards: { key: EvalStatus; label: string }[] = [
    { key: 'PENDING', label: 'Navbatda' },
    { key: 'PROCESSING', label: 'Tekshirilmoqda' },
    { key: 'DONE', label: 'Tayyor' },
    { key: 'FAILED', label: 'Xato' },
  ];

  return (
    <AdminShell title="AI baholash" subtitle="Writing va Speaking javoblarini ko‘rish, bahoni o‘zgartirish va qayta baholash">
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 p-4 text-white shadow-md">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
            <Cpu className="h-3.5 w-3.5" /> Xotiradagi navbat
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{stats?.queueSize ?? '—'}</p>
        </div>
        {cards.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => {
              setStatus(status === c.key ? 'ALL' : c.key);
              setPage(1);
            }}
            className={cn('rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md', status === c.key ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-100')}
          >
            <p className="text-xs font-medium text-gray-500">{c.label}</p>
            <p className={cn('mt-1 text-3xl font-bold tabular-nums', c.key === 'FAILED' && (stats?.byStatus.FAILED ?? 0) > 0 ? 'text-red-600' : 'text-gray-900')}>{stats?.byStatus[c.key] ?? 0}</p>
          </button>
        ))}
      </div>

      <div className="mb-5">
        <Segmented
          value={skill}
          onChange={(v) => {
            setSkill(v);
            setPage(1);
          }}
          options={[
            { value: 'ALL', label: 'Writing + Speaking' },
            { value: 'WRITING', label: 'Writing' },
            { value: 'SPEAKING', label: 'Speaking' },
          ]}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError || !data ? (
        <EmptyState title="Baholashlarni yuklab bo‘lmadi" description={handleApiError(error)} />
      ) : data.items.length === 0 ? (
        <EmptyState icon={Bot} title="Baholash topilmadi" description="Tanlangan filtr bo‘yicha yozuv yo‘q." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full min-w-[48rem] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Talaba</th>
                  <th className="px-4 py-3">Imtihon</th>
                  <th className="px-4 py-3">Bo‘lim</th>
                  <th className="px-4 py-3">Holat</th>
                  <th className="px-4 py-3">Ball</th>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.items.map((e) => {
                  const skillMeta = SKILL_META[e.answer.sectionAttempt.section.skill];
                  const att = e.answer.sectionAttempt.attempt;
                  const finalScore = e.finalScore ?? e.score;
                  return (
                    <tr key={e.id} onClick={() => modal.open(e.id)} className="cursor-pointer hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-medium text-gray-900">{att.user.name}</td>
                      <td className="max-w-[14rem] truncate px-4 py-3 text-gray-700">{att.exam.title}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1', skillMeta.chip)}>
                          <skillMeta.icon className="h-3 w-3" /> {skillMeta.label} #{e.answer.question.number}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', EVAL_META[e.status].cls)}>{EVAL_META[e.status].label}</span>
                        {e.status === 'FAILED' && e.errorMessage && <p className="mt-1 max-w-[14rem] truncate text-[11px] text-red-500" title={e.errorMessage}>{e.errorMessage}</p>}
                      </td>
                      <td className="px-4 py-3 font-bold tabular-nums text-gray-900">
                        {fmtScore(finalScore)}
                        {e.finalScore != null && <span className="ml-1 text-[10px] font-semibold text-indigo-500">tahrirlangan</span>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{fmtDateTime(e.createdAt)}</td>
                      <td className="px-4 py-3 text-right text-indigo-600">
                        <Eye className="inline h-4 w-4" />
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
      {modal.modal}
    </AdminShell>
  );
}
