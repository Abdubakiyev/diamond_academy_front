'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, Clock, FilePlus2, Heading, Layers, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Field, ModalShell, SelectInput, TextAreaInput, TextInput } from './ui/ModalUI';
import Segmented from '../../components/admin/Segmented';
import { useCreateExam } from '../hooks/useExam';
import { useLevelOptions } from '../hooks/useCourse';
import { handleApiError } from '../api/api';
import { SKILL_META, SKILL_ORDER } from '../../lib/exam-rules';
import { ADMIN_HOME } from '../../lib/config';
import { cn } from '../../lib/format';
import type { ExamType, Skill } from '../types/common';

function Content({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { data: levels } = useLevelOptions();
  const create = useCreateExam();

  const [type, setType] = useState<ExamType>('FULL_MULTILEVEL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [levelId, setLevelId] = useState('');
  const [price, setPrice] = useState('');
  const [minutes, setMinutes] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleSkill = (s: Skill) => setSkills((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const submit = () => {
    if (!title.trim()) return setError('Imtihon nomini kiriting');
    const priceNum = price ? Number(price) : 0;
    if (Number.isNaN(priceNum) || priceNum < 0) return setError('Narx noto‘g‘ri');
    if (type === 'CUSTOM') {
      if (!minutes || Number(minutes) < 1) return setError('Umumiy vaqtni (daqiqa) kiriting');
      if (skills.length === 0) return setError('Kamida bitta bo‘lim tanlang');
    }
    setError(null);

    create.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        levelId: levelId || undefined,
        price: priceNum,
        ...(type === 'CUSTOM' ? { durationMinutes: Number(minutes), skills } : {}),
      },
      {
        onSuccess: (exam) => {
          toast.success('Imtihon yaratildi');
          onClose();
          router.push(`${ADMIN_HOME}/exams/${exam.id}`);
        },
        onError: (e) => setError(handleApiError(e)),
      },
    );
  };

  return (
    <ModalShell
      maxWidth="max-w-xl"
      icon={FilePlus2}
      title="Yangi imtihon"
      subtitle="Keyin bo‘lim, part va savollarni qo‘shasiz"
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Yaratish"
      submitIcon={Plus}
      isPending={create.isPending}
      errorMessage={error}
    >
      <Segmented
        value={type}
        onChange={setType}
        options={[
          { value: 'FULL_MULTILEVEL', label: 'To‘liq Multilevel' },
          { value: 'CUSTOM', label: 'Alohida test' },
        ]}
      />
      <p className="-mt-2 text-xs text-gray-500">
        {type === 'FULL_MULTILEVEL'
          ? '4 ta bo‘lim (Listening, Reading, Writing, Speaking) avtomatik yaratiladi.'
          : 'Bo‘limlarni o‘zingiz tanlaysiz va umumiy vaqtni belgilaysiz.'}
      </p>

      <Field label="Nomi" required>
        <TextInput icon={Heading} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masalan: Multilevel Mock #1" maxLength={200} autoFocus />
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
          <TextInput icon={Banknote} type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 = bepul" />
        </Field>
      </div>

      {type === 'CUSTOM' && (
        <>
          <Field label="Umumiy vaqt (daqiqa)" required>
            <TextInput icon={Clock} type="number" min={1} max={600} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </Field>
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700">
              Bo‘limlar <span className="text-red-500">*</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SKILL_ORDER.map((s) => {
                const meta = SKILL_META[s];
                const on = skills.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSkill(s)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                      on ? 'border-indigo-400 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    <meta.icon className="h-4 w-4" /> {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </ModalShell>
  );
}

export function useCreateExamModal() {
  const [isOpen, setOpen] = useState(false);
  return { open: () => setOpen(true), modal: isOpen ? <Content onClose={() => setOpen(false)} /> : null };
}
