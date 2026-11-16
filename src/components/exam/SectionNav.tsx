import { Flag } from 'lucide-react';
import { isAnswered } from '../../lib/exam-session';
import { cn } from '../../lib/format';
import type { AnswerDraft, SessionPart } from '../../features/types/exam-session';

export default function SectionNav({
  parts,
  answers,
  flags,
  activePartId,
  onJump,
}: {
  parts: SessionPart[];
  answers: Record<string, AnswerDraft>;
  flags: Set<string>;
  activePartId: string;
  onJump: (partId: string, questionId: string) => void;
}) {
  const all = parts.flatMap((p) => p.questions);
  const done = all.filter((q) => isAnswered(q, answers[q.id])).length;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Savollar</h3>
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
          {done}/{all.length}
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all" style={{ width: `${all.length ? (done / all.length) * 100 : 0}%` }} />
      </div>

      <div className="space-y-3">
        {parts.map((p, pi) => (
          <div key={p.id}>
            {parts.length > 1 && <p className={cn('mb-1.5 text-xs font-medium', p.id === activePartId ? 'text-indigo-600' : 'text-gray-400')}>Part {pi + 1}</p>}
            <div className="flex flex-wrap gap-1.5">
              {p.questions.map((q) => {
                const on = isAnswered(q, answers[q.id]);
                const flagged = flags.has(q.id);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => onJump(p.id, q.id)}
                    aria-label={`${q.number}-savol${on ? ', javob berilgan' : ''}${flagged ? ', belgilangan' : ''}`}
                    className={cn(
                      'relative flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ring-1 transition',
                      on ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-white text-gray-600 ring-gray-200 hover:bg-gray-50',
                      flagged && 'ring-2 ring-amber-400',
                    )}
                  >
                    {q.number}
                    {flagged && <Flag className="absolute -right-1 -top-1 h-3 w-3 fill-amber-400 text-amber-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
