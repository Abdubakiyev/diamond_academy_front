'use client';

import { useId } from 'react';

export default function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-100">
      <div className="min-w-0">
        <p id={id} className="text-sm font-medium text-gray-700">
          {label}
        </p>
        {description && <p className={`text-xs transition-colors ${checked ? 'text-emerald-600' : 'text-gray-500'}`}>{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${
          checked ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
