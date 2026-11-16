'use client';

import { useState } from 'react';
import { Banknote, Clock, Heading, Layers, Pencil, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Field, ModalShell, SelectInput, TextAreaInput, TextInput } from './ui/ModalUI';
import { useUpdateExam } from '../hooks/useExam';
import { useLevelOptions } from '../hooks/useCourse';
import { handleApiError } from '../api/api';
import type { ExamDetail } from '../types/exam';

type Editable = Pick<ExamDetail, 'id' | 'title' | 'description' | 'levelId' | 'price' | 'type' | 'durationMinutes'>;

function Content({ exam, onClose }: { exam: Editable; onClose: () => void }) {
  const { data: levels } = useLevelOptions();
  const update = useUpdateExam();
  const [title, setTitle] = useState(exam.title);
  const [description, setDescription] = useState(exam.description ?? '');
  const [levelId, setLevelId] = useState(exam.levelId ?? '');
  const [price, setPrice] = useState(String(exam.price ?? 0));
  const [minutes, setMinutes] = useState(exam.durationMinutes ? String(exam.durationMinutes) : '');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!title.trim()) return setError('Imtihon nomini kiriting');
    const priceNum = Number(price || 0);
    if (Number.isNaN(priceNum) || priceNum < 0) return setError('Narx noto‘g‘ri');
    setError(null);
    update.mutate(
      {
        id: exam.id,
        input: {
          title: title.trim(),
          description: description.trim() || null,
          levelId: levelId || null,
          price: priceNum,
          ...(exam.type === 'CUSTOM' && minutes ? { durationMinutes: Number(minutes) } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success('Saqlandi');
          onClose();
        },
        onError: (e) => setError(handleApiError(e)),
      },
    );
  };

  return (
    <ModalShell
      theme="amber"
      icon={Pencil}
      title="Imtihonni tahrirlash"
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Saqlash"
      submitIcon={Save}
      isPending={update.isPending}
      errorMessage={error}
    >
      <Field label="Nomi" required>
        <TextInput icon={Heading} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} autoFocus />
      </Field>
      <Field label="Tavsif">
        <TextAreaInput rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Level">
          <SelectInput icon={Layers} value={levelId} onChange={(e) => setLevelId(e.target.value)}>
            <option value="">Levelsiz</option>
            {levels?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.type}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Narx (so‘m)">
          <TextInput icon={Banknote} type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
      </div>
      {exam.type === 'CUSTOM' && (
        <Field label="Umumiy vaqt (daqiqa)">
          <TextInput icon={Clock} type="number" min={1} max={600} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </Field>
      )}
    </ModalShell>
  );
}

export function useEditExamModal() {
  const [exam, setExam] = useState<Editable | null>(null);
  return {
    open: (e: Editable) => setExam(e),
    modal: exam ? <Content key={exam.id} exam={exam} onClose={() => setExam(null)} /> : null,
  };
}
