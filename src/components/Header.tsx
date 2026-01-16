'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, Home, User, Bell, Settings } from 'lucide-react';

const Header = () => {
  const router = useRouter();

  const handleLogout = () => {
    // 🔥 localStorage tozalash
    localStorage.removeItem('user_id');
    localStorage.removeItem('access_token');

    // 🔁 register page ga o‘tish
    router.push('/register');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo va brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => router.push('/')}
          >
            <div className="relative w-15 h-15 rounded-full overflow-hidden bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/30 shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full overflow-hidden flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={60}
                    height={60}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Diamond Academy
              </h1>
              <p className="text-xs text-blue-100 opacity-80 tracking-wide">
                Ta'lim - Kelajagingiz Kaliti
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="/" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Bosh Sahifa</span>
            </a>

            <a 
              href="/" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all group"
            >
              <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Profil</span>
            </a>

            <a 
              href="/" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all group relative"
            >
              <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Xabarlar</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
                3
              </span>
            </a>

            <a 
              href="/" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all group"
            >
              <Settings className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Sozlamalar</span>
            </a>
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {/* User profile */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-bold">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Abdulloh</span>
                <span className="text-xs text-blue-100 opacity-80">Admin</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-red-500/25 group"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="font-medium hidden md:inline">Chiqish</span>
            </button>

            {/* Mobile menu button */}
            <button className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <span className="w-5 h-0.5 bg-white mb-1"></span>
              <span className="w-5 h-0.5 bg-white mb-1"></span>
              <span className="w-5 h-0.5 bg-white"></span>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-around">
            <a href="/" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Home className="w-5 h-5" />
              <span className="text-xs mt-1">Bosh Sahifa</span>
            </a>
            <a href="/" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/10 transition-colors">
              <User className="w-5 h-5" />
              <span className="text-xs mt-1">Profil</span>
            </a>
            <a href="/" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/10 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="text-xs mt-1">Xabarlar</span>
              <span className="absolute top-0 right-2 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                3
              </span>
            </a>
            <a href="/" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5" />
              <span className="text-xs mt-1">Sozlamalar</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;