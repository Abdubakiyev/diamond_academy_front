'use client';

import { useEffect, useState } from 'react';
import { useLevels } from '@/features/hooks/useLevel';
import { createLevel, updateLevel, deleteLevel } from '@/features/api/level';
import {
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  Check,
  X,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Level, LevelType } from '@/features/types';
import AdminHeader from '@/components/AdminLayout';

/* ───────────── Konstantalar ───────────── */
const ORDER: LevelType[] = [
  LevelType.BEGINNER,
  LevelType.ELEMENTARY,
  LevelType.INTERMEDIATE,
  LevelType.ADVANCED,
];

type LevelStyle = {
  bg: string;
  text: string;
  dot: string;
  bar: string;
  icon: string;
  ring: string;
};

const levelColors: Record<LevelType, LevelStyle> = {
  [LevelType.BEGINNER]: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
    bar: 'from-emerald-400 to-green-500',
    icon: 'from-emerald-400 to-green-600',
    ring: 'border-emerald-400 bg-emerald-50 ring-4 ring-emerald-500/10',
  },
  [LevelType.ELEMENTARY]: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    dot: 'bg-sky-400',
    bar: 'from-sky-400 to-blue-500',
    icon: 'from-sky-400 to-blue-600',
    ring: 'border-sky-400 bg-sky-50 ring-4 ring-sky-500/10',
  },
  [LevelType.INTERMEDIATE]: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    dot: 'bg-violet-400',
    bar: 'from-violet-400 to-purple-500',
    icon: 'from-violet-500 to-purple-600',
    ring: 'border-violet-400 bg-violet-50 ring-4 ring-violet-500/10',
  },
  [LevelType.ADVANCED]: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    bar: 'from-amber-400 to-orange-500',
    icon: 'from-amber-400 to-orange-600',
    ring: 'border-amber-400 bg-amber-50 ring-4 ring-amber-500/10',
  },
};

const levelNames: Record<LevelType, string> = {
  [LevelType.BEGINNER]: "Boshlang'ich",
  [LevelType.ELEMENTARY]: 'Elementar',
  [LevelType.INTERMEDIATE]: "O'rta",
  [LevelType.ADVANCED]: 'Yuqori',
};

type ToastState = { type: 'success' | 'error'; text: string } | null;

const getErrorMessage = (err: unknown, fallback: string) => {
  const e = err as {
    message?: string;
    response?: { status?: number; data?: { message?: string | string[] } };
  };
  const msg = e?.response?.data?.message;
  const text = Array.isArray(msg) ? msg.join(', ') : msg;
  return text || e?.message || fallback;
};

