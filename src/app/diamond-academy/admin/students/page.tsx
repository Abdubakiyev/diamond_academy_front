"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  UserCheck,
  UserX,
  Phone,
  X,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { useDeleteStudent, useStudents } from '@/features/hooks/useStudents';
import { useGroups } from '@/features/hooks/useGroups';
import { Student } from '@/features/types';
import { CreateStudentModal } from '@/features/modals/useCreateStudent';
import { EditStudentModal } from '@/features/modals/useUpdateStudent';
import AdminHeader from '@/components/AdminLayout';

/* ───────────── Yordamchilar ───────────── */
const PAGE_SIZE = 20;

type Filter = 'all' | 'active' | 'inactive';
type ToastState = { type: 'success' | 'error'; text: string } | null;

const avatarPalette = [
  'from-indigo-400 to-violet-500',
  'from-sky-400 to-blue-500',
  'from-emerald-400 to-green-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-teal-400 to-cyan-500',
];
const avatarColor = (name: string) =>
  avatarPalette[(name.charCodeAt(0) || 0) % avatarPalette.length];

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
export default function StudentsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [status, setStatus] = useState<Filter>('all');
  // Filtr o'zgarganda ro'yxat boshidan boshlanishi uchun limit filtr kaliti bilan birga saqlanadi
  const [pageState, setPageState] = useState({ key: '', limit: PAGE_SIZE });
  const [toast, setToast] = useState<ToastState>(null);

  const { data: students, isLoading } = useStudents(selectedGroupId || undefined);
  const { data: groups } = useGroups(true);
  const deleteStudent = useDeleteStudent();

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
      if (e.key === 'Escape' && !deleteStudent.isPending) setDeleteTarget(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteTarget, deleteStudent.isPending]);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteStudent.mutate(deleteTarget.id, {
      onSuccess: () => {
        setToast({ type: 'success', text: "Talaba o'chirildi" });
        setDeleteTarget(null);
      },
      onError: (err: unknown) => {
        setToast({ type: 'error', text: getErrorMessage(err, "O'chirishda xatolik") });
      },
    });
  };

  /* ── Hisob-kitoblar ── */
  const list = useMemo(() => students ?? [], [students]);
  const total = list.length;
  const activeCount = list.filter((s) => s.isActive).length;
  const inactiveCount = total - activeCount;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return list.filter((s) => {
      if (status === 'active' && !s.isActive) return false;
      if (status === 'inactive' && s.isActive) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.phone ?? '').toLowerCase().includes(q) ||
        (s.group?.name ?? '').toLowerCase().includes(q)
      );
    });
  }, [list, searchQuery, status]);

  const filterKey = `${searchQuery}|${selectedGroupId}|${status}`;
  const limit = pageState.key === filterKey ? pageState.limit : PAGE_SIZE;
  const visible = filtered.slice(0, limit);
  const hasFilters = !!(searchQuery || selectedGroupId || status !== 'all');

  const stats = [
    { label: 'Jami', value: total, icon: Users, box: 'bg-indigo-100 text-indigo-600', bar: 'from-indigo-500 to-violet-500' },
    { label: 'Faol', value: activeCount, icon: UserCheck, box: 'bg-emerald-100 text-emerald-600', bar: 'from-emerald-400 to-green-500' },
    { label: 'Nofaol', value: inactiveCount, icon: UserX, box: 'bg-slate-100 text-slate-500', bar: 'from-slate-300 to-slate-400' },
  ];

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Barchasi', count: total },
    { key: 'active', label: 'Faol', count: activeCount },
    { key: 'inactive', label: 'Nofaol', count: inactiveCount },
  ];

  const statusBadge = (active: boolean) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {active ? 'Faol' : 'Nofaol'}
    </span>
  );

  const renderActions = (student: Student) => (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => setEditingStudent(student)}
        aria-label="Tahrirlash"
        title="Tahrirlash"
        className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={() => setDeleteTarget(student)}
        aria-label="O'chirish"
        title="O'chirish"
        className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const renderAvatar = (student: Student, size: string) => (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${size} ${
        student.isActive
          ? `bg-gradient-to-br text-white shadow-sm ${avatarColor(student.name)}`
          : 'bg-slate-100 text-slate-400'
      }`}
    >
      {student.name.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
      <AdminHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
              Talabalar
            </h1>
            <p className="mt-1 text-slate-500">Barcha talabalar ro&apos;yxati va boshqaruv</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Talaba qo&apos;shish
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                  <p className="text-3xl font-bold text-slate-800">{isLoading ? '–' : s.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${s.box}`}>
                  <s.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtrlar */}
        <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ism, telefon yoki guruh bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Tozalash"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="relative md:w-56">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                aria-label="Guruh bo'yicha filtr"
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-9 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="">Barcha guruhlar</option>
                {groups?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="mt-3 inline-flex rounded-xl bg-slate-100/70 p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setStatus(t.key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                  status === t.key
                    ? 'bg-white text-indigo-600 shadow'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    status === t.key ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200/70 text-slate-500'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Ro'yxat */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          {isLoading ? (
            <div className="divide-y divide-slate-50">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-4 px-6 py-4">
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                  <div className="h-4 w-44 rounded bg-slate-200" />
                  <div className="ml-auto h-4 w-28 rounded bg-slate-100" />
                  <div className="h-6 w-20 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              {/* Jadval (md va undan katta) */}
              <div className="hidden md:block">
                <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_auto] gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-3.5">
                  {['Ism', 'Telefon', 'Guruh', 'Holat'].map((h) => (
                    <span
                      key={h}
                      className="text-xs font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {h}
                    </span>
                  ))}
                  <span className="w-[76px] text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Amallar
                  </span>
                </div>

                <div className="divide-y divide-slate-50">
                  {visible.map((student) => (
                    <div
                      key={student.id}
                      className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_auto] items-center gap-4 px-6 py-3.5 transition-colors hover:bg-slate-50/60"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {renderAvatar(student, 'h-10 w-10 text-sm')}
                        <span className="truncate text-sm font-semibold text-slate-800">
                          {student.name}
                        </span>
                      </div>

                      {student.phone ? (
                        <a
                          href={`tel:${student.phone}`}
                          className="truncate text-sm text-slate-500 transition hover:text-indigo-600"
                        >
                          {student.phone}
                        </a>
                      ) : (
                        <span className="text-sm text-slate-300">—</span>
                      )}

                      <span className="truncate">
                        {student.group?.name ? (
                          <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                            {student.group.name}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </span>

                      <div>{statusBadge(student.isActive)}</div>

                      <div className="w-[76px]">{renderActions(student)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kartalar (mobil) */}
              <div className="divide-y divide-slate-100 md:hidden">
                {visible.map((student) => (
                  <div key={student.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {renderAvatar(student, 'h-11 w-11 text-sm')}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {student.name}
                          </p>
                          {student.phone ? (
                            <a
                              href={`tel:${student.phone}`}
                              className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500"
                            >
                              <Phone className="h-3 w-3" />
                              {student.phone}
                            </a>
                          ) : (
                            <p className="mt-0.5 text-xs text-slate-300">Telefon yo&apos;q</p>
                          )}
                        </div>
                      </div>
                      {statusBadge(student.isActive)}
                    </div>
                    <div className="flex items-center justify-between">
                      {student.group?.name ? (
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                          {student.group.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">Guruhsiz</span>
                      )}
                      {renderActions(student)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pastki qism */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-3">
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{visible.length}</span> /{' '}
                  {filtered.length} ta talaba ko&apos;rsatilmoqda
                </p>
                {visible.length < filtered.length && (
                  <button
                    onClick={() => setPageState({ key: filterKey, limit: limit + PAGE_SIZE })}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                  >
                    Yana {Math.min(PAGE_SIZE, filtered.length - visible.length)} ta ko&apos;rsatish
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <Users className="h-8 w-8 text-indigo-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Talabalar yo&apos;q</p>
                <p className="mt-1 text-xs text-slate-400">
                  {hasFilters
                    ? "Filtr bo'yicha natija topilmadi"
                    : "Birinchi talabani qo'shish uchun yuqoridagi tugmani bosing"}
                </p>
              </div>
              {hasFilters && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGroupId('');
                    setStatus('all');
                  }}
                  className="text-sm font-medium text-indigo-600 hover:underline"
                >
                  Filtrlarni tozalash
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modallar (o'zgarishsiz) */}
      <CreateStudentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        groups={groups || []}
      />
      {editingStudent && (
        <EditStudentModal
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          student={editingStudent}
          groups={groups || []}
        />
      )}

      {/* O'chirishni tasdiqlash */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleteStudent.isPending) setDeleteTarget(null);
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
            <h3 className="mb-1 text-lg font-bold text-slate-800">Talabani o&apos;chirasizmi?</h3>
            <p className="mb-6 text-sm text-slate-500">
              <span className="font-medium text-slate-700">{deleteTarget.name}</span> o&apos;chiriladi.
              Bu amalni qaytarib bo&apos;lmaydi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteStudent.isPending}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteStudent.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleteStudent.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
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