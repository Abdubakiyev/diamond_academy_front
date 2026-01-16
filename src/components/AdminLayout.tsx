'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function AdminHeader() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('access_token');
    router.push('/register');
  };

  const menuItems = [
    { label: 'Home', path: '/diamond-academy/admin' },
    { label: 'Results', path: '/diamond-academy/admin/result' },
    { label: 'Tests', path: '/diamond-academy/admin/test' },
  ];

  return (
    <header className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow">
      <div className="max-w-7xl mx-auto px-6 h-16 md:h-16 lg:h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/diamond_academy/admin" className="flex items-center gap-2 cursor-pointer">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <span className="text-lg font-semibold tracking-wide">
            Diamond Academy
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className="hover:text-blue-400 transition"
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="ml-3 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition"
          >
            Chiqish
          </button>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 text-white px-6 py-4 space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className="block w-full text-left hover:text-blue-400 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="block w-full text-left bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm transition"
          >
            Chiqish
          </button>
        </div>
      )}
    </header>
  );
}
