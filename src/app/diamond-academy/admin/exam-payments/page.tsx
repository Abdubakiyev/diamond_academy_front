'use client';

import { useState } from 'react';
import { Ban, Banknote, CheckCircle2, Receipt, RotateCcw } from 'lucide-react';
import AdminShell from '../../../../components/admin/AdminShell';
import Segmented from '../../../../components/admin/Segmented';
import PaymentStatusBadge from '../../../../components/PaymentStatusBadge';
import Spinner from '../../../../components/ui/Spinner';
import EmptyState from '../../../../components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';
import { useAdminPayments } from '../../../../features/hooks/useExamPayment';
import { useExams } from '../../../../features/hooks/useExam';
import { usePaymentActionModal } from '../../../../features/modals/usePaymentActionModal';
import { useManualPaymentModal } from '../../../../features/modals/useManualPaymentModal';
import { handleApiError } from '../../../../features/api/api';
import { PROVIDER_META, fmtDateTime } from '../../../../lib/payment';
import { formatPrice } from '../../../../lib/format';
import type { PaymentStatus } from '../../../../features/types/exam-payment';

const LIMIT = 20;
type Tab = PaymentStatus | 'ALL';

export default function AdminExamPaymentsPage() {
  const [tab, setTab] = useState<Tab>('ALL');
  const [examId, setExamId] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useAdminPayments({
    status: tab === 'ALL' ? undefined : tab,
    examId: examId || undefined,
    page,
    limit: LIMIT,
  });
  const { data: exams } = useExams({ limit: 50 });
  const action = usePaymentActionModal();
  const manual = useManualPaymentModal();

  return (
    <AdminShell
      title="Imtihon to‘lovlari"
      subtitle="Click / Payme to‘lovlari va qo‘lda kiritilganlar"
      actions={
        <button
          onClick={manual.open}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition active:scale-95"
        >
          <Banknote className="h-4 w-4" /> Qo‘lda to‘lov
        </button>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented
          value={tab}
          onChange={(v) => {
            setTab(v);
            setPage(1);
          }}
          options={[
            { value: 'ALL', label: 'Hammasi' },
            { value: 'PENDING', label: 'Kutilmoqda' },
            { value: 'PAID', label: 'To‘langan' },
            { value: 'CANCELLED', label: 'Bekor' },
            { value: 'REFUNDED', label: 'Qaytarilgan' },
            { value: 'FAILED', label: 'Xato' },
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
        <EmptyState title="To‘lovlarni yuklab bo‘lmadi" description={handleApiError(error)} />
      ) : data.items.length === 0 ? (
        <EmptyState icon={Receipt} title="To‘lov topilmadi" description="Tanlangan filtr bo‘yicha to‘lovlar yo‘q." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full min-w-[56rem] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Foydalanuvchi</th>
                  <th className="px-4 py-3">Imtihon</th>
                  <th className="px-4 py-3">Summa</th>
                  <th className="px-4 py-3">Usul</th>
                  <th className="px-4 py-3">Holat</th>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.items.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.user.name}</p>
                      <p className="text-xs text-gray-500">{p.user.phone}</p>
                    </td>
                    <td className="max-w-[14rem] truncate px-4 py-3 text-gray-700">{p.exam.title}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">{formatPrice(p.amount)}</td>
                    <td className="px-4 py-3 text-gray-600">{PROVIDER_META[p.provider].label}</td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={p.status} />
                      {p.status === 'PAID' && p.used && <p className="mt-1 text-[11px] text-gray-400">ishlatilgan</p>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{fmtDateTime(p.paidAt ?? p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {p.status === 'PENDING' && (
                          <>
                            <button onClick={() => action.open(p, 'confirm')} title="Tasdiqlash" className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => action.open(p, 'cancel')} title="Bekor qilish" className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                              <Ban className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {p.status === 'PAID' && !p.used && (
                          <button onClick={() => action.open(p, 'refund')} title="Qaytarish" className="rounded-lg p-2 text-violet-600 hover:bg-violet-50">
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <Pagination page={page} limit={LIMIT} total={data.total} onChange={setPage} />
          </div>
        </>
      )}

      {action.modal}
      {manual.modal}
    </AdminShell>
  );
}
