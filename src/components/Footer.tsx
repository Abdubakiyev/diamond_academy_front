'use client';

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
  ArrowUp,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, type FormEvent } from 'react';

const socials = [
  { icon: Facebook, label: 'Facebook', color: 'hover:text-blue-400', glow: 'hover:shadow-blue-500/30' },
  { icon: Twitter, label: 'Twitter', color: 'hover:text-sky-400', glow: 'hover:shadow-sky-500/30' },
  { icon: Instagram, label: 'Instagram', color: 'hover:text-pink-500', glow: 'hover:shadow-pink-500/30' },
  { icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-300', glow: 'hover:shadow-blue-400/30' },
  { icon: Youtube, label: 'YouTube', color: 'hover:text-red-500', glow: 'hover:shadow-red-500/30' },
];

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: email'ni API'ga yuborish
    setSubscribed(true);
    setEmail('');
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const lastUpdate = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white pt-12 pb-8 px-4 md:px-8">
      {/* Yuqori chegara chizig'i */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      {/* Dekorativ yorug'liklar */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/15 to-indigo-500/10 blur-3xl" />
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/5 blur-3xl" />
      </div>

      {/* Yuqoriga chiqish tugmasi */}
      <button
        type="button"
        onClick={scrollToTop}
        tabIndex={showScrollTop ? 0 : -1}
        aria-hidden={!showScrollTop}
        aria-label="Yuqoriga chiqish"
        className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full flex items-center justify-center
                  bg-gradient-to-br from-blue-500 to-indigo-600 ring-1 ring-white/20
                  shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50
                  hover:-translate-y-1 active:scale-95 transition-all duration-300
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300
                  ${
                    showScrollTop
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
      >
        <ArrowUp size={20} />
      </button>

      <div className="relative container mx-auto">
        {/* Asosiy qism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Kompaniya haqida */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-blue-400/40 shadow-lg shadow-blue-500/20">
                <Image
                  src="/logo.png"
                  alt="Diamond Academy logotipi"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-300 via-indigo-200 to-blue-300 bg-clip-text text-transparent">
                  Diamond Academy
                </h2>
                <p className="text-gray-400 text-sm">Kelajakni shakllantiramiz</p>
              </div>
            </div>
            <p className="text-gray-300/90 mb-6 max-w-lg leading-relaxed">
              Diamond Academy - bu zamonaviy ta&apos;lim platformasi bo&apos;lib, eng yuqori sifatli
              bilim va ko&apos;nikmalarni o&apos;rgatishga qaratilgan. Bizning maqsadimiz har bir
              talabaning potentsialini to&apos;liq ro&apos;yobga chiqarish.
            </p>
          </div>

          {/* Bog'lanish */}
          <div className="lg:col-span-2 lg:max-w-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <span className="w-2 h-6 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full mr-3 shadow-sm shadow-emerald-500/50" />
              Bog&apos;lanish
            </h3>
            <ul className="space-y-4">
              <li className="group flex items-start">
                <MapPin className="w-5 h-5 text-blue-400 mr-3 mt-1 flex-shrink-0 transition-transform group-hover:scale-110" />
                <span className="text-gray-300">
                  Andijon viloyat, Oltinkol tumani,
                  <br />
                  Qoshtepasaroy,
                </span>
              </li>
              <li className="group flex items-center">
                <Phone className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 transition-transform group-hover:scale-110" />
                <a
                  href="tel:+998905259825"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  +998 90 525 98 25
                </a>
              </li>
              <li className="group flex items-center">
                <Mail className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 transition-transform group-hover:scale-110" />
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
              <h4 className="font-bold mb-3 text-gray-200">
                Yangiliklardan xabardor bo&apos;ling
              </h4>
              <form onSubmit={handleSubscribe} className="flex">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email manzilingiz
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSubscribed(false);
                  }}
                  placeholder="Email manzilingiz"
                  className="flex-1 min-w-0 px-4 py-2 bg-gray-800/80 border border-gray-600/70 rounded-l-lg
                           placeholder:text-gray-500 transition-colors
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-r-lg font-medium
                           shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-indigo-600
                           hover:shadow-lg hover:shadow-blue-500/40 active:scale-95 transition-all
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  Yuborish
                </button>
              </form>
              {subscribed && (
                <p role="status" className="mt-2 text-sm text-emerald-400">
                  Rahmat! Obuna muvaffaqiyatli amalga oshirildi.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Ajratgich */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-8" />

        {/* Pastki qism */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Ijtimoiy tarmoqlar */}
          <div className="flex space-x-4 mb-6 md:mb-0">
            {socials.map((social) => (
              <a
                key={social.label}
                href="#"
                aria-label={social.label}
                className={`group relative w-10 h-10 rounded-full flex items-center justify-center
                          bg-gray-800 ring-1 ring-white/10 text-gray-300 ${social.color}
                          transition-all duration-300 hover:-translate-y-1 hover:bg-gray-700
                          hover:shadow-lg ${social.glow}
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`}
              >
                <social.icon className="w-5 h-5" />
                <span
                  className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                           whitespace-nowrap rounded-md bg-gray-950 ring-1 ring-white/10 px-2 py-1 text-xs text-white
                           opacity-0 translate-y-1 transition-all duration-200
                           group-hover:opacity-100 group-hover:translate-y-0
                           group-focus-visible:opacity-100 group-focus-visible:translate-y-0"
                >
                  {social.label}
                </span>
              </a>
            ))}
          </div>

          {/* Havolalar */}
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex items-center text-gray-400">
              <Heart className="w-4 h-4 text-red-500 mr-2 fill-current animate-pulse" />
              <span>Diamond Academy jamoasi tomonidan yaratilgan</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-blue-400 transition-colors">
                Maxfiylik siyosati
              </a>
              <span className="hidden md:inline text-gray-600">•</span>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Foydalanish shartlari
              </a>
              <span className="hidden md:inline text-gray-600">•</span>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Cookie siyosati
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-6 relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          <p className="text-gray-400">
            © {currentYear} Diamond Academy. Barcha huquqlar himoyalangan.
            <span className="hidden md:inline"> | </span>
            <br className="md:hidden" />
            <span className="text-gray-500">
              Platforma versiyasi: 2.1.0 | Oxirgi yangilanish:{' '}
              <span suppressHydrationWarning>{lastUpdate}</span>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;