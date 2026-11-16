const palette: Record<string, string> = {
  A1: 'bg-slate-100 text-slate-700 ring-slate-200',
  A2: 'bg-slate-100 text-slate-700 ring-slate-200',
  B1: 'bg-sky-50 text-sky-700 ring-sky-200',
  B2: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  C1: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  C2: 'bg-amber-50 text-amber-700 ring-amber-200',
};

/** CEFR darajasi belgisi. level yo'q bo'lsa "—" */
export default function ScoreBadge({ level, size = 'md' }: { level?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-3 py-1 text-sm', lg: 'px-4 py-1.5 text-base' };
  const tone = (level && palette[level]) || 'bg-gray-50 text-gray-500 ring-gray-200';
  return (
    <span className={`inline-flex items-center rounded-full font-bold ring-1 ${sizes[size]} ${tone}`}>
      {level || '—'}
    </span>
  );
}
