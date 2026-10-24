'use client';

import { useSyncExternalStore } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';

const STORAGE_KEY = 'access_code_enabled';
const CHANGE_EVENT = 'access-code-change';

// Boshqa tab'dagi o'zgarish (storage) va shu tab'dagi o'zgarish (custom event)ga obuna
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

// Brauzerda: default true (yoqilgan)
function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) !== 'false';
}

// Serverda: default true
function getServerSnapshot() {
  return true;
}

export default function AccessCodeToggle() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    localStorage.setItem(STORAGE_KEY, String(!enabled));
    // Shu tab'dagi obunachilarni xabardor qilish
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl p-5 border backdrop-blur-sm
        flex items-center justify-between transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-xl
        ${
          enabled
            ? 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-100 shadow-lg shadow-blue-500/10'
            : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 border-gray-200 shadow-md shadow-gray-400/10'
        }`}
    >
      {/* Orqa fondagi yumshoq yorug'lik */}
      <div
        className={`pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500 ${
          enabled ? 'bg-blue-400/20 opacity-100' : 'opacity-0'
        }`}
      />

      <div className="relative flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-all duration-300 ${
            enabled
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-blue-400/50 shadow-md shadow-blue-500/30'
              : 'bg-gray-100 text-gray-400 ring-gray-200'
          }`}
        >
          {enabled ? <ShieldCheck size={24} /> : <ShieldOff size={24} />}
        </div>

        <div>
          <p className="font-semibold text-gray-900 tracking-tight">Kirish kodi</p>
          <p
            className={`text-sm transition-colors duration-300 ${
              enabled ? 'text-blue-600/80' : 'text-gray-500'
            }`}
          >
            {enabled
              ? "Foydalanuvchilardan kod so'raladi"
              : "Kod so'ralmaydi — hammaga ochiq"}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Kirish kodini yoqish yoki o'chirish"
        onClick={toggle}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95
          ${
            enabled
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-inner shadow-blue-900/20 focus-visible:ring-blue-500'
              : 'bg-gray-300 shadow-inner shadow-gray-500/20 focus-visible:ring-gray-400'
          }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white
            shadow-md ring-1 ring-black/5
            transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${enabled ? 'translate-x-8' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}