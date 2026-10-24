'use client'

import { useEffect, useMemo, useState } from 'react';
import api from '@/features/api/auth';
import { User } from '@/features/types/user';
import { TestResult } from '@/features/types/test-result';
import { Level } from '@/features/types/level';
import AdminLayout from '@/components/AdminLayout';
import AccessCodeNotification from '@/components/AccessCodeNotification';
import AccessCodeToggle from '@/components/AccessCodeToggle';
import {
  Users,
  Shield,
  BarChart3,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  CheckCircle,
  XCircle,
  RefreshCw,
  Phone,
} from 'lucide-react';

/* ───────────── Yordamchilar ───────────── */
const PAGE_SIZE = 15;

const levelNames: Record<string, string> = {
  BEGINNER: "Boshlang'ich",
  ELEMENTARY: 'Elementar',
  INTERMEDIATE: "O'rta",
  ADVANCED: 'Yuqori',
};
const levelLabel = (type?: string) => (type ? (levelNames[type] ?? type) : "Noma'lum daraja");

const pct = (correct: number, wrong: number) =>
  correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

const scoreStyle = (p: number) =>
  p >= 80
    ? { bar: 'from-emerald-400 to-green-500', badge: 'bg-emerald-50 text-emerald-700' }
    : p >= 60
      ? { bar: 'from-amber-400 to-orange-500', badge: 'bg-amber-50 text-amber-700' }
      : { bar: 'from-rose-400 to-red-500', badge: 'bg-rose-50 text-rose-700' };

const authHeaders = () => {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Token topilmadi, qayta kiring');
  return { Authorization: `Bearer ${token}` };
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

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });

type Tab = 'users' | 'results';
type Role = 'USER' | 'ADMIN';
type ToastState = { type: 'success' | 'error'; text: string } | null;
type DeleteTarget = { kind: 'user' | 'result'; id: string; label: string } | null;

