'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Headphones, ImageIcon, ListPlus, Lock, Pencil, Plus, Settings2, Trash2 } from 'lucide-react';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';
import ConfirmModal from '../ui/ConfirmModal';
import SortableList from './SortableList';
import PartOptionsEditor from './PartOptionsEditor';
import { useExam } from '../../features/hooks/useExam';
import { useExamPart } from '../../features/hooks/useExamPart';
import { useDeleteQuestion, useReorderQuestions } from '../../features/hooks/useQuestion';
import { useQuestionModal, type PartRef } from '../../features/modals/useQuestionModal';
import { usePartModal } from '../../features/modals/usePartModal';
import { handleApiError } from '../../features/api/api';
import { BANK_FORMATS, FORMAT_HINTS, FORMAT_LABELS, SKILL_META } from '../../lib/exam-rules';
import { FORMAT_QUESTION_TYPES, QUESTION_TYPE_META, TFNG_LABELS } from '../../lib/question-rules';
import { cn } from '../../lib/format';
import type { Question, TfngValue } from '../../features/types/question';

function answerSummary(q: Question): string {
  switch (q.type) {
    case 'MULTIPLE_CHOICE': {
      const c = q.options.find((o) => o.isCorrect);
      return c ? `${c.label}) ${c.text}` : '';
    }
    case 'TRUE_FALSE_NG':
      return TFNG_LABELS[q.acceptedAnswers[0] as TfngValue] ?? q.acceptedAnswers[0] ?? '';
    case 'SHORT_ANSWER':
      return q.acceptedAnswers.join(' | ');
    case 'MATCHING':
      return q.correctPartOption ? `Javob: ${q.correctPartOption.label}` : '';
    case 'WRITING_PROMPT':
      return q.minWords || q.maxWords ? `${q.minWords ?? '…'}–${q.maxWords ?? '…'} so‘z` : 'So‘z chegarasi yo‘q';
    case 'SPEAKING_PROMPT': {
      const parts = [q.prepTimeSec ? `tayyorlanish ${q.prepTimeSec}s` : '', q.answerTimeSec ? `javob ${q.answerTimeSec}s` : ''].filter(Boolean);
      return parts.join(', ') || 'Vaqt chegarasi yo‘q';
    }
  }
}

