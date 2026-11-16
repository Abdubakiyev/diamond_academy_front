'use client';

import { useState } from 'react';
import { Pencil, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ModalShell } from './ui/ModalUI';
import CourseFormBody, { type CourseFormValues } from '../../components/admin/CourseFormBody';
import { useUpdateCourse } from '../hooks/useCourse';
import { handleApiError } from '../api/api';
import type { CourseListItem } from '../types/course';

type EditableCourse = Pick<CourseListItem, 'id' | 'title' | 'description' | 'coverUrl' | 'levelId' | 'isPublished'>;

function Content({ course, onClose }: { course: EditableCourse; onClose: () => void }) {
  const [values, setValues] = useState<CourseFormValues>({
    title: course.title,
    description: course.description ?? '',
    levelId: course.levelId ?? '',
    coverUrl: course.coverUrl ?? '',
    isPublished: course.isPublished,
  });
  const [error, setError] = useState<string | null>(null);
  const update = useUpdateCourse();

  const submit = () => {
    if (!values.title.trim()) return setError('Kurs nomini kiriting');
    setError(null);
    update.mutate(
      {
        id: course.id,
        input: {
          title: values.title.trim(),
          description: values.description.trim() || null,
          coverUrl: values.coverUrl.trim() || null,
          levelId: values.levelId || null,
          isPublished: values.isPublished,
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
      title="Kursni tahrirlash"
      subtitle={course.title}
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Saqlash"
      submitIcon={Save}
      isPending={update.isPending}
      errorMessage={error}
    >
      <CourseFormBody values={values} onChange={setValues} />
    </ModalShell>
  );
}

export function useEditCourseModal() {
  const [course, setCourse] = useState<EditableCourse | null>(null);
  return {
    open: (c: EditableCourse) => setCourse(c),
    modal: course ? <Content key={course.id} course={course} onClose={() => setCourse(null)} /> : null,
  };
}
