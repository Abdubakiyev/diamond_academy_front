'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Mic, RotateCcw, SkipForward, Square } from 'lucide-react';
import { useUpload } from '../../features/hooks/useUpload';
import { handleApiError } from '../../features/api/api';
import { formatClock } from '../../lib/exam-session';
import { cn } from '../../lib/format';

type Phase = 'idle' | 'prep' | 'recording' | 'uploading' | 'done' | 'error';

const pickMime = () => {
  if (typeof MediaRecorder === 'undefined') return '';
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
};

const extFor = (mime: string) => (mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : 'webm');

export default function SpeakingRecorder({
  number,
  prepSec,
  answerSec,
  saved,
  onDone,
  onBusy,
}: {
  number: number;
  prepSec: number | null;
  answerSec: number | null;
  /** Serverda yoki shu seansda allaqachon yozilgan */
  saved: boolean;
  onDone: (key: string, durationSec: number) => void;
  onBusy: (busy: boolean) => void;
}) {
  const { upload } = useUpload('SPEAKING_AUDIO');
  const limit = answerSec && answerSec > 0 ? answerSec : 120;

  const [phase, setPhase] = useState<Phase>(saved ? 'done' : 'idle');
  const [left, setLeft] = useState(0);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef(0);
  const pending = useRef<{ blob: Blob; duration: number; mime: string } | null>(null);

  const clearTick = () => {
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
  };
  const stopStream = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };

  useEffect(
    () => () => {
      clearTick();
      stopStream();
      if (recorder.current && recorder.current.state !== 'inactive') {
        recorder.current.onstop = null;
        recorder.current.stop();
      }
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [localUrl]);

  const send = useCallback(
    async (blob: Blob, duration: number, mime: string) => {
      setPhase('uploading');
      setError(null);
      onBusy(true);
      try {
        const res = await upload(blob, `speaking-${number}.${extFor(mime)}`);
        onDone(res.key, duration);
        pending.current = null;
        setPhase('done');
      } catch (e) {
        pending.current = { blob, duration, mime };
        setError(handleApiError(e));
        setPhase('error');
      } finally {
        onBusy(false);
      }
    },
    [number, onBusy, onDone, upload],
  );

  const startRecording = useCallback(() => {
    if (!stream.current) return;
    clearTick();
    chunks.current = [];
    const mime = pickMime();
    const rec = new MediaRecorder(stream.current, mime ? { mimeType: mime } : undefined);
    recorder.current = rec;
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };
    rec.onstop = () => {
      clearTick();
      stopStream();
      const type = (mime || 'audio/webm').split(';')[0]; // presign contentType da parametrlar bo'lmasligi kerak
      const blob = new Blob(chunks.current, { type });
      const duration = Math.min(3600, Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)));
      setLocalUrl(URL.createObjectURL(blob));
      void send(blob, duration, type);
    };
    startedAt.current = Date.now();
    rec.start(1000);
    setPhase('recording');
    setLeft(limit);
    tick.current = setInterval(() => {
      const rem = Math.max(0, limit - (Date.now() - startedAt.current) / 1000);
      setLeft(rem);
      if (rem <= 0 && rec.state !== 'inactive') rec.stop();
    }, 250);
  }, [limit, send]);

  const begin = async () => {
    setError(null);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Mikrofonga ruxsat berilmadi. Brauzer sozlamalarida mikrofonni yoqing.');
      setPhase('error');
      return;
    }
    if (prepSec && prepSec > 0) {
      setPhase('prep');
      const until = Date.now() + prepSec * 1000;
      setLeft(prepSec);
      clearTick();
      tick.current = setInterval(() => {
        const rem = Math.max(0, (until - Date.now()) / 1000);
        setLeft(rem);
        if (rem <= 0) startRecording();
      }, 250);
    } else {
      startRecording();
    }
  };

  const stop = () => {
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop();
  };

  return (
    <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-4">
      {phase === 'idle' && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={begin} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/30 transition hover:bg-indigo-500 active:scale-95">
            <Mic className="h-4 w-4" /> Yozishni boshlash
          </button>
          <span className="text-xs text-gray-500">
            {prepSec ? `Tayyorlanish ${prepSec} soniya, ` : ''}javob vaqti {formatClock(limit)}
          </span>
        </div>
      )}

      {phase === 'prep' && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-indigo-700">Tayyorlaning</p>
            <p className="font-mono text-3xl font-bold tabular-nums text-indigo-900">{formatClock(left)}</p>
          </div>
          <button type="button" onClick={startRecording} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50">
            <SkipForward className="h-4 w-4" /> Hozir boshlash
          </button>
        </div>
      )}

      {phase === 'recording' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" /> Yozilmoqda
            </span>
            <span className="font-mono text-2xl font-bold tabular-nums text-gray-900">{formatClock(left)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white">
            <div className={cn('h-full rounded-full', left < 10 ? 'bg-red-500' : 'bg-indigo-500')} style={{ width: `${(left / limit) * 100}%` }} />
          </div>
          <button type="button" onClick={stop} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-md active:scale-95">
            <Square className="h-4 w-4" /> Tugatish
          </button>
        </div>
      )}

      {phase === 'uploading' && (
        <p className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700">
          <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda... sahifani yopmang
        </p>
      )}

      {phase === 'done' && (
        <div className="space-y-3">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Javob yozilgan va saqlangan
          </p>
          {localUrl && <audio controls src={localUrl} className="w-full" />}
          <button
            type="button"
            onClick={() => {
              setLocalUrl(null);
              setPhase('idle');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Qayta yozish
          </button>
        </div>
      )}

      {phase === 'error' && (
        <div className="space-y-3">
          <p className="flex items-start gap-2 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
          <div className="flex gap-2">
            {pending.current && (
              <button type="button" onClick={() => pending.current && send(pending.current.blob, pending.current.duration, pending.current.mime)} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">
                Qayta yuklash
              </button>
            )}
            <button type="button" onClick={() => setPhase('idle')} className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50">
              Qaytadan yozish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
