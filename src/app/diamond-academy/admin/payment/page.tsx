'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import {
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Search,
  X,
  Users,
  XCircle,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import AdminHeader from '@/components/AdminLayout';
import { PaymentStatus } from '@/features/types/payment';
import {
  useDeletePayment,
  useMarkAsPaid,
  usePayments,
  usePaymentStats,
} from '@/features/hooks/usePayment';
import { useGroups } from '@/features/hooks/useGroups';
import { useStudents } from '@/features/hooks/useStudents';
import { apiClient } from '@/features/api/client';
import { Group, Student } from '@/features/types';

/* ───────────── Yordamchilar ───────────── */
const money = (n: number) => new Intl.NumberFormat('uz-UZ').format(n);
const thisMonthStr = () => format(new Date(), 'yyyy-MM'); // local vaqt (UTC siljishisiz)
const monthKey = (d: string | Date) => new Date(d).toISOString().slice(0, 7);

const getErrorMessage = (err: unknown, fallback: string) => {
  const e = err as {
    message?: string;
    response?: { status?: number; data?: { message?: string | string[] } };
  };
  const msg = e?.response?.data?.message;
  const text = Array.isArray(msg) ? msg.join(', ') : msg;
  return text || e?.message || fallback;
};

type ToastState = { type: 'success' | 'error'; text: string } | null;
type PaymentItem = NonNullable<ReturnType<typeof usePayments>['data']>[number];
type ConfirmState = { kind: 'delete' | 'paid'; payment: PaymentItem } | null;

