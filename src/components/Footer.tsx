'use client'

import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  ArrowUp
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white pt-12 pb-8 px-4 md:px-8">
      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 
                   rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-500/25 
                   hover:scale-110 transition-all duration-300 animate-bounce-slow"
          aria-label="Yuqoriga chiqish"
        >
          <ArrowUp size={20} />
        </button>
      )}

      <div className="container mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Company info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-indigo-200 
                             bg-clip-text text-transparent">
                  Diamond Academy
                </h2>
                <p className="text-gray-400 text-sm">Kelajakni shakllantiramiz</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-lg">
              Diamond Academy - bu zamonaviy ta'lim platformasi bo'lib, eng yuqori 
              sifatli bilim va ko'nikmalarni o'rgatishga qaratilgan. Bizning maqsadimiz 
              har bir talabaning potentsialini to'liq ro'yobga chiqarish.
            </p>
            <div className="flex space-x-4">
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 
                               rounded-lg hover:from-blue-700 hover:to-indigo-700 
                               transition-all font-medium">
                Bepul konsultatsiya
              </button>
              <button className="px-6 py-2 border border-blue-500 text-blue-400 
                               rounded-lg hover:bg-blue-500/10 transition-all font-medium">
                Kurslar
              </button>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <span className="w-2 h-6 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full mr-3"></span>
              Tezkor Havolalar
            </h3>
            <ul className="space-y-3">
              {['Bosh Sahifa', 'Kurslar', 'Ustozlar', 'Natijalar', 'Testlar', 'Yangiliklar'].map((item) => (
                <li key={item}>
                  <a 
                    href="/" 
                    className="text-gray-300 hover:text-blue-400 hover:translate-x-2 
                             transition-all duration-300 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 mr-0 group-hover:mr-2 
                                   transition-all duration-300"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <span className="w-2 h-6 bg-gradient-to-b from-green-400 to-emerald-500 
                             rounded-full mr-3"></span>
              Bog'lanish
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  Toshkent shahar, Yunusobod tumani,<br />
                  Universitet ko'chasi, 15-uy
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                <a 
                  href="tel:+998901234567" 
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  +998 90 123 45 67
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                <a 
                  href="mailto:info@diamondacademy.uz" 
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  info@diamondacademy.uz
                </a>
              </li>
            </ul>
            
            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="font-bold mb-3 text-gray-200">Yangiliklardan xabardor bo'ling</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email manzilingiz"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 
                           rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 
                                 rounded-r-lg hover:from-blue-600 hover:to-indigo-600 
                                 transition-all font-medium">
                  Yukash
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mb-8"></div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Social media */}
          <div className="flex space-x-4 mb-6 md:mb-0">
            {[
              { icon: Facebook, label: 'Facebook', color: 'hover:text-blue-400' },
              { icon: Twitter, label: 'Twitter', color: 'hover:text-sky-400' },
              { icon: Instagram, label: 'Instagram', color: 'hover:text-pink-500' },
              { icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-300' },
              { icon: Youtube, label: 'YouTube', color: 'hover:text-red-500' },
            ].map((social) => (
              <a
                key={social.label}
                href="#"
                className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center 
                          ${social.color} transition-all duration-300 hover:scale-110 
                          hover:bg-gray-600 group`}
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
                <span className="absolute bottom-full mb-2 hidden group-hover:block 
                               bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {social.label}
                </span>
              </a>
            ))}
          </div>

          {/* Copyright and links */}
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex items-center text-gray-400">
              <Heart className="w-4 h-4 text-red-500 mr-2 fill-current animate-pulse" />
              <span>Diamond Academy jamoasi tomonidan yaratilgan</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-blue-400 transition-colors">
                Maxfiylik siyosati
              </a>
              <span className="hidden md:inline">•</span>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Foydalanish shartlari
              </a>
              <span className="hidden md:inline">•</span>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Cookie siyosati
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-6 border-t border-gray-700">
          <p className="text-gray-400">
            © {currentYear} Diamond Academy. Barcha huquqlar himoyalangan.
            <span className="hidden md:inline"> | </span>
            <br className="md:hidden" />
            <span className="text-gray-500">
              Platforma versiyasi: 2.1.0 | Oxirgi yangilanish: {currentYear}-{String(new Date().getMonth() + 1).padStart(2, '0')}-{String(new Date().getDate()).padStart(2, '0')}
            </span>
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <div className="w-64 h-64 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 
                      rounded-full absolute -top-32 -left-32"></div>
        <div className="w-48 h-48 bg-gradient-to-r from-yellow-500/5 to-amber-500/5 
                      rounded-full absolute -top-24 -right-24"></div>
      </div>
    </footer>
  );
};

export default Footer;