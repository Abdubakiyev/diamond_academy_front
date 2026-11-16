import Image from 'next/image';
import Link from 'next/link';
import { Award, BookOpen, Headphones, Mic, PenLine, ShieldCheck, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

const skills = [
  { icon: Headphones, label: 'Listening', desc: 'Audio va vaqt nazorati' },
  { icon: BookOpen, label: 'Reading', desc: 'Matnlar va savollar' },
  { icon: PenLine, label: 'Writing', desc: 'AI tekshiruvi' },
  { icon: Mic, label: 'Speaking', desc: 'Ovozli javob yozish' },
];

const diamondPattern =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M24 4l12 20-12 20L12 24z' fill='none' stroke='%23ffffff' stroke-opacity='0.07'/%3E%3C/svg%3E\")";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ───────── Brend paneli ───────── */}
      <aside
        className="relative hidden overflow-hidden bg-[#0a0f24] text-white lg:flex lg:flex-col lg:justify-between lg:p-12"
        style={{ backgroundImage: diamondPattern }}
      >
        {/* yorug' dog'lar */}
        <div className="da-blob pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-600/40 blur-3xl" />
        <div
          className="da-blob pointer-events-none absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-500/30 blur-3xl"
          style={{ animationDelay: '-6s' }}
        />
        <div className="pointer-events-none absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <Link href="/" className="relative z-10 flex w-fit items-center gap-3">
          <Image
            src="/logo.png"
            alt="Diamond Academy"
            width={44}
            height={44}
            className="rounded-full object-cover ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/30"
          />
          <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-xl font-semibold tracking-wide text-transparent">
            Diamond Academy
          </span>
        </Link>

        <div className="relative z-10 max-w-xl">
          <span className="da-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-blue-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Multilevel (CEFR) onlayn imtihon
          </span>
          <h1 className="da-fade-up da-delay-1 mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            Ingliz tilini{' '}
            <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-cyan-200 bg-clip-text text-transparent">
              yangi darajaga
            </span>{' '}
            olib chiqing
          </h1>
          <p className="da-fade-up da-delay-2 mt-4 max-w-md text-base leading-relaxed text-blue-100/70">
            Kurslar, darslar va haqiqiy imtihon formatidagi mashq: natijangizni darhol va AI tahlili bilan oling.
          </p>

          <div className="da-fade-up da-delay-3 mt-8 grid max-w-lg grid-cols-2 gap-3">
            {skills.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur transition hover:border-blue-400/40 hover:bg-white/[0.08]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/20 ring-1 ring-white/10 transition group-hover:scale-105">
                  <Icon className="h-5 w-5 text-blue-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-blue-100/60">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* suzib yuruvchi kartalar */}
        <div className="da-float pointer-events-none absolute right-10 top-28 hidden w-48 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur-md xl:block">
          <p className="text-xs text-blue-100/70">Umumiy ball</p>
          <p className="mt-1 text-3xl font-bold">
            68<span className="text-base font-medium text-blue-200/70"> / 75</span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-blue-400 to-cyan-300" />
          </div>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-semibold text-emerald-200">
            <Award className="h-3 w-3" /> C1 daraja
          </span>
        </div>

        <div className="da-float-slow pointer-events-none absolute bottom-40 right-24 hidden w-52 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 shadow-2xl shadow-black/30 backdrop-blur-md xl:flex">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-400/25">
            <ShieldCheck className="h-5 w-5 text-indigo-200" />
          </div>
          <div>
            <p className="text-xs font-semibold">AI baholadi</p>
            <p className="text-[11px] text-blue-100/60">Writing · Speaking</p>
          </div>
        </div>

        <p className="relative z-10 text-xs text-blue-100/40">© {new Date().getFullYear()} Diamond Academy</p>
      </aside>

      {/* ───────── Forma tomoni ───────── */}
      <main className="relative flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* mobil brend chizig'i */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#0a0f24] to-indigo-900 px-6 py-4 text-white lg:hidden">
          <Image src="/logo.png" alt="Diamond Academy" width={36} height={36} className="rounded-full ring-2 ring-blue-400/40" />
          <span className="font-semibold tracking-wide">Diamond Academy</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">{children}</div>
      </main>
    </div>
  );
}
