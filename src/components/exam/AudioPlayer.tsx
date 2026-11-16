'use client';

import { useEffect, useRef, useState } from 'react';
import { Headphones, Loader2, Play, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { issueAudio } from '../../features/api/exam-session';
import { getErrorStatus, handleApiError } from '../../features/api/api';
import type { PartAudio } from '../../features/types/exam-session';
import { cn } from '../../lib/format';

type Phase = 'idle' | 'loading' | 'ready' | 'playing' | 'ended';

/**
 * Real imtihon qoidasi: audio to'xtatilmaydi va oldinga-orqaga o'tkazilmaydi.
 * Har "boshlash" serverda eshittirish sonini 1 ga oshiradi (limit tugasa 409).
 */
export default function AudioPlayer({
  attemptId,
  target,
  audio,
  label = 'Audio',
}: {
  attemptId: string;
  target: { partId: string } | { questionId: string };
  audio: PartAudio;
  label?: string;
}) {
  const [played, setPlayed] = useState(audio.played);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const el = useRef<HTMLAudioElement | null>(null);

  const remaining = Math.max(0, audio.playLimit - played);

  useEffect(
    () => () => {
      el.current?.pause();
      el.current = null;
    },
    [],
  );

  useEffect(() => {
    if (el.current) el.current.volume = volume;
  }, [volume]);

  const attach = (a: HTMLAudioElement) => {
    a.volume = volume;
    a.ontimeupdate = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    a.onended = () => {
      setProgress(1);
      setPhase('ended');
    };
    a.onerror = () => {
      setPhase('idle');
      toast.error('Audio yuklanmadi. Internetni tekshirib, qayta urinib ko‘ring.');
    };
    el.current = a;
  };

  const start = async () => {
    setPhase('loading');
    try {
      const res = await issueAudio(attemptId, target);
      setPlayed(res.played);
      if (!res.url) throw new Error('Audio havolasi yo‘q');
      const a = new Audio(res.url);
      attach(a);
      setProgress(0);
      try {
        await a.play();
        setPhase('playing');
      } catch {
        // Ba'zi brauzerlar (Safari) asinxron so'rovdan keyin avtoijroni bloklaydi: bitta bosish yetadi, qayta hisoblanmaydi
        setPhase('ready');
      }
    } catch (e) {
      setPhase('idle');
      if (getErrorStatus(e) === 409) setPlayed(audio.playLimit);
      toast.error(handleApiError(e));
    }
  };

  const resume = async () => {
    try {
      await el.current?.play();
      setPhase('playing');
    } catch {
      toast.error('Audioni ijro etib bo‘lmadi');
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 p-4 text-white shadow-md">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
          <Headphones className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-white/80">
            Eshitish: {played}/{audio.playLimit}
            {phase === 'playing' && ' · ijro etilmoqda (to‘xtatib bo‘lmaydi)'}
            {phase === 'ended' && remaining === 0 && ' · limit tugadi'}
          </p>
        </div>

        {phase === 'ready' ? (
          <button type="button" onClick={resume} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-indigo-700 active:scale-95">
            <Play className="h-4 w-4" /> Eshitishni boshlash
          </button>
        ) : phase === 'playing' ? (
          <span className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium">
            <Volume2 className="h-4 w-4" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Ovoz balandligi"
              className="w-24 accent-white"
            />
          </span>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={remaining === 0 || phase === 'loading'}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-indigo-700 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {phase === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {played === 0 ? 'Audioni boshlash' : remaining > 0 ? `Qayta eshitish (${remaining})` : 'Limit tugagan'}
          </button>
        )}
      </div>

      <div className={cn('mt-3 h-1.5 overflow-hidden rounded-full bg-white/20', phase === 'idle' && progress === 0 && 'opacity-50')}>
        <div className="h-full rounded-full bg-white transition-[width] duration-300" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
}
