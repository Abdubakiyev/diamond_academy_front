'use client';

import { useRef } from 'react';
import { toast } from 'sonner';
import { Heading, ImagePlus, Layers, Link2, Loader2 } from 'lucide-react';
import { Field, SelectInput, TextAreaInput, TextInput } from '../../features/modals/ui/ModalUI';
import ToggleRow from './ToggleRow';
import { useLevelOptions } from '../../features/hooks/useCourse';
import { useUpload } from '../../features/hooks/useUpload';
import { handleApiError } from '../../features/api/api';

export interface CourseFormValues {
  title: string;
  description: string;
  levelId: string;
  coverUrl: string;
  isPublished: boolean;
}

export const emptyCourseForm: CourseFormValues = { title: '', description: '', levelId: '', coverUrl: '', isPublished: false };

export default function CourseFormBody({
  values,
  onChange,
}: {
  values: CourseFormValues;
  onChange: (v: CourseFormValues) => void;
}) {
  const { data: levels } = useLevelOptions();
  const { upload, uploading, progress } = useUpload('LESSON_RESOURCE');
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof CourseFormValues>(k: K, v: CourseFormValues[K]) => onChange({ ...values, [k]: v });

  const onPick = async (file: File) => {
    if (!file.type.startsWith('image/')) return toast.error('Faqat rasm yuklang');
    try {
      const res = await upload(file);
      if (!res.publicUrl) return toast.error('Storage ochiq (public) emas. Rasm havolasini qo‘lda kiriting');
      set('coverUrl', res.publicUrl);
    } catch (e) {
      toast.error(handleApiError(e));
    }
  };

  return (
    <>
      <Field label="Kurs nomi" required>
        <TextInput
          icon={Heading}
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Masalan: IELTS Foundation"
          maxLength={200}
          autoFocus
        />
      </Field>

      <Field label="Tavsif">
        <TextAreaInput
          rows={3}
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Kurs haqida qisqacha..."
          maxLength={5000}
        />
      </Field>

      <Field label="Level">
        <SelectInput icon={Layers} value={values.levelId} onChange={(e) => set('levelId', e.target.value)}>
          <option value="">Levelsiz</option>
          {levels?.map((l) => (
            <option key={l.id} value={l.id}>
              {l.type}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field label="Muqova rasmi">
        <div className="flex gap-2">
          <div className="flex-1">
            <TextInput icon={Link2} value={values.coverUrl} onChange={(e) => set('coverUrl', e.target.value)} placeholder="https://..." />
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {uploading ? `${progress}%` : 'Yuklash'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onPick(f);
              e.target.value = '';
            }}
          />
        </div>
        {values.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={values.coverUrl} alt="" className="mt-2 h-28 w-full rounded-xl object-cover ring-1 ring-gray-100" />
        )}
      </Field>

      <ToggleRow
        label="Holat"
        description={values.isPublished ? 'E’lon qilingan: guruh talabalariga ko‘rinadi' : 'Qoralama: faqat xodimlarga ko‘rinadi'}
        checked={values.isPublished}
        onChange={(v) => set('isPublished', v)}
      />
    </>
  );
}
