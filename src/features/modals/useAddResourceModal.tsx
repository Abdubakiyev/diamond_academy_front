'use client';

import { useState } from 'react';
import { Heading, Link2, Paperclip, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Field, ModalShell, TextInput } from './ui/ModalUI';
import FileDropzone, { type UploadItem } from '../../components/ui/FileDropzone';
import Segmented from '../../components/admin/Segmented';
import { useAddResource } from '../hooks/useLesson';
import { handleApiError } from '../api/api';

const DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function Content({ lessonId, onClose }: { lessonId: string; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'file' | 'link'>('file');
  const [url, setUrl] = useState('');
  const [items, setItems] = useState<UploadItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const add = useAddResource();

  const uploading = items.some((i) => i.status === 'uploading');
  const key = items.find((i) => i.status === 'done')?.key;

  const submit = () => {
    if (!title.trim()) return setError('Material nomini kiriting');
    if (mode === 'file' && !key) return setError(uploading ? 'Fayl yuklanishini kuting' : 'Fayl yuklang');
    if (mode === 'link' && !url.trim()) return setError('Havolani kiriting');
    setError(null);
    add.mutate(
      { lessonId, input: { title: title.trim(), ...(mode === 'file' ? { storageKey: key } : { url: url.trim() }) } },
      {
        onSuccess: () => {
          toast.success('Material qo‘shildi');
          onClose();
        },
        onError: (e) => setError(handleApiError(e)),
      },
    );
  };

  return (
    <ModalShell
      icon={Paperclip}
      title="Material qo‘shish"
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Qo‘shish"
      submitIcon={Plus}
      submitDisabled={uploading}
      isPending={add.isPending}
      errorMessage={error}
    >
      <Field label="Nomi" required>
        <TextInput icon={Heading} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masalan: Grammar PDF" maxLength={200} autoFocus />
      </Field>

      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'file', label: 'Fayl yuklash' },
          { value: 'link', label: 'Havola' },
        ]}
      />

      {mode === 'file' ? (
        <FileDropzone purpose="LESSON_RESOURCE" accept={DOC_TYPES} maxFiles={1} maxSizeMb={50} hint="PDF yoki rasm · 50 MB gacha" onChange={setItems} />
      ) : (
        <Field label="Havola" required>
          <TextInput icon={Link2} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </Field>
      )}
    </ModalShell>
  );
}

export function useAddResourceModal() {
  const [lessonId, setLessonId] = useState<string | null>(null);
  return {
    open: (id: string) => setLessonId(id),
    modal: lessonId ? <Content lessonId={lessonId} onClose={() => setLessonId(null)} /> : null,
  };
}
