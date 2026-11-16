'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, FileText, Loader2, UploadCloud, X } from 'lucide-react';
import { uploadFile } from '../../lib/upload';
import { cn, formatFileSize } from '../../lib/format';
import { handleApiError } from '../../features/api/api';
import type { UploadPurpose } from '../../features/types/storage';

export interface UploadItem {
  uid: string;
  name: string;
  size: number;
  status: 'uploading' | 'done' | 'error';
  progress: number;
  /** storage kaliti (yuklash tugagach) */
  key?: string;
  error?: string;
  preview?: string;
}

interface Props {
  purpose: UploadPurpose;
  /** Ruxsat etilgan MIME turlari */
  accept: string[];
  maxFiles?: number;
  maxSizeMb?: number;
  disabled?: boolean;
  hint?: string;
  onChange: (items: UploadItem[]) => void;
}

const makeUid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function FileDropzone({ purpose, accept, maxFiles = 10, maxSizeMb = 15, disabled, hint, onChange }: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const aborts = useRef(new Map<string, AbortController>());
  const itemsRef = useRef<UploadItem[]>([]);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    itemsRef.current = items;
    onChangeRef.current(items);
  }, [items]);

  // Sahifadan chiqilganda yuklashlarni to'xtatish va preview xotirasini bo'shatish
  useEffect(() => {
    const controllers = aborts.current;
    return () => {
      controllers.forEach((c) => c.abort());
      itemsRef.current.forEach((i) => i.preview && URL.revokeObjectURL(i.preview));
    };
  }, []);

  const patch = (uid: string, p: Partial<UploadItem>) =>
    setItems((prev) => prev.map((i) => (i.uid === uid ? { ...i, ...p } : i)));

  const startUpload = async (file: File, uid: string) => {
    const ctrl = new AbortController();
    aborts.current.set(uid, ctrl);
    try {
      const res = await uploadFile(file, purpose, { onProgress: (progress) => patch(uid, { progress }), signal: ctrl.signal });
      patch(uid, { status: 'done', progress: 100, key: res.key });
    } catch (e) {
      if (axios.isCancel(e)) return;
      patch(uid, { status: 'error', error: handleApiError(e) });
    } finally {
      aborts.current.delete(uid);
    }
  };

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    let room = maxFiles - items.length;
    const fresh: Array<{ file: File; item: UploadItem }> = [];

    for (const file of incoming) {
      if (room <= 0) {
        toast.error(`Eng ko‘pi bilan ${maxFiles} ta fayl yuklash mumkin`);
        break;
      }
      if (!accept.includes(file.type)) {
        toast.error(`"${file.name}": bu fayl turi ruxsat etilmagan`);
        continue;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        toast.error(`"${file.name}": hajmi ${maxSizeMb} MB dan oshmasligi kerak`);
        continue;
      }
      room--;
      fresh.push({
        file,
        item: {
          uid: makeUid(),
          name: file.name,
          size: file.size,
          status: 'uploading',
          progress: 0,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        },
      });
    }

    if (fresh.length === 0) return;
    setItems((prev) => [...prev, ...fresh.map((f) => f.item)]);
    fresh.forEach(({ file, item }) => void startUpload(file, item.uid));
  };

  const remove = (uid: string) => {
    aborts.current.get(uid)?.abort();
    setItems((prev) => {
      const target = prev.find((i) => i.uid === uid);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((i) => i.uid !== uid);
    });
  };

  const full = items.length >= maxFiles;

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled || full ? -1 : 0}
        aria-disabled={disabled || full}
        onClick={() => !disabled && !full && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !disabled && !full && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !full) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled && !full) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition',
          dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50/60 hover:border-indigo-300 hover:bg-indigo-50/40',
          (disabled || full) && 'cursor-not-allowed opacity-60 hover:border-gray-200 hover:bg-gray-50/60',
        )}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-500 shadow-sm ring-1 ring-gray-100">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-gray-800">
          {full ? 'Fayllar limiti to‘ldi' : 'Faylni shu yerga tashlang yoki tanlang'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {hint ?? `PDF yoki rasm · har biri ${maxSizeMb} MB gacha · ${maxFiles} tagacha`}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept.join(',')}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.uid} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400">
                {i.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{i.name}</p>
                {i.status === 'uploading' ? (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                        style={{ width: `${i.progress}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-xs tabular-nums text-gray-500">{i.progress}%</span>
                  </div>
                ) : i.status === 'error' ? (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {i.error}
                  </p>
                ) : (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> Yuklandi · {formatFileSize(i.size)}
                  </p>
                )}
              </div>

              {i.status === 'uploading' && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-500" />}
              <button
                type="button"
                onClick={() => remove(i.uid)}
                disabled={disabled}
                aria-label="Olib tashlash"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
