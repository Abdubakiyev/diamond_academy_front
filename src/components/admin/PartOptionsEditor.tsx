'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSetPartOptions } from '../../features/hooks/useQuestion';
import { useUpload } from '../../features/hooks/useUpload';
import { handleApiError } from '../../features/api/api';
import { cn } from '../../lib/format';
import { inputCls } from './QuestionEditor';
import type { PartFormat, PartOption } from '../../features/types/exam';

const ALL = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

interface Row {
  label: string;
  text: string;
  imageUrl: string;
}

const toRows = (opts: PartOption[]): Row[] =>
  opts.length
    ? opts.map((o) => ({ label: o.label, text: o.text, imageUrl: o.imageUrl ?? '' }))
    : ALL.slice(0, 4).map((label) => ({ label, text: '', imageUrl: '' }));

export default function PartOptionsEditor({
  partId,
  format,
  options,
  locked,
}: {
  partId: string;
  format: PartFormat;
  options: PartOption[];
  locked: boolean;
}) {
  const save = useSetPartOptions();
  const { upload, uploading } = useUpload('EXAM_IMAGE');
  const [rows, setRows] = useState<Row[]>(() => toRows(options));
  const fileRef = useRef<HTMLInputElement>(null);
  const [imgFor, setImgFor] = useState<number | null>(null);

  const isMap = format === 'MAP_LABELING';
  const set = (i: number, p: Partial<Row>) => setRows((r) => r.map((x, k) => (k === i ? { ...x, ...p } : x)));

  const add = () => {
    const used = new Set(rows.map((r) => r.label));
    const next = ALL.find((l) => !used.has(l));
    if (next) setRows((r) => [...r, { label: next, text: '', imageUrl: '' }]);
  };

  const onFile = async (file?: File) => {
    if (!file || imgFor === null) return;
    try {
      const res = await upload(file, file.name);
      if (!res.publicUrl) return toast.error('Rasm havolasi olinmadi (S3_PUBLIC_URL ni tekshiring)');
      set(imgFor, { imageUrl: res.publicUrl });
    } catch (e) {
      toast.error(handleApiError(e));
    } finally {
      setImgFor(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = () => {
    const filled = rows.filter((r) => r.text.trim());
    if (filled.length < 2) return toast.error('Kamida 2 ta variant matnini kiriting');
    save.mutate(
      {
        partId,
        options: filled.map((r) => ({ label: r.label, text: r.text.trim(), imageUrl: r.imageUrl || undefined })),
      },
      {
        onSuccess: (res) => {
          setRows(toRows(res.options));
          if (res.orphanedQuestions > 0) {
            toast.warning(`${res.orphanedQuestions} ta moslashtirish savolining javobi yo‘qoldi. Ularni qayta belgilang.`);
          } else {
            toast.success('Variantlar banki saqlandi');
          }
        },
        onError: (e) => toast.error(handleApiError(e)),
      },
    );
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{isMap ? 'Xarita belgilari banki' : 'Variantlar banki (A–J)'}</h3>
          <p className="text-xs text-gray-500">
            {isMap
              ? 'Xaritadagi joylar (A, B, C...). Har savol shulardan birini tanlaydi.'
              : 'Umumiy ro‘yxat: savollar shu variantlardan birini tanlaydi (masalan, sarlavhalar).'}
          </p>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={locked || save.isPending || uploading}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Bankni saqlash
        </button>
      </div>

      {locked && (
        <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">
          Urinishlar bor: bank tuzilmasi qulflangan.
        </p>
      )}

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />

      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-sm font-bold text-violet-700">{r.label}</span>
            <input
              value={r.text}
              disabled={locked}
              onChange={(e) => set(i, { text: e.target.value })}
              placeholder={isMap ? 'Masalan: Library' : 'Variant matni'}
              className={inputCls}
            />
            {r.imageUrl ? (
              <button
                type="button"
                disabled={locked}
                onClick={() => set(i, { imageUrl: '' })}
                title="Rasmni olib tashlash"
                className="group relative h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.imageUrl} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-white group-hover:flex">
                  <X className="h-4 w-4" />
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled={locked || uploading}
                onClick={() => {
                  setImgFor(i);
                  fileRef.current?.click();
                }}
                title="Rasm biriktirish"
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-50',
                )}
              >
                {uploading && imgFor === i ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              </button>
            )}
            {!locked && rows.length > 2 && (
              <button
                type="button"
                onClick={() => setRows((x) => x.filter((_, k) => k !== i))}
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Variantni o‘chirish"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!locked && rows.length < 10 && (
        <button type="button" onClick={add} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800">
          <Plus className="h-4 w-4" /> Variant qo‘shish
        </button>
      )}
    </section>
  );
}
