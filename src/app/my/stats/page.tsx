'use client';

import Link from 'next/link';
import { Award, CalendarCheck, Gem, Wallet } from 'lucide-react';
import RequireRole from '../../../components/RequireRole';
import Spinner from '../../../components/ui/Spinner';
import { useMyStats } from '../../../features/hooks/useStudentStats';
import type {
  MyStats,
  StatsAttemptStatus,
  StatsCefr,
  StatsPaymentStatus,
} from '../../../features/types/student-stats';

/* ───────────── Yordamchilar ───────────── */

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

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

const PAYMENT: Record<StatsPaymentStatus, { label: string; cls: string }> = {
  PAID: { label: 'To‘langan', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  PENDING: { label: 'Kutilmoqda', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  PARTIAL: { label: 'Qisman to‘langan', cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  OVERDUE: { label: 'Muddati o‘tgan', cls: 'bg-red-50 text-red-700 ring-red-200' },
};

const ATTEMPT: Record<StatsAttemptStatus, string> = {
  IN_PROGRESS: 'Jarayonda',
  SUBMITTED: 'Topshirildi',
  GRADING: 'Tekshirilmoqda',
  COMPLETED: 'Tayyor',
  EXPIRED: 'Vaqt tugadi',
};

const CEFR: Record<StatsCefr, string> = { BELOW_B1: 'B1 dan past', B1: 'B1', B2: 'B2', C1: 'C1' };

function PaymentBadge({ status }: { status: StatsPaymentStatus | null }) {
  if (!status) {
    return <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">Belgilanmagan</span>;
  }
  const s = PAYMENT[status];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${s.cls}`}>{s.label}</span>;
}

function StatCard({
  icon,
  title,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>{icon}</div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2>
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">{children}</div>
    </section>
  );
}

/* ───────────── Asosiy mazmun ───────────── */

function StatsView({ s }: { s: MyStats }) {
  const { attendance, payment, exams } = s;
  const cur = payment.currentMonth;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{s.student.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Guruh: <span className="font-medium text-gray-700">{s.student.group.name}</span>
          {s.student.group.schedule ? ` · ${s.student.group.schedule}` : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          tone="bg-blue-50 text-blue-600"
          icon={<CalendarCheck className="h-5 w-5" />}
          title="Davomat"
          value={attendance.rate === null ? '—' : `${attendance.rate}%`}
          hint={`${attendance.present} / ${attendance.total} dars`}
        />
        <StatCard
          tone="bg-violet-50 text-violet-600"
          icon={<Gem className="h-5 w-5" />}
          title="Olmoslar"
          value={s.diamonds}
          hint="Jami to‘plangan olmoslar"
        />
        <StatCard
          tone="bg-emerald-50 text-emerald-600"
          icon={<Wallet className="h-5 w-5" />}
          title={`To‘lov: ${monthLabel(cur.month)}`}
          value={<PaymentBadge status={cur.status} />}
          hint={money(cur.amount)}
        />
        <StatCard
          tone="bg-amber-50 text-amber-600"
          icon={<Award className="h-5 w-5" />}
          title="Imtihonlar"
          value={exams.count}
          hint={
            exams.bestScore !== null
              ? `Eng yaxshi ball: ${score(exams.bestScore)}${exams.lastCefr ? ` · ${CEFR[exams.lastCefr]}` : ''}`
              : 'Hali natija yo‘q'
          }
        />
      </div>

      <Section title="Davomat (oxirgi 30 kun)">
        {attendance.recent.length === 0 ? (
          <p className="text-sm text-gray-500">Davomat hali belgilanmagan.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {attendance.recent.map((a) => (
                <div
                  key={a.date}
                  title={`${dateLabel(a.date)} — ${a.present ? 'Keldi' : 'Kelmadi'}${a.diamond ? ' · Olmos' : ''}`}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-lg text-xs font-medium ${
                    a.present ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {new Date(a.date).getUTCDate()}
                  {a.diamond && <Gem className="absolute -right-1 -top-1 h-3.5 w-3.5 text-violet-500" />}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              <span className="mr-3">🟩 Keldi</span>
              <span className="mr-3">🟥 Kelmadi</span>
              <span>💎 Olmos</span>
            </p>
          </>
        )}
      </Section>

      <Section title="Oylik to‘lovlar">
        {payment.history.length === 0 ? (
          <p className="text-sm text-gray-500">To‘lov yozuvlari hali yo‘q.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-400">
                <tr>
                  <th className="pb-2 pr-4 font-medium">Oy</th>
                  <th className="pb-2 pr-4 font-medium">Summa</th>
                  <th className="pb-2 pr-4 font-medium">Holat</th>
                  <th className="pb-2 font-medium">To‘langan sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payment.history.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 pr-4 text-gray-900">{monthLabel(p.month)}</td>
                    <td className="py-2.5 pr-4 text-gray-700">{money(p.amount)}</td>
                    <td className="py-2.5 pr-4">
                      <PaymentBadge status={p.status} />
                    </td>
                    <td className="py-2.5 text-gray-500">{p.paidAt ? dateLabel(p.paidAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Imtihon natijalari">
        {exams.attempts.length === 0 ? (
          <p className="text-sm text-gray-500">Siz hali imtihon topshirmagansiz.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-400">
                <tr>
                  <th className="pb-2 pr-4 font-medium">Imtihon</th>
                  <th className="pb-2 pr-4 font-medium">Sana</th>
                  <th className="pb-2 pr-4 font-medium">L</th>
                  <th className="pb-2 pr-4 font-medium">R</th>
                  <th className="pb-2 pr-4 font-medium">W</th>
                  <th className="pb-2 pr-4 font-medium">S</th>
                  <th className="pb-2 pr-4 font-medium">Umumiy</th>
                  <th className="pb-2 pr-4 font-medium">Daraja</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {exams.attempts.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2.5 pr-4 font-medium text-gray-900">{a.title}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{dateLabel(a.startedAt)}</td>
                    <td className="py-2.5 pr-4 text-gray-700">{score(a.listening)}</td>
                    <td className="py-2.5 pr-4 text-gray-700">{score(a.reading)}</td>
                    <td className="py-2.5 pr-4 text-gray-700">{score(a.writing)}</td>
                    <td className="py-2.5 pr-4 text-gray-700">{score(a.speaking)}</td>
                    <td className="py-2.5 pr-4 font-semibold text-gray-900">
                      {a.total !== null ? score(a.total) : <span className="text-xs font-normal text-gray-500">{ATTEMPT[a.status]}</span>}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700">{a.cefr ? CEFR[a.cefr] : '—'}</td>
                    <td className="py-2.5 text-right">
                      <Link href={`/exam/${a.id}/result`} className="text-sm font-medium text-blue-600 hover:underline">
                        Batafsil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="mb-2 text-xl font-semibold text-gray-900">Statistika mavjud emas</h1>
        <p className="text-sm text-gray-600">
          Hisobingiz markaz o‘quvchisi sifatida bog‘lanmagan. Telefon raqamingiz o‘quv markazida ro‘yxatdan o‘tgan raqam bilan bir xil
          ekanini tekshiring yoki administratorga murojaat qiling.
        </p>
      </div>
    );
  }

  return <StatsView s={data} />;
}

export default function MyStatsPage() {
  return (
    <RequireRole>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Content />
      </div>
    </RequireRole>
  );
}
