'use client';

import { useState } from 'react';
import { Banknote, Search, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';
import { ModalShell } from './ui/ModalUI';
import { useCenterStudents, useCreateManualPayment } from '../hooks/useExamPayment';
import { useExams } from '../hooks/useExam';
import { useDebounce } from '../hooks/useDebounce';
import { handleApiError } from '../api/api';
import { formatPrice } from '../../lib/format';
import type { CenterStudent } from '../types/exam-payment';

const field =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500';

function Content({ onClose }: { onClose: () => void }) {
  const create = useCreateManualPayment();
  const { data: exams } = useExams({ limit: 50 });
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search).trim();
  // Foydalanuvchini topish uchun /center-student (faqat role=USER, ism/telefon bo'yicha qidiradi)
  const { data: found, isFetching } = useCenterStudents({ search: debounced, limit: 6 }, debounced.length >= 2);

  const [user, setUser] = useState<CenterStudent | null>(null);
  const [examId, setExamId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const exam = exams?.items.find((e) => e.id === examId);

  const submit = () => {
    if (!user) return setError('Foydalanuvchini tanlang');
    if (!examId) return setError('Imtihonni tanlang');
    const amt = amount.trim() === '' ? undefined : Number(amount);
    if (amt !== undefined && (Number.isNaN(amt) || amt < 0)) return setError('Summa noto‘g‘ri');
    setError(null);
    create.mutate(
      { userId: user.id, examId, amount: amt, note: note.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('To‘lov kiritildi va tasdiqlandi');
          onClose();
        },
        onError: (e) => setError(handleApiError(e)),
      },
    );
  };

  return (
    <ModalShell
      maxWidth="max-w-lg"
      icon={Banknote}
      title="Qo‘lda to‘lov kiritish"
      subtitle="Naqd yoki karta o‘tkazma, darhol tasdiqlanadi"
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Kiritish"
      submitIcon={Banknote}
      isPending={create.isPending}
      errorMessage={error}
    >
      <div className="space-y-4">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Foydalanuvchi</span>
          {user ? (
            <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-3 py-2.5 ring-1 ring-indigo-100">
              <span className="flex items-center gap-2 text-sm">
                <UserRound className="h-4 w-4 text-indigo-600" />
                <b>{user.name}</b> <span className="text-gray-500">{user.phone}</span>
              </span>
              <button type="button" onClick={() => setUser(null)} className="rounded-lg p-1 text-gray-400 hover:bg-white hover:text-red-600" aria-label="Boshqa tanlash">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ism yoki telefon (kamida 2 belgi)" className={`${field} pl-9`} />
              </div>
              {debounced.length >= 2 && (
                <ul className="mt-2 divide-y divide-gray-50 overflow-hidden rounded-xl ring-1 ring-gray-100">
                  {found?.items.length === 0 && !isFetching && <li className="px-3 py-2.5 text-sm text-gray-400">Topilmadi</li>}
                  {found?.items.map((u) => (
                    <li key={u.id}>
                      <button type="button" onClick={() => setUser(u)} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-gray-50">
                        <span className="font-medium text-gray-900">{u.name}</span>
                        <span className="text-gray-500">{u.phone}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Imtihon</span>
          <select value={examId} onChange={(e) => setExamId(e.target.value)} className={field}>
            <option value="">Tanlang...</option>
            {exams?.items.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} {e.isFree ? '(bepul)' : `· ${formatPrice(e.price)}`}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Summa (so‘m)</span>
          <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={exam ? `Bo‘sh = ${formatPrice(exam.price)}` : 'Bo‘sh = imtihon narxi'} className={field} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Izoh</span>
          <input value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="Naqd, chek №..." className={field} />
        </label>
      </div>
    </ModalShell>
  );
}

export function useManualPaymentModal() {
  const [open, setOpen] = useState(false);
  return { open: () => setOpen(true), modal: open ? <Content onClose={() => setOpen(false)} /> : null };
}
