'use client';

import Link from 'next/link';
import { ArrowRight, Receipt } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import PaymentStatusBadge from '../../../components/PaymentStatusBadge';
import Spinner from '../../../components/ui/Spinner';
import EmptyState from '../../../components/ui/EmptyState';
import { useMyPayments } from '../../../features/hooks/useExamPayment';
import { handleApiError } from '../../../features/api/api';
import { PROVIDER_META, fmtDateTime } from '../../../lib/payment';
import { formatPrice } from '../../../lib/format';

export default function MyPaymentsPage() {
  const { data, isLoading, isError, error } = useMyPayments();

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="da-fade-up text-2xl font-bold tracking-tight text-gray-900">Mening to‘lovlarim</h1>
        <p className="mt-1 text-sm text-gray-500">Imtihonlar uchun qilingan to‘lovlar tarixi</p>

        <div className="mt-6">
          {isLoading ? (
            <Spinner />
          ) : isError || !data ? (
            <EmptyState title="To‘lovlarni yuklab bo‘lmadi" description={handleApiError(error)} />
          ) : data.length === 0 ? (
            <EmptyState icon={Receipt} title="Hali to‘lov yo‘q" description="Pullik imtihonni tanlab, to‘lov qilganingizda shu yerda ko‘rinadi." />
          ) : (
            <ul className="space-y-3">
              {data.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{p.exam.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {PROVIDER_META[p.provider].label} · {fmtDateTime(p.paidAt ?? p.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{formatPrice(p.amount)}</span>
                    <PaymentStatusBadge status={p.status} />
                    {p.status === 'PAID' && (
                      <Link
                        href={p.used && p.attemptId ? `/exam/${p.attemptId}` : `/exams/${p.examId}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                      >
                        {p.used ? 'Urinishni ko‘rish' : 'Boshlash'} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    {p.status === 'PENDING' && (
                      <Link href={`/exams/${p.examId}`} className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                        Davom ettirish <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageShell>
  );
}
