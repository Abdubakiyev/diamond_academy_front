'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Spinner from './ui/Spinner';
import { ADMIN_HOME, LOGIN_PATH, USER_HOME } from '../lib/config';
import { tokenStore } from '../lib/token';
import { ME_KEY, useMe } from '../features/hooks/useAuth';
import type { Role } from '../features/types/common';

/**
 * Sahifani himoya qiladi.
 *  <RequireRole>                       — faqat tizimga kirgan bo'lsa
 *  <RequireRole roles={['ADMIN']}>     — faqat shu rollar
 * Ruxsat bo'lmasa: tokensiz -> kirish sahifasi; boshqa rol -> o'z bosh sahifasi.
 */
export default function RequireRole({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!tokenStore.getAccess());
    setReady(true);
  }, []);

  const { data: me, isLoading, isError, refetch } = useMe(ready && hasToken);

  const allowed = !!me && (!roles || roles.includes(me.role));

  useEffect(() => {
    if (!ready) return;
    if (!hasToken) {
      // eski:  router.replace(LOGIN_PATH);   (useEffect ichida, !hasToken bo'lganda)
      router.replace(`${LOGIN_PATH}?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (me && !allowed) {
      router.replace(me.role === 'ADMIN' || me.role === 'TEACHER' ? ADMIN_HOME : USER_HOME);
    }
  }, [ready, hasToken, me, allowed, router]);

  if (!ready || !hasToken || isLoading) return <Spinner className="min-h-[50vh]" />;

  if (isError) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="mb-4 text-sm text-gray-600">Profilni yuklab bo‘lmadi.</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => refetch()} className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white">
            Qayta urinish
          </button>
          <button
            onClick={() => {
              tokenStore.clear();
              queryClient.removeQueries({ queryKey: ME_KEY });
              router.replace(LOGIN_PATH);
            }}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700"
          >
            Chiqish
          </button>
        </div>
      </div>
    );
  }

  if (!allowed) return <Spinner className="min-h-[50vh]" />;
  return <>{children}</>;
}
