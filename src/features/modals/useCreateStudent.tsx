'use client';

import { useState } from 'react';
import { UserPlus, User, Phone, Users } from 'lucide-react';
import { useCreateStudent } from '@/features/hooks/useStudents';
import { CreateStudentDto, Group } from '../types';
import { ModalShell, Field, TextInput, SelectInput } from './ui/ModalUI';

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
}

export function CreateStudentModal({ isOpen, onClose, groups }: CreateStudentModalProps) {
  if (!isOpen) return null;
  // Modal yopilganda ichki forma unmount bo'ladi, shuning uchun state o'zi tozalanadi
  return <CreateStudentForm onClose={onClose} groups={groups} />;
}

function CreateStudentForm({ onClose, groups }: Omit<CreateStudentModalProps, 'isOpen'>) {
  const [form, setForm] = useState<CreateStudentDto>({ name: '', phone: '', groupId: '' });
  const createStudent = useCreateStudent();

  const canSubmit = form.name.trim() !== '' && form.groupId !== '';
  const handleSubmit = () => {
    if (!canSubmit || createStudent.isPending) return;
    createStudent.mutate(
      { ...form, name: form.name.trim(), phone: form.phone?.trim() },
      { onSuccess: onClose }
    );
  };

  return (
    <ModalShell
      theme="blue"
      icon={UserPlus}
      title="Talaba qo'shish"
      subtitle="Yangi talaba ma'lumotlarini kiriting"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Qo'shish"
      submitIcon={UserPlus}
      submitDisabled={!canSubmit}
      isPending={createStudent.isPending}
      errorMessage={
        createStudent.isError ? "Saqlashda xatolik yuz berdi. Qaytadan urinib ko'ring." : null
      }
    >
      <Field label="Ism" required>
        <TextInput
          icon={User}
          type="text"
          autoFocus
          placeholder="Talaba ismi"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>

      <Field label="Telefon raqami">
        <TextInput
          icon={Phone}
          type="tel"
          placeholder="+998 90 000 00 00"
          value={form.phone ?? ''}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </Field>

      <Field label="Guruh" required>
        <SelectInput
          icon={Users}
          value={form.groupId}
          onChange={(e) => setForm({ ...form, groupId: e.target.value })}
        >
          <option value="">Guruhni tanlang</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </SelectInput>
      </Field>
    </ModalShell>
  );
}