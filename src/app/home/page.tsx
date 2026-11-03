"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLevels } from "@/features/hooks/useLevel";
import { GraduationCap, ArrowRight, AlertCircle, RefreshCw, BookOpen } from "lucide-react";

/* ───────────── Token: serverda noma'lum (null), brauzerda true/false ───────────── */
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
function useHasToken(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => !!localStorage.getItem("access_token"),
    () => null,
  );
}

/* ───────────── Darajalar uchun nom va ranglar ───────────── */
const ORDER = ["BEGINNER", "ELEMENTARY", "INTERMEDIATE", "ADVANCED"];

const levelNames: Record<string, string> = {
  BEGINNER: "Boshlang'ich",
  ELEMENTARY: "Elementar",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Yuqori",
};

type LevelStyle = { icon: string; bar: string; chip: string };
const levelStyles: Record<string, LevelStyle> = {
  BEGINNER: {
    icon: "from-emerald-400 to-green-600",
    bar: "from-emerald-400 to-green-500",
    chip: "bg-emerald-50 text-emerald-700",
  },
  ELEMENTARY: {
    icon: "from-sky-400 to-blue-600",
    bar: "from-sky-400 to-blue-500",
    chip: "bg-sky-50 text-sky-700",
  },
  INTERMEDIATE: {
    icon: "from-violet-500 to-purple-600",
    bar: "from-violet-400 to-purple-500",
    chip: "bg-violet-50 text-violet-700",
  },
  ADVANCED: {
    icon: "from-amber-400 to-orange-600",
    bar: "from-amber-400 to-orange-500",
    chip: "bg-amber-50 text-amber-700",
  },
};
const defaultStyle: LevelStyle = {
  icon: "from-indigo-500 to-violet-600",
  bar: "from-indigo-500 to-violet-500",
  chip: "bg-indigo-50 text-indigo-700",
};

const rank = (type: string) => {
  const i = ORDER.indexOf(type);
  return i === -1 ? ORDER.length : i;
};

const steps = [
  { title: "Level tanlang", text: "O'zingizga mos darajani tanlang", box: "bg-indigo-100 text-indigo-600" },
  { title: "Testni boshlang", text: "Savollarni diqqat bilan o'qing", box: "bg-emerald-100 text-emerald-600" },
  { title: "Natijani ko'ring", text: "O'z natijangizni tahlil qiling", box: "bg-violet-100 text-violet-600" },
];

/* ───────────── Sahifa ───────────── */
export default function Home() {
  const router = useRouter();
  const hasToken = useHasToken();
  const { data, isLoading, error, refetch, isFetching } = useLevels();

  const levels = useMemo(
    () => [...(data ?? [])].sort((a, b) => rank(a.type) - rank(b.type)),
    [data],
  );

  // Token bo'lmasa — ro'yxatdan o'tishga (replace: orqaga qaytganda sikl bo'lmasin)
  useEffect(() => {
    if (hasToken === false) router.replace("/register");
  }, [hasToken, router]);

  // Token tekshirilguncha (yoki yo'naltirilayotganda) sahifa mazmuni ko'rsatilmaydi
  const checking = hasToken !== true;
  const showLoading = checking || isLoading;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl" />

      <Header />

      <main className="relative mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
        {/* Hero */}
        <div className="mb-12 mt-6 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl md:text-5xl">
            Bilimingizni{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Sinab Ko&apos;ring
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-500">
            O&apos;zingizga mos darajani tanlang va testni boshlang
          </p>
        </div>

        {/* Yuklanmoqda */}
        {showLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 h-14 w-14 rounded-2xl bg-slate-200" />
                <div className="mb-3 h-6 w-2/3 rounded bg-slate-200" />
                <div className="h-4 w-1/3 rounded bg-slate-100" />
                <div className="mt-8 h-10 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {/* Xatolik */}
        {!showLoading && error && (
          <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">Xatolik yuz berdi</h3>
            <p className="mb-6 text-sm text-red-600">{error.message}</p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-medium text-white shadow-md shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Qayta urinish
            </button>
          </div>
        )}

        {/* Levellar */}
        {!showLoading && !error && levels.length > 0 && (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">Levellar</h2>
                <p className="mt-1 text-slate-500">O&apos;zingizga mos darajani tanlang</p>
              </div>
              <div className="hidden rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 sm:block">
                {levels.length} ta level mavjud
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {levels.map((level, index) => {
                const style = levelStyles[level.type] ?? defaultStyle;
                return (
                  <Link
                    key={level.id}
                    href={`/test/${level.id}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30"
                  >
                    <div className="mb-5 flex items-start justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ${style.icon}`}
                      >
                        <GraduationCap className="h-7 w-7 text-white" />
                      </div>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                        {index + 1}
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-slate-800 transition-colors group-hover:text-indigo-600">
                      {levelNames[level.type] ?? level.type}
                    </h3>
                    <span
                      className={`mb-6 inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.chip}`}
                    >
                      {level.type}
                    </span>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
                      <span className="text-sm text-slate-500">Testni boshlash</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-all group-hover:bg-indigo-600 group-hover:text-white">
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    <div
                      className={`absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-300 group-hover:scale-x-100 ${style.bar}`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Rag'bat */}
            <div className="mt-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-700 p-8 text-center text-white shadow-xl shadow-indigo-500/20">
              <p className="text-lg font-medium">
                Har bir level sizning bilimingizni yangi bosqichga olib chiqadi
              </p>
            </div>

            {/* Qanday boshlash kerak */}
            <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-xl font-bold text-slate-800">Qanday boshlash kerak?</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {steps.map((s, i) => (
                  <div key={s.title} className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${s.box}`}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="mb-1 font-bold text-slate-800">{s.title}</h4>
                      <p className="text-sm text-slate-500">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Levellar yo'q */}
        {!showLoading && !error && levels.length === 0 && (
          <div className="mx-auto max-w-lg rounded-2xl border border-slate-200/70 bg-white p-10 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
              <BookOpen className="h-10 w-10 text-indigo-300" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-slate-800">Levellar topilmadi</h3>
            <p className="mb-6 text-slate-500">
              Hozircha hech qanday level mavjud emas. Iltimos, keyinroq yana urinib ko&apos;ring.
            </p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-medium text-white shadow-md shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Yangilash
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}