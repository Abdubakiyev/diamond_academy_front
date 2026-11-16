'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquareQuote,
  RotateCcw,
  Send,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import PageShell from '../../../components/PageShell';
import EmptyState from '../../../components/ui/EmptyState';
import FileDropzone, { type UploadItem } from '../../../components/ui/FileDropzone';
import SubmissionStatusBadge from '../../../components/SubmissionStatus';
import { useAssignment, useSubmitAssignment } from '../../../features/hooks/useAssignment';
import { getErrorStatus, handleApiError } from '../../../features/api/api';
import { isStaffAssignment, type StudentAssignment, type Submission } from '../../../features/types/assignment';
import { cn, formatDateTime, formatFileSize, timeLeft } from '../../../lib/format';

const SUBMISSION_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const TEXT_MAX = 20000;

/* ───────── Ball halqasi ───────── */
function ScoreRing({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (score / max) * 100) : 0;
  const r = 42;
  const c = 2 * Math.PI * r;
  const tone = pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-indigo-500' : 'text-amber-500';
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-gray-100" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          className={cn('stroke-current transition-all duration-1000', tone)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums text-gray-900">{score}</span>
        <span className="text-xs text-gray-400">/ {max}</span>
      </div>
    </div>
  );
}

/* ───────── Topshirilgan fayllar ───────── */
function SubmittedFiles({ submission }: { submission: Submission }) {
  if (submission.files.length === 0) return null;
  const isImage = (f: Submission['files'][number]) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(f.fileName ?? f.url);
  return (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {submission.files.map((f) => (
        <li key={f.id}>
          <a
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400">
              {isImage(f) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-gray-800">{f.fileName ?? 'Fayl'}</span>
              {f.sizeBytes ? <span className="text-xs text-gray-400">{formatFileSize(f.sizeBytes)}</span> : null}
            </span>
            <ExternalLink className="h-4 w-4 text-gray-300 transition group-hover:text-indigo-500" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ───────── Holat bloki ───────── */
function ResultPanel({ a, s }: { a: StudentAssignment; s: Submission }) {
  return (
    <section className="da-fade-up rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900">Sizning ishingiz</h2>
        <SubmissionStatusBadge status={s.status} />
      </div>

      {s.status === 'GRADED' && s.score != null && (
        <div className="mt-4 flex flex-col items-center gap-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-indigo-50 p-5 sm:flex-row">
          <ScoreRing score={s.score} max={a.maxScore} />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 sm:justify-start">
              <ShieldCheck className="h-4 w-4" /> Ish baholandi
            </p>
            {s.gradedAt && <p className="mt-0.5 text-xs text-gray-500">{formatDateTime(s.gradedAt)}</p>}
            <p className="mt-2 text-xs text-gray-500">Baholangan ishni qayta topshirib bo‘lmaydi.</p>
          </div>
        </div>
      )}

      {s.status === 'RETURNED' && (
        <div className="mt-4 flex gap-3 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
          <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">O‘qituvchi ishni qayta ishlash uchun qaytardi</p>
            <p className="mt-0.5 text-xs text-amber-700/80">Izohni o‘qing va quyidagi forma orqali qayta yuboring.</p>
          </div>
        </div>
      )}

      {s.status === 'SUBMITTED' && (
        <p className="mt-4 rounded-xl bg-sky-50 p-4 text-sm text-sky-800 ring-1 ring-sky-100">
          Ishingiz topshirildi va tekshirilishini kutmoqda. Baholanguncha uni o‘zgartirib, qayta yuborishingiz mumkin.
        </p>
      )}

      {s.feedback && (
        <figure className="mt-4 rounded-xl border-l-4 border-indigo-400 bg-indigo-50/60 p-4">
          <figcaption className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            <MessageSquareQuote className="h-3.5 w-3.5" /> O‘qituvchi izohi
          </figcaption>
          <blockquote className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">{s.feedback}</blockquote>
        </figure>
      )}

      <div className="mt-5 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400">Topshirilgan: {formatDateTime(s.submittedAt)}</p>
        {s.text && (
          <div className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
            {s.text}
          </div>
        )}
        <SubmittedFiles submission={s} />
      </div>
    </section>
  );
}

/* ───────── Topshirish formasi ───────── */
function SubmitForm({ a, existing }: { a: StudentAssignment; existing: Submission | null }) {
  const submit = useSubmitAssignment(a.id);
  const [text, setText] = useState(existing?.text ?? '');
  const [items, setItems] = useState<UploadItem[]>([]);

  const uploading = items.some((i) => i.status === 'uploading');
  const failed = items.some((i) => i.status === 'error');
  const doneFiles = useMemo(() => items.filter((i) => i.status === 'done' && i.key), [items]);
  const hasContent = text.trim().length > 0 || doneFiles.length > 0;
  const hadFiles = (existing?.files.length ?? 0) > 0;
  const isResubmit = !!existing;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasContent || uploading) return;
    submit.mutate(
      {
        text: text.trim() || undefined,
        files: doneFiles.map((i) => ({ storageKey: i.key as string, fileName: i.name, sizeBytes: i.size })),
      },
      {
        onSuccess: () => {
          toast.success(isResubmit ? 'Ish qayta yuborildi' : 'Ish topshirildi!');
          setItems([]);
        },
        onError: (err) => toast.error(handleApiError(err)),
      },
    );
  };

  return (
    <form onSubmit={onSubmit} className="da-fade-up rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Send className="h-4 w-4 text-indigo-500" /> {isResubmit ? 'Qayta yuborish' : 'Ishni topshirish'}
      </h2>

      <div className="space-y-5">
        {a.allowText && (
          <div>
            <label htmlFor="answer-text" className="mb-1.5 flex items-center justify-between text-sm font-medium text-gray-700">
              Javob matni
              <span className={cn('text-xs tabular-nums', text.length > TEXT_MAX * 0.95 ? 'text-red-500' : 'text-gray-400')}>
                {text.length} / {TEXT_MAX}
              </span>
            </label>
            <textarea
              id="answer-text"
              rows={8}
              value={text}
              maxLength={TEXT_MAX}
              onChange={(e) => setText(e.target.value)}
              placeholder="Javobingizni shu yerga yozing..."
              className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        )}

        {a.allowFiles && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700">Fayllar</p>
            {isResubmit && hadFiles && (
              <p className="mb-2 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Qayta yuborishda avvalgi fayllar almashtiriladi. Kerakli fayllarni yana yuklang.
              </p>
            )}
            <FileDropzone purpose="SUBMISSION_FILE" accept={SUBMISSION_TYPES} maxFiles={10} maxSizeMb={15} disabled={submit.isPending} onChange={setItems} />
          </div>
        )}
      </div>

      {failed && <p className="mt-3 text-xs text-red-600">Ba’zi fayllar yuklanmadi. Ularni olib tashlang yoki qayta tanlang.</p>}

      <button
        type="submit"
        disabled={!hasContent || uploading || submit.isPending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        {submit.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Yuborilmoqda...
          </>
        ) : uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Fayllar yuklanmoqda...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> {isResubmit ? 'Qayta yuborish' : 'Topshirish'}
          </>
        )}
      </button>
    </form>
  );
}

/* ───────── Sahifa ───────── */
function AssignmentContent() {
  const { id } = useParams<{ id: string }>();
  const { data: a, isLoading, isError, error } = useAssignment(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <div className="h-40 animate-pulse rounded-3xl bg-gray-100" />
        <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (isError || !a) {
    const denied = [403, 404].includes(getErrorStatus(error) ?? 0);
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          title={denied ? 'Vazifa topilmadi yoki ruxsat yo‘q' : 'Vazifani yuklab bo‘lmadi'}
          description={denied ? undefined : handleApiError(error)}
          action={
            <Link href="/courses" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
              <ArrowLeft className="h-4 w-4" /> Kurslarga qaytish
            </Link>
          }
        />
      </div>
    );
  }

  const staff = isStaffAssignment(a);
  const student = staff ? null : a;
  const submission = student?.mySubmission ?? null;
  const left = timeLeft(a.dueDate);
  const overdue = !staff && !!student?.isOverdue;
  const canSubmit = !staff && !overdue && submission?.status !== 'GRADED';

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <Link href={`/lesson/${a.lesson.id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" /> {a.lesson.title}
      </Link>

      {/* sarlavha */}
      <section className="da-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0f24] via-indigo-950 to-blue-900 p-6 text-white shadow-xl shadow-indigo-900/20 sm:p-8">
        <div className="da-blob pointer-events-none absolute -right-10 -top-14 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/15">
            <ClipboardList className="h-3.5 w-3.5" /> Vazifa
          </span>
          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{a.title}</h1>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">Maksimal ball: {a.maxScore}</span>
            {a.dueDate && (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ring-1',
                  overdue || (!left && !staff) ? 'bg-red-500/20 text-red-100 ring-red-300/30' : 'bg-white/10 ring-white/15',
                )}
              >
                <CalendarClock className="h-3.5 w-3.5" /> {formatDateTime(a.dueDate)}
              </span>
            )}
            {left && !submission && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1.5 text-amber-100 ring-1 ring-amber-300/30">
                <Timer className="h-3.5 w-3.5" /> Qoldi: {left}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="mt-6 space-y-6">
        {/* shart */}
        <section className="da-fade-up da-delay-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <FileText className="h-4 w-4 text-indigo-500" /> Vazifa sharti
          </h2>
          <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-gray-700">{a.instructions}</div>
          <p className="mt-4 text-xs text-gray-400">
            Topshirish usuli: {[a.allowText && 'matn', a.allowFiles && 'fayl / rasm'].filter(Boolean).join(' va ')}
          </p>
        </section>

        {/* xodim ko'rinishi */}
        {staff && (
          <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
            <p className="text-sm font-semibold text-indigo-900">Siz bu vazifani xodim sifatida ko‘ryapsiz</p>
            <p className="mt-1 text-sm text-indigo-800/80">
              Topshirilgan ishlar: {a.stats.total} · Tekshirilmaganlari: {a.stats.pending}
            </p>
            <Link
              href={`/diamond-academy/admin/assignments/${a.id}`}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500"
            >
              Ishlarni tekshirish
            </Link>
          </section>
        )}

        {/* natija / holat */}
        {student && submission && <ResultPanel a={student} s={submission} />}

        {/* muddat o'tgan */}
        {student && overdue && !submission && (
          <p className="flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Topshirish muddati tugagan. Savollar bo‘lsa, o‘qituvchiga murojaat qiling.
          </p>
        )}
        {student && overdue && submission && submission.status === 'RETURNED' && (
          <p className="flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Muddat tugagani uchun qayta yuborib bo‘lmaydi.
          </p>
        )}

        {/* forma */}
        {student && canSubmit && (
          <SubmitForm key={`${submission?.id ?? 'new'}-${submission?.submittedAt ?? ''}-${submission?.status ?? ''}`} a={student} existing={submission} />
        )}

        {student && submission?.status === 'GRADED' && (
          <p className="flex items-center justify-center gap-2 text-center text-sm text-gray-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Bu vazifa yakunlangan.
          </p>
        )}
      </div>
    </div>
  );
}

export default function AssignmentPage() {
  return (
    <PageShell>
      <AssignmentContent />
    </PageShell>
  );
}
