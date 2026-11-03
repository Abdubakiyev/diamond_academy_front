"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gem,
  Headphones,
  Menu,
  Mic,
  Pencil,
  Play,
  Sparkles,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";

/* ============================================================================
   DIAMOND ACADEMY — bosh sahifa ( "/" )
   Tailwind + lucide-react. Animatsiya keyframe'lari globals.css ga qo'shiladi
   (dh-keyframes.css faylidagi blok).
   ============================================================================ */

/* ───────────── Token (sizdagi useHasToken bilan bir xil mantiq) ───────────── */
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
function useHasToken(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => !!localStorage.getItem("access_token"),
    () => null,
  );
}

/* ───────────── Reklamalar (Advertisement) ─────────────
   MUHIM: endpoint manzilini o'zingizning backend yo'lingizga moslang.
   Javob: Advertisement[]  yoki  { data: Advertisement[] }                 */
type Ad = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  mediaType: "IMAGE" | "VIDEO" | null;
  isActive?: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "";
const ADS_ENDPOINT = `${API}/advertisement/active`; // <-- moslang

async function fetchActiveAds(): Promise<Ad[]> {
  try {
    const res = await fetch(ADS_ENDPOINT);
    if (!res.ok) return [];
    const json = await res.json();
    const list = Array.isArray(json) ? json : json?.data;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/* ───────────── Ma'lumotlar ───────────── */
const MARQUEE = [
  "Listening",
  "Reading",
  "Writing",
  "Speaking",
  "AI tekshiruv",
  "Video darslar",
  "Vazifalar",
  "Multilevel mock",
  "CEFR B1 · B2 · C1",
];

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Play, title: "Video darslar", text: "Har bir dars videosi, konspekti va materiallari bir joyda. Istalgan vaqt, istalgan qurilmada." },
  { icon: Upload, title: "Vazifa va baho", text: "Vazifani rasm yoki matn ko‘rinishida yuboring — o‘qituvchi tekshirib, baho va izoh qoldiradi." },
  { icon: Headphones, title: "To‘liq Multilevel mock", text: "Haqiqiy imtihondagi kabi 4 bo‘lim, bo‘limlar bo‘yicha alohida taymer va audio." },
  { icon: Pencil, title: "AI Writing tekshiruvi", text: "Yozma ishingiz tahlil qilinadi: mezonlar bo‘yicha ball, xatolar va aniq maslahatlar." },
  { icon: Mic, title: "AI Speaking tekshiruvi", text: "Javobingiz yoziladi va matnga o‘giriladi. Ravonlik, lug‘at va grammatika bo‘yicha baho oling." },
  { icon: Clock, title: "Alohida testlar", text: "To‘liq imtihondan tashqari, vaqti belgilangan qisqa testlar bilan zaif joylaringizni mashq qiling." },
];

const SKILLS: { icon: LucideIcon; name: string; meta: string; note: string }[] = [
  { icon: Headphones, name: "Listening", meta: "6 part · 35 savol", note: "Audio bo‘yicha test, moslashtirish va xarita topshiriqlari" },
  { icon: BookOpen, name: "Reading", meta: "5 part · 35 savol", note: "Matnlar, sarlavha tanlash, True/False va bo‘sh joylarni to‘ldirish" },
  { icon: Pencil, name: "Writing", meta: "2 ta topshiriq", note: "Xat va esse. AI mezonlar bo‘yicha baholaydi" },
  { icon: Mic, name: "Speaking", meta: "3 qism", note: "Suhbat, rasm tavsifi va munozara. Har bir qismga vaqt belgilangan" },
];

const STEPS = [
  { t: "Ro‘yxatdan o‘ting", d: "Telefon raqamingiz bilan bir daqiqada akkaunt oching." },
  { t: "Testni tanlang", d: "To‘liq Multilevel yoki alohida bo‘lim testini boshlang." },
  { t: "Topshiring", d: "Taymer ishlaydi, javoblaringiz avtomatik saqlanadi." },
  { t: "Natija va maslahat", d: "Har bir bo‘lim bo‘yicha ball, daraja va yaxshilash yo‘llari." },
];

