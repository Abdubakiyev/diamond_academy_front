'use client'

import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/features/api/auth';
import { TestResult } from '@/features/types/test-result';
import AdminLayout from '@/components/AdminLayout';
import { useLevels } from '@/features/hooks/useLevel';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  TrendingUp,
  User,
  Award,
  Calendar,
  RefreshCw,
  BarChart3,
  Users,
  Target,
  X,
  CheckCircle,
  XCircle,
  ChevronDown,
} from 'lucide-react';

/* ───────────── Yordamchilar ───────────── */
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
    ? { bar: 'from-emerald-400 to-green-500', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700' }
    : p >= 60
      ? { bar: 'from-amber-400 to-orange-500', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700' }
      : { bar: 'from-rose-400 to-red-500', text: 'text-rose-600', badge: 'bg-rose-50 text-rose-700' };

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
  return text || (e?.response?.status ? `${fallback} (${e.response.status})` : e?.message || fallback);
};

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });

type ToastState = { type: 'success' | 'error'; text: string } | null;
type UserGroup = {
  id: string;
  name: string;
  items: TestResult[];
  avg: number;
  best: number;
  latest: number;
};

/* ───────────── Sahifa ───────────── */
export default function AdminResults() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Filtrlar
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Forma (modal)
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [correct, setCorrect] = useState('0');
  const [wrong, setWrong] = useState('0');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // O'chirish va toast
  const [deleteTarget, setDeleteTarget] = useState<TestResult | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const { data: levels = [] } = useLevels();

  /* ── Yuklash ── */
  const fetchResults = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setLoadError('');
    try {
      const { data } = await api.get<TestResult[]>('/test-result', {
        headers: authHeaders(),
      });
      setResults(data);
    } catch (err) {
      console.error(err);
      setLoadError(getErrorMessage(err, "Natijalarni yuklab bo'lmadi"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  /* Toast avtomatik yopiladi */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /* Modal ochiq paytda: scroll qulfi + Esc */
  const anyModal = showForm || !!deleteTarget;
  useEffect(() => {
    if (!anyModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (deleteTarget) {
        if (!isDeleting) setDeleteTarget(null);
      } else if (!isSubmitting) {
        closeForm();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyModal, deleteTarget, isDeleting, isSubmitting]);

  /* ── Forma amallari ── */
  const openCreate = () => {
    setEditingId(null);
    setUserId('');
    setLevelId(levels[0]?.id ?? '');
    setCorrect('0');
    setWrong('0');
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (r: TestResult) => {
    setEditingId(r.id);
    setUserId(r.userId);
    setLevelId(r.levelId);
    setCorrect(String(r.correctCount));
    setWrong(String(r.wrongCount));
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = Number(correct);
    const w = Number(wrong);

    if (!userId.trim() || !levelId.trim()) {
      setFormError('User ID va Level ID ni kiriting');
      return;
    }
    if (!Number.isInteger(c) || !Number.isInteger(w) || c < 0 || w < 0) {
      setFormError("To'g'ri va noto'g'ri javoblar soni 0 yoki undan katta butun son bo'lishi kerak");
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = { userId: userId.trim(), levelId: levelId.trim(), correctCount: c, wrongCount: w };
      if (editingId) {
        await api.patch<TestResult>(`/test-result/${editingId}`, payload, { headers: authHeaders() });
      } else {
        await api.post<TestResult>('/test-result', payload, { headers: authHeaders() });
      }
      // user/level ma'lumotlari to'liq kelishi uchun ro'yxatni qayta yuklaymiz
      await fetchResults(true);
      setToast({ type: 'success', text: editingId ? 'Natija yangilandi' : "Natija qo'shildi" });
      closeForm();
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
      await api.delete(`/test-result/${deleteTarget.id}`, { headers: authHeaders() });
      setResults((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setToast({ type: 'success', text: "Natija o'chirildi" });
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', text: getErrorMessage(err, "O'chirishda xatolik") });
    } finally {
      setIsDeleting(false);
    }
  };

  /* ── Hisob-kitoblar ── */
  const totalCorrect = results.reduce((s, r) => s + r.correctCount, 0);
  const totalWrong = results.reduce((s, r) => s + r.wrongCount, 0);
  const averageScore = pct(totalCorrect, totalWrong);
  const totalUsers = new Set(results.map((r) => r.userId)).size;

  const levelOptions = useMemo(
    () => [...new Set(results.map((r) => r.level?.type).filter(Boolean))] as string[],
    [results],
  );

  const filteredResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return results.filter((r) => {
      if (levelFilter && r.level?.type !== levelFilter) return false;
      if (dateFilter && new Date(r.createdAt).toDateString() !== new Date(dateFilter).toDateString())
        return false;
      if (!q) return true;
      return (
        (r.user?.name ?? '').toLowerCase().includes(q) ||
        (r.level?.type ?? '').toLowerCase().includes(q) ||
        levelLabel(r.level?.type).toLowerCase().includes(q)
      );
    });
  }, [results, searchTerm, dateFilter, levelFilter]);

  // Foydalanuvchi ID bo'yicha guruhlash (bir xil ismli odamlar aralashib ketmasin)
  const groups: UserGroup[] = useMemo(() => {
    const map = new Map<string, TestResult[]>();
    filteredResults.forEach((r) => {
      const arr = map.get(r.userId) ?? [];
      arr.push(r);
      map.set(r.userId, arr);
    });
    return [...map.entries()]
      .map(([id, items]) => {
        const sortedItems = [...items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        const c = items.reduce((s, r) => s + r.correctCount, 0);
        const w = items.reduce((s, r) => s + r.wrongCount, 0);
        return {
          id,
          name: items.find((r) => r.user?.name)?.user?.name ?? "Noma'lum foydalanuvchi",
          items: sortedItems,
          avg: pct(c, w),
          best: Math.max(...items.map((r) => pct(r.correctCount, r.wrongCount))),
          latest: new Date(sortedItems[0].createdAt).getTime(),
        };
      })
      .sort((a, b) => b.latest - a.latest);
  }, [filteredResults]);

  // Natijalar taqsimoti (filtr bo'yicha)
  const dist = useMemo(() => {
    const d = { high: 0, mid: 0, low: 0 };
    filteredResults.forEach((r) => {
      const p = pct(r.correctCount, r.wrongCount);
      if (p >= 80) d.high++;
      else if (p >= 60) d.mid++;
      else d.low++;
    });
    return d;
  }, [filteredResults]);

  const knownUsers = useMemo(() => {
    const m = new Map<string, string>();
    results.forEach((r) => {
      if (!m.has(r.userId)) m.set(r.userId, r.user?.name ?? '');
    });
    return [...m.entries()];
  }, [results]);

  const matchedUserName = knownUsers.find(([id]) => id === userId.trim())?.[1];
  const formC = Number(correct) || 0;
  const formW = Number(wrong) || 0;
  const formPct = pct(formC, formW);

  const hasFilters = !!(searchTerm || dateFilter || levelFilter);
  const allCollapsed = groups.length > 0 && groups.every((g) => collapsed.has(g.id));

  const toggleGroup = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const statCards = [
    { label: 'Jami natijalar', value: results.length, icon: BarChart3, box: 'bg-indigo-100 text-indigo-600', bar: 'from-indigo-500 to-violet-500' },
    { label: 'Foydalanuvchilar', value: totalUsers, icon: Users, box: 'bg-sky-100 text-sky-600', bar: 'from-sky-400 to-blue-500' },
    { label: "O'rtacha ball", value: `${averageScore}%`, icon: TrendingUp, box: 'bg-violet-100 text-violet-600', bar: 'from-violet-400 to-purple-500' },
    { label: "To'g'ri javoblar", value: totalCorrect, icon: Award, box: 'bg-emerald-100 text-emerald-600', bar: 'from-emerald-400 to-green-500' },
  ];

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
      <AdminLayout />

      <main className="mx-auto max-w-7xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
              Test natijalari
            </h1>
            <p className="mt-1 text-slate-500">Barcha test natijalarini ko&apos;rish va boshqarish</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchResults(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Yangilash
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl active:scale-[0.98]"
            >
              <Plus size={20} />
              Natija qo&apos;shish
            </button>
          </div>
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

        {/* Filtrlar */}
        <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Ism yoki daraja bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputCls} pl-10 pr-9`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="Tozalash"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              aria-label="Daraja bo'yicha filtr"
              className={`${inputCls} lg:w-48`}
            >
              <option value="">Barcha darajalar</option>
              {levelOptions.map((t) => (
                <option key={t} value={t}>
                  {levelLabel(t)}
                </option>
              ))}
            </select>

            <div className="relative lg:w-52">
              <Calendar
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                aria-label="Sana bo'yicha filtr"
                className={`${inputCls} pl-10`}
              />
            </div>

            {hasFilters && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                  setLevelFilter('');
                }}
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                Tozalash
              </button>
            )}
          </div>

          {/* Taqsimot */}
          {!loading && filteredResults.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {filteredResults.length} / {results.length} natija
                </span>
                <span className="flex gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> 80%+ ({dist.high})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> 60–79% ({dist.mid})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> &lt;60% ({dist.low})
                  </span>
                </span>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(dist.high / filteredResults.length) * 100}%` }} />
                <div className="bg-amber-500 transition-all duration-500" style={{ width: `${(dist.mid / filteredResults.length) * 100}%` }} />
                <div className="bg-rose-500 transition-all duration-500" style={{ width: `${(dist.low / filteredResults.length) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Ro'yxat */}
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-200/70 bg-white p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-slate-200" />
                    <div className="h-3 w-20 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="h-10 rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <XCircle className="text-red-500" size={28} />
            </div>
            <p className="mb-1 text-lg font-semibold text-slate-800">Yuklab bo&apos;lmadi</p>
            <p className="mb-5 text-sm text-red-600">{loadError}</p>
            <button
              onClick={() => fetchResults()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={16} />
              Qayta urinish
            </button>
          </div>
        ) : groups.length > 0 ? (
          <>
            <div className="mb-3 flex justify-end">
              <button
                onClick={() =>
                  setCollapsed(allCollapsed ? new Set() : new Set(groups.map((g) => g.id)))
                }
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                {allCollapsed ? 'Hammasini ochish' : 'Hammasini yig‘ish'}
              </button>
            </div>

            <div className="space-y-4">
              {groups.map((group) => {
                const isCollapsed = collapsed.has(group.id);
                const gs = scoreStyle(group.avg);
                return (
                  <div
                    key={group.id}
                    className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm"
                  >
                    {/* Foydalanuvchi sarlavhasi */}
                    <button
                      onClick={() => toggleGroup(group.id)}
                      aria-expanded={!isCollapsed}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50/60"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100">
                          <User className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-800">{group.name}</h3>
                          <p className="text-xs text-slate-500">{group.items.length} ta test</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="hidden text-right sm:block">
                          <p className="text-xs text-slate-400">Eng yaxshi</p>
                          <p className="text-sm font-bold text-slate-700">{group.best}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">O&apos;rtacha</p>
                          <p className={`text-lg font-bold ${gs.text}`}>{group.avg}%</p>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-slate-400 transition-transform duration-200 ${
                            isCollapsed ? '-rotate-90' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Natijalar */}
                    {!isCollapsed && (
                      <div className="border-t border-slate-100">
                        <div className="hidden grid-cols-[1.2fr_2fr_1fr_auto] gap-4 bg-slate-50/70 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 md:grid">
                          <span>Daraja</span>
                          <span>Ball</span>
                          <span>Sana</span>
                          <span className="w-[76px] text-right">Amallar</span>
                        </div>

                        <div className="divide-y divide-slate-50">
                          {group.items.map((result) => {
                            const p = pct(result.correctCount, result.wrongCount);
                            const st = scoreStyle(p);
                            return (
                              <div
                                key={result.id}
                                className="grid grid-cols-1 items-center gap-3 px-5 py-4 transition hover:bg-slate-50/60 md:grid-cols-[1.2fr_2fr_1fr_auto] md:gap-4"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                                    <Target className="h-4 w-4 text-violet-600" />
                                  </div>
                                  <span className="text-sm font-semibold text-slate-800">
                                    {levelLabel(result.level?.type)}
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">
                                      <span className="font-semibold text-emerald-600">
                                        {result.correctCount}
                                      </span>{' '}
                                      to&apos;g&apos;ri ·{' '}
                                      <span className="font-semibold text-rose-500">
                                        {result.wrongCount}
                                      </span>{' '}
                                      noto&apos;g&apos;ri
                                    </span>
                                    <span className={`rounded-full px-2 py-0.5 font-bold ${st.badge}`}>
                                      {p}%
                                    </span>
                                  </div>
                                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${st.bar}`}
                                      style={{ width: `${p}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="text-sm text-slate-500">
                                  {formatDate(result.createdAt)}
                                </div>

                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => openEdit(result)}
                                    title="Tahrirlash"
                                    aria-label="Tahrirlash"
                                    className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget(result)}
                                    title="O'chirish"
                                    aria-label="O'chirish"
                                    className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
              <BarChart3 className="h-8 w-8 text-indigo-300" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-slate-700">Natija topilmadi</h3>
            <p className="mb-5 text-sm text-slate-500">
              {hasFilters
                ? "Qidiruv shartlariga mos natija yo'q"
                : "Birinchi test natijasini qo'shing"}
            </p>
            {!hasFilters && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
              >
                <Plus size={18} />
                Natija qo&apos;shish
              </button>
            )}
          </div>
        )}
      </main>

      {/* ───────────── Qo'shish / tahrirlash modali ───────────── */}
      {showForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) closeForm();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="my-8 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25">
                  {editingId ? (
                    <Edit className="h-5 w-5 text-white" />
                  ) : (
                    <Plus className="h-5 w-5 text-white" />
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId ? 'Natijani tahrirlash' : "Yangi natija qo'shish"}
                </h2>
              </div>
              <button
                onClick={closeForm}
                disabled={isSubmitting}
                aria-label="Yopish"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">User ID *</label>
                <input
                  type="text"
                  list="known-users"
                  placeholder="Foydalanuvchi ID sini kiriting"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className={inputCls}
                />
                <datalist id="known-users">
                  {knownUsers.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </datalist>
                {matchedUserName && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <CheckCircle size={13} /> {matchedUserName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Daraja *</label>
                {levels.length > 0 ? (
                  <select
                    value={levelId}
                    onChange={(e) => setLevelId(e.target.value)}
                    className={inputCls}
                  >
                    {!levels.some((l) => l.id === levelId) && (
                      <option value={levelId}>{levelId ? `ID: ${levelId}` : 'Darajani tanlang'}</option>
                    )}
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {levelLabel(l.type)} ({l.type})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Level ID sini kiriting"
                    value={levelId}
                    onChange={(e) => setLevelId(e.target.value)}
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

              {formC + formW > 0 && (
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="mb-1.5 flex justify-between text-sm text-slate-600">
                    <span>Ball (ko&apos;rinish)</span>
                    <span className={`font-bold ${scoreStyle(formPct).text}`}>{formPct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${scoreStyle(formPct).bar}`}
                      style={{ width: `${formPct}%` }}
                    />
                  </div>
                </div>
              )}

              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3"
                >
                  <XCircle className="mt-0.5 shrink-0 text-red-500" size={18} />
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
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
                  {isSubmitting ? 'Saqlanmoqda...' : editingId ? 'Yangilash' : "Qo'shish"}
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
            <h3 className="mb-1 text-lg font-bold text-slate-800">Natijani o&apos;chirasizmi?</h3>
            <p className="mb-6 text-sm text-slate-500">
              <span className="font-medium text-slate-700">
                {deleteTarget.user?.name ?? "Noma'lum foydalanuvchi"}
              </span>{' '}
              · {levelLabel(deleteTarget.level?.type)} ·{' '}
              {pct(deleteTarget.correctCount, deleteTarget.wrongCount)}%
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