// src/lib/api.ts
import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");

// Admin tokeni qaysi kalit bilan saqlanishi loyihada farq qilishi mumkin,
// shuning uchun bir nechta odatiy kalitni tekshiramiz.
const TOKEN_KEYS = ["token", "accessToken", "access_token", "authToken"];

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    for (const k of TOKEN_KEYS) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
