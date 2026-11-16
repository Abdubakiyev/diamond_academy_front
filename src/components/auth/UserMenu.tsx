'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, FileText, GraduationCap, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import { useLogout, useMe } from '../../features/hooks/useAuth';
import { initials } from '../../lib/format';
import { ADMIN_HOME, LOGIN_PATH } from '../../lib/config';

/** Header ichiga qo'yiladi: <UserMenu />. Kirmagan bo'lsa "Kirish" tugmasi chiqadi. */
export default function UserMenu() {
  const { data: me, isLoading } = useMe();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  if (isLoading) return <div className="h-9 w-24 animate-pulse rounded-full bg-white/10" />;

  if (!me) {
    return (
      <Link
        href={LOGIN_PATH}
        className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:from-blue-500 hover:to-indigo-500 active:scale-95"
      >
        Kirish
      </Link>
    );
  }

  const staff = me.role === 'ADMIN' || me.role === 'TEACHER';
  const item = 'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-sm text-white ring-1 ring-white/15 transition hover:bg-white/15"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-bold">
          {initials(me.name)}
        </span>
        <span className="hidden max-w-[8rem] truncate sm:block">{me.name}</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-2xl shadow-black/15">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-gray-900">{me.name}</p>
            <p className="text-xs text-gray-500">{me.role}</p>
          </div>
          <div className="my-1 h-px bg-gray-100" />
          <Link href="/profile" onClick={() => setOpen(false)} className={item}>
            <UserIcon className="h-4 w-4 text-gray-400" /> Profil
          </Link>
          <Link href="/my/courses" onClick={() => setOpen(false)} className={item}>
            <GraduationCap className="h-4 w-4 text-gray-400" /> Kurslarim
          </Link>
          <Link href="/my/attempts" onClick={() => setOpen(false)} className={item}>
            <FileText className="h-4 w-4 text-gray-400" /> Natijalarim
          </Link>
          {staff && (
            <Link href={ADMIN_HOME} onClick={() => setOpen(false)} className={item}>
              <LayoutDashboard className="h-4 w-4 text-gray-400" /> Boshqaruv paneli
            </Link>
          )}
          <div className="my-1 h-px bg-gray-100" />
          <button type="button" onClick={logout} className={`${item} w-full text-red-600 hover:bg-red-50`}>
            <LogOut className="h-4 w-4" /> Chiqish
          </button>
        </div>
      )}
    </div>
  );
}
