'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ListChecks, Sparkles, Trophy } from 'lucide-react';
import PageShell from '../../../../components/PageShell';
import Segmented from '../../../../components/admin/Segmented';
import ResultSummary from '../../../../components/exam/ResultSummary';
import ReviewList from '../../../../components/exam/ReviewList';
import AiFeedbackCard from '../../../../components/exam/AiFeedbackCard';
import Spinner from '../../../../components/ui/Spinner';
import EmptyState from '../../../../components/ui/EmptyState';
import { useResult } from '../../../../features/hooks/useExamResult';
import { getErrorStatus, handleApiError } from '../../../../features/api/api';

type Tab = 'SUMMARY' | 'REVIEW' | 'AI';

export default function ResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { data, isLoading, isError, error } = useResult(attemptId);
  const [tab, setTab] = useState<Tab>('SUMMARY');

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link href="/my/attempts" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Urinishlarim
        </Link>

        {isLoading ? (
          <Spinner className="py-32" />
        ) : isError || !data ? (
          <div className="py-12">
            <EmptyState
              title={getErrorStatus(error) === 409 ? 'Imtihon hali yakunlanmagan' : 'Natijani yuklab bo‘lmadi'}
              description={handleApiError(error)}
            />
            {getErrorStatus(error) === 409 && (
              <div className="mt-6 text-center">
                <Link href={`/exam/${attemptId}`} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
                  Imtihonga qaytish
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <ResultSummary result={data} />

            <div className="mb-5 mt-8">
              <Segmented
                value={tab}
                onChange={setTab}
                options={[
                  { value: 'SUMMARY', label: 'Umumiy' },
                  { value: 'REVIEW', label: `Savollar tahlili${data.review.length ? '' : ' (yo‘q)'}` },
                  { value: 'AI', label: `Writing / Speaking${data.evaluations.length ? ` (${data.evaluations.length})` : ''}` },
                ]}
              />
            </div>

            {tab === 'SUMMARY' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <button type="button" onClick={() => setTab('REVIEW')} className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ListChecks className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block font-semibold text-gray-900">Xatolar ustida ishlash</span>
                    <span className="text-sm text-gray-500">Listening va Reading savollari bo‘yicha to‘g‘ri javoblar</span>
                  </span>
                </button>
                <button type="button" onClick={() => setTab('AI')} className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Sparkles className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block font-semibold text-gray-900">AI fikr-mulohazasi</span>
                    <span className="text-sm text-gray-500">Writing va Speaking bo‘yicha mezonlar va maslahatlar</span>
                  </span>
                </button>
              </div>
            )}

            {tab === 'REVIEW' && <ReviewList review={data.review} sections={data.sections} />}

            {tab === 'AI' &&
              (data.evaluations.length === 0 ? (
                <EmptyState icon={Trophy} title="Writing / Speaking javoblari yo‘q" description="Bu urinishda AI baholaydigan javob topshirilmagan." />
              ) : (
                <div className="space-y-4">
                  {[...data.evaluations]
                    .sort((a, b) => a.skill.localeCompare(b.skill) || a.questionNumber - b.questionNumber)
                    .map((ev) => (
                      <AiFeedbackCard key={ev.questionId} ev={ev} />
                    ))}
                </div>
              ))}
          </>
        )}
      </div>
    </PageShell>
  );
}
