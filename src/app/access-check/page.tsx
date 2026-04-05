'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useCheckAccessCode } from '@/features/hooks/useAccess';

export default function AccessCheckPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const checkMutation = useCheckAccessCode();

  // Agar avvaldan tasdiqlangan bo'lsa, tekshirish
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const verified = sessionStorage.getItem('access_verified');
      const userRole = localStorage.getItem('user_role');
      
      // Admin bo'lsa access check'dan o'tkazmaslik
      if (userRole === 'ADMIN') {
        router.push('/diamond-academy/admin');
        return;
      }
      
      if (verified === 'true') {
        router.push('/diamond-academy');
      }
    }
  }, [router]);

  // Sahifa yopilganda yoki refresh qilinganda tozalash
  useEffect(() => {
    const handleBeforeUnload = () => {
      // SessionStorage'ni tozalash (faqat tab yopilganda)
      sessionStorage.removeItem('access_verified');
      sessionStorage.removeItem('access_code');
    };

    // beforeunload event (tab yopilganda)
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Iltimos, kodni kiriting');
      return;
    }

    try {
      const result = await checkMutation.mutateAsync({ code: code.toUpperCase() });

      if (result.success) {
        setIsVerified(true);
        
        // SessionStorage'ga saqlash
        sessionStorage.setItem('access_verified', 'true');
        sessionStorage.setItem('access_code', code.toUpperCase());

        // 2 soniyadan keyin yo'naltirish
        setTimeout(() => {
          router.push('/diamond-academy');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Kod noto'g'ri yoki eskirgan");
      setCode('');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setCode(value);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4 shadow-lg">
            <Lock className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-700 mb-2">
            Diamond Academy
          </h1>
          <p className="text-gray-500">Saytga kirish uchun kod kiriting</p>
        </div>

        {/* Success Message */}
        {isVerified ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Tasdiqlandi!
            </h2>
            <p className="text-gray-500">
              Endi saytga kirishingiz mumkin...
            </p>
            <div className="mt-4">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        ) : (
          /* Access Code Form */
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Kirish kodi (6 ta belgi)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full px-6 py-4 text-2xl font-bold text-center border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-widest text-gray-700"
                  autoComplete="off"
                  autoFocus
                />
                
                {/* Character Counter */}
                <div className="mt-2 text-center">
                  <span className="text-sm text-gray-500">
                    {code.length} / 6 belgi
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={checkMutation.isPending || code.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkMutation.isPending ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    Tekshirilmoqda...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Tasdiqlash
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                💡 Kod 5 daqiqa mobaynida amal qiladi
              </p>
              <p className="text-xs text-gray-400 text-center mt-2">
                Kodni bilmasangiz, admin bilan bog'laning
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}