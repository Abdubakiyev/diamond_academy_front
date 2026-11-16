'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heading, Plus, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Field, ModalShell, TextInput } from './ui/ModalUI';
import { useCreateLesson } from '../hooks/useLesson';
import { handleApiError } from '../api/api';
import { ADMIN_HOME } from '../../lib/config';

function Content({ courseId, onClose }: { courseId: string; onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const create = useCreateLesson();

  const submit = () => {
    if (!title.trim()) return setError('Dars nomini kiriting');
    setError(null);
    create.mutate(
      { courseId, title: title.trim(), isPublished: false },
      {
        onSuccess: (lesson) => {
          toast.success('Dars yaratildi. Endi video va materiallarni qo‘shing');
          onClose();
          router.push(`${ADMIN_HOME}/lessons/${lesson.id}`);
        },
        onError: (e) => setError(handleApiError(e)),
      },
    );
  };

  return (
    <ModalShell
      icon={Video}
      title="Yangi dars"
      subtitle="Qoralama sifatida yaratiladi"
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Yaratish"
      submitIcon={Plus}
      isPending={create.isPending}
      errorMessage={error}
    >
      <Field label="Dars nomi" required>
        <TextInput icon={Heading} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masalan: Present Simple" maxLength={200} autoFocus />
      </Field>
    </ModalShell>
  );
}

export function useCreateLessonModal() {
  const [courseId, setCourseId] = useState<string | null>(null);
  return {
    open: (id: string) => setCourseId(id),
    modal: courseId ? <Content courseId={courseId} onClose={() => setCourseId(null)} /> : null,
  };
}