const STATS = [
  { n: 4, s: "", l: "Skill: Listening, Reading, Writing, Speaking" },
  { n: 75, s: "", l: "Har bir bo‘limdagi maksimal ball" },
  { n: 24, s: "/7", l: "Istalgan vaqtda test topshirish" },
  { n: 3, s: " daraja", l: "B1, B2 va C1 darajalari" },
];

const SPARKS: [number, number, number][] = [
  [8, 18, 0], [18, 70, 1.2], [30, 36, 2.1], [44, 86, 0.6], [56, 12, 1.7],
  [66, 58, 2.6], [78, 26, 0.3], [88, 78, 1.1], [14, 92, 2.3], [92, 8, 1.9],
];

const NAV = [
  { href: "#imkoniyatlar", label: "Imkoniyatlar" },
  { href: "#multilevel", label: "Multilevel" },
  { href: "#yangiliklar", label: "E‘lonlar" },
  { href: "#narx", label: "Narx" },
];

/* ───────────── Umumiy Tailwind bo'laklari ───────────── */
const GRAD_TEXT =
  "bg-gradient-to-r from-sky-300 via-violet-400 to-fuchsia-300 bg-clip-text text-transparent";
const BTN =
  "relative inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-sky-300 via-violet-400 to-fuchsia-300 bg-[length:200%_100%] font-semibold text-[#08091a] shadow-[0_8px_30px_-8px_rgba(125,211,252,.55)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-[position:100%_0] hover:shadow-[0_14px_40px_-8px_rgba(167,139,250,.7)]";
const BTN_GHOST =
  "inline-flex items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/5 font-semibold text-slate-100 backdrop-blur transition-all duration-300 hover:bg-white/10";
const POP =
  "opacity-0 animate-[dh-pop_.7s_ease_forwards] motion-reduce:animate-none motion-reduce:opacity-100";
const WORD =
  "inline-block opacity-0 animate-[dh-word_.8s_cubic-bezier(.2,.8,.2,1)_forwards] motion-reduce:animate-none motion-reduce:opacity-100";
const CARD =
  "relative flex h-full flex-col gap-3 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[.07] to-white/[.02] p-7 transition-colors duration-300 hover:border-sky-300/40";

/* ───────────── Kichik komponentlar ───────────── */

/** Scroll bilan silliq paydo bo'lish */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:blur-0 motion-reduce:transition-none ${
        on ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-sm"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** 0 dan berilgan songacha sanaydi */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1600, 1);
          setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

/** Sichqoncha ustida 3D egilish + yorug'lik */
function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg)`;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group h-full transition-transform duration-200 ease-out ${className}`}
    >
      {children}
    </div>
  );
}

const GLOW =
  "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(260px_circle_at_var(--mx,50%)_var(--my,50%),rgba(125,211,252,.18),transparent_60%)]";

function IconBox({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-300/25 bg-sky-300/10 text-sky-300 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
      <Icon className="h-6 w-6" />
    </div>
  );
}

function SectionHead({ eyebrow, children, sub }: { eyebrow: string; children: ReactNode; sub?: string }) {
  return (
    <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-3.5 text-center">
      <span className="text-xs uppercase tracking-[.18em] text-sky-300">{eyebrow}</span>
      <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">{children}</h2>
      {sub && <p className="text-lg text-slate-400">{sub}</p>}
    </div>
  );
}

