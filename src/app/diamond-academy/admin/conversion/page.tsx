'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, ClipboardPaste, Loader2, Plus, Save, Sparkles, Trash2, X } from 'lucide-react';
import AdminShell from '../../../../components/admin/AdminShell';
import Segmented from '../../../../components/admin/Segmented';
import Spinner from '../../../../components/ui/Spinner';
import EmptyState from '../../../../components/ui/EmptyState';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import { inputCls } from '../../../../components/admin/QuestionEditor';
import { useExams } from '../../../../features/hooks/useExam';
import { useMe } from '../../../../features/hooks/useAuth';
import { useConversion, useDeleteConversion, useGenerateLinear, useSetConversion } from '../../../../features/hooks/useScoring';
import { handleApiError } from '../../../../features/api/api';
import { SKILL_META } from '../../../../lib/exam-rules';
import type { ConversionRow, ConversionScope, ConversionTable, ConvertibleSkill } from '../../../../features/types/scoring';

interface Row {
  raw: string;
  scaled: string;
}

const toRows = (t: ConversionTable): Row[] => t.rows.map((r) => ({ raw: String(r.rawScore), scaled: String(r.scaledScore) }));

function validate(rows: Row[]): { ok: true; rows: ConversionRow[]; warn: string | null } | { ok: false; error: string } {
  const out: ConversionRow[] = [];
  for (const [i, r] of rows.entries()) {
    const raw = Number(r.raw);
    const scaled = Number(r.scaled);
    if (r.raw.trim() === '' || !Number.isInteger(raw) || raw < 0 || raw > 200) return { ok: false, error: `${i + 1}-qator: raw 0–200 oralig‘ida butun son bo‘lishi kerak` };
    if (r.scaled.trim() === '' || Number.isNaN(scaled) || scaled < 0 || scaled > 75) return { ok: false, error: `${i + 1}-qator: ball 0–75 oralig‘ida bo‘lishi kerak` };
    if (Math.abs(scaled * 10 - Math.round(scaled * 10)) > 1e-9) return { ok: false, error: `${i + 1}-qator: ballda ko‘pi bilan 1 ta kasr raqam` };
    out.push({ rawScore: raw, scaledScore: scaled });
  }
  if (out.length < 2) return { ok: false, error: 'Kamida 2 ta qator kerak' };
  if (new Set(out.map((r) => r.rawScore)).size !== out.length) return { ok: false, error: 'Bir xil raw ball takrorlangan' };
  out.sort((a, b) => a.rawScore - b.rawScore);
  const decreasing = out.some((r, i) => i > 0 && r.scaledScore < out[i - 1].scaledScore);
  return { ok: true, rows: out, warn: decreasing ? 'Diqqat: raw oshganda ball kamayadigan joy bor. Tekshirib ko‘ring.' : null };
}

