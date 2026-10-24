'use client'

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/features/api/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TestResult } from '@/features/types/test-result';
import {
  Trophy,
  CheckCircle,
  XCircle,
  Home,
  Calendar,
  User,
  Award,
  TrendingUp,
  Target,
  RefreshCw,
  ListChecks,
} from 'lucide-react';

/* ───────────── Yordamchilar ───────────── */
const levelNames: Record<string, string> = {
  BEGINNER: "Boshlang'ich",
  ELEMENTARY: 'Elementar',
  INTERMEDIATE: "O'rta",
  ADVANCED: 'Yuqori',
};
const levelLabel = (type?: string) => (type ? (levelNames[type] ?? type) : "Noma'lum");

const getErrorMessage = (err: unknown, fallback: string) => {
  const e = err as {
    message?: string;
    response?: { status?: number; data?: { message?: string | string[] } };
  };
  const msg = e?.response?.data?.message;
  const text = Array.isArray(msg) ? msg.join(', ') : msg;
  if (text) return text;
  if (e?.response?.status === 404) return 'Soralgan test natijasi mavjud emas';
  return e?.message || fallback;
};

type Grade = {
  key: string;
  label: string;
  message: string;
  gradient: string;
  min: number;
};

const GRADES: Grade[] = [
  { key: 'a', label: "A'lo", message: 'Ajoyib natija! Mukammal! 🎯', gradient: 'from-emerald-500 to-green-600', min: 90 },
  { key: 'b', label: 'Yaxshi', message: 'Yaxshi natija! Juda yaxshi! 👍', gradient: 'from-green-500 to-teal-600', min: 75 },
  { key: 'c', label: 'Qoniqarli', message: 'Qoniqarli natija! Yaxshilashingiz mumkin. 💪', gradient: 'from-amber-500 to-orange-600', min: 60 },
  { key: 'd', label: "O'rtacha", message: "Yaxshilash uchun imkoniyat bor. Qayta urinib ko'ring! 📚", gradient: 'from-rose-500 to-red-600', min: 0 },
];
const gradeOf = (p: number) => GRADES.find((g) => p >= g.min) ?? GRADES[GRADES.length - 1];

const tips = [
  { title: 'Muntazam mashq', text: 'Har kuni 20 daqiqa mashq qiling' },
  { title: 'Xatolarni tahlil', text: "Noto'g'ri javoblaringizni qayta ko'rib chiqing" },
  { title: 'Qayta urinish', text: "Bir hafta o'tgach testni qayta ishlang" },
];

const pageBg = 'min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white';

