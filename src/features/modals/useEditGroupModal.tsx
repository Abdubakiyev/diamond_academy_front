'use client';

import { useState } from 'react';
import { Edit3, Tag, BookOpen, Calendar } from 'lucide-react';
import { Group, Level, UpdateGroupDto } from '@/features/types';
import { useUpdateGroup } from '@/features/hooks/useGroups';
import { ModalShell, Field, TextInput, SelectInput, StatusSwitch } from './ui/ModalUI';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  levels: Level[];
}

export function EditGroupModal({ isOpen, onClose, group, levels }: EditGroupModalProps) {
  if (!isOpen) return null;
  return <EditGroupForm key={group.id} onClose={onClose} group={group} levels={levels} />;
}

function EditGroupForm({ onClose, group, levels }: Omit<EditGroupModalProps, 'isOpen'>) {
  const [form, setForm] = useState<UpdateGroupDto>({
    name: group.name,
    levelId: group.levelId,
    schedule: group.schedule || '',
    isActive: group.isActive,
  });
  const updateGroup = useUpdateGroup();

  const canSubmit = !!form.name?.trim() && !!form.levelId;

  const handleSubmit = () => {
    if (!canSubmit || updateGroup.isPending) return;
    updateGroup.mutate(
      { id: group.id, dto: { ...form, name: form.name?.trim(), schedule: form.schedule?.trim() } },
      { onSuccess: onClose }
    );
  };

  return (
    <ModalShell
      theme="amber"
      icon={Edit3}
      title="Guruhni tahrirlash"
      subtitle={group.name}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Saqlash"
      submitIcon={Edit3}
      submitDisabled={!canSubmit}
      isPending={updateGroup.isPending}
      errorMessage={
        updateGroup.isError ? "Saqlashda xatolik yuz berdi. Qaytadan urinib ko'ring." : null
      }
    >
      <Field label="Guruh nomi" required>
        <TextInput
          icon={Tag}
          type="text"
          autoFocus
          placeholder="Masalan: Guruh A1"
          value={form.name ?? ''}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>

      <Field label="Level" required>
        <SelectInput
          icon={BookOpen}
          value={form.levelId ?? ''}
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

      <StatusSwitch
        checked={!!form.isActive}
        onChange={(isActive) => setForm({ ...form, isActive })}
        activeText="Guruh faol"
        inactiveText="Guruh nofaol"
      />
    </ModalShell>
  );
}