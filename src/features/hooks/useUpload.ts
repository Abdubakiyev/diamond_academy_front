'use client';

import { useCallback, useRef, useState } from 'react';
import { handleApiError } from '../api/api';
import { uploadFile } from '../../lib/upload';
import type { UploadedFile, UploadPurpose } from '../types/storage';

export function useUpload(purpose: UploadPurpose) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const upload = useCallback(
    async (file: File | Blob, fileName?: string): Promise<UploadedFile> => {
      setUploading(true);
      setError(null);
      setProgress(0);
      abortRef.current = new AbortController();
      try {
        return await uploadFile(file, purpose, {
          fileName,
          onProgress: setProgress,
          signal: abortRef.current.signal,
        });
      } catch (e) {
        const message = handleApiError(e);
        setError(message);
        throw e;
      } finally {
        setUploading(false);
      }
    },
    [purpose],
  );

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  return { upload, cancel, progress, uploading, error };
}
