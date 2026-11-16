import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { currentMonth, monthLabel, shiftMonth } from '../../lib/month';
import { cn } from '../../lib/format';

export default function MonthPicker({ value, onChange }: { value: string; onChange: (m: string) => void }) {
  const isNow = value === currentMonth();
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
      <button type="button" onClick={() => onChange(shiftMonth(value, -1))} aria-label="Oldingi oy" className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 active:scale-90">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="flex min-w-36 items-center justify-center gap-1.5 px-2 text-sm font-semibold text-gray-900">
        <CalendarDays className="h-4 w-4 text-indigo-500" /> {monthLabel(value)}
      </span>
      <button type="button" onClick={() => onChange(shiftMonth(value, 1))} aria-label="Keyingi oy" className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 active:scale-90">
        <ChevronRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange(currentMonth())}
        disabled={isNow}
        className={cn('ml-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition', isNow ? 'text-gray-300' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100')}
      >
        Bugun
      </button>
    </div>
  );
}
