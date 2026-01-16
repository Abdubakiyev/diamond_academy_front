'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { register as registerUser } from '@/features/api/auth';
import { RegisterDto } from '@/features/types/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Eye, EyeOff, User, Phone, Loader2 } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterDto>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const onSubmit = async (data: RegisterDto) => {
    setLoading(true);
    setError(null);

    try {
      const res = await registerUser({
        name: data.name,
        phone: data.phone,
        ...(data.role ? { role: data.role } : {}),
      });

      // ✅ Token va userId localStoragega saqlash
      if (res.accessToken) localStorage.setItem('access_token', res.accessToken);
      if (res.user?.id) localStorage.setItem('user_id', res.user.id);

      // Muvaffaqiyatli ro'yxatdan o'tganlik haqida xabar
      setShowSuccess(true);
      
      // 2 sekunddan so'ng redirect qilish
      setTimeout(() => {
        // backend bergan redirect bo‘yicha
        router.push(res.redirect || '/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Roʻyxatdan oʻtishda xatolik yuz berdi. Iltimos, qayta urinib koʻring.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">

      <main className="flex-1 flex justify-center items-center p-4 md:p-8">
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          {/* Left side - Illustration and info */}
          <div className="hidden md:flex flex-col flex-1 max-w-md">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
              <h1 className="text-3xl font-bold mb-6">Hisobingizni yarating</h1>
              <p className="text-blue-100 mb-8 text-lg">
                Bizning platformamizga qo'shiling va barcha imkoniyatlardan foydalaning. 
                Ro'yxatdan o'tish bir necha daqiqa davom etadi.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Oson ro'yxatdan o'tish</h3>
                    <p className="text-blue-100">Faqat ismingiz va telefon raqamingizni kiriting</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Tezkor kirish</h3>
                    <p className="text-blue-100">Bir marta ro'yxatdan o'ting, har doim platformamizda qoling</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Registration form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Ro'yxatdan o'tish</h2>
              <p className="text-gray-600 mt-2">Yangi hisob yarating</p>
            </div>

            {showSuccess ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Muvaffaqiyatli ro'yxatdan o'tdingiz!</h3>
                <p className="text-gray-600 mb-8">Sizni sahifaga yo'naltiramiz...</p>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center text-red-700">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                      Ismingiz
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('name', { 
                          required: "Ismni kiriting", 
                          minLength: {
                            value: 2,
                            message: "Ism kamida 2 ta belgidan iborat bo'lishi kerak"
                          }
                        })}
                        id="name"
                        type="text"
                        placeholder="Ismingizni kiriting"
                        className={`w-full pl-10 pr-4 py-3 text-gray-700  border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                      Telefon raqamingiz
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('phone', { 
                          required: "Telefon raqamini kiriting",
                          pattern: {
                            value: /^\+998[0-9]{9}$/,
                            message: "+998901234567 formatida kiriting"
                          }
                        })}
                        id="phone"
                        type="tel"
                        placeholder="+998901234567"
                        className={`w-full pl-10 pr-4 py-3 text-gray-700  border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">Raqamni +998901234567 formatida kiriting</p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Ro'yxatdan o'tilmoqda...
                        </>
                      ) : (
                        "Ro'yxatdan o'tish"
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Yoki</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                      </svg>
                      GitHub
                    </button>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm6.25 15.5L10 11.25 3.75 15.5l1.75-6.5L2.5 6.5l6.5-.5L10 0l1 6 6.5.5-2.75 2.5 1.5 6.5z" clipRule="evenodd" />
                      </svg>
                      Google
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}