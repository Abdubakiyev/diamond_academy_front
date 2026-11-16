'use client';

import { useState } from 'react';
import { CalendarClock, ClipboardPlus, Hash, Heading, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Field, ModalShell, TextAreaInput, TextInput } from './ui/ModalUI';
import ToggleRow from '../../components/admin/ToggleRow';
import Spinner from '../../components/ui/Spinner';
import { useAssignment, useCreateAssignment, useUpdateAssignment } from '../hooks/useAssignment';
import { handleApiError } from '../api/api';
import { isStaffAssignment } from '../types/assignment';
import { fromLocalInput, toLocalInput } from '../../lib/format';

interface Initial {
  title: string;
  instructions: string;
  maxScore: number;
  dueDate: string | null;
  allowText: boolean;
  allowFiles: boolean;
}

const blank: Initial = { title: '', instructions: '', maxScore: 100, dueDate: null, allowText: true, allowFiles: true };

function AssignmentForm({
  mode,
  initial,
  lessonId,
  assignmentId,
  onClose,
}: {
  mode: 'create' | 'edit';
  initial: Initial;
  lessonId?: string;
  assignmentId?: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [instructions, setInstructions] = useState(initial.instructions);
  const [maxScore, setMaxScore] = useState(String(initial.maxScore));
  const [due, setDue] = useState(toLocalInput(initial.dueDate));
  const [allowText, setAllowText] = useState(initial.allowText);
  const [allowFiles, setAllowFiles] = useState(initial.allowFiles);
  const [error, setError] = useState<string | null>(null);

  const create = useCreateAssignment();
  const update = useUpdateAssignment();
  const pending = create.isPending || update.isPending;

  const submit = () => {
    const score = Number(maxScore);
    if (!title.trim()) return setError('Vazifa nomini kiriting');
    if (!instructions.trim()) return setError('Vazifa shartini yozing');
    if (!Number.isInteger(score) || score < 1 || score > 1000) return setError('Maksimal ball 1 dan 1000 gacha butun son bo‘lishi kerak');
    if (!allowText && !allowFiles) return setError('Matn yoki fayl topshirishdan kamida bittasi yoqilgan bo‘lishi kerak');
    setError(null);

    const callbacks = {
      onSuccess: () => {
        toast.success(mode === 'create' ? 'Vazifa qo‘shildi' : 'Saqlandi');
        onClose();
      },
      onError: (e: unknown) => setError(handleApiError(e)),
    };

    if (mode === 'create' && lessonId) {
      create.mutate(
        { lessonId, title: title.trim(), instructions: instructions.trim(), maxScore: score, dueDate: fromLocalInput(due), allowText, allowFiles },
        callbacks,
      );
    } else if (assignmentId) {
      update.mutate(
        {
          id: assignmentId,
          input: {
            title: title.trim(),
            instructions: instructions.trim(),
            maxScore: score,
            dueDate: fromLocalInput(due) ?? null,
            allowText,
            allowFiles,
          },
        },
        callbacks,
      );
    }
  };

  return (
    <ModalShell
      theme={mode === 'edit' ? 'amber' : 'blue'}
      icon={ClipboardPlus}
      title={mode === 'create' ? 'Yangi vazifa' : 'Vazifani tahrirlash'}
      onClose={onClose}
      onSubmit={submit}
      submitLabel={mode === 'create' ? 'Qo‘shish' : 'Saqlash'}
      submitIcon={mode === 'create' ? Plus : Save}
      isPending={pending}
      errorMessage={error}
    >
      <Field label="Nomi" required>
        <TextInput icon={Heading} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} autoFocus />
      </Field>
      <Field label="Vazifa sharti" required>
        <TextAreaInput rows={6} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Talaba nima qilishi kerak..." maxLength={20000} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Maksimal ball" required>
          <TextInput icon={Hash} type="number" min={1} max={1000} value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
        </Field>
        <Field label="Muddat">
          <TextInput icon={CalendarClock} type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
        </Field>
      </div>
      <ToggleRow label="Matn bilan topshirish" checked={allowText} onChange={setAllowText} />
      <ToggleRow label="Fayl / rasm bilan topshirish" checked={allowFiles} onChange={setAllowFiles} />
    </ModalShell>
  );
}

function EditLoader({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, isLoading } = useAssignment(id);
  if (isLoading || !data || !isStaffAssignment(data)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm" onClick={onClose}>
        <div className="rounded-2xl bg-white p-6 shadow-2xl">
          <Spinner />
        </div>
      </div>
    );
  }
  return (
    <AssignmentForm
      mode="edit"
      assignmentId={id}
      initial={{
        title: data.title,
        instructions: data.instructions,
        maxScore: data.maxScore,
        dueDate: data.dueDate,
        allowText: data.allowText,
        allowFiles: data.allowFiles,
      }}
      onClose={onClose}
    />
  );
}

type State = { type: 'create'; lessonId: string } | { type: 'edit'; id: string } | null;

export function useAssignmentModal() {
  const [state, setState] = useState<State>(null);
  const close = () => setState(null);
  return {
    openCreate: (lessonId: string) => setState({ type: 'create', lessonId }),
    openEdit: (id: string) => setState({ type: 'edit', id }),
    modal:
      state?.type === 'create' ? (
        <AssignmentForm mode="create" lessonId={state.lessonId} initial={blank} onClose={close} />
      ) : state?.type === 'edit' ? (
        <EditLoader id={state.id} onClose={close} />
      ) : null,
  };
}

export const useCreateAssignmentModal = useAssignmentModal;
