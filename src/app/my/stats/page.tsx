'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarCheck,
  Gem,
  Headphones,
  Mic,
  PenLine,
  Users,
  Wallet,
} from 'lucide-react';
import RequireRole from '../../../components/RequireRole';
import Spinner from '../../../components/ui/Spinner';
import { useMyStats } from '../../../features/hooks/useStudentStats';
import type {
  MyStats,
  StatsAttemptStatus,
  StatsCefr,
  StatsPaymentStatus,
} from '../../../features/types/student-stats';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/* ───────────── Yordamchilar ───────────── */

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const WEEKDAYS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
const MAX_SKILL = 75;

const monthLabel = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

const dateLabel = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
};

const money = (n: number | null) => (n === null ? '—' : `${new Intl.NumberFormat('ru-RU').format(n)} so‘m`);

const score = (n: number | null) => (n === null ? '—' : String(Math.round(n * 10) / 10));

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

const PAYMENT: Record<StatsPaymentStatus, { label: string; badge: string; bar: string }> = {
  PAID: { label: 'To‘langan', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', bar: 'bg-emerald-500' },
  PENDING: { label: 'Kutilmoqda', badge: 'bg-amber-50 text-amber-700 ring-amber-200', bar: 'bg-amber-400' },
  PARTIAL: { label: 'Qisman to‘langan', badge: 'bg-sky-50 text-sky-700 ring-sky-200', bar: 'bg-sky-500' },
  OVERDUE: { label: 'Muddati o‘tgan', badge: 'bg-red-50 text-red-700 ring-red-200', bar: 'bg-red-500' },
};

const ATTEMPT: Record<StatsAttemptStatus, string> = {
  IN_PROGRESS: 'Jarayonda',
  SUBMITTED: 'Topshirildi',
  GRADING: 'Tekshirilmoqda',
  COMPLETED: 'Tayyor',
  EXPIRED: 'Vaqt tugadi',
};

const CEFR: Record<StatsCefr, { label: string; cls: string }> = {
  BELOW_B1: { label: 'B1 dan past', cls: 'bg-gray-100 text-gray-700 ring-gray-200' },
  B1: { label: 'B1', cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  B2: { label: 'B2', cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  C1: { label: 'C1', cls: 'bg-violet-50 text-violet-700 ring-violet-200' },
};

/** Birinchi renderdan keyin true bo'ladi: animatsiyalar (halqa, chiziqlar) shundan boshlanadi */
function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setM(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return m;
}

/* ───────────── Kichik komponentlar ───────────── */

function PaymentBadge({ status }: { status: StatsPaymentStatus | null }) {
  if (!status) {
    return (
      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
        Belgilanmagan
      </span>
    );
  }
  const s = PAYMENT[status];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${s.badge}`}>{s.label}</span>;
}

function Ring({ value }: { value: number | null }) {
  const mounted = useMounted();
  const r = 42;
  const c = 2 * Math.PI * r;
  const pct = value ?? 0;
  const stroke = pct >= 80 ? 'stroke-emerald-500' : pct >= 50 ? 'stroke-amber-500' : 'stroke-red-500';

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-gray-100" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className={`${stroke} transition-all duration-1000 ease-out`}
          strokeDasharray={c}
          strokeDashoffset={mounted ? c - (c * pct) / 100 : c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{value === null ? '—' : `${value}%`}</span>
        <span className="text-[10px] uppercase tracking-wide text-gray-400">davomat</span>
      </div>
    </div>
  );
}

function SkillBar({ icon, label, value, color }: { icon: ReactNode; label: string; value: number | null; color: string }) {
  const mounted = useMounted();
  const width = value === null ? 0 : Math.min(100, (value / MAX_SKILL) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-gray-600">
          {icon}
          {label}
        </span>
        <span className="font-semibold text-gray-900">{score(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: mounted ? `${width}%` : '0%' }}
        />
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

/* ───────────── Asosiy mazmun ───────────── */

function StatsView({ s }: { s: MyStats }) {
  const { attendance, payment, exams } = s;
  const cur = payment.currentMonth;
  const recent = [...attendance.recent].reverse(); // eski -> yangi

  return (
    <>
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-6 text-white shadow-xl shadow-indigo-900/20 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-xl font-bold shadow-lg shadow-blue-900/40">
              {initialsOf(s.student.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{s.student.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
                  <Users className="h-3.5 w-3.5" />
                  {s.student.group.name}
                </span>
                {s.student.group.schedule && (
                  <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">{s.student.group.schedule}</span>
                )}
                {s.student.level && (
                  <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">{s.student.level}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/15 backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-500 shadow-lg shadow-violet-900/40">
              <Gem className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-extrabold leading-none">{s.diamonds}</p>
              <p className="mt-1 text-xs text-white/70">to‘plangan olmoslar</p>
            </div>
          </div>
        </div>
      </div>

      {/* KARTALAR */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Davomat */}
        <div className="flex items-center gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <Ring value={attendance.rate} />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <CalendarCheck className="h-4 w-4 text-blue-600" /> Davomat
            </p>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold text-emerald-600">{attendance.present}</span> ta keldi
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-red-500">{attendance.absent}</span> ta kelmadi
            </p>
            <p className="mt-1 text-xs text-gray-400">Jami {attendance.total} ta dars</p>
          </div>
        </div>

        {/* Joriy oy to'lovi */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <Wallet className="h-4 w-4 text-emerald-600" /> To‘lov · {monthLabel(cur.month)}
          </p>
          <div className="mt-4">
            <PaymentBadge status={cur.status} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{money(cur.amount)}</p>
          <p className="mt-1 text-xs text-gray-400">
            {cur.paidAt ? `To‘langan: ${dateLabel(cur.paidAt)}` : 'Joriy oy uchun oylik to‘lov'}
          </p>
        </div>

        {/* Imtihonlar */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <Award className="h-4 w-4 text-amber-600" /> Imtihonlar
          </p>
          <div className="mt-4 flex items-end gap-6">
            <div>
              <p className="text-3xl font-bold text-gray-900">{exams.count}</p>
              <p className="text-xs text-gray-400">natija</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{score(exams.bestScore)}</p>
              <p className="text-xs text-gray-400">eng yaxshi ball</p>
            </div>
          </div>
          {exams.lastCefr && (
            <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${CEFR[exams.lastCefr].cls}`}>
              Oxirgi daraja: {CEFR[exams.lastCefr].label}
            </span>
          )}
        </div>
      </div>

      {/* DAVOMAT KALENDARI */}
      <Section title="Davomat" subtitle="Oxirgi 30 ta dars">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          {recent.length === 0 ? (
            <p className="text-sm text-gray-500">Davomat hali belgilanmagan.</p>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
                {recent.map((a) => {
                  const d = new Date(a.date);
                  return (
                    <div
                      key={a.date}
                      title={`${dateLabel(a.date)} — ${a.present ? 'Keldi' : 'Kelmadi'}${a.diamond ? ' · Olmos' : ''}`}
                      className={`relative flex flex-col items-center rounded-xl py-2 ring-1 transition hover:scale-105 ${
                        a.present
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                          : 'bg-red-50 text-red-600 ring-red-100'
                      }`}
                    >
                      <span className="text-base font-bold leading-none">{d.getUTCDate()}</span>
                      <span className="mt-1 text-[10px] uppercase opacity-70">{WEEKDAYS[d.getUTCDay()]}</span>
                      {a.diamond && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 shadow">
                          <Gem className="h-3 w-3 text-white" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-emerald-200" /> Keldi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-red-200" /> Kelmadi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-500">
                    <Gem className="h-2.5 w-2.5 text-white" />
                  </span>
                  Olmos
                </span>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* TO'LOVLAR */}
      <Section title="Oylik to‘lovlar" subtitle="Oxirgi 12 oy">
        {payment.history.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-500 shadow-sm">
            To‘lov yozuvlari hali yo‘q.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {payment.history.map((p) => (
              <div
                key={p.id}
                className="flex items-stretch overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className={`w-1.5 ${PAYMENT[p.status].bar}`} />
                <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-semibold text-gray-900">{monthLabel(p.month)}</p>
                    <p className="text-xs text-gray-400">{p.paidAt ? `To‘langan: ${dateLabel(p.paidAt)}` : 'To‘lanmagan'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{money(p.amount)}</p>
                    <div className="mt-1">
                      <PaymentBadge status={p.status} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* IMTIHONLAR */}
      <Section title="Imtihon natijalari" subtitle="Har bir bo‘lim 0–75 shkalada">
        {exams.attempts.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-500 shadow-sm">
            Siz hali imtihon topshirmagansiz.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {exams.attempts.map((a) => (
              <div key={a.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-400">{dateLabel(a.startedAt)}</p>
                  </div>
                  <div className="text-right">
                    {a.total !== null ? (
                      <>
                        <p className="text-2xl font-extrabold leading-none text-gray-900">{score(a.total)}</p>
                        {a.cefr && (
                          <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${CEFR[a.cefr].cls}`}>
                            {CEFR[a.cefr].label}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                        {ATTEMPT[a.status]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SkillBar icon={<Headphones className="h-3.5 w-3.5" />} label="Listening" value={a.listening} color="bg-blue-500" />
                  <SkillBar icon={<BookOpen className="h-3.5 w-3.5" />} label="Reading" value={a.reading} color="bg-emerald-500" />
                  <SkillBar icon={<PenLine className="h-3.5 w-3.5" />} label="Writing" value={a.writing} color="bg-amber-500" />
                  <SkillBar icon={<Mic className="h-3.5 w-3.5" />} label="Speaking" value={a.speaking} color="bg-violet-500" />
                </div>

                <Link
                  href={`/exam/${a.id}/result`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:gap-2"
                >
                  Batafsil natija <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

function Content() {
  const { data, isLoading, isError, refetch } = useMyStats();

  if (isLoading) return <Spinner className="min-h-[40vh]" />;

  if (isError || !data) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-sm text-gray-600">Statistikani yuklab bo‘lmadi.</p>
        <button onClick={() => refetch()} className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white">
          Qayta urinish
        </button>
      </div>
    );
  }

  if (!data.isStudent) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
          <Gem className="h-7 w-7 text-gray-400" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-gray-900">Statistika mavjud emas</h1>
        <p className="text-sm text-gray-600">
          Hisobingiz markaz o‘quvchisi sifatida bog‘lanmagan. Telefon raqamingiz o‘quv markazida ro‘yxatdan o‘tgan raqam bilan bir
          xil ekanini tekshiring yoki administratorga murojaat qiling.
        </p>
      </div>
    );
  }

  return <StatsView s={data} />;
}

export default function MyStatsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-16">
        <RequireRole>
          <Content />
        </RequireRole>
      </main>
      <Footer />
    </div>
  );
}
