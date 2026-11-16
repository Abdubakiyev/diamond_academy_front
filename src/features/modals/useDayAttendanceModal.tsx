'use client';

import { useState } from 'react';
import { Check, Gem, ListChecks, X } from 'lucide-react';
import { toast } from 'sonner';
import { ModalShell } from './ui/ModalUI';
import { useSetDayAttendance } from '../hooks/useGroupBoard';
import { handleApiError } from '../api/api';
import { currentMonth, daysInMonth, dayParts, todayStr } from '../../lib/month';
import { cn } from '../../lib/format';
import type { BoardStudent } from '../types/group-board';

interface Ctx {
  groupId: string;
  month: string;
  students: BoardStudent[];
  /** Saqlangach (yangi kun ustun bo'lib qolishi uchun) */
  onSaved: (date: string) => void;
}

type Row = { present: boolean | null; diamond: boolean };

const rowsFor = (students: BoardStudent[], date: string): Record<string, Row> =>
  Object.fromEntries(
    students.map((s) => {
      const c = s.attendance[date];
      return [s.id, c ? { present: c.present, diamond: c.diamond } : { present: null, diamond: false }];
    }),
  );

function Content({ ctx, onClose }: { ctx: Ctx; onClose: () => void }) {
  const save = useSetDayAttendance(ctx.groupId);
  const first = `${ctx.month}-01`;
  const last = `${ctx.month}-${String(daysInMonth(ctx.month)).padStart(2, '0')}`;
  const today = todayStr();

  const [date, setDate] = useState(ctx.month === currentMonth() ? today : first);
  const [rows, setRows] = useState<Record<string, Row>>(() => rowsFor(ctx.students, ctx.month === currentMonth() ? today : first));
  const [error, setError] = useState<string | null>(null);

  const changeDate = (d: string) => {
    if (!d) return;
    setDate(d);
    setRows(rowsFor(ctx.students, d));
  };
  const set = (id: string, p: Partial<Row>) => setRows((r) => ({ ...r, [id]: { ...r[id], ...p } }));

  const present = Object.values(rows).filter((r) => r.present === true).length;
  const absent = Object.values(rows).filter((r) => r.present === false).length;
  const diamonds = Object.values(rows).filter((r) => r.present && r.diamond).length;

  const submit = () => {
    setError(null);
    save.mutate(
      {
        date,
        records: ctx.students.map((s) => ({ studentId: s.id, present: rows[s.id].present, diamond: !!rows[s.id].present && rows[s.id].diamond })),
      },
      {
        onSuccess: () => {
          toast.success('Davomat saqlandi');
          ctx.onSaved(date);
          onClose();
        },
        onError: (e) => setError(handleApiError(e)),
      },
    );
  };

  const { day, weekday } = dayParts(date);

  return (
    <ModalShell
      maxWidth="max-w-xl"
      icon={ListChecks}
      title="Davomat olish"
      subtitle={`${weekday}, ${day}`}
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Saqlash"
      submitIcon={Check}
      isPending={save.isPending}
      errorMessage={error}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            type="date"
            value={date}
            min={first}
            max={last}
            onChange={(e) => changeDate(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => setRows(Object.fromEntries(ctx.students.map((s) => [s.id, { present: true, diamond: rows[s.id]?.diamond ?? false }])))}
            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Hammasi keldi
          </button>
        </div>

        <div className="flex gap-2 text-xs font-semibold">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-200">Keldi: {present}</span>
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-700 ring-1 ring-red-200">Kelmadi: {absent}</span>
          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700 ring-1 ring-sky-200">💎 {diamonds}</span>
        </div>

        <ul className="max-h-[22rem] space-y-1.5 overflow-y-auto pr-1">
          {ctx.students.map((s) => {
            const r = rows[s.id];
            return (
              <li key={s.id} className="flex items-center gap-2 rounded-xl bg-gray-50 p-2.5">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{s.name}</span>
                <button
                  type="button"
                  onClick={() => set(s.id, { present: r.present === true ? null : true })}
                  className={cn('inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold ring-1 transition', r.present === true ? 'bg-emerald-500 text-white ring-emerald-500' : 'bg-white text-gray-500 ring-gray-200 hover:bg-emerald-50')}
                >
                  <Check className="h-3.5 w-3.5" /> Keldi
                </button>
                <button
                  type="button"
                  onClick={() => set(s.id, { present: r.present === false ? null : false, diamond: false })}
                  className={cn('inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold ring-1 transition', r.present === false ? 'bg-red-500 text-white ring-red-500' : 'bg-white text-gray-500 ring-gray-200 hover:bg-red-50')}
                >
                  <X className="h-3.5 w-3.5" /> Kelmadi
                </button>
                <button
                  type="button"
                  disabled={r.present !== true}
                  onClick={() => set(s.id, { diamond: !r.diamond })}
                  title="Diamond berish"
                  aria-pressed={r.diamond}
                  className={cn('flex h-8 w-8 items-center justify-center rounded-lg ring-1 transition disabled:cursor-not-allowed disabled:opacity-30', r.present && r.diamond ? 'bg-sky-500 text-white ring-sky-500' : 'bg-white text-sky-400 ring-gray-200 hover:bg-sky-50')}
                >
                  <Gem className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
        {ctx.students.length === 0 && <p className="text-center text-sm text-gray-400">Guruhda faol o‘quvchi yo‘q.</p>}
      </div>
    </ModalShell>
  );
}

export function useDayAttendanceModal() {
  const [ctx, setCtx] = useState<Ctx | null>(null);
  return { open: (c: Ctx) => setCtx(c), modal: ctx ? <Content ctx={ctx} onClose={() => setCtx(null)} /> : null };
}
