"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  X,
  RefreshCw,
} from 'lucide-react';
import { Group } from '@/features/types';
import { useDeleteGroup, useGroups } from '@/features/hooks/useGroups';
import { CreateGroupModal } from '@/features/modals/useCreateGroupModal';
import { EditGroupModal } from '@/features/modals/useEditGroupModal';
import { useLevels } from '@/features/hooks/useLevel';
import AdminHeader from '@/components/AdminLayout';

/* ───────────── Daraja ranglari ───────────── */
type LevelStyle = { bg: string; text: string; dot: string; bar: string; avatar: string };

const levelColors: Record<string, LevelStyle> = {
  BEGINNER: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
    bar: 'from-emerald-400 to-green-500',
    avatar: 'from-emerald-400 to-green-600',
  },
  ELEMENTARY: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    dot: 'bg-sky-400',
    bar: 'from-sky-400 to-blue-500',
    avatar: 'from-sky-400 to-blue-600',
  },
  INTERMEDIATE: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    dot: 'bg-violet-400',
    bar: 'from-violet-400 to-purple-500',
    avatar: 'from-violet-500 to-purple-600',
  },
  ADVANCED: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    bar: 'from-amber-400 to-orange-500',
    avatar: 'from-amber-400 to-orange-600',
  },
};

const defaultLevel: LevelStyle = {
  bg: 'bg-slate-100',
  text: 'text-slate-600',
  dot: 'bg-slate-400',
  bar: 'from-slate-300 to-slate-400',
  avatar: 'from-slate-400 to-slate-600',
};

type Filter = 'all' | 'active' | 'inactive';
type ToastState = { type: 'success' | 'error'; text: string } | null;

const getErrorMessage = (err: unknown, fallback: string) => {
  const e = err as { response?: { data?: { message?: string | string[] } } };
  const msg = e?.response?.data?.message;
  return (Array.isArray(msg) ? msg.join(', ') : msg) || fallback;
};

