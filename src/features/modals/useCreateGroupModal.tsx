'use client';

import { useState } from 'react';
import { FolderPlus, Tag, BookOpen, Calendar } from 'lucide-react';
import { CreateGroupDto, Level } from '@/features/types';
import { useCreateGroup } from '@/features/hooks/useGroups';
import { ModalShell, Field, TextInput, SelectInput } from './ui/ModalUI';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  levels: Level[];
}

export function CreateGroupModal({ isOpen, onClose, levels }: CreateGroupModalProps) {
  if (!isOpen) return null;
  return <CreateGroupForm onClose={onClose} levels={levels} />;
}

function CreateGroupForm({ onClose, levels }: Omit<CreateGroupModalProps, 'isOpen'>) {
  const [form, setForm] = useState<CreateGroupDto>({ name: '', levelId: '', schedule: '' });
  const createGroup = useCreateGroup();

  const canSubmit = form.name.trim() !== '' && form.levelId !== '';

  const handleSubmit = () => {
    if (!canSubmit || createGroup.isPending) return;
    createGroup.mutate(
      { ...form, name: form.name.trim(), schedule: form.schedule?.trim() },
      { onSuccess: onClose }
    );
  };

  return (
    <ModalShell
      theme="blue"
      icon={FolderPlus}
      title="Guruh qo'shish"
      subtitle="Yangi guruh ma'lumotlarini kiriting"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Qo'shish"
      submitIcon={FolderPlus}
      submitDisabled={!canSubmit}
      isPending={createGroup.isPending}
      errorMessage={
        createGroup.isError ? "Saqlashda xatolik yuz berdi. Qaytadan urinib ko'ring." : null
      }
    >
      <Field label="Guruh nomi" required>
        <TextInput
          icon={Tag}
          type="text"
          autoFocus
          placeholder="Masalan: Guruh A1"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>

      <Field label="Level" required>
        <SelectInput
          icon={BookOpen}
          value={form.levelId}
          onChange={(e) => setForm({ ...form, levelId: e.target.value })}
        >
          <option value="">Levelni tanlang</option>
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.type}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field label="Dars jadvali">
        <TextInput
          icon={Calendar}
          type="text"
          placeholder="Masalan: Du, Chor, Ju 14:00"
          value={form.schedule ?? ''}
          onChange={(e) => setForm({ ...form, schedule: e.target.value })}
        />
      </Field>
    </ModalShell>
  );
}