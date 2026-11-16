'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PlayCircle,
  User,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

interface StoredUser {
  name?: string;
  role?: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const USER_KEY = 'user';
const USER_CHANGE_EVENT = 'user-change';
const ADMIN_HOME = '/diamond-academy/admin';

/** Hamma foydalanuvchilar uchun */
const baseItems: NavItem[] = [
  { label: 'Bosh sahifa', path: '/', icon: Home },
  { label: 'Kurslar', path: '/courses', icon: BookOpen },
  { label: 'Imtihonlar', path: '/exams', icon: FileText },
  { label: 'Natijalarim', path: '/my/attempts', icon: BarChart3 },
  { label: 'To‘lovlarim', path: '/my/payments', icon: CreditCard },
  { label: 'Kurslarim', path: '/my/courses', icon: PlayCircle },
  { label: 'Profil', path: '/profile', icon: User },
];

/** Faqat xodimlar uchun qo'shimcha tugma */
const adminItem: NavItem = { label: 'Boshqaruv', path: ADMIN_HOME, icon: LayoutDashboard };
const teacherItem: NavItem = { label: 'Jadval', path: `${ADMIN_HOME}/groups`, icon: Users };

// localStorage'dagi foydalanuvchini tashqi store sifatida o'qish
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(USER_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(USER_CHANGE_EVENT, callback);
  };
}
const getSnapshot = () => localStorage.getItem(USER_KEY);
const getServerSnapshot = () => null;

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const rawUser = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const user = useMemo<StoredUser | null>(() => {
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as StoredUser;
    } catch {
      return null;
    }
  }, [rawUser]);

  const role = user?.role?.toUpperCase();
  const navItems = useMemo<NavItem[]>(() => {
    if (role === 'ADMIN') return [...baseItems, adminItem];
    if (role === 'TEACHER') return [...baseItems, teacherItem];
    return baseItems;
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_verified');
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event(USER_CHANGE_EVENT));
    setMobileOpen(false);
    router.replace('/register');
  };

  // "/" faqat aniq mos kelganda; qolganlari ichki sahifalarda ham faol ("/" bilan solishtiriladi)
  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-900/20 border-b border-white/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo va brand */}
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl transition-opacity hover:opacity-90
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <div className="w-11 h-11 sm:w-[52px] sm:h-[52px] rounded-full overflow-hidden border-2 border-white/30 shadow-lg shadow-blue-900/30 shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Diamond Academy logotipi"
                width={52}
                height={52}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Diamond Academy
              </span>
              <span className="text-xs text-blue-100 opacity-80 tracking-wide hidden sm:block">
                {"Ta'lim - Kelajagingiz Kaliti"}
              </span>
            </div>
          </Link>

          {/* Navigatsiya: desktop (lg dan katta) */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Asosiy menyu">
            {navItems.map(({ label, path, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  href={path}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
                    ${
                      active
                        ? 'bg-white/15 shadow-inner shadow-black/10'
                        : 'text-blue-50 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span className="font-medium">{label}</span>
                  <span
                    className={`absolute left-2.5 right-2.5 -bottom-0.5 h-0.5 rounded-full bg-white/80 transition-all duration-300
                      ${active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Foydalanuvchi amallari */}
          <div className="flex items-center gap-3">
            {/* Profil: katta ekran */}
            <div className="hidden xl:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/15">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 ring-2 ring-white/30 shadow-md shadow-cyan-500/30 flex items-center justify-center text-sm font-bold shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name || 'User'}</span>
                <span className="text-xs text-blue-100 opacity-80">{user?.role || 'Student'}</span>
              </div>
            </div>

            {/* Chiqish */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Chiqish"
              className="group flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 rounded-xl
                       shadow-lg shadow-red-900/30 ring-1 ring-white/10
                       hover:from-red-400 hover:to-rose-500 hover:shadow-red-500/40
                       active:scale-95 transition-all
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:rotate-12" />
              <span className="font-medium hidden md:inline">Chiqish</span>
            </button>

            {/* Mobil menyu tugmasi */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 ring-1 ring-white/15
                       hover:bg-white/20 active:scale-95 transition-all
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobil navigatsiya */}
        <div
          id="mobile-nav"
          className={`lg:hidden grid transition-[grid-template-rows,visibility] duration-300 ease-out
            ${mobileOpen ? 'grid-rows-[1fr] visible' : 'grid-rows-[0fr] invisible'}`}
        >
          <div className="overflow-hidden">
            <nav aria-label="Mobil menyu" className="mt-4 pt-4 border-t border-white/20">
              {user?.name && (
                <p className="mb-3 px-1 text-sm text-blue-100">
                  {user.name} <span className="opacity-70">· {user.role || 'Student'}</span>
                </p>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {navItems.map(({ label, path, icon: Icon }) => {
                  const active = isActive(path);
                  return (
                    <Link
                      key={path}
                      href={path}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-center transition-all active:scale-95
                        ${active ? 'bg-white/20 text-white' : 'text-blue-50 bg-white/5 hover:bg-white/10'}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs leading-tight">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
