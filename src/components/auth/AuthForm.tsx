'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import PhoneInput, { isValidPhone } from './PhoneInput';
import { handleApiError } from '../../features/api/api';
import { useMe, useRegister } from '../../features/hooks/useAuth';
import { resolveRedirect } from '../../lib/auth-redirect';

interface FormValues {
  name: string;
  phone: string;
  password: string;
}

const inputBase =
  'w-full rounded-xl border bg-white py-3 pl-10 text-[15px] text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:ring-4';
const inputOk =
  'border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/10';
const inputErr = 'border-red-300 focus:border-red-400 focus:ring-red-500/10';

export default function AuthForm() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  // Allaqachon kirgan bo'lsa, formani ko'rsatmasdan yo'naltiramiz
  const { data: me } = useMe();
  useEffect(() => {
    if (me) router.replace(resolveRedirect(me.role, undefined, next));
  }, [me, next, router]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: '', phone: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const res = await registerMutation.mutateAsync({
        name: values.name.trim() || undefined, // faqat yangi foydalanuvchi uchun kerak
        phone: values.phone,
        password: values.password,
      });
      toast.success(`Xush kelibsiz, ${res.user.name}!`);
      router.replace(resolveRedirect(res.user.role ?? res.role, res.redirect, next));
    } catch (e) {
      setServerError(handleApiError(e));
    }
  });

  const pending = registerMutation.isPending;

  return (
    <div className="da-fade-up w-full max-w-md">
      <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-xl shadow-indigo-900/5 ring-1 ring-black/[0.02] sm:p-9">
        <div className="mb-7">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Xush kelibsiz</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
            Telefon raqam va parolingizni kiriting. Raqam avval ro‘yxatdan o‘tgan bo‘lsa, hisobingizga
            kirasiz. Yangi bo‘lsangiz, ismingizni ham yozing.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {/* Ism */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
              Ism va familiya{' '}
              <span className="font-normal text-gray-400">(faqat yangi foydalanuvchilar uchun)</span>
            </label>
            <div className="group relative">
              <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Masalan: Aziz Karimov"
                aria-invalid={!!errors.name}
                {...register('name', {
                  validate: (v) => !v.trim() || v.trim().length >= 2 || 'Kamida 2 ta belgi kiriting',
                  maxLength: { value: 100, message: 'Juda uzun' },
                })}
                className={`${inputBase} pr-4 ${errors.name ? inputErr : inputOk}`}
              />
            </div>
            {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          {/* Telefon */}
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
              Telefon raqam
            </label>
            <Controller
              name="phone"
              control={control}
              rules={{
                required: 'Telefon raqamni kiriting',
                validate: (v) => isValidPhone(v) || 'Raqam to‘liq emas (9 ta raqam)',
              }}
              render={({ field }) => (
                <PhoneInput
                  id="phone"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={!!errors.phone}
                />
              )}
            />
            {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          {/* Parol */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
              Parol
            </label>
            <div className="group relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Kamida 8 ta belgi"
                aria-invalid={!!errors.password}
                {...register('password', {
                  required: 'Parolni kiriting',
                  minLength: { value: 8, message: 'Kamida 8 ta belgi kiriting' },
                  maxLength: { value: 72, message: 'Juda uzun (ko‘pi bilan 72 ta belgi)' },
                })}
                className={`${inputBase} pr-11 ${errors.password ? inputErr : inputOk}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700 ring-1 ring-red-100"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className={`group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5
              text-[15px] font-semibold text-white shadow-lg shadow-blue-500/30 transition-all
              hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]
              focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/40
              disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none ${pending ? '' : 'da-shimmer'}`}
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Tekshirilmoqda...
              </>
            ) : (
              <>
                Davom etish
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-gray-400">
          Davom etish orqali foydalanish shartlariga rozilik bildirasiz.
        </p>
      </div>
    </div>
  );
}
