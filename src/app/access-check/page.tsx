'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useCheckAccessCode } from '@/features/hooks/useAccess';

const CODE_LENGTH = 6;

export default function AccessCheckPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [focused, setFocused] = useState(true);
  const [shakeKey, setShakeKey] = useState(0);

  const checkMutation = useCheckAccessCode();
  const isLoading = checkMutation.isPending;

  // Yo'naltirish: ADMIN > avval tasdiqlangan > kod o'chirilgan
  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    const verified = sessionStorage.getItem('access_verified');
    const enabled = localStorage.getItem('access_code_enabled');

    if (userRole === 'ADMIN') {
      router.push('/diamond-academy/admin');
      return;
    }
    if (verified === 'true') {
      router.push('/diamond-academy');
      return;
    }
    if (enabled === 'false') {
      router.push('/');
    }
  }, [router]);

  // Sahifa yopilganda yoki refresh qilinganda tozalash
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('access_verified');
      sessionStorage.removeItem('access_code');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Timer'ni tozalash
  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');

    if (!code.trim()) {
      setError('Iltimos, kodni kiriting');
      return;
    }
    if (code.length !== CODE_LENGTH) {
      setError(`Kod ${CODE_LENGTH} ta belgidan iborat bo'lishi kerak`);
      return;
    }

    try {
      const result = await checkMutation.mutateAsync({ code: code.toUpperCase() });

      if (result.success) {
        setIsVerified(true);
        sessionStorage.setItem('access_verified', 'true');
        sessionStorage.setItem('access_code', code.toUpperCase());

        redirectTimer.current = setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(
        (Array.isArray(msg) ? msg.join(', ') : msg) || "Kod noto'g'ri yoki eskirgan",
      );
      setCode('');
      setShakeKey((k) => k + 1);
      inputRef.current?.focus();
    }
  };

  // Paste ham shu yerdan o'tadi: tozalanadi va 6 belgiga qirqiladi
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, CODE_LENGTH);
    setCode(value);
    setError('');
  };

  const activeIndex = Math.min(code.length, CODE_LENGTH - 1);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 flex items-center justify-center p-4">
      <style>{`
        @keyframes acc-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        @keyframes acc-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes acc-pop {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
        .acc-shake { animation: acc-shake 0.4s ease-in-out; }
        .acc-fill { animation: acc-fill 2s linear forwards; }
        .acc-pop { animation: acc-pop 0.5s ease-out both; }
      `}</style>

      {/* Fon bezaklari */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-56 w-56 rounded-full bg-sky-200/50 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-5 h-20 w-20">
            <div className="absolute inset-0 rounded-3xl bg-indigo-500/30 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <Lock className="text-white" size={34} />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Diamond Academy
          </h1>
          <p className="mt-2 text-slate-500">Saytga kirish uchun kodni kiriting</p>
        </div>

        {isVerified ? (
          /* Muvaffaqiyat */
          <div className="rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)] backdrop-blur-xl">
            <div className="acc-pop relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/30">
                <CheckCircle className="text-white" size={40} />
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Tasdiqlandi!</h2>
            <p className="mt-1 text-slate-500">Saytga yo&apos;naltirilmoqda...</p>
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="acc-fill h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500" />
            </div>
          </div>
        ) : (
          /* Kod formasi */
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.25)] backdrop-blur-xl sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="access-code"
                  className="mb-3 block text-center text-sm font-medium text-slate-600"
                >
                  Kirish kodi ({CODE_LENGTH} ta belgi)
                </label>

                {/* 6 ta katak + ularning ustidagi ko'rinmas input */}
                <div
                  key={shakeKey}
                  className={`relative flex justify-center gap-2 sm:gap-3 ${shakeKey ? 'acc-shake' : ''}`}
                >
                  {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                    const char = code[i];
                    const isActive = focused && !isLoading && i === activeIndex;
                    const stateClass = error
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : isActive
                        ? 'border-indigo-500 bg-white ring-4 ring-indigo-500/15'
                        : char
                          ? 'border-indigo-200 bg-indigo-50/60'
                          : 'border-slate-200 bg-slate-50';
                    return (
                      <div
                        key={i}
                        className={`flex h-14 w-11 items-center justify-center rounded-xl border-2 text-2xl font-bold text-slate-800 transition-all duration-150 sm:h-16 sm:w-12 ${stateClass}`}
                      >
                        {char ? (
                          char
                        ) : isActive ? (
                          <span className="h-6 w-0.5 animate-pulse rounded bg-indigo-500" />
                        ) : null}
                      </div>
                    );
                  })}

                  <input
                    id="access-code"
                    ref={inputRef}
                    type="text"
                    value={code}
                    onChange={handleCodeChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    disabled={isLoading}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    autoFocus
                    aria-label="Kirish kodi"
                    aria-invalid={!!error}
                    className="absolute inset-0 h-full w-full cursor-text opacity-0"
                  />
                </div>

                <p className="mt-3 text-center text-xs text-slate-400">
                  {code.length} / {CODE_LENGTH} belgi
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <XCircle className="mt-0.5 shrink-0 text-red-500" size={20} />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || code.length !== CODE_LENGTH}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    Tekshirilmoqda...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Tasdiqlash
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 space-y-2 border-t border-slate-200/70 pt-5">
              <p className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <Clock size={16} className="text-indigo-500" />
                Kod 5 daqiqa mobaynida amal qiladi
              </p>
              <p className="text-center text-xs text-slate-400">
                Kodni bilmasangiz, admin bilan bog&apos;laning
              </p>
            </div>
          </div>
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={14} />
          Himoyalangan kirish
        </p>
      </div>
    </div>
  );
}