import { cn } from '../../lib/format';

export default function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div role="status" className={cn('flex items-center justify-center gap-3 py-10 text-gray-500', className)}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      {label && <span className="text-sm">{label}</span>}
      <span className="sr-only">Yuklanmoqda...</span>
    </div>
  );
}
