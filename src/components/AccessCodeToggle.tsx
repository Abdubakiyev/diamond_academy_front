'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';

export default function AccessCodeToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('access_code_enabled');
    // default: true (yoqilgan)
    setEnabled(stored !== 'false');
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem('access_code_enabled', String(next));
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {enabled
          ? <ShieldCheck className="text-blue-600" size={24} />
          : <ShieldOff className="text-gray-400" size={24} />
        }
        <div>
          <p className="font-semibold text-gray-800">Kirish kodi</p>
          <p className="text-sm text-gray-500">
            {enabled
              ? 'Foydalanuvchilardan kod so\'raladi'
              : 'Kod so\'ralmaydi — hammaga ochiq'}
          </p>
        </div>
      </div>

      <button
        onClick={toggle}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}