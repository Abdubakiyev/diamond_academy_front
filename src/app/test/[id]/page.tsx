"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/features/api/auth";
import { Level } from "@/features/types/level";
import { Test } from "@/features/types/test";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  BookOpen,
  XCircle,
  RefreshCw,
  Check,
} from "lucide-react";

/* ───────────── Konstantalar va yordamchilar ───────────── */
const TEST_DURATION_SECONDS = 1800; // 30 daqiqa

interface AnswerMap {
  [testId: string]: string;
}
type SavedSession = { deadline: number; answers: AnswerMap };

const levelNames: Record<string, string> = {
  BEGINNER: "Boshlang'ich",
  ELEMENTARY: "Elementar",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Yuqori",
};
const levelLabel = (type?: string) => (type ? (levelNames[type] ?? type) : "");

// Sahifa yangilansa ham vaqt va javoblar saqlanib qoladi
const sessionKey = (levelId: string) => `test-session:${levelId}`;
const readSession = (levelId: string): SavedSession | null => {
  try {
    const raw = sessionStorage.getItem(sessionKey(levelId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedSession;
    return typeof parsed?.deadline === "number" && parsed.answers ? parsed : null;
  } catch {
    return null;
  }
};
const writeSession = (levelId: string, data: SavedSession) => {
  try {
    sessionStorage.setItem(sessionKey(levelId), JSON.stringify(data));
  } catch {
    /* ignore */
  }
};
const clearSession = (levelId: string) => {
  try {
    sessionStorage.removeItem(sessionKey(levelId));
  } catch {
    /* ignore */
  }
};

const getErrorMessage = (err: unknown, fallback: string) => {
  const e = err as {
    message?: string;
    response?: { status?: number; data?: { message?: string | string[] } };
  };
  const msg = e?.response?.data?.message;
  const text = Array.isArray(msg) ? msg.join(", ") : msg;
  if (text) return text;
  if (e?.response?.status === 404) return "Soralgan level mavjud emas yoki o'chirilgan";
  return e?.message || fallback;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const pageBg = "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white";

/* ───────────── Sahifa ───────────── */
export default function TestPage() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.id as string;

  const [level, setLevel] = useState<Level | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Vaqt: tugash payti (ms) va hozirgi vaqt (har soniyada yangilanadi)
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const sentRef = useRef(false); // ikki marta yuborilmasligi uchun
  const submitRef = useRef<((auto?: boolean) => Promise<void>) | null>(null);

  /* 🔐 Token tekshiruvi */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.replace("/register");
  }, [router]);

  /* 📡 Level + savollarni yuklash (setState faqat promise callback'larida) */
  useEffect(() => {
    if (!levelId) return;
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Tizimga kirmagansiz");
        return api.get<Level>(`/level/${levelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => {
        if (cancelled) return;
        const list = res.data.tests || [];
        setLevel(res.data);
        setTests(list);
        setLoadError("");

        const t = Date.now();
        setNow(t);
        if (list.length === 0) return;

        const saved = readSession(levelId);
        if (saved) {
          // faqat hozir mavjud savollarga tegishli javoblarni tiklaymiz
          const ids = new Set(list.map((q) => q.id));
          const restored = Object.fromEntries(
            Object.entries(saved.answers).filter(([id]) => ids.has(id)),
          );
          setAnswers(restored);
          setDeadline(saved.deadline);
        } else {
          const d = t + TEST_DURATION_SECONDS * 1000;
          setDeadline(d);
          writeSession(levelId, { deadline: d, answers: {} });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setLoadError(getErrorMessage(err, "Level topilmadi"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [levelId, reloadKey]);

  const retryLoad = () => {
    setLoading(true);
    setLoadError("");
    setReloadKey((k) => k + 1);
  };

  /* ✅ Yuborish */
  const submit = async (auto = false) => {
    if (sentRef.current) return;
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      setSubmitError("Token yoki User ID topilmadi. Iltimos, qayta kiring.");
      return;
    }

    sentRef.current = true;
    setSubmitting(true);
    setSubmitError("");
    setConfirmOpen(false);

    try {
      const payload = {
        userId,
        levelId,
        answers: Object.entries(answers).map(([testId, answer]) => ({ testId, answer })),
      };
      const res = await api.post<{ id: string }>("/test-result", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      clearSession(levelId);
      router.push(`/result?resultId=${res.data.id}`);
    } catch (err: unknown) {
      console.error(err);
      sentRef.current = false;
      setSubmitting(false);
      setSubmitError(
        getErrorMessage(
          err,
          auto
            ? "Vaqt tugadi, lekin testni yuborib bo'lmadi. Qayta urinib ko'ring."
            : "Testni yuborishda xatolik yuz berdi",
        ),
      );
    }
  };

  // Taymer har doim eng so'nggi javoblar bilan ishlashi uchun
  useEffect(() => {
    submitRef.current = submit;
  });

  /* ⏳ Taymer: tugash payti bo'yicha hisoblanadi (fon rejimida ham aniq) */
  useEffect(() => {
    if (deadline === null || tests.length === 0) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= deadline) {
        clearInterval(id);
        submitRef.current?.(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, tests.length]);

  /* ⌨️ Klaviatura: ← → savollar, A–D yoki 1–4 javob */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmOpen(false);
        setLeaveOpen(false);
        return;
      }
      if (confirmOpen || leaveOpen || submitting || tests.length === 0) return;
      const q = tests[currentQuestion];
      if (e.key === "ArrowRight") setCurrentQuestion((p) => Math.min(tests.length - 1, p + 1));
      else if (e.key === "ArrowLeft") setCurrentQuestion((p) => Math.max(0, p - 1));
      else if (q) {
        const map: Record<string, string> = { a: "A", b: "B", c: "C", d: "D", "1": "A", "2": "B", "3": "C", "4": "D" };
        const key = map[e.key.toLowerCase()];
        if (!key || (key === "D" && !q.optionD)) return;
        const next = { ...answers, [q.id]: key };
        setAnswers(next);
        if (deadline !== null) writeSession(levelId, { deadline, answers: next });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen, leaveOpen, submitting, tests, currentQuestion, answers, deadline, levelId]);

  const handleAnswerChange = (testId: string, value: string) => {
    const next = { ...answers, [testId]: value };
    setAnswers(next);
    if (deadline !== null) writeSession(levelId, { deadline, answers: next });
  };

  /* ── Hisob-kitoblar ── */
  const timeLeft =
    deadline === null
      ? TEST_DURATION_SECONDS
      : Math.max(0, Math.ceil((deadline - now) / 1000));
  const answeredCount = tests.filter((t) => answers[t.id]).length;
  const unanswered = tests.length - answeredCount;
  const progressPercentage = tests.length > 0 ? (answeredCount / tests.length) * 100 : 0;
  const timeTone =
    timeLeft <= 60
      ? "bg-red-500/90 animate-pulse"
      : timeLeft <= 300
        ? "bg-amber-500/90"
        : "bg-white/20";

  /* ───────────── Yuklanmoqda ───────────── */
  if (loading) {
    return (
      <div className={pageBg}>
        <Header />
        <main className="mx-auto max-w-6xl animate-pulse space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="h-36 rounded-3xl bg-slate-200" />
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="h-96 rounded-2xl bg-slate-200 lg:col-span-3" />
            <div className="h-72 rounded-2xl bg-slate-200" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ───────────── Level topilmadi / xatolik ───────────── */
  if (!level) {
    return (
      <div className={pageBg}>
        <Header />
        <main className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-red-100">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">Level topilmadi</h2>
          <p className="mb-6 max-w-sm text-slate-500">
            {loadError || "Soralgan level mavjud emas yoki o'chirilgan"}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {loadError && (
              <button
                onClick={retryLoad}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Qayta urinish
              </button>
            )}
            <button
              onClick={() => router.push("/")}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-medium text-white shadow-md shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ───────────── Savollar yo'q ───────────── */
  if (tests.length === 0) {
    return (
      <div className={pageBg}>
        <Header />
        <main className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
            <BookOpen className="h-10 w-10 text-indigo-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">Savollar hali qo&apos;shilmagan</h2>
          <p className="mb-6 max-w-sm text-slate-500">
            {levelLabel(level.type)} darajasi uchun hozircha test savollari yo&apos;q.
          </p>
          <button
            onClick={() => router.push("/")}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-medium text-white shadow-md shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700"
          >
            Bosh sahifaga qaytish
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const q = tests[currentQuestion];
  const options = [
    { key: "A", text: q.optionA },
    { key: "B", text: q.optionB },
    { key: "C", text: q.optionC },
    ...(q.optionD ? [{ key: "D", text: q.optionD }] : []),
  ];
  const isLast = currentQuestion === tests.length - 1;

  return (
    <div className={pageBg}>
      <Header />

      <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        {/* Sarlavha: daraja, vaqt, progress */}
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-500/20">
          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
            <div className="text-center md:text-left">
              <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm text-indigo-200">Test</span>
              </div>
              <h1 className="text-2xl font-bold md:text-3xl">
                {levelLabel(level.type)} darajasi testi
              </h1>
              <p className="mt-1 text-indigo-100">{tests.length} ta savol</p>
            </div>

            <div className="flex gap-3">
              <div className={`min-w-[120px] rounded-2xl p-4 text-center backdrop-blur-sm transition-colors ${timeTone}`}>
                <div className="mb-1 flex items-center justify-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  Qolgan vaqt
                </div>
                <div className="font-mono text-2xl font-bold tabular-nums">{formatTime(timeLeft)}</div>
              </div>
              <div className="min-w-[120px] rounded-2xl bg-white/20 p-4 text-center backdrop-blur-sm">
                <div className="mb-1 flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Javob berilgan
                </div>
                <div className="text-2xl font-bold tabular-nums">
                  {answeredCount}/{tests.length}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs text-indigo-200">
              <span>Test jarayoni</span>
              <span className="font-semibold text-white">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-green-400 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {submitError && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm font-medium text-red-700">{submitError}</p>
            </div>
            <button
              onClick={() => submit()}
              className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Qayta yuborish
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Savol */}
          <div className="space-y-6 lg:col-span-3">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
              <span className="mb-4 inline-block rounded-full bg-indigo-50 px-4 py-1 text-sm font-semibold text-indigo-700">
                Savol {currentQuestion + 1} / {tests.length}
              </span>
              <h2 className="mb-6 text-xl font-bold leading-relaxed text-slate-800 md:text-2xl">
                {q.question}
              </h2>

              <div role="radiogroup" aria-label="Javob variantlari" className="space-y-3">
                {options.map((option) => {
                  const selected = answers[q.id] === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => handleAnswerChange(q.id, option.key)}
                      className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                        selected
                          ? "border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500/10"
                          : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold transition ${
                          selected
                            ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {selected ? <Check className="h-5 w-5" /> : option.key}
                      </span>
                      <span className="font-medium text-slate-800">{option.text}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
                <button
                  onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="hidden sm:inline">Oldingisi</span>
                </button>

                <span className="hidden text-sm sm:block">
                  {answers[q.id] ? (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="h-4 w-4" />
                      Javob belgilangan
                    </span>
                  ) : (
                    <span className="text-amber-600">Javob belgilanmagan</span>
                  )}
                </span>

                {!isLast ? (
                  <button
                    onClick={() => setCurrentQuestion((p) => Math.min(tests.length - 1, p + 1))}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-medium text-white shadow-md shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700"
                  >
                    <span className="hidden sm:inline">Keyingisi</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmOpen(true)}
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-green-700 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                    Testni yakunlash
                  </button>
                )}
              </div>
            </div>

            {/* Qoidalar */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
              <h3 className="mb-4 flex items-center font-bold text-slate-800">
                <AlertCircle className="mr-2 h-5 w-5 text-emerald-600" />
                Test qoidalari
              </h3>
              <ul className="space-y-3 text-slate-700">
                {[
                  "Har bir savol uchun faqat bitta to'g'ri javobni belgilang",
                  "Vaqt tugagach, test avtomatik ravishda yuboriladi",
                  "Sahifani yangilasangiz ham vaqt va javoblaringiz saqlanadi",
                  "Klaviatura: ← → savollar orasida, A–D (yoki 1–4) javob belgilash uchun",
                ].map((rule, i) => (
                  <li key={rule} className="flex items-start">
                    <span className="mr-3 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      {i + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Savollar ro'yxati */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm lg:sticky lg:top-6">
              <h3 className="mb-4 font-bold text-slate-800">Savollar ro&apos;yxati</h3>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-4">
                {tests.map((test, index) => {
                  const isCurrent = currentQuestion === index;
                  const isAnswered = !!answers[test.id];
                  return (
                    <button
                      key={test.id}
                      onClick={() => setCurrentQuestion(index)}
                      aria-label={`${index + 1}-savol${isAnswered ? ", javob berilgan" : ""}`}
                      aria-current={isCurrent}
                      className={`flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                        isCurrent
                          ? "scale-110 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30"
                          : isAnswered
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-2.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded bg-gradient-to-br from-indigo-600 to-violet-600" />
                  Joriy savol
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded bg-emerald-200" />
                  Javob berilgan
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded bg-slate-200" />
                  Javob berilmagan
                </div>
              </div>

              <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 font-medium text-white shadow-md shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-green-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Yuborilmoqda...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Testni yuborish
                    </>
                  )}
                </button>
                <button
                  onClick={() => setLeaveOpen(true)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Yuborishni tasdiqlash */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirmOpen(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
          >
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                unanswered > 0 ? "bg-amber-100" : "bg-emerald-100"
              }`}
            >
              {unanswered > 0 ? (
                <AlertCircle className="h-7 w-7 text-amber-600" />
              ) : (
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              )}
            </div>
            <h3 className="mb-1 text-lg font-bold text-slate-800">Testni yakunlaysizmi?</h3>
            <p className="mb-6 text-sm text-slate-500">
              {answeredCount} ta savolga javob berdingiz.
              {unanswered > 0 ? (
                <>
                  {" "}
                  <span className="font-semibold text-amber-600">{unanswered} ta savol javobsiz</span>{" "}
                  qoldi, ular noto&apos;g&apos;ri hisoblanadi.
                </>
              ) : (
                " Hamma savolga javob berilgan."
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Qaytish
              </button>
              <button
                onClick={() => submit()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 font-medium text-white shadow-md transition hover:from-emerald-600 hover:to-green-700"
              >
                <Send className="h-4 w-4" />
                Yuborish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testdan chiqishni tasdiqlash */}
      {leaveOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setLeaveOpen(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="mb-1 text-lg font-bold text-slate-800">Testni bekor qilasizmi?</h3>
            <p className="mb-6 text-sm text-slate-500">
              Belgilagan javoblaringiz yo&apos;qoladi va test yuborilmaydi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLeaveOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Testni davom ettirish
              </button>
              <button
                onClick={() => {
                  clearSession(levelId);
                  router.push("/");
                }}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700"
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}