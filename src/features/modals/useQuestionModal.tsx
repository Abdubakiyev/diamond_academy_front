'use client';

import { useState } from 'react';
import { FileText, ListPlus, Pencil, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ModalShell } from './ui/ModalUI';
import QuestionFields, { ImageAttachments, Label, inputCls } from '../../components/admin/QuestionEditor';
import MediaField, { type MediaValue } from '../../components/admin/MediaField';
import type { UploadItem } from '../../components/ui/FileDropzone';
import Segmented from '../../components/admin/Segmented';
import {
  useAddQuestionMedia,
  useCreateQuestion,
  useCreateQuestionsBulk,
  useRemoveQuestionMedia,
  useUpdateQuestion,
} from '../hooks/useQuestion';
import { handleApiError } from '../api/api';
import { BULK_HELP, FORMAT_QUESTION_TYPES, QUESTION_TYPE_META } from '../../lib/question-rules';
import { blankDraft, buildInput, buildUpdate, draftFromQuestion, parseBulk, type QuestionDraft } from '../../lib/question-draft';
import { cn } from '../../lib/format';
import type { Skill } from '../types/common';
import type { PartFormat, PartOption } from '../types/exam';
import type { Question, QuestionType } from '../types/question';

export interface PartRef {
  id: string;
  format: PartFormat;
  skill: Skill;
  options: PartOption[];
}

const AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'audio/webm', 'audio/ogg'];

/* ───────────── Bitta savol ───────────── */

