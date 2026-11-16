import { CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import type { SubmissionStatus } from '../features/types/assignment';
import { cn } from '../lib/format';

export const SUBMISSION_STATUS: Record<
  SubmissionStatus,
  { label: string; cls: string; icon: typeof Clock }
> = {
  SUBMITTED: { label: 'Tekshirilmoqda', cls: 'bg-sky-50 text-sky-700 ring-sky-200', icon: Clock },
  GRADED: { label: 'Baholangan', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle2 },
  RETURNED: { label: 'Qaytarilgan', cls: 'bg-amber-50 text-amber-700 ring-amber-200', icon: RotateCcw },
};

export default function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const s = SUBMISSION_STATUS[status] ?? SUBMISSION_STATUS.SUBMITTED;
  const Icon = s.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1', s.cls)}>
      <Icon className="h-3.5 w-3.5" /> {s.label}
    </span>
  );
}
