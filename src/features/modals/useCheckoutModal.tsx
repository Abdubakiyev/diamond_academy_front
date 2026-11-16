'use client';

import { useState } from 'react';
import { AlertTriangle, CreditCard, Info } from 'lucide-react';
import { toast } from 'sonner';
import { ModalShell } from './ui/ModalUI';
import { useCheckout } from '../hooks/useExamPayment';
import { handleApiError } from '../api/api';
import { PROVIDER_META } from '../../lib/payment';
import { cn, formatPrice } from '../../lib/format';
import type { PaymentProvider } from '../types/exam-payment';

interface ExamRef {
  id: string;
  title: string;
  price: number;
}

const ONLINE: PaymentProvider[] = ['CLICK', 'PAYME', 'UZUM'];

function Content({ exam, onClose }: { exam: ExamRef; onClose: () => void }) {
  const checkout = useCheckout();
  const [provider, setProvider] = useState<PaymentProvider>('CLICK');
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    setNote(null);
    checkout.mutate(
      { examId: exam.id, provider },
      {
        onSuccess: (res) => {
          if (res.paymentUrl) {
            toast.success('To‘lov sahifasiga yo‘naltirilmoqda...');
            window.location.href = res.paymentUrl;
          } else {
            setNote(res.note ?? 'To‘lov havolasi yaratilmadi. Boshqa usulni tanlang yoki administratorga murojaat qiling.');
          }
        },
        onError: (e) => setError(handleApiError(e)),
      },
    );
  };

  return (
    <ModalShell
      icon={CreditCard}
      title="Imtihon uchun to‘lov"
      subtitle={exam.title}
      onClose={onClose}
      onSubmit={submit}
      submitLabel="To‘lashga o‘tish"
      submitIcon={CreditCard}
      isPending={checkout.isPending}
      errorMessage={error}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-50 to-sky-50 px-4 py-3 ring-1 ring-indigo-100">
          <span className="text-sm text-gray-600">To‘lov summasi</span>
          <span className="text-lg font-bold text-indigo-700">{formatPrice(exam.price)}</span>
        </div>

        <div className="space-y-2">
          {ONLINE.map((p) => {
            const m = PROVIDER_META[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl p-3 text-left ring-1 transition',
                  provider === p ? 'bg-indigo-50 ring-indigo-400' : 'bg-white ring-gray-200 hover:bg-gray-50',
                )}
              >
                <span className={cn('h-3 w-3 rounded-full', m.dot)} />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-gray-900">{m.label}</span>
                  <span className="block text-xs text-gray-500">{m.hint}</span>
                </span>
                <span className={cn('flex h-5 w-5 items-center justify-center rounded-full border-2', provider === p ? 'border-indigo-600' : 'border-gray-300')}>
                  {provider === p && <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
                </span>
              </button>
            );
          })}
        </div>

        {note && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {note}
          </div>
        )}

        <p className="flex items-start gap-2 text-xs text-gray-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Naqd yoki karta o‘tkazma bilan to‘lamoqchi bo‘lsangiz, markaz administratoriga murojaat qiling. U to‘lovni tasdiqlaydi.
        </p>
      </div>
    </ModalShell>
  );
}

export function useCheckoutModal() {
  const [exam, setExam] = useState<ExamRef | null>(null);
  return {
    open: (e: ExamRef) => setExam(e),
    modal: exam ? <Content key={exam.id} exam={exam} onClose={() => setExam(null)} /> : null,
  };
}
