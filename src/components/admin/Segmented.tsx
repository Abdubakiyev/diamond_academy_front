'use client';

import { cn } from '../../lib/format';

export default function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn('inline-flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-lg px-3.5 py-1.5 text-sm font-medium transition',
            value === o.value ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-800',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
