'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Search,
  Wallet,
  Check,
  X,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import AdminHeader from '@/components/AdminLayout';
import { PaymentStatus } from '@/features/types/payment';
import { useGroups } from '@/features/hooks/useGroups';
import {
  useAttendanceByGroupAndDate,
  useCreateAttendanceBulk,
} from '@/features/hooks/useAttendance';
import { apiClient } from '@/features/api/client';

/* ───────────── Yordamchilar ───────────── */
const money = (n: number) => new Intl.NumberFormat('uz-UZ').format(n);
const todayStr = () => format(new Date(), 'yyyy-MM-dd');
const thisMonthStr = () => format(new Date(), 'yyyy-MM'); // local vaqt (UTC siljishisiz)

type ToastState = { type: 'success' | 'error'; text: string } | null;

function Ring({ value }: { value: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[72px] w-[72px]">
      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" className="stroke-slate-100" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className="stroke-indigo-500 transition-all duration-500"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800">
        {value}%
      </span>
    </div>
  );
}

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
export default function AttendancePaymentPage() {
  const queryClient = useQueryClient();

  const [attGroupId, setAttGroupId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMonth, setPaymentMonth] = useState(thisMonthStr());
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const { data: attGroups } = useGroups(true);
  const { data: students, isLoading: attLoading } = useAttendanceByGroupAndDate(
    attGroupId,
    selectedDate,
  );
  const createAttendance = useCreateAttendanceBulk();

  /* Toast avtomatik yopiladi */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /* Saqlanmagan o'zgarish bo'lsa, sahifadan chiqishda ogohlantirish */
  useEffect(() => {
    if (!dirty) return;
    const fn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', fn);
    return () => window.removeEventListener('beforeunload', fn);
  }, [dirty]);

  /* ── Hisob-kitoblar ── */
  const list = students ?? [];
  const totalCount = list.length;
  const presentCount = list.filter(
    (item) => attendanceData[item.student.id] ?? item.present,
  ).length;
  const absentCount = totalCount - presentCount;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
  const collected = paidIds.size * paymentAmount;

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.student.name.toLowerCase().includes(q) ||
        (item.student.phone ?? '').toLowerCase().includes(q),
    );
  }, [list, search]);

  /* ── Amallar ── */
  const resetSelections = () => {
    setAttendanceData({});
    setPaidIds(new Set());
    setDirty(false);
  };

  const changeGroup = (id: string) => {
    setAttGroupId(id);
    setSearch('');
    resetSelections();
  };

  // Sana o'zgarsa eski sanadagi belgilar qolib ketmasligi kerak
  const changeDate = (value: string) => {
    if (!value) return;
    setSelectedDate(value);
    resetSelections();
  };

  const shiftDate = (days: number) => changeDate(format(addDays(parseISO(selectedDate), days), 'yyyy-MM-dd'));

  const setPresent = (studentId: string, value: boolean) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: value }));
    setDirty(true);
  };

  const setAllPresent = (value: boolean) => {
    setAttendanceData(Object.fromEntries(list.map((item) => [item.student.id, value])));
    setDirty(true);
  };

  const handleTogglePayment = (studentId: string) => {
    setPaidIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
    setDirty(true);
  };

  const setAllPaid = (value: boolean) => {
    setPaidIds(value ? new Set(list.map((item) => item.student.id)) : new Set());
    setDirty(true);
  };

  const handleSaveAll = async () => {
    if (!attGroupId || !students?.length || isSaving) return;
    if (paymentAmount > 0 && !paymentMonth) {
      setToast({ type: 'error', text: "To'lov oyini tanlang" });
      return;
    }

    setIsSaving(true);
    try {
      // 1. Davomat saqlash
      const attendances = students.map((item) => ({
        studentId: item.student.id,
        present: attendanceData[item.student.id] ?? item.present,
      }));
      await new Promise<void>((resolve, reject) => {
        createAttendance.mutate(
          { groupId: attGroupId, date: selectedDate, attendances },
          { onSuccess: () => resolve(), onError: reject },
        );
      });

      // 2. To'lov saqlash (agar summa kiritilgan bo'lsa)
      let failed = 0;
      if (paymentAmount > 0) {
        const results = await Promise.allSettled(
          students.map((item) =>
            apiClient.post('/payment', {
              studentId: item.student.id,
              groupId: attGroupId,
              amount: paymentAmount,
              status: paidIds.has(item.student.id) ? PaymentStatus.PAID : PaymentStatus.PENDING,
              month: new Date(paymentMonth + '-01'),
              paidAt: paidIds.has(item.student.id) ? new Date() : undefined,
            }),
          ),
        );
        failed = results.filter((r) => r.status === 'rejected').length;
        queryClient.invalidateQueries({ queryKey: ['payments'] });
      }

      if (failed > 0) {
        setToast({
          type: 'error',
          text: `Davomat saqlandi, lekin ${failed} ta to'lov saqlanmadi`,
        });
      } else {
        setToast({
          type: 'success',
          text: paymentAmount > 0 ? "Davomat va to'lovlar saqlandi" : 'Davomat saqlandi',
        });
        // Qayta bosilganda to'lovlar takrorlanib ketmasligi uchun tozalaymiz
        setPaidIds(new Set());
        setPaymentAmount(0);
        setDirty(false);
      }
    } catch (e) {
      console.error('Saqlashda xato:', e);
      setToast({ type: 'error', text: 'Saqlashda xatolik yuz berdi' });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedGroupName = attGroups?.find((g) => g.id === attGroupId)?.name;
  const paymentDisabled = paymentAmount <= 0;

  const stats = [
    { label: 'Jami', value: totalCount, icon: Users, box: 'bg-indigo-100 text-indigo-600', num: 'text-indigo-600' },
    { label: 'Keldi', value: presentCount, icon: UserCheck, box: 'bg-emerald-100 text-emerald-600', num: 'text-emerald-600' },
    { label: 'Kelmadi', value: absentCount, icon: UserX, box: 'bg-rose-100 text-rose-500', num: 'text-rose-500' },
  ];

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10';
  const labelCls = 'mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500';

  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <CalendarCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
                Davomat
              </h1>
              <p className="text-slate-500">Davomat va to&apos;lov holatini belgilang</p>
            </div>
          </div>

          {/* Filtrlar */}
          <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <label className={labelCls}>Guruh</label>
                <div className="relative">
                  <select
                    value={attGroupId}
                    onChange={(e) => changeGroup(e.target.value)}
                    className={`${inputCls} appearance-none pr-10`}
                  >
                    <option value="">Guruhni tanlang</option>
                    {attGroups?.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                  />
                </div>
              </div>

              <div className="sm:w-72">
                <label className={labelCls}>Sana</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => shiftDate(-1)}
                    aria-label="Oldingi kun"
                    className="rounded-xl border border-slate-200 p-3 text-slate-500 transition hover:bg-slate-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => changeDate(e.target.value)}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => shiftDate(1)}
                    aria-label="Keyingi kun"
                    className="rounded-xl border border-slate-200 p-3 text-slate-500 transition hover:bg-slate-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                {selectedDate !== todayStr() && (
                  <button
                    type="button"
                    onClick={() => changeDate(todayStr())}
                    className="mt-2 text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Bugunga qaytish
                  </button>
                )}
              </div>
            </div>

            {attGroupId && (
              <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row">
                <div className="flex-1">
                  <label className={labelCls}>To&apos;lov summasi (so&apos;m)</label>
                  <div className="relative">
                    <Wallet
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="500000"
                      value={paymentAmount || ''}
                      onChange={(e) => {
                        setPaymentAmount(Number(e.target.value));
                        setDirty(true);
                      }}
                      className={`${inputCls} pl-11`}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Summa kiritilmasa, to&apos;lovlar saqlanmaydi
                  </p>
                </div>
                <div className="sm:w-72">
                  <label className={labelCls}>To&apos;lov oyi</label>
                  <input
                    type="month"
                    value={paymentMonth}
                    onChange={(e) => {
                      setPaymentMonth(e.target.value);
                      setDirty(true);
                    }}
                    className={inputCls}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Statistika */}
          {attGroupId && totalCount > 0 && (
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{s.label}</p>
                      <p className={`mt-1 text-3xl font-bold ${s.num}`}>{s.value}</p>
                    </div>
                    <div className={`rounded-xl p-2.5 ${s.box}`}>
                      <s.icon size={20} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-xs font-medium text-slate-500">Davomat</p>
                  <p className="mt-1 text-xs text-slate-400">foizi</p>
                </div>
                <Ring value={attendanceRate} />
              </div>
            </div>
          )}

          {/* Talabalar ro'yxati */}
          {attGroupId ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
              {attLoading ? (
                <div className="divide-y divide-slate-50">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex animate-pulse items-center gap-3 px-6 py-4">
                      <div className="h-10 w-10 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-40 rounded bg-slate-200" />
                        <div className="h-3 w-24 rounded bg-slate-100" />
                      </div>
                      <div className="h-9 w-32 rounded-xl bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : totalCount > 0 ? (
                <>
                  {/* Asboblar paneli */}
                  <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-xs">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Talaba qidirish..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-9 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                      />
                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch('')}
                          aria-label="Tozalash"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAllPresent(true)}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Hammasi keldi
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllPresent(false)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                      >
                        Hammasi kelmadi
                      </button>
                      <span className="mx-1 hidden w-px bg-slate-200 sm:block" />
                      <button
                        type="button"
                        onClick={() => setAllPaid(true)}
                        disabled={paymentDisabled}
                        title={paymentDisabled ? "Avval to'lov summasini kiriting" : undefined}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Hammasi to&apos;ladi
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllPaid(false)}
                        disabled={paidIds.size === 0}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        To&apos;lovni tozalash
                      </button>
                    </div>
                  </div>

                  {/* Ustun sarlavhasi (faqat katta ekran) */}
                  <div className="hidden items-center justify-between border-b border-slate-100 px-6 py-2.5 sm:flex">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Talaba {selectedGroupName ? `· ${selectedGroupName}` : ''}
                    </span>
                    <div className="flex gap-8 pr-1">
                      <span className="w-[132px] text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Davomat
                      </span>
                      <span className="w-[96px] text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                        To&apos;lov
                      </span>
                    </div>
                  </div>

                  {/* Qatorlar */}
                  {filteredStudents.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                      <Search className="text-slate-300" size={32} />
                      <p className="text-sm font-medium text-slate-600">Talaba topilmadi</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {filteredStudents.map((item, idx) => {
                        const id = item.student.id;
                        const isPresent = attendanceData[id] ?? item.present;
                        const isPaid = paidIds.has(id);

                        return (
                          <div
                            key={id}
                            className="flex flex-col gap-3 px-4 py-4 transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="w-5 text-xs tabular-nums text-slate-300">
                                {idx + 1}
                              </span>
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                                  isPresent
                                    ? 'bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {item.student.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-slate-800">
                                  {item.student.name}
                                </div>
                                {item.student.phone && (
                                  <div className="mt-0.5 text-xs text-slate-400">
                                    {item.student.phone}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-8">
                              {/* Davomat */}
                              <div
                                role="group"
                                aria-label="Davomat"
                                className="inline-flex w-[132px] rounded-xl bg-slate-100 p-1"
                              >
                                <button
                                  type="button"
                                  aria-pressed={isPresent}
                                  onClick={() => setPresent(id, true)}
                                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                                    isPresent
                                      ? 'bg-emerald-500 text-white shadow'
                                      : 'text-slate-500 hover:text-slate-700'
                                  }`}
                                >
                                  Keldi
                                </button>
                                <button
                                  type="button"
                                  aria-pressed={!isPresent}
                                  onClick={() => setPresent(id, false)}
                                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                                    !isPresent
                                      ? 'bg-rose-500 text-white shadow'
                                      : 'text-slate-500 hover:text-slate-700'
                                  }`}
                                >
                                  Kelmadi
                                </button>
                              </div>

                              {/* To'lov */}
                              <div
                                className={`flex w-[96px] flex-col items-center gap-1 transition ${
                                  paymentDisabled ? 'opacity-50' : ''
                                }`}
                                title={paymentDisabled ? "Avval to'lov summasini kiriting" : undefined}
                              >
                                <Switch
                                  checked={isPaid}
                                  onChange={() => handleTogglePayment(id)}
                                  label="To'lov holati"
                                />
                                <span
                                  className={`text-[11px] font-semibold ${
                                    isPaid ? 'text-emerald-600' : 'text-amber-600'
                                  }`}
                                >
                                  {isPaid ? "To'landi" : 'Kutilmoqda'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                    <Users className="text-indigo-300" size={28} />
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    Bu guruhda talabalar yo&apos;q
                  </p>
                  <p className="text-xs text-slate-400">Boshqa guruhni tanlang</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-72 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/70">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <CalendarCheck className="text-indigo-400" size={32} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Guruh tanlang</p>
                <p className="mt-1 text-xs text-slate-400">
                  Davomat va to&apos;lov belgilash uchun yuqoridan guruh tanlang
                </p>
              </div>
            </div>
          )}

          {/* Saqlash paneli */}
          {attGroupId && totalCount > 0 && (
            <div className="sticky bottom-4 z-20 mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-xl shadow-slate-900/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <UserCheck size={14} className="text-emerald-500" />
                  {presentCount}/{totalCount} keldi
                </span>
                <span className="flex items-center gap-1.5">
                  <Wallet size={14} className="text-indigo-500" />
                  {paidIds.size}/{totalCount} to&apos;ladi
                  {paymentAmount > 0 && paidIds.size > 0 && (
                    <span className="font-semibold text-slate-700">· {money(collected)} so&apos;m</span>
                  )}
                </span>
                {dirty && (
                  <span className="flex items-center gap-1.5 font-medium text-amber-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Saqlanmagan o&apos;zgarishlar
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Saqlash
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div
            role="status"
            className={`fixed bottom-24 right-5 z-[120] flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl sm:bottom-5 ${
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
              type="button"
              onClick={() => setToast(null)}
              aria-label="Yopish"
              className="ml-1 text-white/60 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}