/* ───────────── Sahifa ───────────── */
export default function AdminHome() {
  const [users, setUsers] = useState<User[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Tab, qidiruv, sahifalash
  const [tab, setTab] = useState<Tab>('users');
  const [query, setQuery] = useState('');
  const filterKey = `${tab}|${query}`;
  const [pageState, setPageState] = useState({ key: '', limit: PAGE_SIZE });
  const limit = pageState.key === filterKey ? pageState.limit : PAGE_SIZE;

  // Foydalanuvchi formasi
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<Role>('USER');

  // Natija formasi
  const [showResultForm, setShowResultForm] = useState(false);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [resultUserId, setResultUserId] = useState('');
  const [resultLevelId, setResultLevelId] = useState('');
  const [correct, setCorrect] = useState('0');
  const [wrong, setWrong] = useState('0');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // O'chirish va toast
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  /* ── Yuklash (setState faqat promise callback'larida) ── */
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        const headers = authHeaders();
        return Promise.all([
          api.get<User[]>('/user', { headers }),
          api.get<TestResult[]>('/test-result', { headers }),
          // daraja ro'yxati ixtiyoriy: xato bo'lsa ham sahifa ishlayveradi
          api.get<Level[]>('/level', { headers }).catch(() => ({ data: [] as Level[] })),
        ]);
      })
      .then(([u, r, l]) => {
        if (cancelled) return;
        setUsers(u.data);
        setResults(r.data);
        setLevels(l.data);
        setLoadError('');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setLoadError(getErrorMessage(err, "Ma'lumotlarni yuklab bo'lmadi"));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const fetchData = (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setLoadError('');
    setReloadKey((k) => k + 1);
  };

  /* Toast avtomatik yopiladi */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /* Modal ochiq paytda: scroll qulfi + Esc */
  const anyModal = showUserForm || showResultForm || !!deleteTarget;
  useEffect(() => {
    if (!anyModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (deleteTarget) {
        if (!isDeleting) setDeleteTarget(null);
      } else if (!isSubmitting) {
        closeForms();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [anyModal, deleteTarget, isDeleting, isSubmitting]);

  /* ── Forma amallari ── */
  function closeForms() {
    setShowUserForm(false);
    setShowResultForm(false);
    setEditingUserId(null);
    setEditingResultId(null);
    setFormError('');
  }

  const openUserForm = (u?: User) => {
    setEditingUserId(u?.id ?? null);
    setUserName(u?.name ?? '');
    setUserPhone(u?.phone ?? '');
    setUserRole((u?.role as Role) ?? 'USER');
    setFormError('');
    setShowUserForm(true);
  };

  const openResultForm = (r?: TestResult) => {
    setEditingResultId(r?.id ?? null);
    setResultUserId(r?.userId ?? '');
    setResultLevelId(r?.levelId ?? levels[0]?.id ?? '');
    setCorrect(String(r?.correctCount ?? 0));
    setWrong(String(r?.wrongCount ?? 0));
    setFormError('');
    setShowResultForm(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return setFormError('Ismni kiriting');

    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = { name: userName.trim(), phone: userPhone.trim(), role: userRole };
      if (editingUserId) {
        const { data } = await api.patch<User>(`/user/${editingUserId}`, payload, {
          headers: authHeaders(),
        });
        setUsers((prev) => prev.map((u) => (u.id === editingUserId ? data : u)));
        setToast({ type: 'success', text: 'Foydalanuvchi yangilandi' });
      } else {
        const { data } = await api.post<User>('/user', payload, { headers: authHeaders() });
        setUsers((prev) => [data, ...prev]);
        setToast({ type: 'success', text: "Foydalanuvchi qo'shildi" });
      }
      closeForms();
    } catch (err) {
      console.error(err);
      setFormError(getErrorMessage(err, 'Saqlashda xatolik'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = Number(correct);
    const w = Number(wrong);
    if (!resultUserId || !resultLevelId) return setFormError('Foydalanuvchi va darajani tanlang');
    if (!Number.isInteger(c) || !Number.isInteger(w) || c < 0 || w < 0)
      return setFormError("Javoblar soni 0 yoki undan katta butun son bo'lishi kerak");

    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = { userId: resultUserId, levelId: resultLevelId, correctCount: c, wrongCount: w };
      if (editingResultId) {
        await api.patch<TestResult>(`/test-result/${editingResultId}`, payload, {
          headers: authHeaders(),
        });
      } else {
        await api.post<TestResult>('/test-result', payload, { headers: authHeaders() });
      }
      // user/level ma'lumotlari to'liq kelishi uchun ro'yxat qayta yuklanadi
      fetchData(true);
      setToast({ type: 'success', text: editingResultId ? 'Natija yangilandi' : "Natija qo'shildi" });
      closeForms();
    } catch (err) {
      console.error(err);
      setFormError(getErrorMessage(err, 'Saqlashda xatolik'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.kind === 'user') {
        await api.delete(`/user/${deleteTarget.id}`, { headers: authHeaders() });
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        fetchData(true); // foydalanuvchi natijalari ham o'zgargan bo'lishi mumkin
        setToast({ type: 'success', text: "Foydalanuvchi o'chirildi" });
      } else {
        await api.delete(`/test-result/${deleteTarget.id}`, { headers: authHeaders() });
        setResults((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        setToast({ type: 'success', text: "Natija o'chirildi" });
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', text: getErrorMessage(err, "O'chirishda xatolik") });
    } finally {
      setIsDeleting(false);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setQuery('');
  };

  /* ── Hisob-kitoblar ── */
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const totalCorrect = results.reduce((s, r) => s + r.correctCount, 0);
  const totalWrong = results.reduce((s, r) => s + r.wrongCount, 0);
  const avgScore = pct(totalCorrect, totalWrong);

  const q = query.trim().toLowerCase();
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          !q ||
          u.name.toLowerCase().includes(q) ||
          (u.phone ?? '').toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q),
      ),
    [users, q],
  );
  const filteredResults = useMemo(
    () =>
      results.filter(
        (r) =>
          !q ||
          (r.user?.name ?? '').toLowerCase().includes(q) ||
          levelLabel(r.level?.type).toLowerCase().includes(q),
      ),
    [results, q],
  );

  const activeList = tab === 'users' ? filteredUsers : filteredResults;
  const visibleUsers = filteredUsers.slice(0, limit);
  const visibleResults = filteredResults.slice(0, limit);
  const shownCount = tab === 'users' ? visibleUsers.length : visibleResults.length;

  const statCards = [
    { label: 'Foydalanuvchilar', value: users.length, icon: Users, box: 'bg-indigo-100 text-indigo-600', bar: 'from-indigo-500 to-violet-500' },
    { label: 'Adminlar', value: adminCount, icon: Shield, box: 'bg-emerald-100 text-emerald-600', bar: 'from-emerald-400 to-green-500' },
    { label: 'Test natijalari', value: results.length, icon: BarChart3, box: 'bg-sky-100 text-sky-600', bar: 'from-sky-400 to-blue-500' },
    { label: "O'rtacha ball", value: `${avgScore}%`, icon: TrendingUp, box: 'bg-violet-100 text-violet-600', bar: 'from-violet-400 to-purple-500' },
  ];

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10';

  const roleBadge = (role: string) => (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        role === 'ADMIN' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
      }`}
    >
      {role}
    </span>
  );

  const rowActions = (onEdit: () => void, onDelete: () => void) => (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={onEdit}
        title="Tahrirlash"
        aria-label="Tahrirlash"
        className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        title="O'chirish"
        aria-label="O'chirish"
        className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
      <AdminLayout />

      <main className="mx-auto max-w-7xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
              Admin panel
            </h1>
            <p className="mt-1 text-slate-500">Foydalanuvchilar va test natijalarini boshqarish</p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Yangilash
          </button>
        </div>

        {/* Kirish kodi bloklari (o'zgarishsiz) */}
        <div className="mb-4">
          <AccessCodeToggle />
        </div>
        <div className="mb-8">
          <AccessCodeNotification />
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.bar}`} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-slate-500">{s.label}</p>
                  <p className="text-3xl font-bold text-slate-800">{loading ? '–' : s.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${s.box}`}>
                  <s.icon size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Boshqaruv paneli */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          {/* Tablar + amal */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex rounded-xl bg-slate-100/70 p-1">
              {(
                [
                  { key: 'users', label: 'Foydalanuvchilar', count: users.length },
                  { key: 'results', label: 'Test natijalari', count: results.length },
                ] as { key: Tab; label: string; count: number }[]
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => switchTab(t.key)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    tab === t.key
                      ? 'bg-white text-indigo-600 shadow'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-1.5 text-xs ${
                      tab === t.key ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200/70 text-slate-500'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative sm:w-64">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`${inputCls} pl-10 pr-9`}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Tozalash"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => (tab === 'users' ? openUserForm() : openResultForm())}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98]"
              >
                <Plus size={18} />
                {tab === 'users' ? "Foydalanuvchi qo'shish" : "Natija qo'shish"}
              </button>
            </div>
          </div>

          {/* Mazmun */}
          {loading ? (
            <div className="divide-y divide-slate-50">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-4 px-6 py-4">
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                  <div className="h-4 w-44 rounded bg-slate-200" />
                  <div className="ml-auto h-4 w-28 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <XCircle className="text-red-500" size={28} />
              </div>
              <p className="mb-1 text-lg font-semibold text-slate-800">Yuklab bo&apos;lmadi</p>
              <p className="mb-5 text-sm text-red-600">{loadError}</p>
              <button
                onClick={() => fetchData()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
              >
                <RefreshCw size={16} />
                Qayta urinish
              </button>
            </div>
          ) : activeList.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                {tab === 'users' ? (
                  <Users className="text-indigo-300" size={32} />
                ) : (
                  <BarChart3 className="text-indigo-300" size={32} />
                )}
              </div>
              <p className="font-semibold text-slate-700">
                {tab === 'users' ? 'Foydalanuvchi topilmadi' : 'Natija topilmadi'}
              </p>
              <p className="text-sm text-slate-400">
                {query ? "Qidiruv bo'yicha natija yo'q" : "Birinchisini yuqoridagi tugma orqali qo'shing"}
              </p>
            </div>
          ) : tab === 'users' ? (
            <div className="divide-y divide-slate-50">
              {visibleUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col gap-3 px-4 py-4 transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white shadow-sm">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{u.name}</p>
                      {u.phone ? (
                        <a
                          href={`tel:${u.phone}`}
                          className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500 transition hover:text-indigo-600"
                        >
                          <Phone className="h-3 w-3" />
                          {u.phone}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-xs text-slate-300">Telefon yo&apos;q</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    {roleBadge(u.role)}
                    {rowActions(
                      () => openUserForm(u),
                      () => setDeleteTarget({ kind: 'user', id: u.id, label: u.name }),
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {visibleResults.map((r) => {
                const p = pct(r.correctCount, r.wrongCount);
                const st = scoreStyle(p);
                const name = r.user?.name ?? "Noma'lum";
                return (
                  <div
                    key={r.id}
                    className="grid grid-cols-1 items-center gap-3 px-4 py-4 transition hover:bg-slate-50/60 sm:px-6 md:grid-cols-[1.4fr_1fr_2fr_auto] md:gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-sm font-bold text-white shadow-sm">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                        <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                      </div>
                    </div>

                    <div>
                      <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                        {levelLabel(r.level?.type)}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          <span className="font-semibold text-emerald-600">{r.correctCount}</span>{' '}
                          to&apos;g&apos;ri ·{' '}
                          <span className="font-semibold text-rose-500">{r.wrongCount}</span>{' '}
                          noto&apos;g&apos;ri
                        </span>
                        <span className={`rounded-full px-2 py-0.5 font-bold ${st.badge}`}>{p}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${st.bar}`}
                          style={{ width: `${p}%` }}
                        />
                      </div>
                    </div>

                    {rowActions(
                      () => openResultForm(r),
                      () =>
                        setDeleteTarget({
                          kind: 'result',
                          id: r.id,
                          label: `${name} · ${levelLabel(r.level?.type)} · ${p}%`,
                        }),
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pastki qism */}
          {!loading && !loadError && activeList.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-3">
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{shownCount}</span> /{' '}
                {activeList.length} ta ko&apos;rsatilmoqda
              </p>
              {shownCount < activeList.length && (
                <button
                  onClick={() => setPageState({ key: filterKey, limit: limit + PAGE_SIZE })}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                >
                  Yana {Math.min(PAGE_SIZE, activeList.length - shownCount)} ta ko&apos;rsatish
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ───────────── Foydalanuvchi modali ───────────── */}
      {showUserForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) closeForms();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="my-8 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-800">
                {editingUserId ? 'Foydalanuvchini tahrirlash' : "Yangi foydalanuvchi qo'shish"}
              </h2>
              <button
                onClick={closeForms}
                disabled={isSubmitting}
                aria-label="Yopish"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Ism *</label>
                <input
                  type="text"
                  placeholder="To'liq ism"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Telefon</label>
                <input
                  type="text"
                  placeholder="+998 90 123 45 67"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Rol</label>
                <div role="radiogroup" className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  {(['USER', 'ADMIN'] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      role="radio"
                      aria-checked={userRole === r}
                      onClick={() => setUserRole(r)}
                      className={`rounded-lg py-2 text-sm font-semibold transition ${
                        userRole === r
                          ? r === 'ADMIN'
                            ? 'bg-emerald-500 text-white shadow'
                            : 'bg-indigo-600 text-white shadow'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3">
                  <XCircle className="mt-0.5 shrink-0 text-red-500" size={18} />
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForms}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-medium text-white shadow-md transition hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60"
                >
                  {isSubmitting && <RefreshCw size={16} className="animate-spin" />}
                  {isSubmitting ? 'Saqlanmoqda...' : editingUserId ? 'Yangilash' : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────── Natija modali ───────────── */}
      {showResultForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) closeForms();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="my-8 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-800">
                {editingResultId ? 'Natijani tahrirlash' : "Yangi natija qo'shish"}
              </h2>
              <button
                onClick={closeForms}
                disabled={isSubmitting}
                aria-label="Yopish"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResultSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Foydalanuvchi *
                </label>
                <select
                  value={resultUserId}
                  onChange={(e) => setResultUserId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Foydalanuvchini tanlang</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Daraja *</label>
                {levels.length > 0 ? (
                  <select
                    value={resultLevelId}
                    onChange={(e) => setResultLevelId(e.target.value)}
                    className={inputCls}
                  >
                    {!levels.some((l) => l.id === resultLevelId) && (
                      <option value={resultLevelId}>Darajani tanlang</option>
                    )}
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {levelLabel(l.type)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Level ID"
                    value={resultLevelId}
                    onChange={(e) => setResultLevelId(e.target.value)}
                    className={inputCls}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    To&apos;g&apos;ri javoblar
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={correct}
                    onChange={(e) => setCorrect(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Noto&apos;g&apos;ri javoblar
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={wrong}
                    onChange={(e) => setWrong(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {(Number(correct) || 0) + (Number(wrong) || 0) > 0 && (
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="mb-1.5 flex justify-between text-sm text-slate-600">
                    <span>Ball (ko&apos;rinish)</span>
                    <span className="font-bold">{pct(Number(correct) || 0, Number(wrong) || 0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                        scoreStyle(pct(Number(correct) || 0, Number(wrong) || 0)).bar
                      }`}
                      style={{ width: `${pct(Number(correct) || 0, Number(wrong) || 0)}%` }}
                    />
                  </div>
                </div>
              )}

              {formError && (
                <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3">
                  <XCircle className="mt-0.5 shrink-0 text-red-500" size={18} />
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForms}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-medium text-white shadow-md transition hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60"
                >
                  {isSubmitting && <RefreshCw size={16} className="animate-spin" />}
                  {isSubmitting ? 'Saqlanmoqda...' : editingResultId ? 'Yangilash' : "Qo'shish"}
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
            <h3 className="mb-1 text-lg font-bold text-slate-800">
              {deleteTarget.kind === 'user' ? "Foydalanuvchini o'chirasizmi?" : "Natijani o'chirasizmi?"}
            </h3>
            <p className="mb-6 text-sm text-slate-500">
              <span className="font-medium text-slate-700">{deleteTarget.label}</span>
              <br />
              Bu amalni qaytarib bo&apos;lmaydi.
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
  );
}