/* ───────────── Natija ko'rinishi ───────────── */
function ResultView({
  result,
  onHome,
  onRefresh,
  refreshing,
}: {
  result: TestResult;
  onHome: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  // Chiziqlar va doira yuklangandan keyin to'lib borishi uchun
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const total = result.correctCount + result.wrongCount;
  const correctPct = total > 0 ? (result.correctCount / total) * 100 : 0;
  const wrongPct = total > 0 ? (result.wrongCount / total) * 100 : 0;
  const percentage = Math.round(correctPct);
  const grade = gradeOf(percentage);

  const R = 70;
  const C = 2 * Math.PI * R;

  const details = [
    { icon: User, label: 'Foydalanuvchi', value: result.user?.name || "Noma'lum", box: 'bg-indigo-100 text-indigo-600' },
    { icon: Target, label: 'Daraja', value: levelLabel(result.level?.type), box: 'bg-emerald-100 text-emerald-600' },
    {
      icon: Calendar,
      label: 'Yakunlangan sana',
      value: result.createdAt
        ? new Date(result.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' })
        : "Noma'lum",
      box: 'bg-violet-100 text-violet-600',
    },
    { icon: ListChecks, label: 'Jami savollar', value: `${total} ta`, box: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className={pageBg}>
      <Header />

      <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        {/* Asosiy natija */}
        <div className={`mb-8 overflow-hidden rounded-3xl bg-gradient-to-r p-6 text-white shadow-xl md:p-10 ${grade.gradient}`}>
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
                <Trophy className="h-6 w-6" />
                <span className="text-white/90">Test natijasi</span>
              </div>
              <h1 className="mb-3 text-3xl font-bold leading-tight md:text-4xl">{grade.message}</h1>
              <p className="text-white/90">
                {result.user?.name || 'Foydalanuvchi'} · {levelLabel(result.level?.type)} darajasi
              </p>
            </div>

            <div className="relative h-44 w-44 shrink-0">
              <svg viewBox="0 0 176 176" className="h-full w-full -rotate-90">
                <circle cx="88" cy="88" r={R} fill="none" strokeWidth="12" className="stroke-white/25" />
                <circle
                  cx="88"
                  cy="88"
                  r={R}
                  fill="none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className="stroke-white transition-all duration-1000 ease-out"
                  strokeDasharray={C}
                  strokeDashoffset={shown ? C - (C * percentage) / 100 : C}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">{percentage}%</span>
                <span className="mt-1 text-sm text-white/90">Umumiy natija</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ko'rsatkichlar */}
        <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">To&apos;g&apos;ri javoblar</p>
                <p className="text-3xl font-bold text-slate-800">{result.correctCount}</p>
              </div>
            </div>
            <div className="mb-1 flex justify-between text-sm text-slate-500">
              <span>Foiz</span>
              <span>{Math.round(correctPct)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-1000"
                style={{ width: shown ? `${correctPct}%` : '0%' }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100">
                <XCircle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Noto&apos;g&apos;ri javoblar</p>
                <p className="text-3xl font-bold text-slate-800">{result.wrongCount}</p>
              </div>
            </div>
            <div className="mb-1 flex justify-between text-sm text-slate-500">
              <span>Foiz</span>
              <span>{Math.round(wrongPct)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 to-red-500 transition-all duration-1000"
                style={{ width: shown ? `${wrongPct}%` : '0%' }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Baho</p>
                <p className="text-3xl font-bold text-slate-800">{grade.label}</p>
              </div>
            </div>
            <div className="mb-1 flex justify-between text-sm text-slate-500">
              <span>Umumiy natija</span>
              <span>{percentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${grade.gradient}`}
                style={{ width: shown ? `${percentage}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Ma'lumotlar va tahlil */}
        <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center text-lg font-bold text-slate-800">
              <User className="mr-3 h-5 w-5 text-indigo-600" />
              Test ma&apos;lumotlari
            </h2>
            <div className="space-y-3">
              {details.map((d) => (
                <div key={d.label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${d.box}`}>
                    <d.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">{d.label}</p>
                    <p className="truncate font-semibold text-slate-800">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center text-lg font-bold text-slate-800">
              <TrendingUp className="mr-3 h-5 w-5 text-indigo-600" />
              Natija taqsimoti
            </h2>

            <div className="mb-2 flex h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-1000"
                style={{ width: shown ? `${correctPct}%` : '0%' }}
              />
              <div
                className="bg-gradient-to-r from-rose-400 to-red-500 transition-all duration-1000"
                style={{ width: shown ? `${wrongPct}%` : '0%' }}
              />
            </div>
            <div className="mb-6 flex justify-between text-sm">
              <span className="font-semibold text-emerald-600">{result.correctCount} ta to&apos;g&apos;ri</span>
              <span className="font-semibold text-rose-600">{result.wrongCount} ta noto&apos;g&apos;ri</span>
            </div>

            <p className="mb-3 text-sm font-medium text-slate-600">Baho shkalasi</p>
            <div className="space-y-2">
              {GRADES.map((g) => {
                const active = g.key === grade.key;
                return (
                  <div
                    key={g.key}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition ${
                      active
                        ? 'border-indigo-300 bg-indigo-50 ring-4 ring-indigo-500/10'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${g.gradient}`} />
                      <span className={active ? 'font-bold text-slate-800' : 'text-slate-600'}>
                        {g.label}
                      </span>
                    </span>
                    <span className="text-slate-400">
                      {g.min === 0 ? "60% dan past" : `${g.min}% dan yuqori`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Keyingi qadamlar */}
        <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-slate-800">Keyingi qadamlar</h3>
              <p className="text-sm text-slate-500">Natijangizni yaxshilash uchun davom eting</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                onClick={onHome}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-medium text-white shadow-md shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg active:scale-[0.98]"
              >
                <Home className="h-4 w-4" />
                Bosh sahifaga qaytish
              </button>
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Natijani yangilash
              </button>
            </div>
          </div>
        </div>

        {/* Maslahatlar */}
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
          <h3 className="mb-4 flex items-center font-bold text-slate-800">
            <TrendingUp className="mr-2 h-5 w-5 text-emerald-600" />
            Natijangizni yaxshilash uchun maslahatlar
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {tips.map((t, i) => (
              <div key={t.title} className="flex items-start">
                <div className="mr-3 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{t.title}</p>
                  <p className="text-sm text-slate-600">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ───────────── Yuklash va xatolik holatlari ───────────── */
function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get('resultId');

  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Tizimga kirmagan bo'lsa — ro'yxatdan o'tishga
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) router.push('/register');
  }, [router]);

  // Yuklash: setState faqat promise callback'larida
  useEffect(() => {
    if (!resultId) return;
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('Tizimga kirmagansiz');
        return api.get<TestResult>(`/test-result/${resultId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => {
        if (cancelled) return;
        setResult(res.data);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError(getErrorMessage(err, "Natijani yuklab bo'lmadi"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resultId, reloadKey]);

  const retry = () => {
    setLoading(true);
    setError('');
    setReloadKey((k) => k + 1);
  };

  // resultId bo'lmasa, yuklanish kutilmaydi
  const isLoading = loading && !!resultId;

  if (isLoading && !result) {
    return (
      <div className={pageBg}>
        <Header />
        <main className="mx-auto max-w-6xl animate-pulse space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="h-56 rounded-3xl bg-slate-200" />
          <div className="grid gap-5 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-72 rounded-2xl bg-slate-200" />
            <div className="h-72 rounded-2xl bg-slate-200" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!result) {
    return (
      <div className={pageBg}>
        <Header />
        <main className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">Natija topilmadi</h2>
          <p className="mb-6 max-w-sm text-slate-500">
            {error || 'Soralgan test natijasi mavjud emas'}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {error && resultId && (
              <button
                onClick={retry}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Qayta urinish
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-medium text-white shadow-md shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ResultView
      result={result}
      onHome={() => router.push('/')}
      onRefresh={retry}
      refreshing={isLoading}
    />
  );
}

// Asosiy export — useSearchParams uchun Suspense bilan o'ralgan
export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className={`${pageBg} flex items-center justify-center`}>
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="text-lg font-medium text-slate-600">Yuklanmoqda...</p>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}