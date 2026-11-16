'use client';

import { Phone } from 'lucide-react';

/** Qiymat doim "+998901234567" ko'rinishida saqlanadi; ekranda "90 123 45 67" */
export const isValidPhone = (v?: string) => /^\+998\d{9}$/.test(v ?? '');

const national = (v: string) => (v.startsWith('+998') ? v.slice(4) : v).replace(/\D/g, '').slice(0, 9);

const group = (d: string) =>
  [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');

export default function PhoneInput({
  id,
  value,
  onChange,
  onBlur,
  invalid,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
}) {
  return (
    <div
      className={`group flex items-center overflow-hidden rounded-xl border bg-white shadow-sm transition-all
        focus-within:ring-4 ${
          invalid
            ? 'border-red-300 focus-within:border-red-400 focus-within:ring-red-500/10'
            : 'border-gray-200 hover:border-gray-300 focus-within:border-indigo-500 focus-within:ring-indigo-500/10'
        }`}
    >
      <div className="flex items-center gap-2 self-stretch border-r border-gray-100 bg-gray-50 px-3.5 text-sm font-medium text-gray-600">
        <Phone className="h-4 w-4 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
        +998
      </div>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="90 123 45 67"
        value={group(national(value))}
        onBlur={onBlur}
        onChange={(e) => {
          const d = e.target.value.replace(/\D/g, '').slice(0, 9);
          onChange(d ? `+998${d}` : '');
        }}
        className="w-full bg-transparent px-3.5 py-3 text-[15px] tracking-wide text-gray-900 outline-none placeholder:text-gray-400"
      />
    </div>
  );
}
