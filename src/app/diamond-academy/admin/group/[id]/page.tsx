'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Banknote, Check, CircleDashed, Gem, ListChecks, Loader2, Pencil, RotateCcw, Users, X } from 'lucide-react';
import AdminShell from '../../../../../components/admin/AdminShell';
import MonthPicker from '../../../../../components/admin/MonthPicker';
import Spinner from '../../../../../components/ui/Spinner';
import EmptyState from '../../../../../components/ui/EmptyState';
import { useGroupBoard, useResetFee, useSetAttendance, useSetFee, useSetPayment } from '../../../../../features/hooks/useGroupBoard';
import { useDayAttendanceModal } from '../../../../../features/modals/useDayAttendanceModal';
import { handleApiError } from '../../../../../features/api/api';
import { currentMonth, dayParts, monthLabel } from '../../../../../lib/month';
import { ADMIN_HOME } from '../../../../../lib/config';
import { cn, formatPrice } from '../../../../../lib/format';
import type { BoardCell, GroupBoard } from '../../../../../features/types/group-board';

/** Katakni bosganda: — → keldi → keldi + 💎 → kelmadi → — */
const nextState = (c?: BoardCell): { present: boolean | null; diamond: boolean } =>
  !c ? { present: true, diamond: false } : c.present && !c.diamond ? { present: true, diamond: true } : c.present ? { present: false, diamond: false } : { present: null, diamond: false };

