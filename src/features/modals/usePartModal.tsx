'use client';

import { useState } from 'react';
import { Clock, Hash, Heading, Layers3, Plus, Repeat, Save, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { Field, ModalShell, SelectInput, TextAreaInput, TextInput } from './ui/ModalUI';
import MediaField, { type MediaValue } from '../../components/admin/MediaField';
import Spinner from '../../components/ui/Spinner';
import { useCreatePart, useExamPart, useUpdatePart } from '../hooks/useExamPart';
import { handleApiError } from '../api/api';
import { FORMAT_HINTS, FORMAT_LABELS, SKILL_FORMATS, SKILL_META, supportsImage } from '../../lib/exam-rules';
import type { Skill } from '../types/common';
import type { ExamPartDetail, PartFormat } from '../types/exam';

const AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'audio/webm', 'audio/ogg'];
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface SectionRef {
  id: string;
  skill: Skill;
}

interface Initial {
  format: PartFormat;
  title: string;
  instructions: string;
  minutes: string;
  playLimit: string;
  passage: string;
  prep: string;
  answer: string;
  audioUrl: string | null;
  imageUrl: string | null;
  hasQuestions: boolean;
}

const blankFor = (skill: Skill): Initial => ({
  format: SKILL_FORMATS[skill][0],
  title: '',
  instructions: '',
  minutes: '',
  playLimit: '2',
  passage: '',
  prep: '',
  answer: '',
  audioUrl: null,
  imageUrl: null,
  hasQuestions: false,
});

const fromPart = (p: ExamPartDetail): Initial => ({
  format: p.format,
  title: p.title ?? '',
  instructions: p.instructions ?? '',
  minutes: p.timeLimitSec ? String(Math.round((p.timeLimitSec / 60) * 10) / 10) : '',
  playLimit: String(p.audioPlayLimit ?? 2),
  passage: p.passageText ?? '',
  prep: p.prepTimeSec != null ? String(p.prepTimeSec) : '',
  answer: p.answerTimeSec != null ? String(p.answerTimeSec) : '',
  audioUrl: p.audioUrl,
  imageUrl: p.imageUrl,
  hasQuestions: p.questions.length > 0,
});

