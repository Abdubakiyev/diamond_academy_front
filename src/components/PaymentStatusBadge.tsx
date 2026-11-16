import { STATUS_META } from '../lib/payment';
import { cn } from '../lib/format';
import type { PaymentStatus } from '../features/types/exam-payment';

export default function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1', m.cls)}>
      <m.icon className="h-3 w-3" /> {m.label}
    </span>
  );
}