const statusStyle = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID:
      return { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', text: "To'langan" };
    case PaymentStatus.PENDING:
      return { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', text: 'Kutilmoqda' };
    case PaymentStatus.PARTIAL:
      return { badge: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500', text: 'Qisman' };
    case PaymentStatus.OVERDUE:
      return { badge: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500', text: "Muddati o'tgan" };
    default:
      return { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', text: String(status) };
  }
};

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
        checked ? 'bg-emerald-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

/* ───────────── Sahifa ───────────── */
export default function PaymentPage() {
  const queryClient = useQueryClient();

  // Filtrlar
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [month, setMonth] = useState(thisMonthStr());
  const [amount, setAmount] = useState<number>(0);
  const [paidStudentIds, setPaidStudentIds] = useState<Set<string>>(new Set());
  const [studentSearch, setStudentSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Amallar
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const { data: payments, isLoading } = usePayments({ status: filterStatus });
  const { data: stats } = usePaymentStats();
  const { data: groups = [] } = useGroups();
  const { data: students = [] } = useStudents(selectedGroupId || undefined);

  const deleteMutation = useDeletePayment();
  const markPaidMutation = useMarkAsPaid();

  /* Toast avtomatik yopiladi */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /* Modal ochiq paytda: scroll qulfi + Esc */
  const anyModal = showModal || !!confirm;
  useEffect(() => {
    if (!anyModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (confirm) {
        if (!busyId) setConfirm(null);
      } else if (!isSubmitting) {
        closeModal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyModal, confirm, busyId, isSubmitting]);

  /* ── Modal amallari ── */
  const closeModal = () => {
    setShowModal(false);
    setSelectedGroupId('');
    setMonth(thisMonthStr());
    setAmount(0);
    setPaidStudentIds(new Set());
    setStudentSearch('');
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    setPaidStudentIds(new Set());
    setStudentSearch('');
  };

  const togglePaid = (studentId: string) => {
    setPaidStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  // Har bir student uchun payment yaratadi, keyin ro'yxat yangilanadi
  const handleSubmit = async () => {
    if (!selectedGroupId || !month || !amount || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const results = await Promise.allSettled(
        students.map((student: Student) =>
          apiClient.post('/payment', {
            studentId: student.id,
            groupId: selectedGroupId,
            amount,
            status: paidStudentIds.has(student.id) ? PaymentStatus.PAID : PaymentStatus.PENDING,
            month: new Date(month + '-01'),
            paidAt: paidStudentIds.has(student.id) ? new Date() : undefined,
          }),
        ),
      );

      const failed = results.filter((r) => r.status === 'rejected').length;
      const ok = results.length - failed;

      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] });

      if (ok === 0) {
        setToast({ type: 'error', text: "To'lovlarni saqlab bo'lmadi" });
        return; // modal ochiq qoladi, qayta urinish mumkin
      }
      setToast(
        failed > 0
          ? { type: 'error', text: `${ok} ta saqlandi, ${failed} ta saqlanmadi` }
          : { type: 'success', text: `${ok} ta to'lov qo'shildi` },
      );
      closeModal();
    } catch (error) {
      console.error('Error creating payments:', error);
      setToast({ type: 'error', text: getErrorMessage(error, 'Xatolik yuz berdi!') });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Tasdiqlash oynasi amallari ── */
  const handleConfirm = async () => {
    if (!confirm) return;
    const { kind, payment } = confirm;
    setBusyId(payment.id);
    try {
      if (kind === 'delete') {
        await deleteMutation.mutateAsync(payment.id);
        setToast({ type: 'success', text: "To'lov o'chirildi" });
      } else {
        await markPaidMutation.mutateAsync(payment.id);
        // useMarkAsPaid ichida invalidate bo'lmasa ham ro'yxat yangilansin
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        setToast({ type: 'success', text: "To'langan deb belgilandi" });
      }
      setConfirm(null);
    } catch (error) {
      setToast({ type: 'error', text: getErrorMessage(error, 'Xatolik yuz berdi!') });
    } finally {
      setBusyId(null);
    }
  };

  /* ── Hisob-kitoblar ── */
  const filteredPayments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return (payments ?? []).filter((payment) => {
      if (monthFilter && monthKey(payment.month) !== monthFilter) return false;
      if (!q) return true;
      const name = payment.student?.name ?? '';
      const group = payment.group?.name ?? '';
      return name.toLowerCase().includes(q) || group.toLowerCase().includes(q);
    });
  }, [payments, searchTerm, monthFilter]);

  const filteredTotal = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Tanlangan guruh va oy uchun allaqachon yozilgan to'lovlar (takrorlanishdan ogohlantirish)
  const duplicateCount = useMemo(() => {
    if (!selectedGroupId || !month) return 0;
    const keys = new Set(
      (payments ?? []).map(
        (p) => `${p.student?.id}|${p.group?.id}|${monthKey(p.month)}`,
      ),
    );
    return students.filter((s: Student) => keys.has(`${s.id}|${selectedGroupId}|${month}`)).length;
  }, [payments, students, selectedGroupId, month]);

  const visibleStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s: Student) =>
        s.name.toLowerCase().includes(q) || (s.phone ?? '').toLowerCase().includes(q),
    );
  }, [students, studentSearch]);

  const expectedTotal = amount * students.length;
  const collectedTotal = amount * paidStudentIds.size;

  const statCards = [
    {
      label: "To'langan",
      value: stats?.paidAmount ?? 0,
      icon: CheckCircle,
      box: 'bg-emerald-100 text-emerald-600',
      bar: 'from-emerald-400 to-green-500',
    },
    {
      label: 'Kutilmoqda',
      value: stats?.pendingAmount ?? 0,
      icon: Clock,
      box: 'bg-amber-100 text-amber-600',
      bar: 'from-amber-400 to-orange-500',
    },
    {
      label: "Muddati o'tgan",
      value: stats?.overdueAmount ?? 0,
      icon: AlertCircle,
      box: 'bg-rose-100 text-rose-600',
      bar: 'from-rose-400 to-red-500',
    },
    {
      label: 'Jami',
      value: stats?.totalAmount ?? 0,
      icon: DollarSign,
      box: 'bg-indigo-100 text-indigo-600',
      bar: 'from-indigo-500 to-violet-500',
    },
  ];

  const statusTabs: { key: PaymentStatus | undefined; label: string }[] = [
    { key: undefined, label: 'Barchasi' },
    { key: PaymentStatus.PAID, label: "To'langan" },
    { key: PaymentStatus.PENDING, label: 'Kutilmoqda' },
    { key: PaymentStatus.PARTIAL, label: 'Qisman' },
    { key: PaymentStatus.OVERDUE, label: "Muddati o'tgan" },
  ];

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10';

  const renderActions = (payment: PaymentItem) => (
    <div className="flex items-center gap-1">
      {payment.status !== PaymentStatus.PAID && (
        <button
          onClick={() => setConfirm({ kind: 'paid', payment })}
          title="To'langan deb belgilash"
          aria-label="To'langan deb belgilash"
          className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
        >
          <CheckCircle size={18} />
        </button>
      )}
      <button
        onClick={() => setConfirm({ kind: 'delete', payment })}
        title="O'chirish"
        aria-label="O'chirish"
        className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );

  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
                To&apos;lovlar
              </h1>
              <p className="mt-1 text-slate-500">O&apos;quvchilar to&apos;lovlarini boshqarish</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl active:scale-[0.98]"
            >
              <Plus size={20} />
              To&apos;lov qo&apos;shish
            </button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.bar}`} />
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-1 text-sm text-slate-500">{s.label}</p>
                    <p className="truncate text-2xl font-bold text-slate-800">
                      {money(s.value)}{' '}
                      <span className="text-sm font-medium text-slate-400">so&apos;m</span>
                    </p>
                  </div>
                  <div className={`shrink-0 rounded-xl p-3 ${s.box}`}>
                    <s.icon size={22} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filtrlar */}
          <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Talaba yoki guruh qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputCls} pl-10 pr-9`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    aria-label="Tozalash"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="month"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    aria-label="Oy bo'yicha filtr"
                    className={`${inputCls} pl-10`}
                  />
                </div>
                {monthFilter && (
                  <button
                    onClick={() => setMonthFilter('')}
                    aria-label="Oy filtrini tozalash"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5 rounded-xl bg-slate-100/70 p-1">
              {statusTabs.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setFilterStatus(t.key)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                    filterStatus === t.key
                      ? 'bg-white text-indigo-600 shadow'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ro'yxat */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            {isLoading ? (
              <div className="divide-y divide-slate-50">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex animate-pulse items-center gap-4 px-6 py-4">
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div className="h-4 w-40 rounded bg-slate-200" />
                    <div className="ml-auto h-4 w-24 rounded bg-slate-100" />
                    <div className="h-6 w-24 rounded-full bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : filteredPayments.length > 0 ? (
              <>
                {/* Jadval (md va undan katta) */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead className="border-b border-slate-100 bg-slate-50/70">
                      <tr>
                        {['Talaba', 'Guruh', 'Summa', 'Oy', 'Holat', 'Amallar'].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredPayments.map((payment) => {
                        const st = statusStyle(payment.status);
                        const name = payment.student?.name ?? '-';
                        return (
                          <tr key={payment.id} className="transition hover:bg-slate-50/60">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-bold text-indigo-600">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold text-slate-800">{name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                {payment.group?.name ?? '-'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-800">
                              {money(Number(payment.amount))} so&apos;m
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                              {new Date(payment.month).toLocaleDateString('uz-UZ', {
                                year: 'numeric',
                                month: 'long',
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${st.badge}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                                {st.text}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {renderActions(payment)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Kartalar (mobil) */}
                <div className="divide-y divide-slate-100 md:hidden">
                  {filteredPayments.map((payment) => {
                    const st = statusStyle(payment.status);
                    const name = payment.student?.name ?? '-';
                    return (
                      <div key={payment.id} className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-bold text-indigo-600">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                              <p className="truncate text-xs text-slate-400">
                                {payment.group?.name ?? '-'}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.text}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-bold text-slate-800">
                              {money(Number(payment.amount))} so&apos;m
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(payment.month).toLocaleDateString('uz-UZ', {
                                year: 'numeric',
                                month: 'long',
                              })}
                            </p>
                          </div>
                          {renderActions(payment)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pastki yig'indi */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-3 text-sm">
                  <span className="text-slate-500">
                    Ko&apos;rsatilmoqda:{' '}
                    <span className="font-semibold text-slate-700">{filteredPayments.length}</span>{' '}
                    ta
                  </span>
                  <span className="text-slate-500">
                    Yig&apos;indi:{' '}
                    <span className="font-bold text-slate-800">{money(filteredTotal)} so&apos;m</span>
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                  <DollarSign className="text-indigo-300" size={32} />
                </div>
                <p className="font-semibold text-slate-700">Hech qanday to&apos;lov topilmadi</p>
                {(searchTerm || monthFilter || filterStatus) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setMonthFilter('');
                      setFilterStatus(undefined);
                    }}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    Filtrlarni tozalash
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───────────── To'lov qo'shish modali ───────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">To&apos;lov qo&apos;shish</h2>
                  <p className="text-xs text-slate-500">Guruh tanlang, summa va oy kiriting</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                aria-label="Yopish"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Guruh <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Guruhni tanlang</option>
                  {groups.map((group: Group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Oy <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Summa (so&apos;m) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="500000"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>

              {selectedGroupId && (
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <p className="text-sm font-medium text-slate-700">
                        O&apos;quvchilar ({students.length} ta)
                      </p>
                    </div>
                    {students.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPaidStudentIds(new Set(students.map((s: Student) => s.id)))
                          }
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Hammasi to&apos;ladi
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaidStudentIds(new Set())}
                          disabled={paidStudentIds.size === 0}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                        >
                          Tozalash
                        </button>
                      </div>
                    )}
                  </div>

                  {duplicateCount > 0 && (
                    <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>
                        Bu oy uchun {duplicateCount} ta talabada to&apos;lov allaqachon mavjud. Saqlasangiz,
                        takroriy yozuvlar paydo bo&apos;ladi.
                      </span>
                    </div>
                  )}

                  {students.length > 0 ? (
                    <>
                      {students.length > 6 && (
                        <div className="relative mb-2">
                          <Search
                            size={15}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            placeholder="Talaba qidirish..."
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                          />
                        </div>
                      )}

                      <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                        {visibleStudents.map((student: Student) => {
                          const isPaid = paidStudentIds.has(student.id);
                          return (
                            <div
                              key={student.id}
                              className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-4 py-2.5"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-800">
                                  {student.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {student.phone || "Telefon yo'q"}
                                </p>
                              </div>
                              <div className="ml-3 flex shrink-0 items-center gap-2.5">
                                <span
                                  className={`text-xs font-semibold ${
                                    isPaid ? 'text-emerald-600' : 'text-slate-400'
                                  }`}
                                >
                                  {isPaid ? "To'langan" : 'Kutilmoqda'}
                                </span>
                                <Switch
                                  checked={isPaid}
                                  onChange={() => togglePaid(student.id)}
                                  label={`${student.name} to'lovi`}
                                />
                              </div>
                            </div>
                          );
                        })}
                        {visibleStudents.length === 0 && (
                          <p className="py-4 text-center text-sm text-slate-400">Talaba topilmadi</p>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-indigo-50/70 px-4 py-2.5 text-xs">
                        <span className="text-slate-600">
                          ✅ To&apos;lagan: <b>{paidStudentIds.size}</b> &nbsp;|&nbsp; ⏳ Kutilmoqda:{' '}
                          <b>{students.length - paidStudentIds.size}</b>
                        </span>
                        {amount > 0 && (
                          <span className="font-semibold text-indigo-700">
                            {money(collectedTotal)} / {money(expectedTotal)} so&apos;m
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
                      Bu guruhda o&apos;quvchilar yo&apos;q
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  !selectedGroupId || !amount || !month || isSubmitting || students.length === 0
                }
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <DollarSign size={16} />
                    Saqlash ({students.length} ta student)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────── Tasdiqlash oynasi ───────────── */}
      {confirm && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busyId) setConfirm(null);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
          >
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                confirm.kind === 'delete' ? 'bg-red-100' : 'bg-emerald-100'
              }`}
            >
              {confirm.kind === 'delete' ? (
                <Trash2 className="text-red-600" size={26} />
              ) : (
                <CheckCircle className="text-emerald-600" size={26} />
              )}
            </div>
            <h3 className="mb-1 text-lg font-bold text-slate-800">
              {confirm.kind === 'delete'
                ? "To'lovni o'chirasizmi?"
                : "To'langan deb belgilaysizmi?"}
            </h3>
            <p className="mb-6 text-sm text-slate-500">
              <span className="font-medium text-slate-700">
                {confirm.payment.student?.name ?? '-'}
              </span>{' '}
              · {money(Number(confirm.payment.amount))} so&apos;m
              {confirm.kind === 'delete' && (
                <>
                  <br />
                  Bu amalni qaytarib bo&apos;lmaydi.
                </>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                disabled={!!busyId}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirm}
                disabled={!!busyId}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium text-white transition disabled:opacity-60 ${
                  confirm.kind === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {busyId && <RefreshCw size={16} className="animate-spin" />}
                {confirm.kind === 'delete' ? "O'chirish" : 'Tasdiqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────── Toast ───────────── */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-[120] flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
            toast.type === 'success' ? 'bg-slate-900' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={18} className="shrink-0 text-emerald-400" />
          ) : (
            <XCircle size={18} className="shrink-0" />
          )}
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            aria-label="Yopish"
            className="ml-1 text-white/60 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}