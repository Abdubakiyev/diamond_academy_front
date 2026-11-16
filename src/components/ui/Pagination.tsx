'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  limit,
  total,
  onChange,
}: {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (total <= limit) return null;

  const btn =
    'inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex items-center justify-between gap-3 pt-4">
      <p className="text-sm text-gray-500">
        {page} / {pages} sahifa · jami {total} ta
      </p>
      <div className="flex gap-2">
        <button type="button" className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" /> Oldingi
        </button>
        <button type="button" className={btn} disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Keyingi <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
