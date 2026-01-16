"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/features/api/auth";
import { Level } from "@/features/types/level";
import { Test } from "@/features/types/test";
import { CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight, Send, BookOpen } from "lucide-react";

interface AnswerMap {
  [testId: string]: string;
}

export default function TestPage() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.id as string;

  const [level, setLevel] = useState<Level | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 daqiqa = 1800 soniya

  // 🔐 Token check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.replace("/register");
  }, [router]);

  // 📡 Fetch level + tests
  useEffect(() => {
    if (!levelId) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await api.get<Level>(`/level/${levelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLevel(res.data);
        setTests(res.data.tests || []);
      } catch (err) {
        console.error(err);
        alert("Level topilmadi");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [levelId]);

  // ⏳ Timer
  useEffect(() => {
    if (loading || !tests.length) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, tests.length]);

  const handleAnswerChange = (testId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [testId]: value }));
  };

  // ✅ SUBMIT
  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) return alert("Token yoki User ID topilmadi");

    try {
      setSubmitting(true);
      const payload = {
        userId,
        levelId,
        answers: Object.entries(answers).map(([testId, answer]) => ({
          testId,
          answer,
        })),
      };

      const res = await api.post('/test-result', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      router.push(`/result?resultId=${res.data.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Testni yuborishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercentage = tests.length > 0 ? (answeredCount / tests.length) * 100 : 0;

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
          <p className="mt-6 text-gray-600 text-lg font-medium">Test yuklanmoqda...</p>
          <p className="text-gray-500 text-sm mt-2">Iltimos, biroz kuting</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Header />
        <main className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Level topilmadi</h2>
          <p className="text-gray-600 mb-6 text-center">Soralgan level mavjud emas yoki o'chirilgan</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Test Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-blue-200 text-sm">Test</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{level.type} Level Test</h1>
              <p className="text-blue-100 mt-2">{tests.length} ta savol</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Qolgan vaqt</span>
                </div>
                <div className="text-2xl font-bold font-mono">{formatTime(timeLeft)}</div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Javob berilgan</span>
                </div>
                <div className="text-2xl font-bold">{answeredCount}/{tests.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Test jarayoni</span>
            <span className="text-blue-600 font-bold">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Boshlash</span>
            <span>Yakunlash</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4">Savollar ro'yxati</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-3 gap-2">
                {tests.map((test, index) => (
                  <button
                    key={test.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all ${
                      currentQuestion === index
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-110'
                        : answers[test.id]
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 mr-2"></div>
                  <span className="text-sm text-gray-600">Joriy savol</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Javob berilgan</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-gray-200 mr-2"></div>
                  <span className="text-sm text-gray-600">Javob berilmagan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Area */}
          <div className="lg:col-span-3">
            {tests.length > 0 && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="inline-block px-4 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-medium mb-3">
                        Savol {currentQuestion + 1}/{tests.length}
                      </span>
                      <h2 className="text-xl font-bold text-gray-900">
                        {tests[currentQuestion].question}
                      </h2>
                    </div>
                    <div className="text-sm text-gray-500">
                      {currentQuestion + 1}/{tests.length}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'A', text: tests[currentQuestion].optionA },
                      { key: 'B', text: tests[currentQuestion].optionB },
                      { key: 'C', text: tests[currentQuestion].optionC },
                      ...(tests[currentQuestion].optionD ? [{ key: 'D', text: tests[currentQuestion].optionD }] : [])
                    ].map((option) => (
                      <label
                        key={option.key}
                        className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          answers[tests[currentQuestion].id] === option.key
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={tests[currentQuestion].id}
                          checked={answers[tests[currentQuestion].id] === option.key}
                          onChange={() => handleAnswerChange(tests[currentQuestion].id, option.key)}
                          className="mt-1 mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 font-bold ${
                              answers[tests[currentQuestion].id] === option.key
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {option.key}
                            </div>
                            <span className="font-medium text-gray-900">{option.text}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestion === 0}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Oldingisi
                    </button>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {answers[tests[currentQuestion].id] ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Javob belgilangan
                        </span>
                      ) : (
                        <span className="text-amber-600">Javob belgilanmagan</span>
                      )}
                    </div>

                    {currentQuestion < tests.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestion(prev => Math.min(tests.length - 1, prev + 1))}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                      >
                        Keyingisi
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Yuborilmoqda...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Testni yakunlash
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Test Info */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-emerald-600" />
                    Test qoidalari
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <span className="text-emerald-600 text-sm">1</span>
                      </div>
                      <span>Har bir savol uchun faqat bitta to'g'ri javobni belgilang</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <span className="text-emerald-600 text-sm">2</span>
                      </div>
                      <span>Vaqt tugagach, test avtomatik ravishda yuboriladi</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <span className="text-emerald-600 text-sm">3</span>
                      </div>
                      <span>Barcha javoblarni tekshirib chiqish uchun savollar ro'yxatidan foydalaning</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Section */}
        {tests.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Testni yakunlash</h3>
                <p className="text-gray-600">
                  {answeredCount} ta savolga javob berdingiz. {tests.length - answeredCount} ta savol qoldi.
                </p>
              </div>
              <div className="flex gap-4 mt-4 md:mt-0">
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Yuborilmoqda...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Testni yuborish
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}