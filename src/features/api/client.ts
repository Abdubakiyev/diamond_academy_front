import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URL, LOGIN_PATH } from '../../lib/config';
import { tokenStore } from '../../lib/token';

export const BASE_URL = API_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** Bir vaqtda kelgan ko'p 401 uchun refresh faqat bir marta bajariladi */
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');

  const { data } = await axios.post<{ accessToken: string; refreshToken?: string }>(
    `${BASE_URL}/auth/refresh`,
    { refreshToken },
  );
  tokenStore.set(data.accessToken, data.refreshToken);
  return data.accessToken;
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== LOGIN_PATH) window.location.href = LOGIN_PATH;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const isAuthCall = !!original?.url?.includes('/auth/');

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const token = await refreshPromise;
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      } catch {
        tokenStore.clear();
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
