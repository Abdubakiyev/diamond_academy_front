'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { GraduationCap, Search, Users } from 'lucide-react';
import AdminShell from '../../../../components/admin/AdminShell';
import Segmented from '../../../../components/admin/Segmented';
import Spinner from '../../../../components/ui/Spinner';
import EmptyState from '../../../../components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';
import { useBulkCenterStudents, useCenterStudents, useSetCenterStudent } from '../../../../features/hooks/useExamPayment';
import { useDebounce } from '../../../../features/hooks/useDebounce';
import { handleApiError } from '../../../../features/api/api';
import { cn } from '../../../../lib/format';

const LIMIT = 20;
type Filter = 'ALL' | 'YES' | 'NO';

export default function AdminCenterStudentsPage() {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const debounced = useDebounce(search);

  const { data, isLoading, isError, error } = useCenterStudents({
    search: debounced.trim() || undefined,
    isCenterStudent: filter === 'ALL' ? undefined : filter === 'YES',
    page,
    limit: LIMIT,
  });
  const set = useSetCenterStudent();
  const bulk = useBulkCenterStudents();

  const toggleSel = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const pageIds = data?.items.map((u) => u.id) ?? [];
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const runBulk = (value: boolean) =>
    bulk.mutate(
      { userIds: [...selected], value },
      {
        onSuccess: (r) => {
          toast.success(`${r.updated} ta foydalanuvchi yangilandi`);
          setSelected(new Set());
        },
        onError: (e) => toast.error(handleApiError(e)),
      },
    );

  return (
    <AdminShell title="Markaz talabalari" subtitle="Belgilanganlar uchun barcha imtihonlar bepul">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setPage(1);
            setSelected(new Set());
          }}
          options={[
            { value: 'ALL', label: 'Hammasi' },
            { value: 'YES', label: 'Markaz talabasi' },
            { value: 'NO', label: 'Boshqalar' },
          ]}
        />
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Ism yoki telefon..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="da-fade-up mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-indigo-600 px-4 py-3 text-white shadow-lg">
          <span className="text-sm font-medium">{selected.size} ta tanlandi</span>
          <div className="flex gap-2">
            <button disabled={bulk.isPending} onClick={() => runBulk(true)} className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60">
              Markaz talabasi qilish
            </button>
            <button disabled={bulk.isPending} onClick={() => runBulk(false)} className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold hover:bg-white/25 disabled:opacity-60">
              Belgini olib tashlash
            </button>
            <button onClick={() => setSelected(new Set())} className="rounded-lg px-3 py-1.5 text-sm hover:bg-white/10">
              Bekor
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : isError || !data ? (
        <EmptyState title="Ro‘yxatni yuklab bo‘lmadi" description={handleApiError(error)} />
      ) : data.items.length === 0 ? (
        <EmptyState icon={Users} title="Foydalanuvchi topilmadi" description="Qidiruv yoki filtrni o‘zgartiring." />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <input
                type="checkbox"
                checked={allOnPage}
                onChange={() => setSelected((s) => (allOnPage ? new Set([...s].filter((id) => !pageIds.includes(id))) : new Set([...s, ...pageIds])))}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                aria-label="Sahifadagi hammasini tanlash"
              />
              Foydalanuvchi
            </div>
            <ul className="divide-y divide-gray-50">
              {data.items.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(u.id)}
                    onChange={() => toggleSel(u.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    aria-label={`${u.name} ni tanlash`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.phone}</p>
                  </div>
                  {u.isCenterStudent && (
                    <span className="hidden items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 sm:inline-flex">
                      <GraduationCap className="h-3.5 w-3.5" /> Markaz
                    </span>
                  )}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={u.isCenterStudent}
                    aria-label={`${u.name}: markaz talabasi`}
                    disabled={set.isPending && set.variables?.userId === u.id}
                    onClick={() =>
                      set.mutate(
                        { userId: u.id, value: !u.isCenterStudent },
                        { onError: (e) => toast.error(handleApiError(e)) },
                      )
                    }
                    className={cn('relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-60', u.isCenterStudent ? 'bg-indigo-600' : 'bg-gray-300')}
                  >
                    <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', u.isCenterStudent ? 'left-[1.375rem]' : 'left-0.5')} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <Pagination page={page} limit={LIMIT} total={data.total} onChange={setPage} />
          </div>
        </>
      )}
    </AdminShell>
  );
}
