'use client';

import AudioPlayer from './AudioPlayer';
import QuestionRenderer from './QuestionRenderer';
import type { AnswerDraft, SessionPart } from '../../features/types/exam-session';

interface Props {
  attemptId: string;
  part: SessionPart;
  answers: Record<string, AnswerDraft>;
  onAnswer: (questionId: string, patch: AnswerDraft) => void;
  flags: Set<string>;
  onFlag: (questionId: string) => void;
  onBusy: (questionId: string, busy: boolean) => void;
}

export default function PartView({ attemptId, part, answers, onAnswer, flags, onFlag, onBusy }: Props) {
  const hasPassage = !!part.passageText;

  const questions = (
    <div className="space-y-4">
      {part.questions.map((q) => (
        <QuestionRenderer
          key={q.id}
          attemptId={attemptId}
          q={q}
          part={part}
          answer={answers[q.id]}
          onChange={(p) => onAnswer(q.id, p)}
          flagged={flags.has(q.id)}
          onFlag={() => onFlag(q.id)}
          onBusy={onBusy}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {(part.title || part.instructions) && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          {part.title && <h2 className="font-semibold text-gray-900">{part.title}</h2>}
          {part.instructions && <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{part.instructions}</p>}
        </div>
      )}

      {part.audio && <AudioPlayer attemptId={attemptId} target={{ partId: part.id }} audio={part.audio} label={part.title ? `${part.title} audiosi` : 'Part audiosi'} />}

      {part.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={part.imageUrl} alt="" className="max-h-96 rounded-2xl ring-1 ring-gray-200" />
      )}

      {/* A–J banki: savollar shu variantlardan tanlaydi */}
      {part.options.length > 0 && (
        <div className="rounded-2xl bg-violet-50/70 p-4 ring-1 ring-violet-100">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-700">Variantlar</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {part.options.map((o) => (
              <li key={o.id} className="flex items-start gap-2.5 text-sm text-gray-800">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-600 text-xs font-bold text-white">{o.label}</span>
                <span className="pt-0.5">{o.text}</span>
                {o.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.imageUrl} alt="" className="h-12 rounded-md" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasPassage ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto">
            <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-800">{part.passageText}</p>
          </div>
          {questions}
        </div>
      ) : (
        questions
      )}
    </div>
  );
}
