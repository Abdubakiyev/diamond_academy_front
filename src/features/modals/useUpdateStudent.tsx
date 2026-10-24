'use client';

import { useState } from 'react';
import { Edit3, User, Phone, Users } from 'lucide-react';
import { useUpdateStudent } from '@/features/hooks/useStudents';
import { Group, Student, UpdateStudentDto } from '../types';
import { ModalShell, Field, TextInput, SelectInput, StatusSwitch } from './ui/ModalUI';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  groups: Group[];
}

export function EditStudentModal({ isOpen, onClose, student, groups }: EditStudentModalProps) {
  if (!isOpen) return null;
  // key={student.id}: boshqa talaba tanlansa forma boshidan boshlanadi (useEffect kerak emas)
  return <EditStudentForm key={student.id} onClose={onClose} student={student} groups={groups} />;
}

function EditStudentForm({ onClose, student, groups }: Omit<EditStudentModalProps, 'isOpen'>) {
  const [form, setForm] = useState<UpdateStudentDto>({
    name: student.name,
    phone: student.phone || '',
    groupId: student.groupId,
    isActive: student.isActive,
  });
  const updateStudent = useUpdateStudent();

  const canSubmit = !!form.name?.trim() && !!form.groupId;

  const handleSubmit = () => {
    if (!canSubmit || updateStudent.isPending) return;
    updateStudent.mutate(
      { id: student.id, dto: { ...form, name: form.name?.trim(), phone: form.phone?.trim() } },
      { onSuccess: onClose }
    );
  };

  return (
    <ModalShell
      theme="amber"
      icon={Edit3}
      title="Talabani tahrirlash"
      subtitle={student.name}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Saqlash"
      submitIcon={Edit3}
      submitDisabled={!canSubmit}
      isPending={updateStudent.isPending}
      errorMessage={
        updateStudent.isError ? "Saqlashda xatolik yuz berdi. Qaytadan urinib ko'ring." : null
      }
    >
      <Field label="Ism" required>
        <TextInput
          icon={User}
          type="text"
          autoFocus
          placeholder="Talaba ismi"
          value={form.name ?? ''}
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
          value={form.groupId ?? ''}
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

      <StatusSwitch
        checked={!!form.isActive}
        onChange={(isActive) => setForm({ ...form, isActive })}
        activeText="Talaba faol"
        inactiveText="Talaba nofaol"
      />
    </ModalShell>
  );
}