import { Clock } from 'lucide-react';
import { formatClock } from '../../lib/exam-session';
import { cn } from '../../lib/format';

export default function ExamTimer({ left, className }: { left: number | null; className?: string }) {
  if (left == null) return null;
  const danger = left <= 60;
  const warn = left <= 300;
  return (
    <div
      role="timer"
      aria-live="off"
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-lg font-bold tabular-nums ring-1 transition-colors',
        danger ? 'animate-pulse bg-red-50 text-red-600 ring-red-200' : warn ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-slate-900 text-white ring-slate-900',
        className,
      )}
    >
      <Clock className="h-4 w-4" /> {formatClock(left)}
    </div>
  );
}
