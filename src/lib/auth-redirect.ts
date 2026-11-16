import { ADMIN_HOME, USER_HOME } from './config';
import type { Role } from '../features/types/common';

const isSafePath = (p?: string | null): p is string => !!p && p.startsWith('/') && !p.startsWith('//');

/** Kirgandan keyin qayerga yo'naltirish: ?next= → rol bo'yicha → serverdagi redirect → foydalanuvchi bosh sahifasi */
export function resolveRedirect(role: Role, serverRedirect?: string, next?: string | null): string {
  const isStaff = role === 'ADMIN' || role === 'TEACHER';
  if (isSafePath(next) && (isStaff || !next.startsWith(ADMIN_HOME))) return next;
  if (isStaff) return ADMIN_HOME;
  if (isSafePath(serverRedirect) && !serverRedirect.startsWith(ADMIN_HOME)) return serverRedirect;
  return USER_HOME;
}
