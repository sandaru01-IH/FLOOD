'use client';

import Link from 'next/link';
import { useState } from 'react';
import LanguageToggle from '@/components/ui/LanguageToggle';
import NotificationBar from '@/components/ui/NotificationBar';
import type { Language } from '@/types';

interface HeaderProps {
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
  showNotifications?: boolean;
}

export default function Header({ 
  lang = 'en', 
  onLanguageChange,
  showNotifications = true 
}: HeaderProps) {
  const [currentLang, setCurrentLang] = useState<Language>(lang);

  const handleLanguageChange = (newLang: Language) => {
    setCurrentLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
              FloodRelief.lk
            </h1>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {showNotifications && <NotificationBar lang={currentLang} />}
            <LanguageToggle currentLang={currentLang} onLanguageChange={handleLanguageChange} />
          </div>
        </div>
      </div>
    </header>
  );
}

