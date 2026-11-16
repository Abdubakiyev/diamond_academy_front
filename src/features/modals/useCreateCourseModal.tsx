'use client';

import { useState } from 'react';
import { BookPlus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ModalShell } from './ui/ModalUI';
import CourseFormBody, { emptyCourseForm, type CourseFormValues } from '../../components/admin/CourseFormBody';
import { useCreateCourse } from '../hooks/useCourse';
import { handleApiError } from '../api/api';

function Content({ onClose }: { onClose: () => void }) {
  const [values, setValues] = useState<CourseFormValues>(emptyCourseForm);
  const [error, setError] = useState<string | null>(null);
  const create = useCreateCourse();

  const submit = () => {
    if (!values.title.trim()) return setError('Kurs nomini kiriting');
    setError(null);
    create.mutate(
      {
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        coverUrl: values.coverUrl.trim() || undefined,
        levelId: values.levelId || undefined,
        isPublished: values.isPublished,
      },
      {
        onSuccess: () => {
          toast.success('Kurs yaratildi');
          onClose();
        },
        onError: (e) => setError(handleApiError(e)),
      },
    );
  };

  return (
    <ModalShell
      icon={BookPlus}
      title="Yangi kurs"
      subtitle="Keyin darslar va guruhlarni biriktirasiz"
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Yaratish"
      submitIcon={Plus}
      isPending={create.isPending}
      errorMessage={error}
    >
      <CourseFormBody values={values} onChange={setValues} />
    </ModalShell>
  );
}

export function useCreateCourseModal() {
  const [isOpen, setOpen] = useState(false);
  return {
    open: () => setOpen(true),
    modal: isOpen ? <Content onClose={() => setOpen(false)} /> : null,
  };
}