/* ───────────── Sahifa ───────────── */
export default function LevelPage() {
  const { data: levels = [], isLoading, error, refetch } = useLevels();

  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [formData, setFormData] = useState<{ type: LevelType }>({ type: LevelType.BEGINNER });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Level | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  /* Toast avtomatik yopiladi */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /* Modal ochiq paytda: scroll qulfi + Esc */
  const modalOpen = showModal || !!deleteTarget;
  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (deleteTarget) {
        if (!isDeleting) setDeleteTarget(null);
      } else if (!isSubmitting) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, deleteTarget, isDeleting, isSubmitting]);

  /* ── Hisob-kitoblar ── */
  const sortedLevels = [...levels].sort(
    (a: Level, b: Level) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type),
  );
  const existingTypes = new Set<LevelType>(levels.map((l: Level) => l.type));
  const missingTypes = ORDER.filter((t) => !existingTypes.has(t));
  const coverage = Math.round((existingTypes.size / ORDER.length) * 100);

  // Tanlangan tur band bo'lsa (tahrirlanayotgan darajaning o'z turi bundan mustasno)
  const isTaken = (type: LevelType) => existingTypes.has(type) && type !== editingLevel?.type;

  /* ── Modal amallari ── */
  const handleOpenModal = (level?: Level, presetType?: LevelType) => {
    if (level) {
      setEditingLevel(level);
      setFormData({ type: level.type });
    } else {
      setEditingLevel(null);
      setFormData({ type: presetType ?? missingTypes[0] ?? LevelType.BEGINNER });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLevel(null);
    setFormData({ type: LevelType.BEGINNER });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTaken(formData.type)) return;
    setIsSubmitting(true);

    try {
      if (editingLevel) {
        await updateLevel(editingLevel.id, formData);
      } else {
        await createLevel(formData);
      }
      await refetch();
      setToast({
        type: 'success',
        text: editingLevel ? 'Daraja yangilandi' : "Daraja qo'shildi",
      });
      handleCloseModal();
    } catch (err) {
      console.error('Error saving level:', err);
      setToast({ type: 'error', text: getErrorMessage(err, 'Xatolik yuz berdi!') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteLevel(deleteTarget.id);
      await refetch();
      setToast({ type: 'success', text: "Daraja o'chirildi" });
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting level:', err);
      setToast({
        type: 'error',
        text: getErrorMessage(err, "O'chirishda xatolik! Daraja guruhlarda ishlatilayotgan bo'lishi mumkin"),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /* ───────────── Yuklanmoqda (skeleton) ───────────── */
  if (isLoading) {
    return (
      <div>
        <AdminHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white p-4 md:p-8">
          <div className="mx-auto max-w-7xl animate-pulse">
            <div className="mb-8 flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-9 w-48 rounded-lg bg-slate-200" />
                <div className="h-4 w-64 rounded bg-slate-200" />
              </div>
              <div className="h-11 w-44 rounded-xl bg-slate-200" />
            </div>
            <div className="mb-8 h-28 rounded-2xl bg-slate-200" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-slate-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────── Xatolik ───────────── */
  if (error) {
    return (
      <div>
        <AdminHeader />
        <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white p-4">
          <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <XCircle className="text-red-500" size={28} />
            </div>
            <p className="mb-1 text-lg font-semibold text-slate-800">Ma&apos;lumotlarni yuklab bo&apos;lmadi</p>
            <p className="mb-6 text-sm text-red-600">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={16} />
              Qayta urinish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
                Darajalar
              </h1>
              <p className="mt-1 text-slate-500">O&apos;quv darajalarini boshqarish</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              disabled={missingTypes.length === 0}
              title={missingTypes.length === 0 ? 'Barcha darajalar qo\'shilgan' : undefined}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              <Plus size={20} />
              Daraja qo&apos;shish
            </button>
          </div>

          {/* Qamrov (progress) */}
          <div className="mb-8 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Jami darajalar
                  </p>
                  <p className="text-3xl font-bold text-slate-800">{levels.length}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-indigo-600">
                  {existingTypes.size} / {ORDER.length}
                </p>
                <p className="text-xs text-slate-400">tur yaratilgan</p>
              </div>
            </div>

            <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                style={{ width: `${coverage}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {ORDER.map((type) => {
                const has = existingTypes.has(type);
                const c = levelColors[type];
                return (
                  <span
                    key={type}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      has ? `${c.bg} ${c.text}` : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {has ? <Check size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                    {levelNames[type]}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Darajalar to'ri */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sortedLevels.map((level: Level) => {
              const colors = levelColors[level.type];
              return (
                <div
                  key={level.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${colors.bar}`} />
                  <div className="p-5">
                    <div className="mb-5 flex items-start justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md ${colors.icon}`}
                      >
                        <GraduationCap className="text-white" size={28} />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenModal(level)}
                          aria-label="Tahrirlash"
                          title="Tahrirlash"
                          className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(level)}
                          aria-label="O'chirish"
                          title="O'chirish"
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-slate-800">
                      {levelNames[level.type]}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                      {level.type}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Yaratilmagan turlar uchun bo'sh joylar */}
            {missingTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleOpenModal(undefined, type)}
                className="group flex min-h-[11rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 p-5 text-slate-400 transition hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-indigo-100">
                  <Plus size={22} />
                </span>
                <span className="text-sm font-semibold">{levelNames[type]}</span>
                <span className="text-xs">Qo&apos;shish</span>
              </button>
            ))}
          </div>

          {levels.length === 0 && (
            <p className="mt-6 text-center text-sm text-slate-400">
              Hali hech qanday daraja yo&apos;q. Yuqoridagi bo&apos;sh joylardan birini bosing.
            </p>
          )}
        </div>

        {/* ───────────── Qo'shish / tahrirlash modali ───────────── */}
        {showModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isSubmitting) handleCloseModal();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {editingLevel ? 'Darajani tahrirlash' : "Yangi daraja qo'shish"}
                  </h2>
                  <p className="text-sm text-slate-500">Daraja turini tanlang</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  aria-label="Yopish"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5">
                <div role="radiogroup" aria-label="Daraja turi" className="grid grid-cols-2 gap-3">
                  {ORDER.map((type) => {
                    const c = levelColors[type];
                    const selected = formData.type === type;
                    const taken = isTaken(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={taken}
                        onClick={() => setFormData({ type })}
                        className={`relative rounded-xl border-2 p-4 text-left transition ${
                          selected
                            ? c.ring
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        } ${taken ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <span
                          className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.icon}`}
                        >
                          <GraduationCap className="text-white" size={18} />
                        </span>
                        <span className="block text-sm font-bold text-slate-800">
                          {levelNames[type]}
                        </span>
                        <span className="block text-[11px] tracking-wide text-slate-400">
                          {type}
                        </span>
                        {taken && (
                          <span className="absolute right-2 top-2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                            Mavjud
                          </span>
                        )}
                        {selected && !taken && (
                          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                            <Check size={12} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {!editingLevel && missingTypes.length === 0 && (
                  <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Barcha daraja turlari allaqachon qo&apos;shilgan.
                  </p>
                )}

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isTaken(formData.type)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-medium text-white shadow-md transition hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60"
                  >
                    {isSubmitting && <RefreshCw size={16} className="animate-spin" />}
                    {isSubmitting ? 'Yuklanmoqda...' : editingLevel ? 'Yangilash' : 'Saqlash'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ───────────── O'chirishni tasdiqlash ───────────── */}
        {deleteTarget && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isDeleting) setDeleteTarget(null);
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
              <h3 className="mb-1 text-lg font-bold text-slate-800">Darajani o&apos;chirasizmi?</h3>
              <p className="mb-6 text-sm text-slate-500">
                <span className="font-medium text-slate-700">
                  {levelNames[deleteTarget.type]}
                </span>{' '}
                darajasi o&apos;chiriladi. Bu amalni qaytarib bo&apos;lmaydi.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
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
              toast.type === 'success' ? 'bg-slate-900' : 'bg-red-600'
            }`}
          >
            {toast.type === 'success' ? (
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
    </div>
  );
}