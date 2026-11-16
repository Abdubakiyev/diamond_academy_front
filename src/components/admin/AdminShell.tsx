'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import AdminLayout from '../AdminLayout';
import RequireRole from '../RequireRole';

export default function AdminShell({
  title,
  subtitle,
  back,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <RequireRole roles={['ADMIN', 'TEACHER']}>
      <div className="min-h-screen bg-slate-50">
        <AdminLayout />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          {back && (
            <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600">
              <ArrowLeft className="h-4 w-4" /> {back.label}
            </Link>
          )}
          <div className="da-fade-up mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </RequireRole>
  );
}
