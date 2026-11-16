'use client';

import { AlertTriangle, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import FileDropzone, { type UploadItem } from '../ui/FileDropzone';
import Segmented from './Segmented';
import { QUESTION_TYPE_META, TFNG_LABELS } from '../../lib/question-rules';
import { cn } from '../../lib/format';
import type { PartOption } from '../../features/types/exam';
import type { QuestionMedia, QuestionType, TfngValue } from '../../features/types/question';
import type { QuestionDraft } from '../../lib/question-draft';

export const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 ' +
  'hover:border-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400';

export function Label({ text, hint, children }: { text: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-gray-700">{text}</span>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

interface Props {
  draft: QuestionDraft;
  patch: (p: Partial<QuestionDraft>) => void;
  allowed: QuestionType[];
  bank: PartOption[];
  /** Urinishlar bor: tur va variantlar tuzilmasini o'zgartirib bo'lmaydi */
  lockStructure: boolean;
}

export default function QuestionFields({ draft, patch, allowed, bank, lockStructure }: Props) {
  const { type } = draft;

  const setOpt = (i: number, p: Partial<QuestionDraft['options'][number]>) =>
    patch({ options: draft.options.map((o, k) => (k === i ? { ...o, ...p } : o)) });
  const setCorrect = (i: number) => patch({ options: draft.options.map((o, k) => ({ ...o, isCorrect: k === i })) });
  const setAnswer = (i: number, v: string) => patch({ answers: draft.answers.map((a, k) => (k === i ? v : a)) });

  return (
    <div className="space-y-4">
      {allowed.length > 1 && (
        <Label text="Savol turi">
          <Segmented
            value={type}
            onChange={(v) => !lockStructure && patch({ type: v })}
            options={allowed.map((t) => ({ value: t, label: QUESTION_TYPE_META[t].label }))}
          />
        </Label>
      )}

      <Label
        text={type === 'WRITING_PROMPT' ? 'Topshiriq matni' : type === 'SPEAKING_PROMPT' ? 'Savol' : 'Savol matni'}
        hint={type === 'SHORT_ANSWER' ? 'Bo‘sh joy uchun ____ ishlating' : undefined}
      >
        <textarea
          rows={type === 'WRITING_PROMPT' ? 6 : 3}
          value={draft.text}
          onChange={(e) => patch({ text: e.target.value })}
          placeholder={
            type === 'SHORT_ANSWER'
              ? 'The bus leaves at ____ pm.'
              : type === 'WRITING_PROMPT'
                ? 'Write a letter to your friend about...'
                : 'Savol matni...'
          }
          className={cn(inputCls, 'resize-y')}
        />
      </Label>

      {/* ─── Ko'p variantli ─── */}
      {type === 'MULTIPLE_CHOICE' && (
        <Label text="Variantlar" hint="To‘g‘ri javobni doira bilan belgilang">
          <div className="space-y-2">
            {draft.options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={lockStructure}
                  onClick={() => setCorrect(i)}
                  aria-label={`${String.fromCharCode(65 + i)} to‘g‘ri javob`}
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1 transition disabled:cursor-not-allowed',
                    o.isCorrect ? 'bg-emerald-500 text-white ring-emerald-500' : 'bg-white text-gray-500 ring-gray-200 hover:ring-emerald-300',
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </button>
                <input
                  value={o.text}
                  disabled={lockStructure}
                  onChange={(e) => setOpt(i, { text: e.target.value })}
                  placeholder={`${String.fromCharCode(65 + i)} varianti`}
                  className={inputCls}
                />
                {!lockStructure && draft.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => patch({ options: draft.options.filter((_, k) => k !== i) })}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Variantni o‘chirish"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {!lockStructure && draft.options.length < 6 && (
              <button
                type="button"
                onClick={() => patch({ options: [...draft.options, { label: '', text: '', isCorrect: false }] })}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="h-4 w-4" /> Variant qo‘shish
              </button>
            )}
          </div>
        </Label>
      )}

      {/* ─── True / False / NG ─── */}
      {type === 'TRUE_FALSE_NG' && (
        <Label text="To‘g‘ri javob">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TFNG_LABELS) as TfngValue[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => patch({ tfng: v })}
                className={cn(
                  'rounded-xl px-3 py-2.5 text-sm font-semibold ring-1 transition',
                  draft.tfng === v
                    ? v === 'TRUE'
                      ? 'bg-emerald-500 text-white ring-emerald-500'
                      : v === 'FALSE'
                        ? 'bg-rose-500 text-white ring-rose-500'
                        : 'bg-slate-600 text-white ring-slate-600'
                    : 'bg-white text-gray-600 ring-gray-200 hover:bg-gray-50',
                )}
              >
                {TFNG_LABELS[v]}
              </button>
            ))}
          </div>
        </Label>
      )}

      {/* ─── Qisqa javob ─── */}
      {type === 'SHORT_ANSWER' && (
        <>
          <Label text="Qabul qilinadigan javoblar" hint="Bir nechta variant yozish mumkin (masalan: 5 va five)">
            <div className="space-y-2">
              {draft.answers.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={a} onChange={(e) => setAnswer(i, e.target.value)} placeholder="To‘g‘ri javob" className={inputCls} />
                  {draft.answers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => patch({ answers: draft.answers.filter((_, k) => k !== i) })}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Javobni o‘chirish"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {draft.answers.length < 20 && (
                <button
                  type="button"
                  onClick={() => patch({ answers: [...draft.answers, ''] })}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="h-4 w-4" /> Yana javob varianti
                </button>
              )}
            </div>
          </Label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={draft.caseSensitive}
              onChange={(e) => patch({ caseSensitive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Katta-kichik harfni farqlash
          </label>
        </>
      )}

      {/* ─── Moslashtirish ─── */}
      {type === 'MATCHING' && (
        <Label text="To‘g‘ri javob (bankdan)">
          {bank.length === 0 ? (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Avval part sahifasida A–J variantlar bankini to‘ldiring, keyin moslashtirish savoli qo‘shiladi.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {bank.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => patch({ matchLabel: o.label })}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl p-2.5 text-left text-sm ring-1 transition',
                    draft.matchLabel === o.label ? 'bg-indigo-50 ring-indigo-400' : 'bg-white ring-gray-200 hover:bg-gray-50',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                      draft.matchLabel === o.label ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600',
                    )}
                  >
                    {o.label}
                  </span>
                  <span className="line-clamp-2 text-gray-700">{o.text}</span>
                </button>
              ))}
            </div>
          )}
        </Label>
      )}

      {/* ─── Writing ─── */}
      {type === 'WRITING_PROMPT' && (
        <div className="grid grid-cols-2 gap-3">
          <Label text="Min so‘z" hint="ixtiyoriy">
            <input type="number" min={1} value={draft.minWords} onChange={(e) => patch({ minWords: e.target.value })} placeholder="120" className={inputCls} />
          </Label>
          <Label text="Max so‘z" hint="ixtiyoriy">
            <input type="number" min={1} value={draft.maxWords} onChange={(e) => patch({ maxWords: e.target.value })} placeholder="150" className={inputCls} />
          </Label>
        </div>
      )}

      {/* ─── Speaking ─── */}
      {type === 'SPEAKING_PROMPT' && (
        <div className="grid grid-cols-2 gap-3">
          <Label text="Tayyorlanish (soniya)" hint="ixtiyoriy">
            <input type="number" min={0} value={draft.prepTimeSec} onChange={(e) => patch({ prepTimeSec: e.target.value })} placeholder="30" className={inputCls} />
          </Label>
          <Label text="Javob vaqti (soniya)" hint="ixtiyoriy">
            <input type="number" min={0} value={draft.answerTimeSec} onChange={(e) => patch({ answerTimeSec: e.target.value })} placeholder="60" className={inputCls} />
          </Label>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
        {type !== 'WRITING_PROMPT' && type !== 'SPEAKING_PROMPT' && (
          <Label text="Ball">
            <input type="number" min={0} max={100} step="0.5" value={draft.points} onChange={(e) => patch({ points: e.target.value })} className={inputCls} />
          </Label>
        )}
        <div className={type === 'WRITING_PROMPT' || type === 'SPEAKING_PROMPT' ? 'sm:col-span-2' : undefined}>
          <Label text="Izoh" hint="natijada ko‘rsatiladi, ixtiyoriy">
            <input value={draft.explanation} onChange={(e) => patch({ explanation: e.target.value })} placeholder="Nima uchun bu javob to‘g‘ri" className={inputCls} />
          </Label>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Savol rasmlari ───────────── */

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ImageAttachments({
  existing,
  onRemoveExisting,
  onNew,
  disabled,
}: {
  existing: QuestionMedia[];
  onRemoveExisting: (id: string) => void;
  onNew: (items: UploadItem[]) => void;
  disabled?: boolean;
}) {
  const images = existing.filter((m) => m.kind === 'IMAGE');
  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.caption ?? ''} className="h-24 w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveExisting(m.id)}
                aria-label="Rasmni o‘chirish"
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1.5 text-red-600 opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <FileDropzone
        purpose="EXAM_IMAGE"
        accept={IMAGE_TYPES}
        maxFiles={4}
        maxSizeMb={10}
        disabled={disabled}
        hint="Rasm (grafik, xarita, Speaking kartasi). Maks. 10 MB"
        onChange={onNew}
      />
    </div>
  );
}

export { ImagePlus };
