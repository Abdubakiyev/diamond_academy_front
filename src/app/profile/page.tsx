'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Phone,
  PlayCircle,
  Trophy,
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import RequireRole from '../../components/RequireRole';
import EmptyState from '../../components/ui/EmptyState';
import ScoreBadge from '../../components/exam/ScoreBadge';
import { useLogout, useMe } from '../../features/hooks/useAuth';
import { useMyAttempts } from '../../features/hooks/useExamAttempt';
import type { ExamAttemptListItem } from '../../features/types/exam-attempt';
import type { AttemptStatus } from '../../features/types/common';
import { ADMIN_HOME } from '../../lib/config';
import { cn, formatDate, formatPhone, initials } from '../../lib/format';

const STATUS: Record<AttemptStatus, { label: string; cls: string }> = {
  IN_PROGRESS: { label: 'Davom etmoqda', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  SUBMITTED: { label: 'Topshirildi', cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  GRADING: { label: 'Baholanmoqda', cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  COMPLETED: { label: 'Yakunlandi', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
};

const SKILLS: Array<{ key: keyof ExamAttemptListItem; label: string; color: string }> = [
  { key: 'listeningScore', label: 'L', color: 'from-sky-400 to-blue-500' },
  { key: 'readingScore', label: 'R', color: 'from-emerald-400 to-teal-500' },
  { key: 'writingScore', label: 'W', color: 'from-violet-400 to-indigo-500' },
  { key: 'speakingScore', label: 'S', color: 'from-amber-400 to-orange-500' },
];

function SkillBars({ attempt }: { attempt: ExamAttemptListItem }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
      {SKILLS.map(({ key, label, color }) => {
        const v = attempt[key] as number | null;
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="w-3 text-[11px] font-bold text-gray-400">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn('h-full rounded-full bg-gradient-to-r', color)}
                style={{ width: `${v == null ? 0 : Math.min(100, (v / 75) * 100)}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs tabular-nums text-gray-600">{v ?? '—'}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof Trophy; label: string; value: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', tone)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function ProfileContent() {
  const { data: me } = useMe();
  const logout = useLogout();
  const { data: attempts, isLoading } = useMyAttempts({ limit: 50 });

  if (!me) return null;

  const items = attempts?.items ?? [];
  const done = items.filter((a) => a.status === 'COMPLETED' && a.totalScore != null);
  const best = done.reduce<ExamAttemptListItem | null>((acc, a) => (!acc || (a.totalScore ?? 0) > (acc.totalScore ?? 0) ? a : acc), null);
  const staff = me.role === 'ADMIN' || me.role === 'TEACHER';

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      {/* ───── Profil kartasi ───── */}
      <section className="da-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0f24] via-indigo-950 to-blue-900 p-6 text-white shadow-xl shadow-indigo-900/20 sm:p-8">
        <div className="da-blob pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-2xl font-bold shadow-lg shadow-blue-500/30 ring-4 ring-white/10">
            {initials(me.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight">{me.name}</h1>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-blue-100 ring-1 ring-white/15">
                {me.role === 'USER' ? 'Talaba' : me.role === 'TEACHER' ? 'O‘qituvchi' : 'Admin'}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-blue-100/80">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {formatPhone(me.phone)}
              </span>
              {me.createdAt && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> {formatDate(me.createdAt)} dan beri
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col">
            {staff && (
              <Link
                href={ADMIN_HOME}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-900 shadow-md transition hover:bg-blue-50 active:scale-95"
              >
                <LayoutDashboard className="h-4 w-4" /> Boshqaruv paneli
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95"
            >
              <LogOut className="h-4 w-4" /> Chiqish
            </button>
          </div>
        </div>
      </section>

      {/* ───── Statistika ───── */}
      <section className="da-fade-up da-delay-1 mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Jami urinishlar" value={isLoading ? '…' : attempts?.total ?? 0} tone="bg-blue-50 text-blue-600" />
        <StatCard icon={CheckCircle2} label="Yakunlangan" value={isLoading ? '…' : done.length} tone="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Trophy} label="Eng yuqori ball" value={isLoading ? '…' : best?.totalScore ?? '—'} tone="bg-amber-50 text-amber-600" />
        <StatCard icon={Award} label="Eng yuqori daraja" value={isLoading ? '…' : <ScoreBadge level={best?.cefrLevel} />} tone="bg-indigo-50 text-indigo-600" />
      </section>

      {/* ───── Tezkor havolalar ───── */}
      <section className="da-fade-up da-delay-2 mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { href: '/exams', icon: FileText, title: 'Imtihonlar', desc: 'Multilevel imtihonni boshlash' },
          { href: '/courses', icon: BookOpen, title: 'Kurslar', desc: 'Darslar va vazifalar' },
          { href: '/my/attempts', icon: ClipboardList, title: 'Natijalarim', desc: 'Barcha urinishlar tarixi' },
        ].map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-indigo-600">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="truncate text-xs text-gray-500">{desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
          </Link>
        ))}
      </section>

      {/* ───── So'nggi urinishlar ───── */}
      <section className="da-fade-up da-delay-3 mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">So‘nggi urinishlar</h2>
          {items.length > 0 && (
            <Link href="/my/attempts" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Hammasi
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Hali imtihon topshirmagansiz"
            description="Birinchi Multilevel imtihoningizni boshlang va natijangizni AI tahlili bilan oling."
            action={
              <Link
                href="/exams"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md"
              >
                Imtihonlarni ko‘rish <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {items.slice(0, 5).map((a) => {
              const status = STATUS[a.status];
              const resumable = a.status === 'IN_PROGRESS';
              return (
                <li key={a.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{a.exam.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{formatDate(a.startedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium ring-1', status.cls)}>{status.label}</span>
                      {a.status === 'COMPLETED' && <ScoreBadge level={a.cefrLevel} size="sm" />}
                    </div>
                  </div>

                  {a.status !== 'IN_PROGRESS' && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                      <div className="shrink-0">
                        <p className="text-3xl font-bold tracking-tight text-gray-900">
                          {a.totalScore ?? '—'}
                          <span className="text-sm font-medium text-gray-400"> / 75</span>
                        </p>
                      </div>
                      <div className="flex-1">
                        <SkillBars attempt={a} />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Link
                      href={resumable ? `/exam/${a.id}` : `/exam/${a.id}/result`}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition active:scale-95',
                        resumable
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
                      )}
                    >
                      {resumable ? (
                        <>
                          <PlayCircle className="h-4 w-4" /> Davom ettirish
                        </>
                      ) : (
                        <>
                          Natijani ko‘rish <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireRole>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex-1">
          <ProfileContent />
        </main>
        <Footer />
      </div>
    </RequireRole>
  );
}
