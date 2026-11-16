'use client';

import { useState } from 'react';
import { RefreshCw, Trash2, Undo2 } from 'lucide-react';
import FileDropzone, { type UploadItem } from '../ui/FileDropzone';
import type { UploadPurpose } from '../../features/types/storage';

/**
 * key: undefined = o'zgarmagan, null = olib tashlash, string = yangi yuklangan fayl kaliti
 */
export interface MediaValue {
  key: string | null | undefined;
  uploading: boolean;
}

interface Props {
  purpose: Extract<UploadPurpose, 'EXAM_AUDIO' | 'EXAM_IMAGE'>;
  kind: 'audio' | 'image';
  accept: string[];
  maxSizeMb: number;
  hint?: string;
  /** Mavjud faylning ko'rish manzili (tahrirlashda) */
  currentUrl?: string | null;
  onChange: (v: MediaValue) => void;
}

export default function MediaField({ purpose, kind, accept, maxSizeMb, hint, currentUrl, onChange }: Props) {
  const [mode, setMode] = useState<'keep' | 'removed' | 'new'>(currentUrl ? 'keep' : 'new');

  const set = (next: 'keep' | 'removed' | 'new') => {
    setMode(next);
    if (next === 'removed') onChange({ key: null, uploading: false });
    else onChange({ key: undefined, uploading: false });
  };

  const onItems = (items: UploadItem[]) =>
    onChange({
      key: items.find((i) => i.status === 'done')?.key,
      uploading: items.some((i) => i.status === 'uploading'),
    });

  if (currentUrl && mode === 'keep') {
    return (
      <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
        {kind === 'audio' ? (
          <audio controls src={currentUrl} className="w-full" preload="metadata" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt="" className="max-h-48 w-full rounded-lg object-contain" />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set('new')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Almashtirish
          </button>
          <button
            type="button"
            onClick={() => set('removed')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-red-600 ring-1 ring-red-100 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Olib tashlash
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'removed') {
    return (
      <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
        <span>Fayl saqlaganda olib tashlanadi</span>
        <button type="button" onClick={() => set('keep')} className="inline-flex items-center gap-1 text-xs font-semibold hover:underline">
          <Undo2 className="h-3.5 w-3.5" /> Bekor qilish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <FileDropzone purpose={purpose} accept={accept} maxFiles={1} maxSizeMb={maxSizeMb} hint={hint} onChange={onItems} />
      {currentUrl && (
        <button type="button" onClick={() => set('keep')} className="text-xs font-medium text-gray-500 hover:text-gray-800">
          Joriy faylni qoldirish
        </button>
      )}
    </div>
  );
}
