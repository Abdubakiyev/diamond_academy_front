// src/components/AccessCodeNotification.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useCurrentAccessCode, useGenerateAccessCode } from '@/features/hooks/useAccess';
import { Key, Copy, RefreshCw, Clock, CheckCircle2, XCircle } from 'lucide-react';

const CODE_LIFETIME_SECONDS = 300; // kod 5 daqiqa amal qiladi
const EXPIRING_SOON_SECONDS = 120;
const EXPIRED_RETRY_MS = 5000; // muddati tugagach yangi kodni har 5 soniyada so'raymiz

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getErrorMessage = (err: unknown, fallback: string) => {
  const e = err as {
    message?: string;
    response?: { status?: number; data?: { message?: string | string[] } };
  };
  const msg = e?.response?.data?.message;
  const text = Array.isArray(msg) ? msg.join(', ') : msg;
  return text || e?.message || fallback;
};

// Clipboard API bo'lmagan (masalan, http) muhitlar uchun zaxira usul
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
};

export default function AccessCodeNotification() {
  const { data: accessCode, isLoading, error, refetch, dataUpdatedAt } = useCurrentAccessCode();
  const generateMutation = useGenerateAccessCode();

  const [now, setNow] = useState(0);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState('');
  const lastRetry = useRef(0);

  // Kod tugash payti: ma'lumot kelgan payt + qolgan soniyalar (render ichida Date.now() yo'q)
  const expiresAt = accessCode ? dataUpdatedAt + accessCode.remainingSeconds * 1000 : 0;
  const current = Math.max(now, dataUpdatedAt);
  const timeLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - current) / 1000)) : 0;
  const isExpired = !!accessCode && timeLeft === 0;
  const isExpiringSoon = !!accessCode && !isExpired && timeLeft < EXPIRING_SOON_SECONDS;

  /* ⏳ Bitta interval: soniyalarni yangilaydi va muddati tugasa yangi kodni so'raydi */
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= expiresAt && t - lastRetry.current >= EXPIRED_RETRY_MS) {
        lastRetry.current = t;
        refetch();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, refetch]);

  /* "Nusxalandi" belgisi 2 soniyadan keyin yo'qoladi (unmount bo'lsa ham tozalanadi) */
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleGenerateNewCode = async () => {
    setActionError('');
    try {
      await generateMutation.mutateAsync();
      await refetch();
    } catch (err) {
      console.error('Error generating new code:', err);
      setActionError(getErrorMessage(err, 'Yangi kod yaratib bo\'lmadi'));
    }
  };

  const copyToClipboard = async () => {
    if (!accessCode) return;
    const ok = await copyText(accessCode.code);
    if (ok) setCopied(true);
    else setActionError("Nusxalab bo'lmadi, kodni qo'lda belgilab oling");
  };

  /* ───────────── Yuklanmoqda ───────────── */
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 p-6 shadow-lg">
        <div className="flex animate-pulse items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/20" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-white/20" />
            <div className="h-8 w-1/2 rounded bg-white/20" />
          </div>
        </div>
      </div>
    );
  }

  /* ───────────── Kod yo'q / xatolik ───────────── */
  if (error || !accessCode) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="rounded-2xl bg-red-100 p-3">
            <Key className="text-red-600" size={24} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800">Access code topilmadi</p>
            <p className="text-sm text-red-600">
              {actionError || 'Yangi kod yaratish uchun tugmani bosing'}
            </p>
          </div>
          <button
            onClick={handleGenerateNewCode}
            disabled={generateMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={generateMutation.isPending ? 'animate-spin' : ''} />
            Yaratish
          </button>
        </div>
      </div>
    );
  }

  const tone = isExpired
    ? 'from-slate-500 to-slate-700'
    : isExpiringSoon
      ? 'from-orange-500 to-red-600'
      : 'from-indigo-500 to-violet-600';
  const progress = Math.min(100, (timeLeft / CODE_LIFETIME_SECONDS) * 100);

  return (
    <div
      className={`rounded-2xl bg-gradient-to-r p-6 shadow-lg transition-all duration-500 ${tone}`}
    >
      <div className="flex flex-col items-center gap-6 md:flex-row">
        <div className="rounded-2xl bg-white/20 p-4">
          <Key className="text-white" size={32} />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <h3 className="text-lg font-semibold text-white">Sayt kirish kodi</h3>
            {isExpiringSoon && (
              <span className="animate-pulse rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                Tez orada tugaydi!
              </span>
            )}
            {isExpired && (
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                Muddati tugadi, yangisi olinmoqda...
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 md:justify-start">
            <div
              className={`flex gap-1.5 sm:gap-2 ${isExpired ? 'opacity-50' : ''}`}
              aria-label={`Kirish kodi: ${accessCode.code}`}
            >
              {accessCode.code.split('').map((ch, i) => (
                <span
                  key={i}
                  className="flex h-12 w-9 items-center justify-center rounded-lg bg-white/95 font-mono text-2xl font-bold text-slate-800 shadow-sm sm:h-14 sm:w-11 sm:text-3xl"
                >
                  {ch}
                </span>
              ))}
            </div>

            <button
              onClick={copyToClipboard}
              disabled={isExpired}
              className="rounded-xl bg-white/20 p-3 text-white transition-all hover:bg-white/30 disabled:opacity-50"
              title="Nusxa olish"
              aria-label="Kodni nusxalash"
            >
              {copied ? <CheckCircle2 size={20} className="text-green-300" /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2">
            <Clock className="text-white" size={20} />
            <span className="font-mono text-xl font-bold tabular-nums text-white">
              {formatTime(timeLeft)}
            </span>
          </div>

          <button
            onClick={handleGenerateNewCode}
            disabled={generateMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm text-white transition-all hover:bg-white/30 disabled:opacity-50"
          >
            <RefreshCw size={16} className={generateMutation.isPending ? 'animate-spin' : ''} />
            Yangilash
          </button>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {actionError && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm text-white"
        >
          <XCircle size={16} className="mt-0.5 shrink-0" />
          {actionError}
        </div>
      )}

      <p className="mt-3 text-center text-sm text-white/80 md:text-left">
        Bu kodni foydalanuvchilar saytga kirish uchun ishlatadi. Kod har 5 minutda avtomatik
        yangilanadi.
      </p>
    </div>
  );
}