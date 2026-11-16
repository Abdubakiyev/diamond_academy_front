'use client';

import { useState } from 'react';
import { Clock, Hash, Heading, LayoutList, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Field, ModalShell, SelectInput, TextAreaInput, TextInput } from './ui/ModalUI';
import { useAddSection, useUpdateSection } from '../hooks/useExam';
import { handleApiError } from '../api/api';
import { SKILL_META, SKILL_ORDER } from '../../lib/exam-rules';
import type { Skill } from '../types/common';
import type { ExamSection } from '../types/exam';

function CreateForm({ examId, available, onClose }: { examId: string; available: Skill[]; onClose: () => void }) {
  const add = useAddSection();
  const [skill, setSkill] = useState<Skill>(available[0]);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [minutes, setMinutes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const sec = minutes ? Math.round(Number(minutes) * 60) : undefined;
    if (sec !== undefined && sec < 30) return setError('Vaqt kamida 30 soniya (0.5 daqiqa) bo‘lishi kerak');
    setError(null);
    add.mutate(
      { examId, input: { skill, title: title.trim() || undefined, instructions: instructions.trim() || undefined, timeLimitSec: sec } },
      {
        onSuccess: () => {
          toast.success('Bo‘lim qo‘shildi');
          onClose();
        },
        onError: (e) => setError(handleApiError(e)),
      },
    );
  };

  return (
    <ModalShell icon={LayoutList} title="Bo‘lim qo‘shish" onClose={onClose} onSubmit={submit} submitLabel="Qo‘shish" submitIcon={Plus} isPending={add.isPending} errorMessage={error}>
      <Field label="Bo‘lim turi" required>
        <SelectInput icon={LayoutList} value={skill} onChange={(e) => setSkill(e.target.value as Skill)}>
          {available.map((s) => (
            <option key={s} value={s}>
              {SKILL_META[s].label}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Sarlavha">
        <TextInput icon={Heading} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={SKILL_META[skill].label} maxLength={200} />
      </Field>
      <Field label="Ko‘rsatma">
        <TextAreaInput rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={5000} />
      </Field>
      <Field label="Bo‘lim vaqti (daqiqa)">
        <TextInput icon={Clock} type="number" min={0.5} step={0.5} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
      </Field>
    </ModalShell>
  );
}

function EditForm({ section, onClose }: { section: ExamSection; onClose: () => void }) {
  const update = useUpdateSection();
  const [title, setTitle] = useState(section.title ?? '');
  const [instructions, setInstructions] = useState(section.instructions ?? '');
  const [minutes, setMinutes] = useState(section.timeLimitSec ? String(section.timeLimitSec / 60) : '');
  const [maxScore, setMaxScore] = useState(String(section.maxScore));
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const sec = minutes ? Math.round(Number(minutes) * 60) : null;
    const max = Number(maxScore);
    if (sec !== null && sec < 30) return setError('Vaqt kamida 30 soniya (0.5 daqiqa) bo‘lishi kerak');
    if (Number.isNaN(max) || max < 1 || max > 75) return setError('Maksimal ball 1 dan 75 gacha bo‘lishi kerak');
    setError(null);
    update.mutate(
      {
        sectionId: section.id,
        input: { title: title.trim() || null, instructions: instructions.trim() || null, timeLimitSec: sec, maxScore: max },
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
      icon={LayoutList}
      title={`${SKILL_META[section.skill].label} sozlamalari`}
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Saqlash"
      submitIcon={Save}
      isPending={update.isPending}
      errorMessage={error}
    >
      <Field label="Sarlavha">
        <TextInput icon={Heading} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} autoFocus />
      </Field>
      <Field label="Ko‘rsatma (talabaga ko‘rinadi)">
        <TextAreaInput rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={5000} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vaqt (daqiqa)">
          <TextInput icon={Clock} type="number" min={0.5} step={0.5} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </Field>
        <Field label="Maksimal ball">
          <TextInput icon={Hash} type="number" min={1} max={75} value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
        </Field>
      </div>
    </ModalShell>
  );
}

type State = { type: 'create'; examId: string; available: Skill[] } | { type: 'edit'; section: ExamSection } | null;

export function useSectionModal() {
  const [state, setState] = useState<State>(null);
  const close = () => setState(null);
  return {
    /** usedSkills: imtihonda allaqachon bor bo'limlar; qolganlari tanlanadi */
    openCreate: (examId: string, usedSkills: Skill[]) => {
      const available = SKILL_ORDER.filter((s) => !usedSkills.includes(s));
      if (available.length === 0) return toast.error('Barcha bo‘limlar allaqachon qo‘shilgan');
      setState({ type: 'create', examId, available });
    },
    openEdit: (section: ExamSection) => setState({ type: 'edit', section }),
    modal:
      state?.type === 'create' ? (
        <CreateForm examId={state.examId} available={state.available} onClose={close} />
      ) : state?.type === 'edit' ? (
        <EditForm key={state.section.id} section={state.section} onClose={close} />
      ) : null,
  };
}
