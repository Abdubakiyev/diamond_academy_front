export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

/** Hozircha kirish register sahifasi orqali. /login tayyor bo'lgach (2-bo'lim) shu yerda o'zgartiriladi. */
export const LOGIN_PATH = '/login';

export const ADMIN_HOME = '/diamond-academy/admin';
export const USER_HOME = '/home';

