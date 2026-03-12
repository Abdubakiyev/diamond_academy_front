"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLevels } from "@/features/hooks/useLevel";

export default function Home() {
  const router = useRouter();
  const { data: levels = [], isLoading, error } = useLevels();

  // ✅ Token check (client-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/register"); // replace → back bosilganda qaytib kelmasin
    }
  }, [router]);

  // ✅ Level bosilganda test page
  const handleLevelClick = (levelId: string) => {
    router.push(`/test/${levelId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-10 mt-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bilimingizni <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Sinab Ko'ring</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            O'zingizga mos darajani tanlang va testni boshlang
          </p>
        </div>

        {/* Loading State */}
        {isLoading&& (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Level yuklanmoqda...</p>
            <p className="text-gray-500 text-sm mt-2">Iltimos, biroz kuting</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-lg mx-auto bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Xatolik yuz berdi</h3>
            <p className="text-gray-600 mb-6">{error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              Qayta yuklash
            </button>
          </div>
        )}

        {/* Levels Grid */}
        {!isLoading && !error && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Levellar</h2>
                <p className="text-gray-600 mt-2">O'zingizga mos darajani tanlang</p>
              </div>
              <div className="hidden sm:block px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-medium shadow-lg">
                {levels.length} ta level mavjud
              </div>
            </div>

            {/* Level Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {levels.map((level, index) => (
                <div
                  key={level.id}
                  onClick={() => handleLevelClick(level.id)}
                  className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
                >
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-100 to-indigo-100 transform translate-x-10 -translate-y-10 rotate-45"></div>
                  
                  {/* Level number */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-4">
                      <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {level.type}
                      </h3>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                      <span className="text-sm text-gray-500">Testni boshlash</span>
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 rounded-full flex items-center justify-center transition-all">
                        <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover effect line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{levels.length}</div>
                  <p className="text-blue-100">Mavjud Level</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {levels.length * 10}+
                  </div>
                  <p className="text-blue-100">Jami Testlar</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    1000+
                  </div>
                  <p className="text-blue-100">Faol O'quvchilar</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-blue-400">
                <p className="text-center text-blue-100">
                  Har bir level sizning bilimingizni yangi bosqichga olib chiqadi
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Qanday boshlash kerak?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Level tanlang</h4>
                    <p className="text-gray-600 text-sm">O'zingizga mos darajani tanlang</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Testni boshlang</h4>
                    <p className="text-gray-600 text-sm">Savollarni diqqat bilan o'qing</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Natijani ko'ring</h4>
                    <p className="text-gray-600 text-sm">O'z natijangizni tahlil qiling</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && levels.length === 0 && (
          <div className="max-w-lg mx-auto bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-10 text-center shadow-xl">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Levellar topilmadi</h3>
            <p className="text-gray-600 mb-6">
              Hozircha hech qanday level mavjud emas. Iltimos, keyinroq yana urinib ko'ring.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              Yangilash
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}