function Editor({ table, scope, canEdit }: { table: ConversionTable; scope: ConversionScope; canEdit: boolean }) {
  const [rows, setRows] = useState<Row[]>(() => toRows(table));
  const [maxRaw, setMaxRaw] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = useSetConversion();
  const gen = useGenerateLinear();
  const del = useDeleteConversion();
  const busy = set.isPending || gen.isPending || del.isPending;

  const setRow = (i: number, p: Partial<Row>) => setRows((r) => r.map((x, k) => (k === i ? { ...x, ...p } : x)));

  const save = () => {
    const v = validate(rows);
    if (!v.ok) return toast.error(v.error);
    if (v.warn) toast.warning(v.warn);
    set.mutate(
      { ...scope, rows: v.rows },
      { onSuccess: () => toast.success('Jadval saqlandi'), onError: (e) => toast.error(handleApiError(e)) },
    );
  };

  const generate = () => {
    const n = maxRaw.trim() ? Number(maxRaw) : undefined;
    if (n !== undefined && (!Number.isInteger(n) || n < 1 || n > 200)) return toast.error('Maksimal raw 1–200 oralig‘ida butun son');
    gen.mutate(
      { ...scope, maxRaw: n },
      { onSuccess: () => toast.success('Chiziqli jadval yaratildi'), onError: (e) => toast.error(handleApiError(e)) },
    );
  };

  const runImport = () => {
    const parsed: Row[] = [];
    for (const line of importText.split('\n')) {
      const parts = line.trim().split(/[\s,;\t]+/).filter(Boolean);
      if (parts.length === 0) continue;
      if (parts.length < 2) return toast.error(`"${line.trim()}" qatorida 2 ta son bo‘lishi kerak`);
      parsed.push({ raw: parts[0], scaled: parts[1].replace(',', '.') });
    }
    if (parsed.length === 0) return toast.error('Matn bo‘sh');
    setRows(parsed);
    setShowImport(false);
    setImportText('');
    toast.success(`${parsed.length} ta qator yuklandi. Saqlashni unutmang.`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {/* Jadval */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900">
            Raw → 0–75 jadvali <span className="ml-1 text-xs font-normal text-gray-400">({rows.length} qator)</span>
          </h3>
          {canEdit && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setShowImport((v) => !v)} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-medium text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50">
                <ClipboardPaste className="h-4 w-4" /> Matndan yuklash
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={save}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
              >
                {set.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Saqlash
              </button>
            </div>
          )}
        </div>

        {showImport && (
          <div className="mb-4 space-y-2 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100">
            <p className="text-xs text-gray-500">Har qatorda ikki son: <b>raw</b> va <b>ball</b> (bo‘sh joy, vergul yoki tab bilan). Excel / Rasch jadvalidan nusxalab qo‘ysa bo‘ladi.</p>
            <textarea rows={6} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={'0  0\n1  3.5\n2  7'} className={`${inputCls} font-mono text-[13px]`} />
            <div className="flex gap-2">
              <button type="button" onClick={runImport} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">Yuklash</button>
              <button type="button" onClick={() => setShowImport(false)} className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100">Bekor qilish</button>
            </div>
          </div>
        )}

        {rows.length === 0 ? (
          <EmptyState
            title="Jadval kiritilmagan"
            description={scope.examId ? 'Bu imtihon uchun alohida jadval yo‘q: umumiy jadval yoki chiziqli hisob ishlatiladi.' : 'Umumiy jadval yo‘q: ballar chiziqli (raw / max × 75) hisoblanadi.'}
          />
        ) : (
          <div className="max-h-[32rem] overflow-y-auto rounded-xl ring-1 ring-gray-100">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-24 px-3 py-2">Raw</th>
                  <th className="w-28 px-3 py-2">Ball (0–75)</th>
                  <th className="px-3 py-2">Ko‘rinish</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((r, i) => {
                  const pct = Math.max(0, Math.min(100, (Number(r.scaled) / 75) * 100)) || 0;
                  return (
                    <tr key={i}>
                      <td className="px-3 py-1.5">
                        <input type="number" min={0} max={200} value={r.raw} disabled={!canEdit} onChange={(e) => setRow(i, { raw: e.target.value })} className={`${inputCls} !py-1.5`} />
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" min={0} max={75} step="0.1" value={r.scaled} disabled={!canEdit} onChange={(e) => setRow(i, { scaled: e.target.value })} className={`${inputCls} !py-1.5`} />
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-1">
                        {canEdit && (
                          <button type="button" onClick={() => setRows((x) => x.filter((_, k) => k !== i))} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="Qatorni o‘chirish">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {canEdit && (
          <button
            type="button"
            onClick={() => {
              const last = rows.length ? Number(rows[rows.length - 1].raw) : -1;
              setRows((r) => [...r, { raw: String(Number.isFinite(last) ? last + 1 : r.length), scaled: '' }]);
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <Plus className="h-4 w-4" /> Qator qo‘shish
          </button>
        )}
      </section>

      {/* Yon panel */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h4 className="flex items-center gap-1.5 font-semibold text-gray-900">
            <Sparkles className="h-4 w-4 text-indigo-500" /> Chiziqli jadval
          </h4>
          <p className="mt-1 text-xs text-gray-500">ball = raw / maxRaw × 75. Rasmiy jadval kelguncha vaqtincha ishlatiladi.</p>
          <div className="mt-3">
            <input type="number" min={1} max={200} value={maxRaw} disabled={!canEdit} onChange={(e) => setMaxRaw(e.target.value)} placeholder={scope.examId ? 'Max raw (bo‘sh = savollardan)' : 'Max raw, masalan 35'} className={inputCls} />
          </div>
          <button
            type="button"
            disabled={!canEdit || busy}
            onClick={generate}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
          >
            {gen.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Yaratish
          </button>
          <p className="mt-2 text-xs text-amber-700">Mavjud jadval almashtiriladi.</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h4 className="font-semibold text-gray-900">Jadvalni o‘chirish</h4>
          <p className="mt-1 text-xs text-gray-500">
            {scope.examId ? 'Keyin umumiy jadval (yoki chiziqli hisob) ishlatiladi.' : 'Keyin barcha imtihonlar chiziqli hisobga o‘tadi.'}
          </p>
          <button
            type="button"
            disabled={!canEdit || busy || table.rows.length === 0}
            onClick={() => setConfirmDelete(true)}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> O‘chirish
          </button>
        </div>

        <div className="flex gap-2 rounded-2xl bg-sky-50 p-4 text-xs leading-relaxed text-sky-900 ring-1 ring-sky-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Writing va Speaking AI orqali to‘g‘ridan-to‘g‘ri 0–75 oladi, shuning uchun ular uchun jadval kerak emas. Imtihonning o‘z jadvali bo‘lsa, u umumiy jadvaldan ustun turadi.</p>
        </div>
      </aside>

      <ConfirmModal
        open={confirmDelete}
        title="Jadval o‘chirilsinmi?"
        message="Bu amalni qaytarib bo‘lmaydi."
        confirmLabel="Ha, o‘chirish"
        isPending={del.isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          del.mutate(scope, {
            onSuccess: () => {
              toast.success('Jadval o‘chirildi');
              setConfirmDelete(false);
            },
            onError: (e) => toast.error(handleApiError(e)),
          })
        }
      />
    </div>
  );
}

export default function AdminConversionPage() {
  const { data: me } = useMe();
  const [skill, setSkill] = useState<ConvertibleSkill>('LISTENING');
  const [examId, setExamId] = useState('');
  const { data: exams } = useExams({ limit: 50 });

  const scope: ConversionScope = { examId: examId || undefined, skill };
  const { data, isLoading, isError, error, dataUpdatedAt } = useConversion(scope);
  // Umumiy jadvalni faqat ADMIN o'zgartiradi, imtihonniki — admin va o'qituvchi
  const canEdit = examId ? true : me?.role === 'ADMIN';

  return (
    <AdminShell title="Konversiya jadvali" subtitle="Listening / Reading: to‘g‘ri javoblar soni → 0–75 ball">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented
          value={skill}
          onChange={setSkill}
          options={(['LISTENING', 'READING'] as const).map((s) => ({ value: s, label: SKILL_META[s].label }))}
        />
        <select value={examId} onChange={(e) => setExamId(e.target.value)} className={`${inputCls} !w-auto min-w-64`} aria-label="Jadval doirasi">
          <option value="">Umumiy jadval (barcha imtihonlar)</option>
          {exams?.items.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
        {!canEdit && <span className="text-xs text-amber-700">Umumiy jadvalni faqat admin o‘zgartira oladi</span>}
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError || !data ? (
        <EmptyState title="Jadvalni yuklab bo‘lmadi" description={handleApiError(error)} />
      ) : (
        <Editor key={`${examId}-${skill}-${dataUpdatedAt}`} table={data} scope={scope} canEdit={canEdit} />
      )}
    </AdminShell>
  );
}