function FeeCard({ board, groupId, month }: { board: GroupBoard; groupId: string; month: string }) {
  const setFee = useSetFee(groupId);
  const reset = useResetFee(groupId);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const { fee } = board;

  const startEdit = () => {
    setValue(fee.amount != null ? String(fee.amount) : '');
    setEditing(true);
  };

  const save = () => {
    const n = Number(value);
    if (value.trim() === '' || Number.isNaN(n) || n < 0) return toast.error('Summani to‘g‘ri kiriting');
    setFee.mutate(
      { month, amount: n },
      {
        onSuccess: () => {
          toast.success(`${monthLabel(month)} va keyingi oylar uchun summa saqlandi`);
          setEditing(false);
        },
        onError: (e) => toast.error(handleApiError(e)),
      },
    );
  };

  return (
    <div className={cn('rounded-2xl border p-4 shadow-sm', fee.amount == null ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white')}>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <Banknote className="h-3.5 w-3.5" /> Oylik to‘lov summasi
      </p>

      {editing ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            autoFocus
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder="500000"
            className="w-40 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="button" onClick={save} disabled={setFee.isPending} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
            {setFee.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Saqlash
          </button>
          <button type="button" onClick={() => setEditing(false)} className="rounded-xl px-3 py-2 text-sm text-gray-500 hover:bg-gray-100">
            Bekor
          </button>
        </div>
      ) : (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-2xl font-bold tabular-nums text-gray-900">{fee.amount != null ? formatPrice(fee.amount) : 'Kiritilmagan'}</span>
          <button type="button" onClick={startEdit} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50">
            <Pencil className="h-3 w-3" /> {fee.amount != null ? 'O‘zgartirish' : 'Kiritish'}
          </button>
          {fee.amount != null && !fee.inherited && fee.fromMonth && (
            <button
              type="button"
              disabled={reset.isPending}
              onClick={() => reset.mutate(month, { onError: (e) => toast.error(handleApiError(e)) })}
              title="Shu oyning o‘z summasini olib tashlash"
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700"
            >
              <RotateCcw className="h-3 w-3" /> oldingi oydagisiga qaytarish
            </button>
          )}
        </div>
      )}

      <p className="mt-1.5 text-xs text-gray-500">
        {fee.amount == null
          ? 'Avval summani kiriting: keyingi oylarda ham o‘zi qoladi.'
          : fee.inherited
            ? `${monthLabel(fee.fromMonth as string)} dan o‘tgan summa. Keyingi oylarda ham shunday qoladi.`
            : 'Bu summa shu oydan boshlab keyingi oylarga ham o‘tadi.'}
      </p>
    </div>
  );
}

export default function AdminGroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [month, setMonth] = useState(currentMonth());
  const [extraDays, setExtraDays] = useState<string[]>([]);

  const { data: board, isLoading, isError, error, isFetching } = useGroupBoard(id, month);
  const attendance = useSetAttendance();
  const payment = useSetPayment(id);
  const dayModal = useDayAttendanceModal();

  const days = useMemo(() => {
    const set = new Set([...(board?.days ?? []), ...extraDays.filter((d) => d.startsWith(month))]);
    return [...set].sort();
  }, [board?.days, extraDays, month]);

  const onCell = (studentId: string, date: string, cell?: BoardCell) => {
    const n = nextState(cell);
    attendance.mutate({ groupId: id, month, studentId, date, present: n.present, diamond: n.diamond }, { onError: (e) => toast.error(handleApiError(e)) });
  };

  const onPay = (studentId: string, paid: boolean) =>
    payment.mutate({ studentId, month, paid }, { onError: (e) => toast.error(handleApiError(e)) });

  const t = board?.totals;

  return (
    <AdminShell
      title={board?.group.name ?? 'Guruh'}
      subtitle={board ? [board.group.level?.type, board.group.teacher?.name, board.group.schedule].filter(Boolean).join(' · ') : undefined}
      back={{ href: `${ADMIN_HOME}/groups`, label: 'Guruhlar' }}
      actions={
        board && (
          <button
            type="button"
            onClick={() => dayModal.open({ groupId: id, month, students: board.students, onSaved: (d) => setExtraDays((x) => [...x, d]) })}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition active:scale-95"
          >
            <ListChecks className="h-4 w-4" /> Davomat olish
          </button>
        )
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <MonthPicker value={month} onChange={setMonth} />
        {isFetching && !isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError || !board ? (
        <EmptyState title="Guruhni yuklab bo‘lmadi" description={handleApiError(error)} />
      ) : (
        <div className="space-y-5">
          {/* Yuqori kartalar */}
          <div className="grid gap-4 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
            <FeeCard board={board} groupId={id} month={month} />
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">To‘lagan</p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-emerald-600">
                {t?.paid} <span className="text-sm font-medium text-gray-400">/ {t?.students}</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">To‘lamagan: {t?.unpaid}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Yig‘ilgan</p>
              <p className="mt-1.5 text-xl font-bold tabular-nums text-gray-900">{formatPrice(t?.collected ?? 0)}</p>
              <p className="mt-1 text-xs text-gray-500">Kutilgan: {t?.expected != null ? formatPrice(t.expected) : '—'}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <Gem className="h-3.5 w-3.5 text-sky-500" /> Diamond
              </p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-sky-600">{board.students.reduce((s, st) => s + Object.values(st.attendance).filter((c) => c.diamond).length, 0)}</p>
              <p className="mt-1 text-xs text-gray-500">Shu oy berilgan</p>
            </div>
          </div>

          {board.students.length === 0 ? (
            <EmptyState icon={Users} title="Guruhda o‘quvchi yo‘q" description="O‘quvchilarni “Student” sahifasidan qo‘shing." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th className="sticky left-0 z-20 min-w-48 border-b border-gray-100 bg-gray-50 px-4 py-3 font-semibold uppercase tracking-wide">O‘quvchi</th>
                    <th className="border-b border-gray-100 bg-gray-50 px-3 py-3 text-center font-semibold uppercase tracking-wide">To‘lov</th>
                    {days.map((d) => {
                      const p = dayParts(d);
                      return (
                        <th key={d} className="border-b border-gray-100 bg-gray-50 px-1 py-2 text-center">
                          <span className="block text-sm font-bold text-gray-800">{p.day}</span>
                          <span className="block text-[10px] font-medium uppercase text-gray-400">{p.weekday}</span>
                        </th>
                      );
                    })}
                    <th className="border-b border-gray-100 bg-gray-50 px-3 py-3 text-center font-semibold uppercase tracking-wide">Keldi</th>
                    <th className="border-b border-gray-100 bg-gray-50 px-3 py-3 text-center font-semibold uppercase tracking-wide">Kelmadi</th>
                    <th className="border-b border-gray-100 bg-gray-50 px-3 py-3 text-center font-semibold uppercase tracking-wide">💎</th>
                  </tr>
                </thead>
                <tbody>
                  {board.students.map((s) => {
                    const cells = Object.values(s.attendance);
                    const present = cells.filter((c) => c.present).length;
                    const absent = cells.filter((c) => !c.present).length;
                    const gems = cells.filter((c) => c.diamond).length;
                    const paying = payment.isPending && payment.variables?.studentId === s.id;
                    return (
                      <tr key={s.id} className="group">
                        <td className="sticky left-0 z-10 border-b border-gray-50 bg-white px-4 py-2.5 group-hover:bg-gray-50">
                          <p className="font-medium text-gray-900">{s.name}</p>
                          {s.phone && <p className="text-xs text-gray-400">{s.phone}</p>}
                        </td>
                        <td className="border-b border-gray-50 px-3 py-2.5 text-center group-hover:bg-gray-50">
                          <button
                            type="button"
                            disabled={paying}
                            onClick={() => onPay(s.id, !s.payment.paid)}
                            title={s.payment.paid ? `To‘langan: ${s.payment.amount != null ? formatPrice(s.payment.amount) : ''}. Bekor qilish uchun bosing` : 'To‘landi deb belgilash'}
                            className={cn(
                              'inline-flex min-w-28 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition active:scale-95 disabled:opacity-60',
                              s.payment.paid ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-700 ring-red-200 hover:bg-red-100',
                            )}
                          >
                            {paying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : s.payment.paid ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            {s.payment.paid ? 'To‘lagan' : 'To‘lamagan'}
                          </button>
                        </td>
                        {days.map((d) => {
                          const c = s.attendance[d];
                          return (
                            <td key={d} className="border-b border-gray-50 px-1 py-2.5 text-center group-hover:bg-gray-50">
                              <button
                                type="button"
                                onClick={() => onCell(s.id, d, c)}
                                aria-label={`${s.name}, ${d}: ${c ? (c.present ? (c.diamond ? 'keldi, diamond' : 'keldi') : 'kelmadi') : 'belgilanmagan'}`}
                                className={cn(
                                  'relative mx-auto flex h-8 w-8 items-center justify-center rounded-lg ring-1 transition active:scale-90',
                                  !c && 'bg-white text-gray-300 ring-gray-200 hover:bg-gray-50',
                                  c?.present && 'bg-emerald-500 text-white ring-emerald-500',
                                  c && !c.present && 'bg-red-500 text-white ring-red-500',
                                )}
                              >
                                {!c ? <CircleDashed className="h-3.5 w-3.5" /> : c.present ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                {c?.diamond && <Gem className="absolute -right-1.5 -top-1.5 h-4 w-4 fill-sky-300 text-sky-600 drop-shadow" />}
                              </button>
                            </td>
                          );
                        })}
                        <td className="border-b border-gray-50 px-3 py-2.5 text-center font-bold tabular-nums text-emerald-600 group-hover:bg-gray-50">{present}</td>
                        <td className="border-b border-gray-50 px-3 py-2.5 text-center font-bold tabular-nums text-red-500 group-hover:bg-gray-50">{absent}</td>
                        <td className="border-b border-gray-50 px-3 py-2.5 text-center font-bold tabular-nums text-sky-600 group-hover:bg-gray-50">{gems}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {days.length === 0 && (
                <p className="border-t border-gray-100 px-4 py-6 text-center text-sm text-gray-500">
                  {monthLabel(month)} oyida hali davomat olinmagan. Yuqoridagi “Davomat olish” tugmasini bosing.
                </p>
              )}
            </div>
          )}

          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="font-semibold text-gray-600">Katakni bosing:</span>
            <span>— belgilanmagan</span>
            <span>→ ✓ keldi</span>
            <span>→ ✓💎 keldi va diamond</span>
            <span>→ ✗ kelmadi</span>
            <span>→ —</span>
          </p>
        </div>
      )}
      {dayModal.modal}
    </AdminShell>
  );
}