/** Admin joylagan faol reklamalar slayderi */
function AdSlider({ ads }: { ads: Ad[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = ads.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [n, paused, go]);

  if (n === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {ads.map((ad, idx) => (
          <article
            key={ad.id}
            aria-hidden={idx !== i}
            className="grid min-h-[380px] shrink-0 grow-0 basis-full md:grid-cols-[1.1fr_1fr]"
          >
            <div className="relative min-h-[260px] overflow-hidden">
              {ad.imageUrl && ad.mediaType === "VIDEO" ? (
                <video
                  src={ad.imageUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : ad.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ad.imageUrl} alt={ad.title} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#3b82f6,transparent_60%),radial-gradient(circle_at_70%_70%,#a855f7,transparent_60%)] bg-[#0b0d24]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-[#080a1c]/90 md:bg-gradient-to-r md:from-transparent md:from-55%" />
            </div>
            <div className="flex flex-col items-start justify-center gap-3.5 p-7 pb-12 md:p-11">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-3.5 py-1.5 text-xs text-sky-300">
                <Sparkles className="h-3.5 w-3.5" /> Yangilik
              </span>
              <h3 className="text-2xl font-extrabold leading-tight md:text-3xl">{ad.title}</h3>
              <p className="whitespace-pre-line text-slate-400">{ad.description}</p>
            </div>
          </article>
        ))}
      </div>

      {n > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Oldingi"
            className="absolute left-3.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-[#05060f]/60 backdrop-blur transition hover:scale-110 hover:bg-sky-300/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Keyingi"
            className="absolute right-3.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-[#05060f]/60 backdrop-blur transition hover:scale-110 hover:bg-sky-300/20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {ads.map((a, idx) => (
              <button
                key={a.id}
                onClick={() => setI(idx)}
                aria-label={`${idx + 1}-e‘lon`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === i ? "w-7 bg-sky-300" : "w-2.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ───────────── Sahifa ───────────── */
export default function LandingPage() {
  const hasToken = useHasToken();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);

  // Kirgan foydalanuvchi -> /home (test darajalari), kirmagan -> /register
  const ctaHref = hasToken ? "/home" : "/register";
  const ctaText = hasToken ? "Testlarni boshlash" : "Ro‘yxatdan o‘tish";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let alive = true;
    fetchActiveAds().then((list) => alive && setAds(list));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#05060f] font-sans leading-relaxed text-slate-100 antialiased [color-scheme:dark]">
      {/* ============ NAVBAR ============ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? "border-white/10 bg-[#05060f]/70 backdrop-blur-xl" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-[68px] w-[min(1180px,100%-40px)] items-center justify-between gap-5">
          <Link href="/" className="inline-flex items-center gap-2.5 font-semibold" aria-label="Diamond Academy">
            <Gem className="h-7 w-7 text-sky-300" />
            <span>
              Diamond <b className={GRAD_TEXT}>Academy</b>
            </span>
          </Link>

          <nav
            className={`absolute left-0 right-0 top-[68px] flex flex-col border-b border-white/10 bg-[#05060f]/95 px-5 pb-5 pt-2.5 backdrop-blur-xl transition-all duration-300 md:static md:ml-auto md:mr-2 md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 md:opacity-100 md:backdrop-blur-none md:pointer-events-auto md:translate-y-0 ${
              menu ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
            }`}
          >
            {NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenu(false)}
                className="border-b border-white/10 py-3.5 text-sm text-slate-400 transition-colors hover:text-slate-100 md:border-0 md:py-0"
              >
                {l.label}
              </a>
            ))}
            <Link href={ctaHref} className={`${BTN} mt-3.5 px-5 py-2.5 text-sm md:hidden`}>
              {ctaText}
            </Link>
          </nav>

          <Link href={ctaHref} className={`${BTN} hidden px-[18px] py-[9px] text-sm md:inline-flex`}>
            {ctaText}
          </Link>

          <button
            onClick={() => setMenu((v) => !v)}
            aria-label="Menyu"
            aria-expanded={menu}
            className="grid h-[42px] w-[42px] place-items-center rounded-xl border border-white/10 bg-white/5 md:hidden"
          >
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden pb-24 pt-[120px] lg:pt-[150px]">
        {/* Aurora */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <i className="absolute -left-28 -top-36 h-[520px] w-[520px] animate-[dh-drift_14s_ease-in-out_infinite_alternate] rounded-full bg-blue-500 opacity-50 blur-[90px]" />
          <i className="absolute -right-28 top-[10%] h-[460px] w-[460px] animate-[dh-drift_17s_ease-in-out_infinite_alternate-reverse] rounded-full bg-violet-600 opacity-50 blur-[90px]" />
          <i className="absolute -bottom-40 left-[38%] h-[380px] w-[380px] animate-[dh-drift_19s_ease-in-out_infinite_alternate] rounded-full bg-fuchsia-500 opacity-30 blur-[90px]" />
        </div>
        {/* Setka */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.09)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_30%,transparent_75%)]"
        />
        {/* Yulduzchalar */}
        {SPARKS.map(([x, y, d], k) => (
          <span
            key={k}
            aria-hidden="true"
            className="pointer-events-none absolute h-1 w-1 animate-[dh-twinkle_3.4s_ease-in-out_infinite] rounded-full bg-white opacity-0 shadow-[0_0_12px_3px_rgba(125,211,252,.8)]"
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }}
          />
        ))}

        <div className="relative mx-auto grid w-[min(1180px,100%-40px)] items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          {/* Matn */}
          <div className="flex flex-col items-start gap-6">
            <span
              className={`${POP} inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-3.5 py-1.5 text-[13px] text-sky-300`}
              style={{ animationDelay: "100ms" }}
            >
              <Sparkles className="h-3.5 w-3.5" /> Yangi: Writing va Speaking uchun AI tekshiruv
            </span>

            <h1 className="text-[clamp(2.5rem,5.6vw,4.6rem)] font-extrabold leading-[1.06] tracking-[-.03em] [perspective:600px]">
              {["Ingliz", "tilini"].map((w, i) => (
                <span key={w} className={WORD} style={{ animationDelay: `${150 + (i + 1) * 110}ms` }}>
                  {w}&nbsp;
                </span>
              ))}
              <span
                className={`inline-block opacity-0 animate-[dh-word_.8s_cubic-bezier(.2,.8,.2,1)_forwards,dh-flow_5s_linear_infinite] bg-gradient-to-r from-sky-300 via-violet-400 to-fuchsia-300 bg-[length:200%_100%] bg-clip-text text-transparent motion-reduce:animate-none motion-reduce:opacity-100`}
                style={{ animationDelay: `${150 + 3 * 110}ms, 0s` }}
              >
                olmosdek&nbsp;
              </span>
              <span className={WORD} style={{ animationDelay: `${150 + 4 * 110}ms` }}>
                sayqallang
              </span>
            </h1>

            <p className={`${POP} max-w-[56ch] text-lg text-slate-400`} style={{ animationDelay: "700ms" }}>
              Video darslar, vazifalar va haqiqiy imtihon formatidagi online{" "}
              <b className="text-slate-100">Multilevel (CEFR)</b> testlar. Natijangizni sun’iy intellekt tahlil qilib,
              aniq ball va maslahat beradi.
            </p>

            <div className={`${POP} flex flex-wrap gap-3.5`} style={{ animationDelay: "820ms" }}>
              <Link href={ctaHref} className={`${BTN} px-8 py-4 text-[17px]`}>
                {ctaText} <ArrowRight className="h-[18px] w-[18px]" />
                <span className="pointer-events-none absolute -inset-0.5 animate-[dh-pulse_2.6s_infinite] rounded-full border-2 border-sky-300 opacity-0" />
              </Link>
              <a href="#imkoniyatlar" className={`${BTN_GHOST} px-8 py-4 text-[17px]`}>
                Imkoniyatlarni ko‘rish
              </a>
            </div>

            <ul className={`${POP} flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400`} style={{ animationDelay: "940ms" }}>
              {["To‘liq imtihon formati", "AI tahlil va maslahat", "Telefon va kompyuterda"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-sky-300" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Vizual */}
          <div className="relative order-first grid h-[440px] place-items-center sm:h-[480px] lg:order-none lg:h-[520px]" aria-hidden="true">
            <div className="relative mt-3.5 h-[230px] w-[230px] self-start animate-[dh-float_6s_ease-in-out_infinite] sm:h-[300px] sm:w-[300px]">
              <svg
                viewBox="0 0 200 200"
                className="h-full w-full origin-[50%_60%] animate-[dh-spin_9s_ease-in-out_infinite] drop-shadow-[0_20px_50px_rgba(125,211,252,.45)]"
              >
                <defs>
                  <linearGradient id="g-crown" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#bae6fd" />
                    <stop offset="1" stopColor="#a78bfa" />
                  </linearGradient>
                  <linearGradient id="g-pav" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7dd3fc" />
                    <stop offset="1" stopColor="#6d28d9" />
                  </linearGradient>
                  <linearGradient id="g-light" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#fff" stopOpacity="0" />
                    <stop offset=".5" stopColor="#fff" stopOpacity=".7" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                  </linearGradient>
                  <clipPath id="g-clip">
                    <polygon points="55,45 145,45 180,90 100,175 20,90" />
                  </clipPath>
                </defs>
                <polygon points="55,45 145,45 180,90 20,90" fill="url(#g-crown)" />
                <polygon points="20,90 180,90 100,175" fill="url(#g-pav)" />
                <g stroke="#fff" strokeOpacity=".45" strokeWidth="1" fill="none">
                  <path d="M80 90 55 45M120 90 145 45M100 45 80 90M100 45 120 90M80 90 100 175M120 90 100 175" />
                </g>
                <g clipPath="url(#g-clip)">
                  <g transform="skewX(-20)">
                    <rect
                      className="animate-[dh-sweep_4s_ease-in-out_infinite]"
                      x="-60"
                      y="30"
                      width="50"
                      height="160"
                      fill="url(#g-light)"
                    />
                  </g>
                </g>
              </svg>
              <span className="absolute -inset-10 animate-[dh-rot_24s_linear_infinite] rounded-full border border-dashed border-sky-300/30 max-sm:hidden" />
              <span className="absolute -inset-[90px] animate-[dh-rot_38s_linear_infinite] rounded-full border border-dashed border-violet-400/20 [animation-direction:reverse] max-sm:hidden" />
            </div>

            {[
              { Icon: Headphones, t: "Listening", c: "left-[4%] top-[6%]", d: "0s" },
              { Icon: BookOpen, t: "Reading", c: "right-0 top-[14%]", d: "-1.2s" },
              { Icon: Pencil, t: "Writing", c: "-left-[2%] top-[46%]", d: "-2.4s" },
              { Icon: Mic, t: "Speaking", c: "-right-[2%] top-[40%]", d: "-3.4s" },
            ].map(({ Icon, t, c, d }) => (
              <div
                key={t}
                style={{ animationDelay: d }}
                className={`absolute hidden animate-[dh-bob_5s_ease-in-out_infinite] items-center gap-2 rounded-2xl border border-white/10 bg-[#0f1228]/70 px-3.5 py-2 text-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,.6)] backdrop-blur-xl sm:inline-flex ${c}`}
              >
                <Icon className="h-4 w-4 text-sky-300" /> {t}
              </div>
            ))}

            <div className="absolute bottom-0 left-1/2 w-[min(330px,92%)] -translate-x-1/2 rounded-[20px] border border-white/10 bg-[#0c0e22]/80 p-[18px] pb-3.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,.7)] backdrop-blur-2xl">
              <div className="mb-3 flex items-center justify-between text-[13px] text-slate-400">
                <span>Namuna natija</span>
                <b className="rounded-full bg-gradient-to-r from-sky-300 via-violet-400 to-fuchsia-300 px-3 py-0.5 text-lg text-[#08091a]">
                  B2
                </b>
              </div>
              {(
                [
                  ["Listening", 62],
                  ["Reading", 58],
                  ["Writing", 55],
                  ["Speaking", 60],
                ] as const
              ).map(([name, v], k) => (
                <div key={name} className="mb-2 grid grid-cols-[74px_1fr_28px] items-center gap-2.5 text-[13px] text-slate-400">
                  <span>{name}</span>
                  <i className="block h-[7px] overflow-hidden rounded-full bg-white/10">
                    <u
                      className="block h-full w-0 animate-[dh-fill_1.2s_cubic-bezier(.2,.8,.2,1)_forwards] rounded-full bg-gradient-to-r from-sky-300 via-violet-400 to-fuchsia-300 no-underline motion-reduce:animate-none motion-reduce:w-[var(--w)]"
                      style={{ "--w": `${(v / 75) * 100}%`, animationDelay: `${0.9 + k * 0.15}s` } as CSSProperties}
                    />
                  </i>
                  <em className="text-right not-italic text-slate-100">{v}</em>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <div
        aria-hidden="true"
        className="overflow-hidden border-y border-white/10 bg-white/[.02] py-4 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
      >
        <div className="flex w-max animate-[dh-marq_32s_linear_infinite] gap-11">
          {[...MARQUEE, ...MARQUEE].map((m, k) => (
            <span key={k} className="inline-flex items-center gap-2.5 whitespace-nowrap text-[15px] text-slate-400">
              <Gem className="h-3.5 w-3.5 text-sky-300" /> {m}
            </span>
          ))}
        </div>
      </div>

      {/* ============ STATS ============ */}
      <section className="mx-auto grid w-[min(1180px,100%-40px)] grid-cols-2 gap-4 pb-2.5 pt-[70px] lg:grid-cols-4 lg:gap-[18px]">
        {STATS.map((s, k) => (
          <Reveal key={s.l} delay={k * 90}>
            <div className="h-full rounded-[20px] border border-white/10 bg-white/5 p-6 text-center">
              <strong className={`block text-4xl font-extrabold tracking-tight md:text-5xl ${GRAD_TEXT}`}>
                <Counter to={s.n} suffix={s.s} />
              </strong>
              <span className="text-sm text-slate-400">{s.l}</span>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ============ IMKONIYATLAR ============ */}
      <section id="imkoniyatlar" className="relative py-[70px] md:py-[100px]">
        <div className="mx-auto w-[min(1180px,100%-40px)]">
          <Reveal>
            <SectionHead
              eyebrow="Imkoniyatlar"
              sub="Darslardan tortib AI baholashgacha. Natijaga olib boradigan hamma narsa shu yerda."
            >
              O‘qish va imtihonga tayyorlanish — <em className={`not-italic ${GRAD_TEXT}`}>bitta platformada</em>
            </SectionHead>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, k) => (
              <Reveal key={f.title} delay={(k % 3) * 100}>
                <Tilt>
                  <div className={CARD}>
                    <span className={GLOW} />
                    <IconBox icon={f.icon} />
                    <h3 className="text-xl font-bold">{f.title}</h3>
                    <p className="text-[15px] text-slate-400">{f.text}</p>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MULTILEVEL ============ */}
      <section
        id="multilevel"
        className="relative bg-gradient-to-b from-transparent via-[#0a0c1d] to-transparent py-[70px] md:py-[100px]"
      >
        <div className="mx-auto w-[min(1180px,100%-40px)]">
          <Reveal>
            <SectionHead
              eyebrow="Multilevel (CEFR)"
              sub="To‘rt bo‘lim, har biri o‘z vaqti bilan. Natija 0–75 ball va CEFR darajasi ko‘rinishida beriladi."
            >
              Imtihon xuddi <em className={`not-italic ${GRAD_TEXT}`}>haqiqiysidek</em> o‘tadi
            </SectionHead>
          </Reveal>

          <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {SKILLS.map((s, k) => (
              <Reveal key={s.name} delay={k * 100}>
                <Tilt>
                  <div className={CARD}>
                    <span className={GLOW} />
                    <span className="absolute right-[18px] top-2 text-7xl font-extrabold leading-none text-white/5">
                      0{k + 1}
                    </span>
                    <IconBox icon={s.icon} />
                    <h3 className="text-xl font-bold">{s.name}</h3>
                    <b className="text-sm font-semibold text-sky-300">{s.meta}</b>
                    <p className="text-[15px] text-slate-400">{s.note}</p>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, k) => (
              <Reveal key={s.t} delay={k * 110}>
                <div className="relative border-t-2 border-white/10 px-5 pb-2 pt-[22px]">
                  <span className="absolute -top-0.5 left-0 h-0.5 w-11 bg-gradient-to-r from-sky-300 to-violet-400" />
                  <span className="mb-3 grid h-[34px] w-[34px] place-items-center rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-sm font-bold text-[#08091a]">
                    {k + 1}
                  </span>
                  <h4 className="mb-1.5 text-[17px] font-semibold">{s.t}</h4>
                  <p className="text-[15px] text-slate-400">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ E'LONLAR (Advertisement) ============ */}
      {ads.length > 0 && (
        <section id="yangiliklar" className="relative py-[70px] md:py-[100px]">
          <div className="mx-auto w-[min(1180px,100%-40px)]">
            <Reveal>
              <SectionHead eyebrow="E‘lonlar">
                Yangiliklar va <em className={`not-italic ${GRAD_TEXT}`}>aksiyalar</em>
              </SectionHead>
            </Reveal>
            <Reveal delay={100}>
              <AdSlider ads={ads} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ============ NARX ============ */}
      <section
        id="narx"
        className="relative bg-gradient-to-b from-transparent via-[#0a0c1d] to-transparent py-[70px] md:py-[100px]"
      >
        <div className="mx-auto w-[min(1180px,100%-40px)]">
          <Reveal>
            <SectionHead eyebrow="Narx">
              Sizga mos <em className={`not-italic ${GRAD_TEXT}`}>variantni</em> tanlang
            </SectionHead>
          </Reveal>

          <div className="mx-auto grid max-w-[880px] gap-[22px] md:grid-cols-2">
            <Reveal>
              <Tilt>
                <div className={`${CARD} !border-sky-300/40 !from-sky-300/[.12] !to-violet-400/[.06] shadow-[0_30px_80px_-30px_rgba(125,211,252,.35)]`}>
                  <span className={GLOW} />
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-3.5 py-1.5 text-xs text-sky-300">
                    Eng qulay
                  </span>
                  <h3 className="text-xl font-bold">Diamond Academy o‘quvchisi</h3>
                  <strong className={`text-4xl font-extrabold tracking-tight ${GRAD_TEXT}`}>Bepul</strong>
                  <p className="text-[15px] text-slate-400">
                    Markazimizda o‘qiydigan o‘quvchilar barcha testlarni cheklovsiz topshiradi.
                  </p>
                  <ul className="mt-1.5 flex flex-col gap-2.5 text-[15px]">
                    {["To‘liq Multilevel mock", "AI Writing va Speaking", "Video darslar va vazifalar"].map((t) => (
                      <li key={t} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-sky-300" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Tilt>
            </Reveal>

            <Reveal delay={120}>
              <Tilt>
                <div className={CARD}>
                  <span className={GLOW} />
                  <h3 className="text-xl font-bold">Mehmon</h3>
                  <strong className="text-3xl font-extrabold leading-tight tracking-tight">Har bir test uchun</strong>
                  <p className="text-[15px] text-slate-400">
                    Markazda o‘qimasangiz ham testlarni topshirishingiz mumkin. To‘lov har bir test uchun alohida.
                  </p>
                  <ul className="mt-1.5 flex flex-col gap-2.5 text-[15px]">
                    {["Natija va CEFR daraja", "AI tahlil va maslahat", "Test narxi test sahifasida ko‘rsatiladi"].map((t) => (
                      <li key={t} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-sky-300" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Tilt>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ YAKUNIY CTA ============ */}
      <section className="relative overflow-hidden border-t border-white/10 py-[120px] text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <i className="absolute -left-28 -top-36 h-[520px] w-[520px] animate-[dh-drift_14s_ease-in-out_infinite_alternate] rounded-full bg-blue-500 opacity-40 blur-[90px]" />
          <i className="absolute -bottom-40 left-[38%] h-[380px] w-[380px] animate-[dh-drift_19s_ease-in-out_infinite_alternate] rounded-full bg-fuchsia-500 opacity-30 blur-[90px]" />
        </div>
        <Reveal>
          <div className="relative mx-auto flex w-[min(1180px,100%-40px)] flex-col items-center gap-5">
            <Gem className="h-14 w-14 animate-[dh-float_5s_ease-in-out_infinite] text-sky-300 drop-shadow-[0_10px_24px_rgba(125,211,252,.6)]" />
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Natijangizni bugundan <em className={`not-italic ${GRAD_TEXT}`}>yaxshilang</em>
            </h2>
            <p className="text-lg text-slate-400">Ro‘yxatdan o‘ting va birinchi testni hoziroq boshlang.</p>
            <Link href={ctaHref} className={`${BTN} px-8 py-4 text-[17px]`}>
              {ctaText} <ArrowRight className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/10 py-7 text-sm text-slate-400">
        <div className="mx-auto flex w-[min(1180px,100%-40px)] flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2.5 font-semibold text-slate-100">
            <Gem className="h-[22px] w-[22px] text-sky-300" /> Diamond <b className={GRAD_TEXT}>Academy</b>
          </span>
          <span>© {new Date().getFullYear()} Diamond Academy. Barcha huquqlar himoyalangan.</span>
        </div>
      </footer>
    </div>
  );
}