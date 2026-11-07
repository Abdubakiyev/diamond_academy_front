'use client'
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { register as registerUser } from '@/features/api/auth';
import { RegisterDto } from '@/features/types/auth';
import { useActiveAdvertisement } from '@/features/hooks/useAdvertisement';
import {
  User,
  Phone,
  Loader2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Gem,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Headphones,
  Mic,
  Pencil,
} from 'lucide-react';

/* ───────────── Yordamchilar (mantiq o'zgarmagan) ───────────── */
const API_URL = 'https://diamond-academy-back-guqx.onrender.com';

const mediaUrl = (path: string) => (path.startsWith('http') ? path : `${API_URL}${path}`);
const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

const PHONE_PREFIX = '+998 ';

// "+998 90 123 45 67" ko'rinishida avtomatik formatlaydi
const formatPhone = (raw: string) => {
  let digits = raw.replace(/\D/g, '');
  // faqat prefiks qolgan yoki o'chirilgan bo'lsa — prefiksni saqlaymiz
  if ('998'.startsWith(digits)) return PHONE_PREFIX;
  if (!digits.startsWith('998')) digits = '998' + digits;
  digits = digits.slice(0, 12);
  const parts = [digits.slice(3, 5), digits.slice(5, 8), digits.slice(8, 10), digits.slice(10, 12)];
  return ('+998 ' + parts.filter(Boolean).join(' ')).trimEnd();
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

/* ───────────── Dizayn ma'lumotlari ───────────── */
const GRAD_TEXT =
  'bg-gradient-to-r from-sky-300 via-violet-400 to-fuchsia-300 bg-clip-text text-transparent';

const SPARKS: [number, number, number][] = [
  [8, 18, 0], [18, 70, 1.2], [30, 36, 2.1], [44, 86, 0.6], [56, 12, 1.7],
  [66, 58, 2.6], [78, 26, 0.3], [88, 78, 1.1], [14, 92, 2.3], [92, 8, 1.9],
];

const BENEFITS = [
  { icon: Headphones, t: 'To‘liq Multilevel mock', d: 'Haqiqiy imtihon formati, bo‘limlar bo‘yicha taymer' },
  { icon: Pencil, t: 'AI Writing tekshiruvi', d: 'Mezonlar bo‘yicha ball va aniq maslahatlar' },
  { icon: Mic, t: 'AI Speaking tekshiruvi', d: 'Javobingiz matnga o‘giriladi va baholanadi' },
];

// Animatsiya kalitlari shu sahifaning o'zida (globals.css ga bog'liq emas)
const KEYFRAMES = `
  @keyframes rg-in { from{opacity:0;transform:translateY(24px) scale(.98)} to{opacity:1;transform:none} }
  @keyframes rg-drift { from{transform:translate(0,0) scale(1)} to{transform:translate(60px,40px) scale(1.15)} }
  @keyframes rg-twinkle { 0%,100%{opacity:0;transform:scale(.5)} 50%{opacity:1;transform:scale(1.4)} }
  @keyframes rg-float { 0%,100%{transform:translateY(-8px)} 50%{transform:translateY(12px)} }
  @keyframes rg-spin { 0%,100%{transform:rotateY(-14deg)} 50%{transform:rotateY(14deg)} }
  @keyframes rg-shine { from{transform:translateX(-120%) skewX(-20deg)} to{transform:translateX(320%) skewX(-20deg)} }
  @keyframes reg-pop { 0%{transform:scale(.6);opacity:0} 70%{transform:scale(1.08);opacity:1} 100%{transform:scale(1)} }
  @keyframes reg-fill { from{width:0%} to{width:100%} }
  .reg-pop{animation:reg-pop .5s ease-out both}
  .reg-fill{animation:reg-fill 2s linear forwards}
`;

const IN = 'animate-[rg-in_.7s_cubic-bezier(.2,.8,.2,1)_both] motion-reduce:animate-none';

/* ───────────── Chap tomondagi diamond (reklama bo'lmaganda) ───────────── */
function BrandPanel() {
  return (
    <div className="relative flex flex-col items-start gap-8">
      <div className="relative h-52 w-52 animate-[rg-float_6s_ease-in-out_infinite]">
        <svg
          viewBox="0 0 200 200"
          className="h-full w-full origin-[50%_60%] animate-[rg-spin_9s_ease-in-out_infinite] drop-shadow-[0_20px_50px_rgba(125,211,252,.45)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="rg-crown" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#bae6fd" />
              <stop offset="1" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="rg-pav" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7dd3fc" />
              <stop offset="1" stopColor="#6d28d9" />
            </linearGradient>
          </defs>
          <polygon points="55,45 145,45 180,90 20,90" fill="url(#rg-crown)" />
          <polygon points="20,90 180,90 100,175" fill="url(#rg-pav)" />
          <path
            d="M80 90 55 45M120 90 145 45M100 45 80 90M100 45 120 90M80 90 100 175M120 90 100 175"
            stroke="#fff"
            strokeOpacity=".45"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      <div>
        <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tight">
          Ingliz tilini <span className={GRAD_TEXT}>olmosdek</span> sayqallang
        </h2>
        <p className="mt-3 max-w-md text-slate-400">
          Bir daqiqada hisob oching va Multilevel (CEFR) testlarni topshirishni boshlang.
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {BENEFITS.map(({ icon: Icon, t, d }) => (
          <li key={t} className="flex items-start gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-sky-300/25 bg-sky-300/10 text-sky-300">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <b className="block text-[15px] font-semibold text-slate-100">{t}</b>
              <span className="text-sm text-slate-400">{d}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────── Sahifa ───────────── */
export default function Register() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterDto>({
    mode: 'onTouched',
    defaultValues: { phone: PHONE_PREFIX },
  });
  const { data: activeAd, isLoading: adLoading } = useActiveAdvertisement();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const showSuccess = redirectTo !== null;

  // Muvaffaqiyatdan 2 soniya keyin yo'naltirish; sahifadan chiqilsa timer bekor qilinadi
  useEffect(() => {
    if (!redirectTo) return;
    const t = setTimeout(() => router.push(redirectTo), 2000);
    return () => clearTimeout(t);
  }, [redirectTo, router]);

  const onSubmit = async (data: RegisterDto) => {
    setLoading(true);
    setError(null);

    try {
      const res = await registerUser({
        name: data.name.trim(),
        phone: '+' + data.phone.replace(/\D/g, ''),
        ...(data.role ? { role: data.role } : {}),
      });

      // Token va foydalanuvchi ma'lumotlarini saqlash
      if (res.accessToken) localStorage.setItem('access_token', res.accessToken);
      if (res.user?.id) localStorage.setItem('user_id', res.user.id);
      if (res.user?.role) localStorage.setItem('user_role', res.user.role);

      // Rolga qarab yo'naltirish: ADMIN — to'g'ridan-to'g'ri panelga, USER — kod tekshiruviga
      setRedirectTo(res.user?.role === 'ADMIN' ? '/diamond-academy/admin' : '/access-check');
    } catch (err: any) {
      setError(
        getErrorMessage(
          err,
          "Ro'yxatdan o'tishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full rounded-xl border bg-white/5 py-3.5 pl-12 pr-4 text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 focus:bg-white/[.07] focus:ring-4 [&:-webkit-autofill]:[-webkit-text-fill-color:#f1f5f9] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0d1030]';
  const inputState = (hasError: boolean) =>
    hasError
      ? 'border-red-400/50 focus:border-red-400/70 focus:ring-red-500/15'
      : 'border-white/10 hover:border-white/20 focus:border-sky-300/60 focus:ring-sky-300/10';
  const iconState = (hasError: boolean) =>
    hasError ? 'text-red-400' : 'text-slate-500 group-focus-within:text-sky-300';

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#05060f] text-slate-100 antialiased [color-scheme:dark]">
      <style>{KEYFRAMES}</style>

      {/* Fon: aurora, setka, yulduzchalar */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <i className="absolute -left-28 -top-36 h-[520px] w-[520px] animate-[rg-drift_14s_ease-in-out_infinite_alternate] rounded-full bg-blue-500 opacity-45 blur-[90px]" />
        <i className="absolute -right-28 top-[8%] h-[460px] w-[460px] animate-[rg-drift_17s_ease-in-out_infinite_alternate-reverse] rounded-full bg-violet-600 opacity-45 blur-[90px]" />
        <i className="absolute -bottom-40 left-[38%] h-[380px] w-[380px] animate-[rg-drift_19s_ease-in-out_infinite_alternate] rounded-full bg-fuchsia-500 opacity-25 blur-[90px]" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_30%,transparent_75%)]"
      />
      {SPARKS.map(([x, y, d], k) => (
        <span
          key={k}
          aria-hidden="true"
          className="pointer-events-none absolute h-1 w-1 animate-[rg-twinkle_3.4s_ease-in-out_infinite] rounded-full bg-white opacity-0 shadow-[0_0_12px_3px_rgba(125,211,252,.8)]"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }}
        />
      ))}

      {/* Yuqori panel */}
      <header className="relative z-10 mx-auto flex w-[min(1180px,100%-40px)] items-center justify-between py-5">
        <Link href="/" className="inline-flex items-center gap-2.5 font-semibold" aria-label="Diamond Academy">
          <Gem className="h-7 w-7 text-sky-300" />
          <span>
            Diamond <b className={GRAD_TEXT}>Academy</b>
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Bosh sahifa
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="flex w-full max-w-6xl flex-col items-center gap-10 lg:flex-row lg:justify-between lg:gap-16">
          {/* Chap tomon — reklama yoki brend paneli */}
          <aside
            className={`${IN} hidden w-full max-w-md flex-1 lg:flex lg:flex-col`}
            style={{ animationDelay: '100ms' }}
          >
            {adLoading ? (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="animate-pulse space-y-4">
                  <div className="h-52 rounded-2xl bg-white/10" />
                  <div className="h-6 w-3/4 rounded bg-white/10" />
                  <div className="h-4 rounded bg-white/5" />
                  <div className="h-4 w-5/6 rounded bg-white/5" />
                </div>
              </div>
            ) : activeAd ? (
              <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_30px_80px_-30px_rgba(125,211,252,.35)] backdrop-blur-xl">
                {activeAd.imageUrl && (
                  <div className="relative aspect-video w-full overflow-hidden bg-white/5">
                    {isVideo(activeAd.imageUrl) ? (
                      <video
                        src={mediaUrl(activeAd.imageUrl)}
                        className="h-full w-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={mediaUrl(activeAd.imageUrl)}
                        alt={activeAd.title}
                        className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-[#0a0c22]" />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-[#05060f]/60 px-3 py-1.5 text-xs text-sky-300 backdrop-blur">
                      <Sparkles className="h-3.5 w-3.5" /> Yangilik
                    </span>
                  </div>
                )}
                <div className="p-8">
                  <h2 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight">
                    {activeAd.title}
                  </h2>
                  <p className="whitespace-pre-line text-lg leading-relaxed text-slate-400">
                    {activeAd.description}
                  </p>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-sky-300 via-violet-400 to-fuchsia-300 transition-transform duration-500 group-hover:scale-x-100" />
              </div>
            ) : (
              <BrandPanel />
            )}
          </aside>

          {/* O'ng tomon — forma */}
          <div
            className={`${IN} w-full max-w-md rounded-[28px] bg-gradient-to-br from-sky-300/40 via-white/10 to-violet-400/40 p-px shadow-[0_30px_80px_-25px_rgba(124,58,237,.45)]`}
            style={{ animationDelay: '250ms' }}
          >
            <div className="rounded-[27px] bg-[#0a0c22]/90 p-6 backdrop-blur-2xl sm:p-8">
              <div className="mb-8 text-center">
                <div className="relative mx-auto mb-5 h-16 w-16">
                  <div className="absolute inset-0 rounded-2xl bg-sky-300/40 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 via-violet-400 to-fuchsia-400 shadow-lg shadow-violet-500/30">
                    <Gem className="h-8 w-8 text-[#08091a]" />
                  </div>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Ro&apos;yxatdan <span className={GRAD_TEXT}>o&apos;tish</span>
                </h1>
                <p className="mt-2 text-slate-400">Diamond Academy&apos;da yangi hisob yarating</p>
              </div>

              {showSuccess ? (
                <div className="py-8 text-center">
                  <div className="reg-pop relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
                    <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/30">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </span>
                  </div>
                  <h2 className="mb-2 text-2xl font-bold">
                    Muvaffaqiyatli ro&apos;yxatdan o&apos;tdingiz!
                  </h2>
                  <p className="mb-8 text-slate-400">Sizni tegishli sahifaga yo&apos;naltiramiz...</p>
                  <div className="mx-auto h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
                    <div className="reg-fill h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500" />
                  </div>
                </div>
              ) : (
                <>
                  {error && (
                    <div
                      role="alert"
                      className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4"
                    >
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                      <p className="text-sm font-medium text-red-300">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    {/* Ism */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="name">
                        Ismingiz
                      </label>
                      <div className="group relative">
                        <User
                          className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${iconState(!!errors.name)}`}
                        />
                        <input
                          {...register('name', {
                            required: 'Ismni kiriting',
                            minLength: {
                              value: 2,
                              message: "Ism kamida 2 ta belgidan iborat bo'lishi kerak",
                            },
                            validate: (v) => v.trim().length >= 2 || 'Ismni kiriting',
                          })}
                          id="name"
                          type="text"
                          autoComplete="name"
                          placeholder="Ismingizni kiriting"
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                          className={`${inputBase} ${inputState(!!errors.name)}`}
                        />
                      </div>
                      {errors.name && (
                        <p id="name-error" className="mt-2 text-sm text-red-400">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Telefon */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="phone">
                        Telefon raqamingiz
                      </label>
                      <div className="group relative">
                        <Phone
                          className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${iconState(!!errors.phone)}`}
                        />
                        <input
                          {...register('phone', {
                            validate: (v) => {
                              const d = (v ?? '').replace(/\D/g, '');
                              if (d.length <= 3) return 'Telefon raqamini kiriting';
                              return /^998\d{9}$/.test(d) || "Raqam to'liq emas: +998 90 123 45 67";
                            },
                            onChange: (e) =>
                              setValue('phone', formatPhone(e.target.value), {
                                shouldValidate: !!errors.phone,
                              }),
                          })}
                          id="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="+998 90 123 45 67"
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'}
                          className={`${inputBase} ${inputState(!!errors.phone)}`}
                        />
                      </div>
                      {errors.phone ? (
                        <p id="phone-error" className="mt-2 text-sm text-red-400">
                          {errors.phone.message}
                        </p>
                      ) : (
                        <p id="phone-hint" className="mt-2 text-sm text-slate-500">
                          Raqam avtomatik formatlanadi: +998 90 123 45 67
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sky-300 via-violet-400 to-fuchsia-300 bg-[length:200%_100%] px-4 py-3.5 font-semibold text-[#08091a] shadow-[0_10px_30px_-8px_rgba(125,211,252,.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[position:100%_0] hover:shadow-[0_16px_40px_-8px_rgba(167,139,250,.7)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none disabled:hover:translate-y-0"
                    >
                      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-white/40 blur-md group-hover:animate-[rg-shine_1s_ease]" />
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Ro&apos;yxatdan o&apos;tilmoqda...
                        </>
                      ) : (
                        <>
                          Ro&apos;yxatdan o&apos;tish
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="mt-6 text-center text-sm text-slate-500">
                    Ro&apos;yxatdan o&apos;tish orqali siz{' '}
                    <Link href="/" className="font-medium text-sky-300 transition-colors hover:text-sky-200">
                      Foydalanish shartlari
                    </Link>{' '}
                    va{' '}
                    <Link href="/" className="font-medium text-sky-300 transition-colors hover:text-sky-200">
                      Maxfiylik siyosati
                    </Link>
                    ga rozilik bildirasiz
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <p className="relative z-10 mb-2 flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <ShieldCheck size={14} />
        Ma&apos;lumotlaringiz himoyalangan
      </p>

      <footer className="relative z-10 border-t border-white/10 py-5 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Diamond Academy. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
