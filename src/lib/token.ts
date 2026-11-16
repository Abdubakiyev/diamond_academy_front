const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
// Eski kodda ishlatilgan kalitlar (o'qish uchun, yo'qotmaslik maqsadida)
const LEGACY_ACCESS_KEY = 'accessToken';
const LEGACY_REFRESH_KEY = 'refreshToken';

const isBrowser = () => typeof window !== 'undefined';

const read = (key: string): string | null => {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string | null) => {
  if (!isBrowser()) return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* private rejim yoki to'lgan storage */
  }
};

export const tokenStore = {
  getAccess: () => read(ACCESS_KEY) ?? read(LEGACY_ACCESS_KEY),
  getRefresh: () => read(REFRESH_KEY) ?? read(LEGACY_REFRESH_KEY),

  set(access: string, refresh?: string | null) {
    write(ACCESS_KEY, access);
    write(LEGACY_ACCESS_KEY, null);
    if (refresh) {
      write(REFRESH_KEY, refresh);
      write(LEGACY_REFRESH_KEY, null);
    }
  },

  clear() {
    [ACCESS_KEY, REFRESH_KEY, LEGACY_ACCESS_KEY, LEGACY_REFRESH_KEY, 'user_id'].forEach((k) => write(k, null));
  },
};
