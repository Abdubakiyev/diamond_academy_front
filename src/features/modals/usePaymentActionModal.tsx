'use client';

import { useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ModalShell } from './ui/ModalUI';
import { usePaymentAction } from '../hooks/useExamPayment';
import { handleApiError } from '../api/api';
import { formatPrice } from '../../lib/format';
import type { AdminPayment, PaymentAction } from '../types/exam-payment';

const COPY: Record<PaymentAction, { title: string; label: string; ok: string; hint: string; icon: typeof XCircle; theme: 'blue' | 'amber' }> = {
  confirm: { title: 'To‘lovni tasdiqlash', label: 'Tasdiqlash', ok: 'To‘lov tasdiqlandi', hint: 'Foydalanuvchi testni boshlay oladi.', icon: CheckCircle2, theme: 'blue' },
  cancel: { title: 'To‘lovni bekor qilish', label: 'Bekor qilish', ok: 'To‘lov bekor qilindi', hint: 'Faqat kutilayotgan to‘lov bekor qilinadi.', icon: XCircle, theme: 'amber' },
  refund: { title: 'To‘lovni qaytarish', label: 'Qaytarish', ok: 'To‘lov qaytarildi', hint: 'Pul qaytarilgach foydalanuvchi bu to‘lov bilan test boshlay olmaydi. Pulni provayder orqali alohida qaytarishingiz kerak.', icon: RotateCcw, theme: 'amber' },
};

function Content({ payment, action, onClose }: { payment: AdminPayment; action: PaymentAction; onClose: () => void }) {
  const run = usePaymentAction();
  const c = COPY[action];
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () =>
    run.mutate(
      { id: payment.id, action, note: note.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(c.ok);
          onClose();
        },
        onError: (e) => setError(handleApiError(e)),
      },
    );

  return (
    <ModalShell
      theme={c.theme}
      icon={c.icon}
      title={c.title}
      subtitle={`${payment.user.name} · ${formatPrice(payment.amount)}`}
      onClose={onClose}
      onSubmit={submit}
      submitLabel={c.label}
      submitIcon={c.icon}
      isPending={run.isPending}
      errorMessage={error}
    >
      <div className="space-y-3">
        <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
          <b>{payment.exam.title}</b>
          <br />
          {c.hint}
        </p>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Izoh (ixtiyoriy)</span>
          <textarea
            rows={3}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Masalan: naqd to‘landi, chek №123"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
      </div>
    </ModalShell>
  );
}

export function usePaymentActionModal() {
  const [state, setState] = useState<{ payment: AdminPayment; action: PaymentAction } | null>(null);
  return {
    open: (payment: AdminPayment, action: PaymentAction) => setState({ payment, action }),
    modal: state ? <Content key={state.payment.id + state.action} payment={state.payment} action={state.action} onClose={() => setState(null)} /> : null,
  };
}
