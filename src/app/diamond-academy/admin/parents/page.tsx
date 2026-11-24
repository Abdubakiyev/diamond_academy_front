"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import api from "@/lib/api"; // <- o'zingizdagi axios instance'ga moslang

type Status = "PENDING" | "APPROVED" | "REJECTED";

interface Req {
  id: number | string;
  status: Status;
  createdAt: string;
  parent?: { name?: string; phone?: string };
  student?: { name?: string; group?: { name?: string } | null };
}

const TABS: { key: Status; label: string }[] = [
  { key: "PENDING", label: "Kutilayotgan" },
  { key: "APPROVED", label: "Tasdiqlangan" },
  { key: "REJECTED", label: "Rad etilgan" },
];

export default function AdminParentsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Status>("PENDING");

  const q = useQuery({
    queryKey: ["parent-requests", tab],
    queryFn: async () =>
      (await api.get<Req[]>("/parent/admin/requests", { params: { status: tab } })).data,
  });

  const act = useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: "APPROVED" | "REJECTED" }) =>
      api.patch(`/parent/admin/requests/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parent-requests"] }),
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Ota-onalar so&apos;rovlari</h1>

      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              tab === t.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {q.isLoading && <p className="text-gray-500">Yuklanmoqda...</p>}
      {q.data?.length === 0 && <p className="text-gray-500">So&apos;rov yo&apos;q</p>}

      <ul className="space-y-3">
        {q.data?.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4">
            <div>
              <p className="font-semibold">
                {r.parent?.name ?? "Ota-ona"}{" "}
                <span className="text-sm font-normal text-gray-500">{r.parent?.phone}</span>
              </p>
              <p className="text-sm text-gray-600">
                O&apos;quvchi: <b>{r.student?.name}</b>
                {r.student?.group?.name && ` · ${r.student.group.name}`}
              </p>
            </div>
            {r.status === "PENDING" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => act.mutate({ id: r.id, status: "APPROVED" })}
                  disabled={act.isPending}
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  <Check className="h-4 w-4" /> Tasdiqlash
                </button>
                <button
                  onClick={() => act.mutate({ id: r.id, status: "REJECTED" })}
                  disabled={act.isPending}
                  className="flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  <X className="h-4 w-4" /> Rad etish
                </button>
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-500">{r.status}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
