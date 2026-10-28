"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/features/api/auth";
import { Test } from "@/features/types/test";
import { Level } from "@/features/types/level";
import AdminLayout from "@/components/AdminLayout";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Check,
  CheckCircle,
  XCircle,
  RefreshCw,
  BookOpen,
  Layers,
  ListChecks,
} from "lucide-react";

/* ───────────── Konstantalar ───────────── */
const PAGE_SIZE = 10;
const LETTERS = ["A", "B", "C", "D"] as const;
type OptionLetter = (typeof LETTERS)[number];
type Option = { letter: OptionLetter; text: string };
type ToastState = { type: "success" | "error"; text: string } | null;

type FormState = {
  levelId: string;
  question: string;
  A: string;
  B: string;
  C: string;
  D: string;
  correct: OptionLetter;
};
const emptyForm: FormState = {
  levelId: "",
  question: "",
  A: "",
  B: "",
  C: "",
  D: "",
  correct: "A",
};

const levelNames: Record<string, string> = {
  BEGINNER: "Boshlang'ich",
  ELEMENTARY: "Elementar",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Yuqori",
};
const levelLabel = (type?: string) =>
  type ? (levelNames[type] ?? type) : "Noma'lum daraja";

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Token topilmadi, qayta kiring");
  return { Authorization: `Bearer ${token}` };
};

const optionsOf = (t: Test): Option[] => {
  const all: Option[] = [
    { letter: "A", text: t.optionA },
    { letter: "B", text: t.optionB },
    { letter: "C", text: t.optionC },
    { letter: "D", text: t.optionD ?? "" },
  ];
  return all.filter((o) => o.text);
};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] disabled:opacity-60";
const ghostBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50";

