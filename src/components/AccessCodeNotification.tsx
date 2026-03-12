// src/components/AccessCodeNotification.tsx
'use client';

import { useEffect, useState } from 'react';
import { useCurrentAccessCode, useGenerateAccessCode } from '@/features/hooks/useAccess';
import { Key, Copy, RefreshCw, Clock, CheckCircle2 } from 'lucide-react';

export default function AccessCodeNotification() {
  const { data: accessCode, isLoading, error } = useCurrentAccessCode();
  const generateMutation = useGenerateAccessCode();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (accessCode) {
      setTimeLeft(accessCode.remainingSeconds);
    }
  }, [accessCode]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleGenerateNewCode = async () => {
    try {
      await generateMutation.mutateAsync();
    } catch (error) {
      console.error('Error generating new code:', error);
    }
  };

  const copyToClipboard = () => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-white/20 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-white/20 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !accessCode) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-3 rounded-full">
            <Key className="text-red-600" size={24} />
          </div>
          <div className="flex-1">
            <p className="text-red-800 font-medium">Access code topilmadi</p>
            <p className="text-red-600 text-sm">Yangi kod yaratish uchun tugmani bosing</p>
          </div>
          <button
            onClick={handleGenerateNewCode}
            disabled={generateMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={generateMutation.isPending ? 'animate-spin' : ''} />
            Yaratish
          </button>
        </div>
      </div>
    );
  }

  const isExpiringSoon = timeLeft < 120;

  return (
    <div className={`rounded-xl shadow-lg p-6 transition-all duration-300 ${
      isExpiringSoon 
        ? 'bg-gradient-to-r from-orange-500 to-red-600' 
        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
    }`}>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="bg-white/20 p-4 rounded-full">
          <Key className="text-white" size={32} />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
            <h3 className="text-white text-lg font-semibold">Sayt kirish kodi</h3>
            {isExpiringSoon && (
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                Tez orada tugaydi!
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="bg-white/90 px-6 py-3 rounded-lg">
              <p className="text-3xl font-bold text-gray-800 tracking-wider font-mono">
                {accessCode.code}
              </p>
            </div>
            
            <button
              onClick={copyToClipboard}
              className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg transition-all"
              title="Nusxa olish"
            >
              {copied ? (
                <CheckCircle2 size={20} className="text-green-300" />
              ) : (
                <Copy size={20} />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="bg-white/20 px-4 py-2 rounded-lg flex items-center gap-2">
            <Clock className="text-white" size={20} />
            <span className="text-white font-bold text-xl font-mono">
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <button
            onClick={handleGenerateNewCode}
            disabled={generateMutation.isPending}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={generateMutation.isPending ? 'animate-spin' : ''} />
            Yangilash
          </button>
        </div>
      </div>

      <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-white h-full transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / 300) * 100}%` }}
        ></div>
      </div>

      <p className="text-white/80 text-sm mt-3 text-center md:text-left">
        Bu kodni foydalanuvchilar saytga kirish uchun ishlatadi. Kod har 5 minutda avtomatik yangilanadi.
      </p>
    </div>
  );
}