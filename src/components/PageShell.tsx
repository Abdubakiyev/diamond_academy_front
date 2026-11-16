'use client';

import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import RequireRole from './RequireRole';
import type { Role } from '../features/types/common';

export default function PageShell({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  return (
    <RequireRole roles={roles}>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </RequireRole>
  );
}