function QuestionForm({
  part,
  question,
  initialType,
  locked,
  onClose,
}: {
  part: PartRef;
  question?: Question;
  initialType?: QuestionType;
  locked: boolean;
  onClose: () => void;
}) {
  const allowed = FORMAT_QUESTION_TYPES[part.format];
  const isEdit = !!question;
  const create = useCreateQuestion();
  const update = useUpdateQuestion();
  const addMedia = useAddQuestionMedia();
  const removeMedia = useRemoveQuestionMedia();

  const [draft, setDraft] = useState<QuestionDraft>(() =>
    question ? draftFromQuestion(question) : blankDraft(initialType ?? allowed[0]),
  );
  const [audio, setAudio] = useState<MediaValue>({ key: undefined, uploading: false });
  const [images, setImages] = useState<UploadItem[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [again, setAgain] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const patch = (p: Partial<QuestionDraft>) => setDraft((d) => ({ ...d, ...p }));
  const showAudio = part.skill === 'LISTENING' || part.skill === 'SPEAKING';
  const uploading = audio.uploading || images.some((i) => i.status === 'uploading');

  const submit = async () => {
    setError(null);
    const built = buildInput(draft, part.options);
    if (!built.ok) return setError(built.error);
    if (uploading) return setError('Fayllar yuklanishini kuting');

    setSaving(true);
    try {
      let saved: Question;
      if (question) {
        saved = await update.mutateAsync({ id: question.id, input: buildUpdate(built.value, question, audio.key) });
      } else {
        saved = await create.mutateAsync({
          partId: part.id,
          input: { ...built.value, audioKey: typeof audio.key === 'string' ? audio.key : undefined },
        });
      }

      const keys = images.filter((i) => i.status === 'done' && i.key).map((i) => i.key as string);
      for (const storageKey of keys) {
        try {
          await addMedia.mutateAsync({ questionId: saved.id, input: { storageKey } });
        } catch (e) {
          toast.warning(`Savol saqlandi, lekin rasm biriktirilmadi: ${handleApiError(e)}`);
        }
      }

      toast.success(isEdit ? 'Savol yangilandi' : 'Savol qo‘shildi');
      if (!isEdit && again) {
        setDraft(blankDraft(draft.type));
        setImages([]);
        setAudio({ key: undefined, uploading: false });
        setFormKey((k) => k + 1);
      } else {
        onClose();
      }
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const dropExisting = (mediaId: string) =>
    removeMedia.mutate(mediaId, {
      onSuccess: () => setRemoved((r) => [...r, mediaId]),
      onError: (e) => toast.error(handleApiError(e)),
    });

  return (
    <ModalShell
      maxWidth="max-w-2xl"
      icon={isEdit ? Pencil : Plus}
      title={isEdit ? `${question.number}-savolni tahrirlash` : 'Yangi savol'}
      subtitle={QUESTION_TYPE_META[draft.type].label}
      onClose={onClose}
      onSubmit={submit}
      submitLabel={isEdit ? 'Saqlash' : 'Qo‘shish'}
      submitIcon={isEdit ? Save : Plus}
      submitDisabled={uploading}
      isPending={saving}
      errorMessage={error}
    >
      <div key={formKey} className="space-y-5">
        {locked && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">
            Bu imtihonda urinishlar bor, shuning uchun tur va variantlar tuzilmasini o‘zgartirib bo‘lmaydi. Matn, ball va izohni tahrirlash mumkin.
          </p>
        )}

        <QuestionFields draft={draft} patch={patch} allowed={allowed} bank={part.options} lockStructure={locked && isEdit} />

        {showAudio && (
          <Label text="Savol audiosi" hint="ixtiyoriy">
            <MediaField
              purpose="EXAM_AUDIO"
              kind="audio"
              accept={AUDIO_TYPES}
              maxSizeMb={100}
              hint="MP3, M4A, WAV. Maks. 100 MB"
              currentUrl={question?.audioUrl ?? null}
              onChange={setAudio}
            />
          </Label>
        )}

        <Label text="Rasmlar" hint="ixtiyoriy">
          <ImageAttachments
            existing={(question?.media ?? []).filter((m) => !removed.includes(m.id))}
            onRemoveExisting={dropExisting}
            onNew={setImages}
          />
        </Label>

        {!isEdit && (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={again}
              onChange={(e) => setAgain(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Saqlagach yana savol qo‘shish
          </label>
        )}
      </div>
    </ModalShell>
  );
}

/* ───────────── Ommaviy qo'shish ───────────── */

function BulkForm({ part, onClose }: { part: PartRef; onClose: () => void }) {
  const allowed = FORMAT_QUESTION_TYPES[part.format];
  const bulk = useCreateQuestionsBulk();
  const [type, setType] = useState<QuestionType>(allowed[0]);
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | null>(null);

  const parsed = parseBulk(type, raw, part.options);
  const help = BULK_HELP[type];

  const submit = () => {
    setError(null);
    if (parsed.errors.length) return setError(parsed.errors[0]);
    if (parsed.items.length === 0) return setError('Hech narsa kiritilmadi');
    if (parsed.items.length > 60) return setError('Bir martada ko‘pi bilan 60 ta savol');
    bulk.mutate(
      { partId: part.id, questions: parsed.items },
      {
        onSuccess: (list) => {
          toast.success(`${list.length} ta savol qo‘shildi`);
          onClose();
        },
        onError: (e) => setError(handleApiError(e)),
      },
    );
  };

  return (
    <ModalShell
      maxWidth="max-w-2xl"
      icon={ListPlus}
      title="Ommaviy qo‘shish"
      subtitle="Savollarni matn ko‘rinishida joylashtiring"
      onClose={onClose}
      onSubmit={submit}
      submitLabel={parsed.items.length ? `${parsed.items.length} ta savolni qo‘shish` : 'Qo‘shish'}
      submitIcon={Plus}
      submitDisabled={parsed.items.length === 0}
      isPending={bulk.isPending}
      errorMessage={error}
    >
      <div className="space-y-4">
        {allowed.length > 1 && (
          <Label text="Savol turi">
            <Segmented value={type} onChange={setType} options={allowed.map((t) => ({ value: t, label: QUESTION_TYPE_META[t].label }))} />
          </Label>
        )}

        <div className="rounded-xl bg-indigo-50/60 p-3 text-xs text-indigo-900 ring-1 ring-indigo-100">
          <p className="font-medium">{help.title}</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-white/80 p-2 font-mono text-[11px] text-gray-700">{help.example}</pre>
        </div>

        <textarea
          rows={10}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Savollarni shu yerga joylashtiring..."
          className={cn(inputCls, 'resize-y font-mono text-[13px]')}
        />

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <FileText className="h-3.5 w-3.5" /> {parsed.items.length} ta tayyor
          </span>
          {parsed.errors.length > 0 && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700 ring-1 ring-red-200">{parsed.errors.length} ta xato</span>
          )}
        </div>
        {parsed.errors.length > 0 && (
          <ul className="space-y-1 text-xs text-red-600">
            {parsed.errors.slice(0, 5).map((e, i) => (
              <li key={i}>• {e}</li>
            ))}
            {parsed.errors.length > 5 && <li>… va yana {parsed.errors.length - 5} ta</li>}
          </ul>
        )}
        <p className="text-xs text-gray-400">Ball hamma savolga 1 qilib qo‘yiladi, keyin har birini tahrirlab o‘zgartirish mumkin.</p>
      </div>
    </ModalShell>
  );
}

/* ───────────── Hook ───────────── */

type State =
  | { kind: 'create'; part: PartRef; type?: QuestionType }
  | { kind: 'edit'; part: PartRef; question: Question; locked: boolean }
  | { kind: 'bulk'; part: PartRef }
  | null;

export function useQuestionModal() {
  const [state, setState] = useState<State>(null);
  const close = () => setState(null);

  return {
    openCreate: (part: PartRef, type?: QuestionType) => setState({ kind: 'create', part, type }),
    openEdit: (part: PartRef, question: Question, locked: boolean) => setState({ kind: 'edit', part, question, locked }),
    openBulk: (part: PartRef) => setState({ kind: 'bulk', part }),
    modal:
      state?.kind === 'create' ? (
        <QuestionForm part={state.part} initialType={state.type} locked={false} onClose={close} />
      ) : state?.kind === 'edit' ? (
        <QuestionForm key={state.question.id} part={state.part} question={state.question} locked={state.locked} onClose={close} />
      ) : state?.kind === 'bulk' ? (
        <BulkForm part={state.part} onClose={close} />
      ) : null,
  };
}
