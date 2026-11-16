import { countWords } from '../../lib/exam-session';
import { cn } from '../../lib/format';

export default function WritingEditor({
  value,
  onChange,
  minWords,
  maxWords,
}: {
  value: string;
  onChange: (v: string) => void;
  minWords?: number | null;
  maxWords?: number | null;
}) {
  const words = countWords(value);
  const tooFew = !!minWords && words < minWords;
  const tooMany = !!maxWords && words > maxWords;

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        maxLength={20000}
        placeholder="Javobingizni shu yerga yozing..."
        className="w-full resize-y rounded-xl border border-gray-200 bg-white p-4 text-[15px] leading-relaxed text-gray-900 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-gray-400">{minWords || maxWords ? `Tavsiya: ${minWords ?? '…'}–${maxWords ?? '…'} so‘z` : 'So‘z chegarasi yo‘q'}</span>
        <span className={cn('rounded-full px-2.5 py-1 font-semibold ring-1', tooMany ? 'bg-red-50 text-red-700 ring-red-200' : tooFew ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200')}>
          {words} so‘z
        </span>
      </div>
    </div>
  );
}