/* ───────────── Sahifa ───────────── */
export default function AdminTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const filterKey = `${levelFilter}|${searchTerm}`;
  const [pageState, setPageState] = useState({ key: "", limit: PAGE_SIZE });
  const limit = pageState.key === filterKey ? pageState.limit : PAGE_SIZE;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Test | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  /* ── Yuklash ── */
  const loadData = useCallback(async () => {
    try {
      const headers = authHeaders();
      const [testsRes, levelsRes] = await Promise.all([
        api.get<Test[]>("/test", { headers }),
        api.get<Level[]>("/level", { headers }),
      ]);
      setTests(testsRes.data);
      setLevels(levelsRes.data);
      setLoadError("");
    } catch (err) {
      console.error(err);
      setLoadError(getErrorMessage(err, "Ma'lumotlarni yuklab bo'lmadi"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  /* ── Toast ── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Modal: scroll qulfi + Esc ── */
  const closeForm = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setFormError("");
  }, []);

  const anyModal = modalOpen || !!deleteTarget;
  useEffect(() => {
    if (!anyModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (deleteTarget) {
        if (!isDeleting) setDeleteTarget(null);
      } else if (!isSaving) {
        closeForm();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [anyModal, deleteTarget, isDeleting, isSaving, closeForm]);

  /* ── Forma amallari ── */
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, levelId: levelFilter });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (t: Test) => {
    setEditingId(t.id);
    setForm({
      levelId: t.levelId,
      question: t.question,
      A: t.optionA,
      B: t.optionB,
      C: t.optionC,
      D: t.optionD ?? "",
      correct: t.correct as OptionLetter,
    });
    setFormError("");
    setModalOpen(true);
  };

  const validate = (): string | null => {
    if (!form.levelId) return "Darajani tanlang";
    if (!form.question.trim()) return "Savol matnini kiriting";
    if (!form.A.trim() || !form.B.trim() || !form.C.trim())
      return "A, B va C variantlarini to'ldiring";
    if (form.correct === "D" && !form.D.trim())
      return "D variant bo'sh. Boshqa to'g'ri javobni tanlang yoki D ni to'ldiring";
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) return setFormError(error);

    const payload = {
      question: form.question.trim(),
      optionA: form.A.trim(),
      optionB: form.B.trim(),
      optionC: form.C.trim(),
      optionD: form.D.trim() || null,
      levelId: form.levelId,
      correct: form.correct,
    };

    setIsSaving(true);
    setFormError("");
    try {
      if (editingId) {
        const { data } = await api.patch<Test>(`/test/${editingId}`, payload, {
          headers: authHeaders(),
        });
        setTests((prev) => prev.map((t) => (t.id === editingId ? data : t)));
        setToast({ type: "success", text: "Savol yangilandi" });
      } else {
        const { data } = await api.post<Test>("/test", payload, {
          headers: authHeaders(),
        });
        setTests((prev) => [data, ...prev]);
        setToast({ type: "success", text: "Savol qo'shildi" });
      }
      closeForm();
    } catch (err) {
      console.error(err);
      setFormError(getErrorMessage(err, "Saqlashda xatolik"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/test/${deleteTarget.id}`, { headers: authHeaders() });
      setTests((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setToast({ type: "success", text: "Savol o'chirildi" });
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        text: getErrorMessage(err, "O'chirishda xatolik"),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /* ── Hisob-kitoblar ── */
  const levelById = useMemo(
    () => new Map(levels.map((l) => [l.id, l])),
    [levels],
  );
  const countByLevel = useMemo(() => {
    const m = new Map<string, number>();
    tests.forEach((t) => m.set(t.levelId, (m.get(t.levelId) ?? 0) + 1));
    return m;
  }, [tests]);

  const q = searchTerm.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      tests.filter((t) => {
        if (levelFilter && t.levelId !== levelFilter) return false;
        if (!q) return true;
        return [
          t.question,
          t.optionA,
          t.optionB,
          t.optionC,
          t.optionD ?? "",
        ].some((s) => s.toLowerCase().includes(q));
      }),
    [tests, levelFilter, q],
  );
  const visible = filtered.slice(0, limit);
  const withOptionD = tests.filter((t) => t.optionD).length;

  const stats = [
    {
      label: "Jami savollar",
      value: tests.length,
      icon: BookOpen,
      tone: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Darajalar",
      value: levels.length,
      icon: Layers,
      tone: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "D variantli",
      value: withOptionD,
      icon: ListChecks,
      tone: "bg-violet-100 text-violet-600",
    },
  ];

  const pills = [
    { id: "", label: "Barchasi", count: tests.length },
    ...levels.map((l) => ({
      id: l.id,
      label: levelLabel(l.type),
      count: countByLevel.get(l.id) ?? 0,
    })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
      <AdminLayout />

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        {/* Sarlavha */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Test savollari
            </h1>
            <p className="mt-1 text-slate-500">
              Savollarni daraja bo&apos;yicha yarating, tahrirlang va boshqaring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className={ghostBtn}
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Yangilash
            </button>
            <button onClick={openCreate} className={primaryBtn}>
              <Plus size={18} />
              Yangi savol
            </button>
          </div>
        </div>

        {/* Statistika */}
        <section className="mb-6 grid grid-cols-3 divide-x divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.tone}`}
              >
                <s.icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {loading ? "–" : s.value}
                </p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Qidiruv va daraja filtri */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Savol yoki variant bo'yicha qidirish..."
              className={`${inputCls} pl-10 pr-9`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                aria-label="Tozalash"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {pills.map((p) => (
              <button
                key={p.id || "all"}
                onClick={() => setLevelFilter(p.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                  levelFilter === p.id
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p.label}
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    levelFilter === p.id
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {p.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Ro'yxat */}
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200/70 bg-white p-5"
              >
                <div className="mb-3 h-5 w-24 rounded-full bg-slate-200" />
                <div className="mb-4 h-5 w-3/4 rounded bg-slate-200" />
                <div className="grid gap-2 sm:grid-cols-2">
                  {[0, 1, 2, 3].map((j) => (
                    <div key={j} className="h-11 rounded-xl bg-slate-100" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <XCircle className="text-red-500" size={28} />
            </div>
            <p className="mb-1 text-lg font-semibold text-slate-800">
              Yuklab bo&apos;lmadi
            </p>
            <p className="mb-5 text-sm text-red-600">{loadError}</p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={primaryBtn}
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Qayta urinish
            </button>
          </div>
        ) : tests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
              <BookOpen className="text-indigo-400" size={32} />
            </div>
            <p className="mb-1 text-lg font-semibold text-slate-700">
              Hali savollar yo&apos;q
            </p>
            <p className="mb-6 text-sm text-slate-500">
              Birinchi test savolini qo&apos;shing
            </p>
            <button onClick={openCreate} className={primaryBtn}>
              <Plus size={18} />
              Yangi savol
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
            <Search className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="font-medium text-slate-600">Hech narsa topilmadi</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setLevelFilter("");
              }}
              className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
            >
              Filtrlarni tozalash
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {visible.map((test) => {
                const level = levelById.get(test.levelId);
                return (
                  <article
                    key={test.id}
                    className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="mb-2 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          {levelLabel(level?.type)}
                        </span>
                        <h3 className="whitespace-pre-line break-words text-base font-semibold leading-snug text-slate-900">
                          {test.question}
                        </h3>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => openEdit(test)}
                          aria-label="Tahrirlash"
                          title="Tahrirlash"
                          className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(test)}
                          aria-label="O'chirish"
                          title="O'chirish"
                          className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {optionsOf(test).map((o) => {
                        const isCorrect = o.letter === test.correct;
                        return (
                          <li
                            key={o.letter}
                            className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                              isCorrect
                                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                                : "border-slate-200 text-slate-600"
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                                isCorrect
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {o.letter}
                            </span>
                            <span className="min-w-0 flex-1 break-words pt-0.5">
                              {o.text}
                            </span>
                            {isCorrect && (
                              <Check
                                size={16}
                                aria-label="To'g'ri javob"
                                className="mt-1 shrink-0 text-emerald-600"
                              />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">
                  {visible.length}
                </span>{" "}
                / {filtered.length} ta savol ko&apos;rsatilmoqda
              </p>
              {visible.length < filtered.length && (
                <button
                  onClick={() =>
                    setPageState({ key: filterKey, limit: limit + PAGE_SIZE })
                  }
                  className={ghostBtn}
                >
                  Yana {Math.min(PAGE_SIZE, filtered.length - visible.length)}{" "}
                  ta ko&apos;rsatish
                </button>
              )}
            </div>
          </>
        )}
      </main>

      {/* ───────────── Qo'shish / tahrirlash modali ───────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSaving) closeForm();
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="test-form-title"
            onSubmit={handleSave}
            className="my-8 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2
                id="test-form-title"
                className="text-lg font-bold text-slate-900"
              >
                {editingId ? "Savolni tahrirlash" : "Yangi savol qo'shish"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                aria-label="Yopish"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div>
                <label
                  htmlFor="level"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Daraja *
                </label>
                <select
                  id="level"
                  value={form.levelId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, levelId: e.target.value }))
                  }
                  className={inputCls}
                >
                  <option value="">Darajani tanlang</option>
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {levelLabel(l.type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="question"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Savol *
                </label>
                <textarea
                  id="question"
                  rows={3}
                  autoFocus
                  value={form.question}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, question: e.target.value }))
                  }
                  placeholder="Savol matnini kiriting"
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    Javob variantlari *
                  </span>
                  <span className="text-xs text-slate-400">
                    To&apos;g&apos;ri javobni harf tugmasi bilan belgilang
                  </span>
                </div>
                <div
                  role="radiogroup"
                  aria-label="To'g'ri javob"
                  className="space-y-2.5"
                >
                  {LETTERS.map((letter) => {
                    const selected = form.correct === letter;
                    return (
                      <div key={letter} className="flex items-center gap-3">
                        <button
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={`${letter} to'g'ri javob`}
                          onClick={() =>
                            setForm((f) => ({ ...f, correct: letter }))
                          }
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            selected
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {letter}
                        </button>
                        <input
                          type="text"
                          value={form[letter]}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, [letter]: e.target.value }))
                          }
                          placeholder={
                            letter === "D"
                              ? "D variant (ixtiyoriy)"
                              : `${letter} variant`
                          }
                          className={`${inputCls} ${selected ? "!border-emerald-300 !bg-emerald-50/50" : ""}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3"
                >
                  <XCircle className="mt-0.5 shrink-0 text-red-500" size={18} />
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                className={`${ghostBtn} flex-1`}
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`${primaryBtn} flex-1`}
              >
                {isSaving && <RefreshCw size={16} className="animate-spin" />}
                {isSaving
                  ? "Saqlanmoqda..."
                  : editingId
                    ? "Yangilash"
                    : "Qo'shish"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ───────────── O'chirishni tasdiqlash ───────────── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isDeleting)
              setDeleteTarget(null);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="text-red-600" size={26} />
            </div>
            <h3 className="mb-1 text-lg font-bold text-slate-900">
              Savolni o&apos;chirasizmi?
            </h3>
            <p className="mb-6 text-sm text-slate-500">
              <span className="line-clamp-3 font-medium text-slate-700">
                {deleteTarget.question}
              </span>
              Bu amalni qaytarib bo&apos;lmaydi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className={`${ghostBtn} flex-1`}
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting && <RefreshCw size={16} className="animate-spin" />}
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────── Toast ───────────── */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-[120] flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
            toast.type === "success" ? "bg-slate-900" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={18} className="shrink-0 text-emerald-400" />
          ) : (
            <XCircle size={18} className="shrink-0" />
          )}
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            aria-label="Yopish"
            className="ml-1 text-white/60 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
