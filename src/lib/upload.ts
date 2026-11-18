import axios from 'axios';
import { presignUpload } from '../features/api/storage';
import type { UploadPurpose, UploadedFile } from '../features/types/storage';

export interface UploadOptions {
  /** Blob (masalan, speaking yozuvi) uchun majburiy; File bo'lsa file.name olinadi */
  fileName?: string;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

/**
 * Faylni 3 qadamda yuklaydi:
 *  1) POST /storage/presign  2) PUT <uploadUrl> (to'g'ridan-to'g'ri S3/R2 ga)  3) { key, publicUrl } qaytaradi
 * Eslatma: S3 ga yuboriladigan so'rovda Authorization sarlavhasi bo'lmasligi kerak, shuning uchun
 * bu yerda umumiy apiClient emas, alohida axios chaqiriladi.
 */
export async function uploadFile(file: File | Blob, purpose: UploadPurpose, opts: UploadOptions = {}): Promise<UploadedFile> {
  const fileName = opts.fileName ?? (file instanceof File ? file.name : '');
  if (!fileName) throw new Error('Fayl nomi ko‘rsatilmagan');

  const contentType = file.type || 'application/octet-stream';

  const presign = await presignUpload({
    purpose,
    fileName,
    contentType,
    sizeBytes: file.size,
  });
  console.log('PRESIGN', presign, 'file.size=', file.size, 'type=', contentType);
  await axios.put(presign.uploadUrl, file, {
    headers: presign.headers,
    signal: opts.signal,
    onUploadProgress: (e) => {
      if (opts.onProgress && e.total) opts.onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });

  return { key: presign.key, publicUrl: presign.publicUrl };
}
