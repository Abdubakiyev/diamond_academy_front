"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CheckCircle,
  Clock,
  Phone,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import AdminHeader from "@/components/AdminLayout";
import { apiClient } from "@/features/api/client";

type Status = "PENDING" | "APPROVED" | "REJECTED";

interface Req {
  id: number | string;
  status: Status;
  createdAt: string;
  parent?: { name?: string; phone?: string };
  student?: { name?: string; group?: { name?: string } | null };
}

type ToastState = { type: "success" | "error"; text: string } | null;

const TABS: {
  key: Status;
  label: string;
  icon: typeof Clock;
  box: string;
  num: string;
  bar: string;
}[] = [
  { key: "PENDING", label: "Kutilayotgan", icon: Clock, box: "bg-amber-100 text-amber-600", num: "text-amber-600", bar: "from-amber-400 to-orange-500" },
  { key: "APPROVED", label: "Tasdiqlangan", icon: CheckCircle, box: "bg-emerald-100 text-emerald-600", num: "text-emerald-600", bar: "from-emerald-400 to-green-500" },
  { key: "REJECTED", label: "Rad etilgan", icon: XCircle, box: "bg-rose-100 text-rose-600", num: "text-rose-600", bar: "from-rose-400 to-red-500" },
];

const STATUS_BADGE: Record<Status, { cls: string; dot: string; text: string }> = {
  PENDING: { cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500", text: "Kutilmoqda" },
  APPROVED: { cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", text: "Tasdiqlangan" },
  REJECTED: { cls: "bg-rose-50 text-rose-700", dot: "bg-rose-500", text: "Rad etilgan" },
};

const initial = (name?: string) => (name?.trim().charAt(0) || "?").toUpperCase();

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });
};

const fetchRequests = async (status: Status) =>
  (await apiClient.get<Req[]>("/parent/admin/requests", { params: { status } })).data;

export default function AdminParentsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Status>("PENDING");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [busyId, setBusyId] = useState<string | number | null>(null);

  // Har bir holat uchun alohida so'rov: tablardagi sonlar shundan olinadi
  const pending = useQuery({ queryKey: ["parent-requests", "PENDING"], queryFn: () => fetchRequests("PENDING") });
  const approved = useQuery({ queryKey: ["parent-requests", "APPROVED"], queryFn: () => fetchRequests("APPROVED") });
  const rejected = useQuery({ queryKey: ["parent-requests", "REJECTED"], queryFn: () => fetchRequests("REJECTED") });
  const queries = { PENDING: pending, APPROVED: approved, REJECTED: rejected };
  const current = queries[tab];

  const act = useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: "APPROVED" | "REJECTED" }) =>
      apiClient.patch(`/parent/admin/requests/${id}`, { status }),
    onMutate: ({ id }) => setBusyId(id),
    onSuccess: (_d, { status }) => {
      qc.invalidateQueries({ queryKey: ["parent-requests"] });
      setToast({
        type: "success",
        text: status === "APPROVED" ? "So'rov tasdiqlandi" : "So'rov rad etildi",
      });
    },
    onError: () => setToast({ type: "error", text: "Xatolik yuz berdi, qayta urinib ko'ring" }),
    onSettled: () => setBusyId(null),
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = current.data ?? [];
    if (!q) return list;
    return list.filter((r) =>
      [r.parent?.name, r.parent?.phone, r.student?.name, r.student?.group?.name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [current.data, search]);

  const count = (s: Status) => queries[s].data?.length ?? 0;

  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          {/* Sarlavha */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <UserCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
                Ota-onalar
              </h1>
              <p className="text-slate-500">Ota-onalarning o&apos;quvchiga ulanish so&apos;rovlari</p>
            </div>
          </div>

          {/* Statistika kartalari */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                  tab === t.key ? "border-indigo-300 ring-2 ring-indigo-500/20" : "border-slate-200/70"
                }`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${t.bar}`} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{t.label}</p>
                    <p className={`mt-1 text-3xl font-bold tabular-nums ${t.num}`}>{count(t.key)}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${t.box}`}>
                    <t.icon size={22} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Qidiruv va tablar */}
          <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ota-ona, telefon, o'quvchi yoki guruh bo'yicha qidirish..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Tozalash"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5 rounded-xl bg-slate-100/70 p-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                    tab === t.key ? "bg-white text-indigo-600 shadow" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      tab === t.key ? "bg-indigo-50 text-indigo-600" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {count(t.key)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Ro'yxat */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            {current.isLoading ? (
              <div className="divide-y divide-slate-50">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex animate-pulse items-center gap-4 px-6 py-5">
                    <div className="h-11 w-11 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-48 rounded bg-slate-200" />
                      <div className="h-3 w-32 rounded bg-slate-100" />
                    </div>
                    <div className="h-9 w-28 rounded-xl bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : current.isError ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
                  <XCircle className="text-rose-400" size={28} />
                </div>
                <p className="font-semibold text-slate-700">So&apos;rovlarni yuklab bo&apos;lmadi</p>
                <button
                  type="button"
                  onClick={() => current.refetch()}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline"
                >
                  <RefreshCw size={14} /> Qayta urinish
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                  <Users className="text-indigo-300" size={32} />
                </div>
                <p className="font-semibold text-slate-700">
                  {search ? "Hech narsa topilmadi" : "Bu bo'limda so'rov yo'q"}
                </p>
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    Qidiruvni tozalash
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {filtered.map((r) => {
                  const badge = STATUS_BADGE[r.status];
                  const busy = busyId === r.id;
                  return (
                    <li
                      key={r.id}
                      className="flex flex-col gap-4 px-4 py-4 transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-base font-bold text-indigo-600">
                          {initial(r.parent?.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {r.parent?.name ?? "Ota-ona"}
                          </p>
                          {r.parent?.phone && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                              <Phone size={12} /> {r.parent.phone}
                            </p>
                          )}
                          <p className="mt-1 text-sm text-slate-600">
                            O&apos;quvchi: <b className="font-semibold text-slate-800">{r.student?.name ?? "-"}</b>
                            {r.student?.group?.name && (
                              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                {r.student.group.name}
                              </span>
                            )}
                          </p>
                          {r.createdAt && (
                            <p className="mt-0.5 text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                          )}
                        </div>
                      </div>

                      {r.status === "PENDING" ? (
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => act.mutate({ id: r.id, status: "APPROVED" })}
                            disabled={act.isPending}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:brightness-105 active:scale-95 disabled:opacity-60"
                          >
                            {busy ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                            Tasdiqlash
                          </button>
                          <button
                            type="button"
                            onClick={() => act.mutate({ id: r.id, status: "REJECTED" })}
                            disabled={act.isPending}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 active:scale-95 disabled:opacity-60"
                          >
                            <X size={16} /> Rad etish
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-center ${badge.cls}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                          {badge.text}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {filtered.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-3 text-sm text-slate-500">
                Ko&apos;rsatilmoqda: <span className="font-semibold text-slate-700">{filtered.length}</span> ta
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
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
              type="button"
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