function PartForm({
  mode,
  section,
  partId,
  initial,
  onClose,
}: {
  mode: 'create' | 'edit';
  section: SectionRef;
  partId?: string;
  initial: Initial;
  onClose: () => void;
}) {
  const create = useCreatePart();
  const update = useUpdatePart();
  const skill = section.skill;

  const [format, setFormat] = useState<PartFormat>(initial.format);
  const [title, setTitle] = useState(initial.title);
  const [instructions, setInstructions] = useState(initial.instructions);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [playLimit, setPlayLimit] = useState(initial.playLimit);
  const [passage, setPassage] = useState(initial.passage);
  const [prep, setPrep] = useState(initial.prep);
  const [answer, setAnswer] = useState(initial.answer);
  const [audio, setAudio] = useState<MediaValue>({ key: undefined, uploading: false });
  const [image, setImage] = useState<MediaValue>({ key: undefined, uploading: false });
  const [error, setError] = useState<string | null>(null);

  const pending = create.isPending || update.isPending;
  const uploading = audio.uploading || image.uploading;

  const submit = () => {
    const sec = minutes ? Math.round(Number(minutes) * 60) : null;
    if (sec !== null && sec < 10) return setError('Part vaqti kamida 10 soniya bo‘lishi kerak');
    const limit = Number(playLimit);
    if (skill === 'LISTENING' && (!Number.isInteger(limit) || limit < 1 || limit > 10)) return setError('Eshittirish soni 1 dan 10 gacha bo‘lishi kerak');
    if (uploading) return setError('Fayl yuklanishini kuting');
    setError(null);

    const callbacks = {
      onSuccess: () => {
        toast.success(mode === 'create' ? 'Part qo‘shildi' : 'Saqlandi');
        onClose();
      },
      onError: (e: unknown) => setError(handleApiError(e)),
    };

    const speaking = skill === 'SPEAKING';

    if (mode === 'create') {
      create.mutate(
        {
          sectionId: section.id,
          format,
          title: title.trim() || undefined,
          instructions: instructions.trim() || undefined,
          timeLimitSec: sec ?? undefined,
          ...(skill === 'LISTENING' ? { audioPlayLimit: limit } : {}),
          ...(typeof audio.key === 'string' ? { audioKey: audio.key } : {}),
          ...(skill === 'READING' && passage.trim() ? { passageText: passage } : {}),
          ...(typeof image.key === 'string' ? { imageKey: image.key } : {}),
          ...(speaking && prep !== '' ? { prepTimeSec: Number(prep) } : {}),
          ...(speaking && answer !== '' ? { answerTimeSec: Number(answer) } : {}),
        },
        callbacks,
      );
    } else if (partId) {
      update.mutate(
        {
          id: partId,
          input: {
            ...(format !== initial.format ? { format } : {}),
            title: title.trim() || null,
            instructions: instructions.trim() || null,
            timeLimitSec: sec,
            ...(skill === 'LISTENING' ? { audioPlayLimit: limit } : {}),
            ...(audio.key !== undefined ? { audioKey: audio.key } : {}),
            ...(image.key !== undefined ? { imageKey: image.key } : {}),
            ...(skill === 'READING' ? { passageText: passage.trim() || null } : {}),
            ...(speaking ? { prepTimeSec: prep !== '' ? Number(prep) : null, answerTimeSec: answer !== '' ? Number(answer) : null } : {}),
          },
        },
        callbacks,
      );
    }
  };

  const formats = SKILL_FORMATS[skill];

  return (
    <ModalShell
      maxWidth="max-w-xl"
      theme={mode === 'edit' ? 'amber' : 'blue'}
      icon={Layers3}
      title={mode === 'create' ? 'Yangi part' : 'Partni tahrirlash'}
      subtitle={SKILL_META[skill].label}
      onClose={onClose}
      onSubmit={submit}
      submitLabel={mode === 'create' ? 'Qo‘shish' : 'Saqlash'}
      submitIcon={mode === 'create' ? Plus : Save}
      submitDisabled={uploading}
      isPending={pending}
      errorMessage={error}
    >
      <Field label="Part formati" required>
        <SelectInput icon={Layers3} value={format} onChange={(e) => setFormat(e.target.value as PartFormat)} disabled={initial.hasQuestions}>
          {formats.map((f) => (
            <option key={f} value={f}>
              {FORMAT_LABELS[f]}
            </option>
          ))}
        </SelectInput>
        <p className="mt-1 text-xs text-gray-500">
          {initial.hasQuestions ? 'Partda savollar bor, formatni o‘zgartirib bo‘lmaydi.' : FORMAT_HINTS[format]}
        </p>
      </Field>

      <Field label="Sarlavha">
        <TextInput icon={Heading} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masalan: Part 1" maxLength={200} />
      </Field>

      <Field label="Ko‘rsatma">
        <TextAreaInput rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Talabaga ko‘rinadigan ko‘rsatma" maxLength={5000} />
      </Field>

      <Field label="Part vaqti (daqiqa)">
        <TextInput icon={Clock} type="number" min={0.2} step={0.5} value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="Ixtiyoriy" />
      </Field>

      {skill === 'LISTENING' && (
        <>
          <Field label="Audio">
            <MediaField
              purpose="EXAM_AUDIO"
              kind="audio"
              accept={AUDIO_TYPES}
              maxSizeMb={100}
              hint="MP3, M4A, WAV, OGG yoki WEBM · 100 MB gacha"
              currentUrl={initial.audioUrl}
              onChange={setAudio}
            />
          </Field>
          <Field label="Necha marta eshittiriladi">
            <TextInput icon={Repeat} type="number" min={1} max={10} value={playLimit} onChange={(e) => setPlayLimit(e.target.value)} />
          </Field>
        </>
      )}

      {skill === 'READING' && (
        <Field label="Matn (passage)">
          <TextAreaInput rows={10} value={passage} onChange={(e) => setPassage(e.target.value)} placeholder="Reading matni. Bo‘sh joylar uchun [1], [2] ... ishlating." maxLength={50000} />
        </Field>
      )}

      {supportsImage(format) && (
        <Field label={format === 'MAP_LABELING' ? 'Xarita / reja rasmi' : format === 'SPEAKING_PICTURE' ? 'Tasvirlanadigan rasm' : 'Rasm (ixtiyoriy)'}>
          <MediaField
            purpose="EXAM_IMAGE"
            kind="image"
            accept={IMAGE_TYPES}
            maxSizeMb={10}
            hint="JPG, PNG, WEBP yoki GIF · 10 MB gacha"
            currentUrl={initial.imageUrl}
            onChange={setImage}
          />
        </Field>
      )}

      {skill === 'SPEAKING' && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tayyorlanish (soniya)">
            <TextInput icon={Timer} type="number" min={0} max={3600} value={prep} onChange={(e) => setPrep(e.target.value)} />
          </Field>
          <Field label="Javob (soniya)">
            <TextInput icon={Hash} type="number" min={0} max={3600} value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </Field>
        </div>
      )}
    </ModalShell>
  );
}

function EditLoader({ section, partId, onClose }: { section: SectionRef; partId: string; onClose: () => void }) {
  const { data, isLoading, isError, error } = useExamPart(partId);
  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm" onClick={onClose}>
        <div className="rounded-2xl bg-white p-6 shadow-2xl">{isLoading ? <Spinner /> : <p className="text-sm text-red-600">{isError ? handleApiError(error) : 'Part topilmadi'}</p>}</div>
      </div>
    );
  }
  return <PartForm key={data.id} mode="edit" section={section} partId={partId} initial={fromPart(data)} onClose={onClose} />;
}

type State = { type: 'create'; section: SectionRef } | { type: 'edit'; section: SectionRef; partId: string } | null;

export function usePartModal() {
  const [state, setState] = useState<State>(null);
  const close = () => setState(null);
  return {
    openCreate: (section: SectionRef) => setState({ type: 'create', section }),
    openEdit: (section: SectionRef, partId: string) => setState({ type: 'edit', section, partId }),
    modal:
      state?.type === 'create' ? (
        <PartForm mode="create" section={state.section} initial={blankFor(state.section.skill)} onClose={close} />
      ) : state?.type === 'edit' ? (
        <EditLoader section={state.section} partId={state.partId} onClose={close} />
      ) : null,
  };
}
