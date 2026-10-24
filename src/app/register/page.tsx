'use client'
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { register as registerUser } from '@/features/api/auth';
import { RegisterDto } from '@/features/types/auth';
import { useActiveAdvertisement } from '@/features/hooks/useAdvertisement';
import Footer from '@/components/Footer';
import { User, Phone, Loader2, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

/* ───────────── Yordamchilar ───────────── */
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
    response?: { data?: { message?: string | string[] } };
  };
  const msg = e?.response?.data?.message;
  const text = Array.isArray(msg) ? msg.join(', ') : msg;
  return text || (err instanceof Error && !e.response && e.message ? e.message : fallback);
};

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
    } catch (err: unknown) {
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
    'w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4';
  const inputState = (hasError: boolean) =>
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10'
      : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/10';

  const showLeft = adLoading || !!activeAd;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50">
      {/* Fon bezaklari */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-300/40 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-1/4 h-56 w-56 rounded-full bg-sky-200/50 blur-3xl" />

      <style>{`
        @keyframes reg-pop { 0%{transform:scale(.6);opacity:0} 70%{transform:scale(1.08);opacity:1} 100%{transform:scale(1)} }
        @keyframes reg-fill { from{width:0%} to{width:100%} }
        .reg-pop{animation:reg-pop .5s ease-out both}
        .reg-fill{animation:reg-fill 2s linear forwards}
      `}</style>

      <main className="relative flex flex-1 items-center justify-center p-4 md:p-8">
        <div
          className={`flex w-full max-w-6xl flex-col items-center gap-8 md:gap-14 ${
            showLeft ? 'md:flex-row md:justify-between' : 'justify-center'
          }`}
        >
          {/* Chap tomon — reklama */}
          {showLeft && (
            <div className="hidden w-full max-w-md flex-1 md:flex md:flex-col">
              {adLoading ? (
                <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
                  <div className="animate-pulse space-y-4">
                    <div className="h-52 rounded-2xl bg-slate-200" />
                    <div className="h-6 w-3/4 rounded bg-slate-200" />
                    <div className="h-4 rounded bg-slate-100" />
                    <div className="h-4 w-5/6 rounded bg-slate-100" />
                  </div>
                </div>
              ) : (
                activeAd && (
                  <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl shadow-indigo-500/25">
                    {activeAd.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden bg-white/10">
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
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    )}
                    <div className="p-8">
                      <h2 className="mb-3 text-3xl font-bold leading-tight">{activeAd.title}</h2>
                      <p className="text-lg leading-relaxed text-indigo-100">
                        {activeAd.description}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* O'ng tomon — forma */}
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.25)] backdrop-blur-xl sm:p-8">
            <div className="mb-8 text-center">
              <div className="relative mx-auto mb-4 h-16 w-16">
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/30 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                  <User className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                Ro&apos;yxatdan o&apos;tish
              </h1>
              <p className="mt-2 text-slate-500">Diamond Academy&apos;da yangi hisob yarating</p>
            </div>

            {showSuccess ? (
              <div className="py-8 text-center">
                <div className="reg-pop relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
                  <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/30">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </span>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-800">
                  Muvaffaqiyatli ro&apos;yxatdan o&apos;tdingiz!
                </h2>
                <p className="mb-8 text-slate-500">Sizni tegishli sahifaga yo&apos;naltiramiz...</p>
                <div className="mx-auto h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
                  <div className="reg-fill h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500" />
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                  >
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  {/* Ism */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="name">
                      Ismingiz
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
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
                      <p id="name-error" className="mt-2 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Telefon */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="phone">
                      Telefon raqamingiz
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
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
                      <p id="phone-error" className="mt-2 text-sm text-red-600">
                        {errors.phone.message}
                      </p>
                    ) : (
                      <p id="phone-hint" className="mt-2 text-sm text-slate-400">
                        Raqam avtomatik formatlanadi: +998 90 123 45 67
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Ro&apos;yxatdan o&apos;tilmoqda...
                      </>
                    ) : (
                      "Ro'yxatdan o'tish"
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                  Ro&apos;yxatdan o&apos;tish orqali siz{' '}
                  <Link href="/terms" className="font-medium text-indigo-600 hover:text-indigo-700">
                    Foydalanish shartlari
                  </Link>{' '}
                  va{' '}
                  <Link href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-700">
                    Maxfiylik siyosati
                  </Link>
                  ga rozilik bildirasiz
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <p className="relative mb-2 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck size={14} />
        Ma&apos;lumotlaringiz himoyalangan
      </p>

      <div className="relative">
        <Footer />
      </div>
    </div>
  );
}