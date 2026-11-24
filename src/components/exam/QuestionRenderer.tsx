'use client';

import { Fragment, type ReactNode } from 'react';
import { Flag } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import Highlightable from './Highlightable';
import WritingEditor from './WritingEditor';
import SpeakingRecorder from './SpeakingRecorder';
import { isAnswered } from '../../lib/exam-session';
import { TFNG_LABELS } from '../../lib/question-rules';
import { cn } from '../../lib/format';
import type { AnswerDraft, SessionPart, SessionQuestion } from '../../features/types/exam-session';
import type { TfngValue } from '../../features/types/question';

interface Props {
  attemptId: string;
  q: SessionQuestion;
  part: SessionPart;
  answer?: AnswerDraft;
  onChange: (patch: AnswerDraft) => void;
  flagged: boolean;
  onFlag: () => void;
  onBusy: (questionId: string, busy: boolean) => void;
}

const blankInput =
  'rounded-lg border-0 border-b-2 border-indigo-300 bg-indigo-50/60 px-2 py-1 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-0';

/** Matn tanlanayotgan bo'lsa true: bu holatda bosish javobni o'zgartirmasligi kerak */
const hasTextSelection = () => {
  const s = typeof window !== 'undefined' ? window.getSelection() : null;
  return !!s && !s.isCollapsed && s.toString().length > 0;
};

export default function QuestionRenderer({ attemptId, q, part, answer, onChange, flagged, onFlag, onBusy }: Props) {
  const images = q.media.filter((m) => m.kind === 'IMAGE' && m.url);
  const answered = isAnswered(q, answer);
  const longForm = q.type === 'WRITING_PROMPT' || q.type === 'SPEAKING_PROMPT';

  // Faqat Listening / Reading savollarida belgilash bor
  const hl = (id: string, node: ReactNode, className?: string) =>
    longForm ? (
      node
    ) : (
      <Highlightable id={id} className={className}>
        {node}
      </Highlightable>
    );

  const shortInput = (
    <input
      value={answer?.textAnswer ?? ''}
      onChange={(e) => onChange({ textAnswer: e.target.value })}
      maxLength={200}
      autoComplete="off"
      spellCheck={false}
      aria-label={`${q.number}-savol javobi`}
      className={cn(blankInput, 'mx-1 w-44')}
    />
  );

  return (
    <article id={`q-${q.id}`} className={cn('scroll-mt-28 rounded-2xl border bg-white p-4 shadow-sm transition', answered ? 'border-indigo-100' : 'border-gray-100')}>
      <div className="flex items-start gap-3">
        <span className={cn('flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg px-1.5 text-sm font-bold', answered ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600')}>{q.number}</span>

        <div className="min-w-0 flex-1 space-y-3">
          {q.audio && <AudioPlayer attemptId={attemptId} target={{ questionId: q.id }} audio={q.audio} label={`${q.number}-savol audiosi`} />}

          {images.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.url as string} alt={m.caption ?? ''} className="max-h-80 rounded-xl ring-1 ring-gray-200" />
          ))}

          {/* Savol matni (qisqa javobda bo'sh joy ichiga input qo'yiladi) */}
          {q.type === 'SHORT_ANSWER' && /_{2,}/.test(q.text)
            ? hl(
                `q-${q.id}`,
                <p className="text-[15px] leading-9 text-gray-900">
                  {q.text.split(/_{2,}/).map((seg, i, arr) => (
                    <Fragment key={i}>
                      {seg}
                      {i < arr.length - 1 && (i === 0 ? shortInput : <span className="text-gray-300">____</span>)}
                    </Fragment>
                  ))}
                </p>,
              )
            : hl(
                `q-${q.id}`,
                <p className={cn('whitespace-pre-wrap text-[15px] leading-relaxed text-gray-900', longForm && 'font-medium')}>{q.text}</p>,
              )}

          {/* ─── Javob maydoni ─── */}
          {q.type === 'MULTIPLE_CHOICE' && (
            <div role="radiogroup" className="space-y-2">
              {q.options.map((o) => {
                const on = answer?.selectedOptionId === o.id;
                const toggle = () => onChange({ selectedOptionId: on ? null : o.id });
                return (
                  // button emas: ichidagi matnni sichqoncha bilan tanlab belgilash uchun
                  <div
                    key={o.id}
                    role="radio"
                    aria-checked={on}
                    tabIndex={0}
                    onClick={() => {
                      if (hasTextSelection()) return; // matn belgilanayotgan bo'lsa, javob o'zgarmaydi
                      toggle();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle();
                      }
                    }}
                    className={cn(
                      'flex w-full cursor-pointer items-start gap-3 rounded-xl p-3 text-left text-sm ring-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                      on ? 'bg-indigo-50 ring-indigo-400' : 'bg-white ring-gray-200 hover:bg-gray-50',
                    )}
                  >
                    <span className={cn('flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full text-xs font-bold', on ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600')}>{o.label}</span>
                    {hl(`opt-${o.id}`, <span className="text-gray-800">{o.text}</span>, 'min-w-0 flex-1 select-text pt-0.5')}
                  </div>
                );
              })}
            </div>
          )}

          {q.type === 'TRUE_FALSE_NG' && (
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TFNG_LABELS) as TfngValue[]).map((v) => {
                const on = answer?.textAnswer === v;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onChange({ textAnswer: on ? null : v })}
                    className={cn('rounded-xl px-2 py-2.5 text-sm font-semibold ring-1 transition', on ? 'bg-indigo-600 text-white ring-indigo-600' : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50')}
                  >
                    {TFNG_LABELS[v]}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === 'SHORT_ANSWER' && !/_{2,}/.test(q.text) && <div>{shortInput}</div>}

          {q.type === 'MATCHING' && (
            <select
              value={answer?.selectedPartOptionId ?? ''}
              onChange={(e) => onChange({ selectedPartOptionId: e.target.value || null })}
              aria-label={`${q.number}-savol uchun variant`}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tanlang...</option>
              {part.options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}. {o.text}
                </option>
              ))}
            </select>
          )}

          {q.type === 'WRITING_PROMPT' && (
            <WritingEditor value={answer?.textAnswer ?? ''} onChange={(v) => onChange({ textAnswer: v })} minWords={q.minWords} maxWords={q.maxWords} />
          )}

          {q.type === 'SPEAKING_PROMPT' && (
            <SpeakingRecorder
              number={q.number}
              prepSec={q.prepTimeSec ?? part.prepTimeSec}
              answerSec={q.answerTimeSec ?? part.answerTimeSec}
              saved={!!answer?.audioKey || !!answer?.hasAudio}
              onDone={(key, durationSec) => onChange({ audioKey: key, durationSec, hasAudio: true })}
              onBusy={(b) => onBusy(q.id, b)}
            />
          )}
        </div>

        <button
          type="button"
          onClick={onFlag}
          aria-pressed={flagged}
          title={flagged ? 'Belgini olib tashlash' : 'Keyinroq qaytish uchun belgilash'}
          className={cn('shrink-0 rounded-lg p-2 transition', flagged ? 'bg-amber-100 text-amber-600' : 'text-gray-300 hover:bg-gray-50 hover:text-amber-500')}
        >
          <Flag className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