export default function PartEditor({ examId, partId }: { examId: string; partId: string }) {
  const { data: exam } = useExam(examId);
  const { data: part, isLoading, isError, error } = useExamPart(partId);
  const reorder = useReorderQuestions();
  const del = useDeleteQuestion();
  const qModal = useQuestionModal();
  const partModal = usePartModal();
  const [toDelete, setToDelete] = useState<Question | null>(null);
  const [showPassage, setShowPassage] = useState(false);

  if (isLoading) return <Spinner />;
  if (isError || !part) return <EmptyState title="Partni yuklab bo‘lmadi" description={handleApiError(error)} />;

  const section = exam?.sections.find((s) => s.id === part.sectionId);
  if (!exam || !section) return <Spinner />;

  const locked = exam.stats.attempts > 0;
  const allowed = FORMAT_QUESTION_TYPES[part.format];
  const hasBank = BANK_FORMATS.includes(part.format);
  const bankEmpty = part.options.length === 0;
  const ref: PartRef = { id: part.id, format: part.format, skill: section.skill, options: part.options };
  const skill = SKILL_META[section.skill];

  const orphaned = part.questions.filter(
    (q) => q.type === 'MATCHING' && !q.correctPartOptionId,
  ).length;

  return (
    <div className="space-y-6">
      {/* ─── Part ma'lumoti ─── */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className={cn('flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r px-5 py-4 text-white', skill.grad)}>
          <div className="flex items-center gap-3">
            <skill.icon className="h-6 w-6" />
            <div>
              <p className="text-xs font-medium text-white/80">{skill.label}</p>
              <h2 className="text-lg font-bold leading-tight">{FORMAT_LABELS[part.format]}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => partModal.openEdit({ id: section.id, skill: section.skill }, part.id)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25"
          >
            <Settings2 className="h-4 w-4" /> Part sozlamalari
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm text-gray-500">{FORMAT_HINTS[part.format]}</p>
          {part.instructions && <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{part.instructions}</p>}

          {part.audioUrl && (
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <Headphones className="h-3.5 w-3.5" /> Part audiosi (maks. {part.audioPlayLimit} marta eshitiladi)
              </p>
              <audio controls src={part.audioUrl} className="w-full" preload="metadata" />
            </div>
          )}

          {part.imageUrl && (
            <div>
              <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <ImageIcon className="h-3.5 w-3.5" /> Part rasmi
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={part.imageUrl} alt="" className="max-h-64 rounded-xl ring-1 ring-gray-200" />
            </div>
          )}

          {part.passageText && (
            <div>
              <button type="button" onClick={() => setShowPassage((v) => !v)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                {showPassage ? 'Matnni yashirish' : 'Reading matnini ko‘rsatish'}
              </button>
              {showPassage && (
                <p className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">{part.passageText}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {locked && (
        <div className="flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-100">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          Bu imtihonda {exam.stats.attempts} ta urinish bor: savol qo‘shish, o‘chirish va tartibini o‘zgartirish qulflangan. Savol matni, ball va izohni tahrirlash mumkin.
        </div>
      )}

      {/* ─── A–J banki ─── */}
      {hasBank && <PartOptionsEditor key={part.options.map((o) => o.id + o.text).join('|')} partId={part.id} format={part.format} options={part.options} locked={locked} />}

      {orphaned > 0 && (
        <div className="flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {orphaned} ta moslashtirish savolining javobi belgilanmagan (bank o‘zgargan). Ularni tahrirlab, javobni qayta tanlang.
        </div>
      )}

      {/* ─── Savollar ─── */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900">
            Savollar <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">{part.questions.length}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {allowed.map((t) => {
              const m = QUESTION_TYPE_META[t];
              const blocked = locked || (t === 'MATCHING' && bankEmpty);
              return (
                <button
                  key={t}
                  type="button"
                  disabled={blocked}
                  title={t === 'MATCHING' && bankEmpty ? 'Avval variantlar bankini saqlang' : undefined}
                  onClick={() => qModal.openCreate(ref, t)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  <Plus className="h-4 w-4" /> {allowed.length > 1 ? m.label : 'Savol qo‘shish'}
                </button>
              );
            })}
            <button
              type="button"
              disabled={locked}
              onClick={() => qModal.openBulk(ref)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ListPlus className="h-4 w-4" /> Ommaviy
            </button>
          </div>
        </div>

        {part.questions.length === 0 ? (
          <EmptyState icon={Plus} title="Hali savol yo‘q" description="Yuqoridagi tugmalar bilan savol qo‘shing yoki matndan ommaviy kiriting." />
        ) : (
          <>
            {!locked && part.questions.length > 1 && <p className="mb-3 text-xs text-gray-400">Tartibni o‘zgartirish uchun savolni sudrang yoki ↑↓ tugmalaridan foydalaning. Raqamlar avtomatik yangilanadi.</p>}
            <SortableList
              items={part.questions}
              disabled={locked || reorder.isPending}
              onReorder={(questionIds) => reorder.mutate({ partId: part.id, questionIds }, { onError: (e) => toast.error(handleApiError(e)) })}
              renderRow={(q) => {
                const m = QUESTION_TYPE_META[q.type];
                const summary = answerSummary(q);
                const images = q.media.filter((x) => x.kind === 'IMAGE').length;
                return (
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">{q.number}</span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-gray-900">{q.text}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ring-1', m.chip)}>
                          <m.icon className="h-3 w-3" /> {m.label}
                        </span>
                        {q.type === 'MATCHING' && !q.correctPartOption ? (
                          <span className="font-semibold text-red-600">Javob belgilanmagan</span>
                        ) : (
                          summary && <span className="truncate text-emerald-700">{summary}</span>
                        )}
                        {q.audioUrl && <Headphones className="h-3.5 w-3.5 text-gray-400" />}
                        {images > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-gray-400">
                            <ImageIcon className="h-3.5 w-3.5" /> {images}
                          </span>
                        )}
                        <span className="text-gray-400">{q.points} ball</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => qModal.openEdit(ref, q, locked)}
                      title="Tahrirlash"
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => setToDelete(q)}
                      title="O‘chirish"
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              }}
            />
          </>
        )}
      </section>

      {qModal.modal}
      {partModal.modal}
      <ConfirmModal
        open={!!toDelete}
        title={`${toDelete?.number}-savolni o‘chirasizmi?`}
        message="Savol va unga biriktirilgan audio / rasmlar o‘chadi, keyingi savollar raqami avtomatik yangilanadi."
        confirmLabel="Ha, o‘chirish"
        isPending={del.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          del.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success('Savol o‘chirildi');
              setToDelete(null);
            },
            onError: (e) => toast.error(handleApiError(e)),
          })
        }
      />
    </div>
  );
}
