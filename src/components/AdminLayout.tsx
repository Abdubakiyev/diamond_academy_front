'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { logout } from '@/lib/logout';

const ADMIN_HOME = '/diamond-academy/admin';

type Item = { label: string; path: string };
type Section = { label: string; path?: string; items?: Item[] };

const sections: Section[] = [
  { label: 'Home', path: ADMIN_HOME },
  {
    label: 'Markaz',
    items: [
      { label: 'Group', path: `${ADMIN_HOME}/group` },
      { label: 'Student', path: `${ADMIN_HOME}/students` },
      { label: 'Davomat', path: `${ADMIN_HOME}/attendance` },
      { label: 'To‘lovlar', path: `${ADMIN_HOME}/payment` },
      { label: 'Ota-onalar', path: `${ADMIN_HOME}/parents` },   // <- yangi
    ],
  },
  {
    label: 'Imtihon',
    items: [
      { label: 'Exams', path: `${ADMIN_HOME}/exams` },
      { label: 'Imtihon to‘lovlari', path: `${ADMIN_HOME}/exam-payments` },
      { label: 'Markaz o‘quvchilari', path: `${ADMIN_HOME}/center-students` },
      { label: 'Ball jadvali', path: `${ADMIN_HOME}/conversion` },
      { label: 'Urinishlar', path: `${ADMIN_HOME}/attempts` },
      { label: 'AI baholash', path: `${ADMIN_HOME}/ai` },
    ],
  },
  {
    label: 'Kurslar',
    items: [
      { label: 'Courses', path: `${ADMIN_HOME}/courses` },
      { label: 'Assignments', path: `${ADMIN_HOME}/assignments` },
    ],
  },
  {
    label: 'Boshqa',
    items: [
      { label: 'Results', path: `${ADMIN_HOME}/result` },
      { label: 'Level', path: `${ADMIN_HOME}/level` },
      { label: 'Tests', path: `${ADMIN_HOME}/test` },
      { label: 'Reklama', path: `${ADMIN_HOME}/advertisement` },
    ],
  },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const handleLogout = () => logout();

  // "/group" va "/groups", "/exams" va "/exam-payments" bir-birini faol qilmasligi uchun "/" bilan solishtiriladi
  const isActive = (path: string) =>
    path === ADMIN_HOME ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);
  const sectionActive = (s: Section) => (s.path ? isActive(s.path) : !!s.items?.some((i) => isActive(i.path)));

  // Ochiq ro'yxat: tashqariga bosilsa yoki Esc bosilsa yopiladi
  useEffect(() => {
    if (!openSection) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenSection(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenSection(null);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openSection]);

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-gray-900/95 via-gray-900/95 to-gray-800/95 backdrop-blur-md text-white shadow-lg shadow-black/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 md:h-16 lg:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={ADMIN_HOME}
          className="group flex items-center gap-2 cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Image
            src="/logo.png"
            alt="Diamond Academy logotipi"
            width={40}
            height={40}
            className="rounded-full object-cover ring-2 ring-blue-400/40 shadow-md shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-lg font-semibold tracking-wide bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Diamond Academy
          </span>
        </Link>

        {/* Desktop menyu */}
        <nav ref={navRef} className="hidden md:flex items-center gap-1 text-sm" aria-label="Admin menyu">
          {sections.map((s) => {
            const active = sectionActive(s);
            const base = `relative px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              active ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`;
            const underline = (
              <span
                className={`absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-300 origin-center ${
                  active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                }`}
              />
            );

            if (s.path) {
              return (
                <Link key={s.label} href={s.path} aria-current={active ? 'page' : undefined} className={base}>
                  {s.label}
                  {underline}
                </Link>
              );
            }

            const open = openSection === s.label;
            return (
              <div key={s.label} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenSection(open ? null : s.label)}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  className={`${base} inline-flex items-center gap-1`}
                >
                  {s.label}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  {underline}
                </button>

                {open && (
                  <div
                    role="menu"
                    className="absolute left-0 top-full z-50 mt-2 min-w-56 overflow-hidden rounded-xl border border-white/10 bg-gray-800/95 p-1.5 shadow-xl shadow-black/30 backdrop-blur-md"
                  >
                    {s.items?.map((item) => {
                      const itemActive = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          role="menuitem"
                          aria-current={itemActive ? 'page' : undefined}
                          onClick={() => setOpenSection(null)}
                          className={`block rounded-lg px-3 py-2 transition ${
                            itemActive ? 'bg-blue-500/20 text-blue-300' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            className="ml-3 inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600
                     hover:from-red-500 hover:to-rose-500 px-4 py-2 rounded-lg text-sm
                     shadow-md shadow-red-900/30 hover:shadow-lg hover:shadow-red-600/30
                     active:scale-95 transition-all
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <LogOut size={16} />
            Chiqish
          </button>
        </nav>

        {/* Mobil menyu tugmasi */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
            aria-expanded={mobileMenuOpen}
            aria-controls="admin-mobile-menu"
            className="rounded-lg p-1 hover:bg-white/10 active:scale-95 transition-all
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobil menyu */}
      <div
        id="admin-mobile-menu"
        className={`md:hidden grid transition-[grid-template-rows,visibility] duration-300 ease-out
          ${mobileMenuOpen ? 'grid-rows-[1fr] visible' : 'grid-rows-[0fr] invisible'}`}
      >
        <div className="overflow-hidden">
          <div className="max-h-[75vh] overflow-y-auto bg-gray-800/95 backdrop-blur-md text-white px-6 py-4 space-y-4 border-t border-white/10">
            {sections.map((s) => {
              const links: Item[] = s.path ? [{ label: s.label, path: s.path }] : (s.items ?? []);
              return (
                <div key={s.label} className="space-y-1">
                  {!s.path && (
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{s.label}</p>
                  )}
                  {links.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block w-full text-left rounded-lg px-3 py-2 transition-all
                          ${
                            active
                              ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/10 text-blue-300 border-l-2 border-blue-400'
                              : 'text-gray-300 hover:text-blue-400 hover:bg-white/5 border-l-2 border-transparent'
                          }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-left bg-gradient-to-r from-red-600 to-rose-600
                       hover:from-red-500 hover:to-rose-500 px-3 py-2 rounded-lg text-sm
                       active:scale-[0.98] transition-all"
            >
              <LogOut size={16} />
              Chiqish
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
