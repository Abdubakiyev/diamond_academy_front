'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/features/api/auth';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TestResult } from '@/features/types/test-result';
import { Trophy, CheckCircle, XCircle, Home, Clock, Calendar, User, Award, TrendingUp, Target } from 'lucide-react';

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get('resultId');
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [scorePercentage, setScorePercentage] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/register");
    }
  }, [router]);

  useEffect(() => {
    if (!resultId) return;

    const fetchResult = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No token found');

        const res = await api.get<TestResult>(`/test-result/${resultId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setResult(res.data);
        
        // Calculate percentage
        if (res.data.correctCount !== undefined && res.data.wrongCount !== undefined) {
          const total = res.data.correctCount + res.data.wrongCount;
          const percentage = total > 0 ? Math.round((res.data.correctCount / total) * 100) : 0;
          setScorePercentage(percentage);
        }
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Failed to load result');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Header />
        <main className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Natija yuklanmoqda...</p>
          <p className="text-gray-500 text-sm mt-2">Iltimos, biroz kuting</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Error/not found state
  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Header />
        <main className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Natija topilmadi</h2>
          <p className="text-gray-600 mb-6 text-center">Soralgan test natijasi mavjud emas</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
          >
            Bosh sahifaga qaytish
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate values
  const totalQuestions = result.correctCount + result.wrongCount;
  const percentage = totalQuestions > 0 ? Math.round((result.correctCount / totalQuestions) * 100) : 0;
  
  // Determine result color and message based on percentage
  const getResultColor = () => {
    if (percentage >= 90) return 'from-emerald-500 to-green-600';
    if (percentage >= 75) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getResultMessage = () => {
    if (percentage >= 90) return "Ajoyib natija! Mukammal! 🎯";
    if (percentage >= 75) return "Yaxshi natija! Juda yaxshi! 👍";
    if (percentage >= 60) return "Qoniqarli natija! Yaxshilashingiz mumkin. 💪";
    return "Yaxshilash uchun imkoniyat bor. Qayta urinib ko'ring! 📚";
  };

  const getResultLevel = () => {
    if (percentage >= 90) return "A'lo";
    if (percentage >= 75) return "Yaxshi";
    if (percentage >= 60) return "Qoniqarli";
    return "O'rtacha";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Hero Result Card */}
        <div className={`bg-gradient-to-r ${getResultColor()} rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8`}>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-6 h-6" />
                <span className="text-white/90">Test natijasi</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{getResultMessage()}</h1>
              <p className="text-white/90">
                {result.user?.name || "Foydalanuvchi"} - {result.level?.type || "Level"}
              </p>
            </div>
            
            <div className="relative">
              <div className="w-40 h-40 bg-white/10 backdrop-blur-sm rounded-full flex flex-col items-center justify-center">
                <div className="text-5xl font-bold">{percentage}%</div>
                <div className="text-white/90 mt-2">Umumiy natija</div>
              </div>
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-white/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Score Cards */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">To'g'ri javoblar</p>
                <p className="text-3xl font-bold text-gray-900">{result.correctCount}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Foiz</span>
                <span>{Math.round((result.correctCount / totalQuestions) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(result.correctCount / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-rose-100 rounded-lg flex items-center justify-center mr-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Noto'g'ri javoblar</p>
                <p className="text-3xl font-bold text-gray-900">{result.wrongCount}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Foiz</span>
                <span>{Math.round((result.wrongCount / totalQuestions) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-400 to-rose-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(result.wrongCount / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mr-4">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Daraja</p>
                <p className="text-3xl font-bold text-gray-900">{getResultLevel()}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Umumiy natija</span>
                <span>{percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r h-2 rounded-full transition-all duration-1000 ${getResultColor()}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Info Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-3 text-blue-600" />
              Test ma'lumotlari
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">Foydalanuvchi</p>
                    <p className="font-medium text-gray-800">{result.user?.name || "Noma'lum"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center mr-3">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">Level</p>
                    <p className="font-medium text-gray-800">{result.level?.type || "Noma'lum"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mr-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">Yakunlangan sana</p>
                    <p className="font-medium text-gray-800">
                      {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : "Noma'lum"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center mr-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">Jami savollar</p>
                    <p className="font-medium text-gray-800">{totalQuestions} ta</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-3 text-blue-600" />
              Statistik tahliil
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700">To'g'ri javoblar</span>
                  <span className="text-green-600 font-bold">{result.correctCount} ta</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${(result.correctCount / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700">Noto'g'ri javoblar</span>
                  <span className="text-red-600 font-bold">{result.wrongCount} ta</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-red-400 to-rose-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${(result.wrongCount / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{result.correctCount}</div>
                    <p className="text-gray-600 text-sm">To'g'ri</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{result.wrongCount}</div>
                    <p className="text-gray-600 text-sm">Noto'g'ri</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full ${getResultColor().replace('from-', 'bg-gradient-to-r from-')} text-white font-medium`}>
                    <Award className="w-4 h-4 mr-2" />
                    {getResultLevel()} daraja
                  </div>
                  <p className="text-gray-600 text-sm mt-2">
                    {percentage >= 70 ? "Ajoyib ishladingiz!" : "Yana bir bor urinib ko'ring!"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-lg font-bold text-gray-900">Keyingi qadamlar</h3>
              <p className="text-gray-600 text-sm">Natijangizni yaxshilash uchun davom eting</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                <Home className="w-4 h-4" />
                Bosh sahifaga qaytish
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Natijani yangilash
              </button>
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
            Natijangizni yaxshilash uchun maslahatlar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <span className="text-emerald-600 text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Muntazam mashq</p>
                <p className="text-gray-600 text-sm">Har kuni 20 daqiqa mashq qiling</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <span className="text-emerald-600 text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Xatolarni tahlil</p>
                <p className="text-gray-600 text-sm">Noto'g'ri javoblaringizni qayta ko'rib chiqing</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <span className="text-emerald-600 text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Qayta urinish</p>
                <p className="text-gray-600 text-sm">Bir hafta o'tgach testni qayta ishlang</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}