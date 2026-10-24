'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';

const ADMIN_HOME = '/diamond-academy/admin';

const menuItems = [
  { label: 'Home', path: ADMIN_HOME },
  { label: 'Results', path: `${ADMIN_HOME}/result` },
  { label: 'Level', path: `${ADMIN_HOME}/level` },
  { label: 'Reklama', path: `${ADMIN_HOME}/advertisement` },
  { label: 'Tests', path: `${ADMIN_HOME}/test` },
  { label: 'Davomat', path: `${ADMIN_HOME}/attendance` },
  { label: 'Student', path: `${ADMIN_HOME}/students` },
  { label: 'Group', path: `${ADMIN_HOME}/group` },
];

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('access_token');
    setMobileMenuOpen(false);
    router.replace('/register');
  };

  // Home faqat aniq mos kelganda, qolganlari ichki sahifalarda ham faol
  const isActive = (path: string) =>
    path === ADMIN_HOME ? pathname === path : pathname.startsWith(path);

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
        <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Admin menyu">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.label}
                href={item.path}
                aria-current={active ? 'page' : undefined}
                className={`relative px-3 py-2 rounded-lg transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                  ${
                    active
                      ? 'text-white bg-white/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                {item.label}
                <span
                  className={`absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400
                    transition-all duration-300 origin-center
                    ${active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}
                />
              </Link>
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
          <div className="bg-gray-800/95 backdrop-blur-md text-white px-6 py-4 space-y-3 border-t border-white/10">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.label}
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