/* ───────────── Sahifa ───────────── */
export default function GroupsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const { data: groups, isLoading } = useGroups();
  const { data: levels } = useLevels();
  const deleteGroup = useDeleteGroup();

  /* Toast avtomatik yopiladi */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /* O'chirish oynasi: Esc bilan yopish */
  useEffect(() => {
    if (!deleteTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleteGroup.isPending) setDeleteTarget(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteTarget, deleteGroup.isPending]);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteGroup.mutate(deleteTarget.id, {
      onSuccess: () => {
        setToast({ type: 'success', text: "Guruh o'chirildi" });
        setDeleteTarget(null);
      },
      onError: (err: unknown) => {
        setToast({ type: 'error', text: getErrorMessage(err, "O'chirishda xatolik") });
      },
    });
  };

  /* ── Hisob-kitoblar ── */
  const list = useMemo(() => groups ?? [], [groups]);
  const total = list.length;
  const activeCount = list.filter((g) => g.isActive).length;
  const inactiveCount = total - activeCount;
  const totalStudents = list.reduce((sum, g) => sum + (g._count?.students ?? 0), 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((g) => {
      if (filter === 'active' && !g.isActive) return false;
      if (filter === 'inactive' && g.isActive) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        (g.level?.type ?? '').toLowerCase().includes(q) ||
        (g.schedule ?? '').toLowerCase().includes(q)
      );
    });
  }, [list, filter, query]);

  const stats = [
    {
      label: 'Jami guruhlar',
      value: total,
      icon: BookOpen,
      box: 'bg-indigo-100 text-indigo-600',
      bar: 'from-indigo-500 to-violet-500',
    },
    {
      label: 'Faol guruhlar',
      value: activeCount,
      icon: CheckCircle,
      box: 'bg-emerald-100 text-emerald-600',
      bar: 'from-emerald-400 to-green-500',
    },
    {
      label: 'Jami talabalar',
      value: totalStudents,
      icon: Users,
      box: 'bg-sky-100 text-sky-600',
      bar: 'from-sky-400 to-blue-500',
    },
  ];

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Barchasi', count: total },
    { key: 'active', label: 'Faol', count: activeCount },
    { key: 'inactive', label: 'Nofaol', count: inactiveCount },
  ];

  /* ───────────── Yuklanmoqda (skeleton) ───────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
        <AdminHeader />
        <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 md:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-9 w-48 rounded-lg bg-slate-200" />
              <div className="h-4 w-64 rounded bg-slate-200" />
            </div>
            <div className="h-11 w-40 rounded-xl bg-slate-200" />
          </div>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-52 rounded-2xl bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
      <AdminHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
              Guruhlar
            </h1>
            <p className="mt-1 text-slate-500">Barcha guruhlar ro&apos;yxati va boshqaruv</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Guruh qo&apos;shish
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.bar}`} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {s.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-800">{s.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${s.box}`}>
                  <s.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Qidiruv va filtr */}
        {total > 0 && (
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Guruh, daraja yoki jadval bo'yicha qidirish..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Tozalash"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                    filter === t.key
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-1.5 text-xs ${
                      filter === t.key ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Guruhlar to'ri */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((group) => {
              const levelKey = group.level?.type ?? '';
              const colors = levelColors[levelKey] ?? defaultLevel;
              const studentCount = group._count?.students ?? 0;

              return (
                <div
                  key={group.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${colors.bar}`} />
                  <div className="flex flex-1 flex-col p-5">
                    {/* Sarlavha */}
                    <div className="mb-4 flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white shadow-md ${colors.avatar}`}
                      >
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-slate-800">
                          {group.name}
                        </h3>
                        <span
                          className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                          {group.level?.type || "Level noma'lum"}
                        </span>
                      </div>
                    </div>

                    {/* Ma'lumotlar */}
                    <div className="mb-5 space-y-2.5">
                      <div className="flex items-center gap-2.5 text-sm text-slate-500">
                        <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="truncate">
                          {group.schedule || "Jadval ko'rsatilmagan"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-slate-500">
                        <Users className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>
                          <span className="font-semibold text-slate-700">{studentCount}</span> ta
                          talaba
                        </span>
                      </div>
                    </div>

                    {/* Pastki qism */}
                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          group.isActive
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            group.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {group.isActive ? 'Faol' : 'Nofaol'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingGroup(group)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                        >
                          <Edit className="h-4 w-4" />
                          Tahrirlash
                        </button>
                        <button
                          onClick={() => setDeleteTarget(group)}
                          aria-label="O'chirish"
                          title="O'chirish"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bo'sh holatlar */}
        {total === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
              <BookOpen className="h-8 w-8 text-indigo-400" />
            </div>
            <p className="mb-1 text-lg font-semibold text-slate-700">Guruhlar yo&apos;q</p>
            <p className="mb-6 text-sm text-slate-500">
              Birinchi guruhni qo&apos;shish uchun tugmani bosing
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Guruh qo&apos;shish
            </button>
          </div>
        )}

        {total > 0 && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-600">Hech narsa topilmadi</p>
            <button
              onClick={() => {
                setQuery('');
                setFilter('all');
              }}
              className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>

      {/* Modallar (o'zgarishsiz) */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        levels={levels || []}
      />
      {editingGroup && (
        <EditGroupModal
          isOpen={!!editingGroup}
          onClose={() => setEditingGroup(null)}
          group={editingGroup}
          levels={levels || []}
        />
      )}

      {/* O'chirishni tasdiqlash */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleteGroup.isPending) setDeleteTarget(null);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mb-1 text-lg font-bold text-slate-800">Guruhni o&apos;chirasizmi?</h3>
            <p className="mb-6 text-sm text-slate-500">
              <span className="font-medium text-slate-700">{deleteTarget.name}</span> guruhi
              o&apos;chiriladi. Bu amalni qaytarib bo&apos;lmaydi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteGroup.isPending}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteGroup.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleteGroup.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-[120] flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
            toast.type === 'success' ? 'bg-slate-900' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="h-[18px] w-[18px] shrink-0 text-emerald-400" />
          ) : (
            <XCircle className="h-[18px] w-[18px] shrink-0" />
          )}
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            aria-label="Yopish"
            className="ml-1 text-white/60 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}