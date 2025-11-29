'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import type { Language } from '@/types';

interface Stats {
  assessments: number;
  donations: number;
  collections: number;
  totalGigs: number;
  criticalCases: number;
}

export default function HomePage() {
  const [lang, setLang] = useState<Language>('en');
  const [stats, setStats] = useState<Stats>({
    assessments: 0,
    donations: 0,
    collections: 0,
    totalGigs: 0,
    criticalCases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <Header lang={lang} onLanguageChange={setLang} showNotifications={true} />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {lang === 'en' ? 'Flood Relief Support System' : lang === 'si' ? 'ගංවතුර සහන සහාය පද්ධතිය' : 'வெள்ள நிவாரண ஆதரவு அமைப்பு'}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            {lang === 'en' 
              ? 'Assess flood damage, connect with helpers, and visualize real-time flood data across Sri Lanka'
              : lang === 'si'
              ? 'ගංවතුර හානි තක්සේරු කරන්න, උදව්කරුවන් සමඟ සම්බන්ධ වන්න, සහ ශ්‍රී ලංකාව පුරා සජීවී ගංවතුර දත්ත දෘශ්‍යකරණය කරන්න'
              : 'வெள்ள சேதத்தை மதிப்பீடு செய்யுங்கள், உதவியாளர்களுடன் இணைக்கவும், இலங்கை முழுவதும் நேரடி வெள்ள தரவைக் காட்சிப்படுத்தவும்'}
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-12">
          {/* Assess Damage */}
          <Link href="/assess" className="block group">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-red-500 h-full flex flex-col">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📋</div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {lang === 'en' ? 'Report Damage' : lang === 'si' ? 'හානි වාර්තා කරන්න' : 'சேதத்தைப் புகாரளிக்கவும்'}
                </h3>
                {!loading && (
                  <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-semibold">
                    {stats.assessments}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-gray-600 flex-1">
                {lang === 'en' 
                  ? 'Tell us what happened to your home - simple questions only'
                  : lang === 'si'
                  ? 'ඔබේ නිවසට සිදු වූ දේ අපට කියන්න - සරල ප්‍රශ්න පමණි'
                  : 'உங்கள் வீட்டிற்கு என்ன நடந்தது என்று எங்களிடம் சொல்லுங்கள் - எளிய கேள்விகள் மட்டுமே'}
              </p>
            </div>
          </Link>

          {/* Donate Supplies */}
          <Link href="/gigs/new?type=donate" className="block group">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-blue-500 h-full flex flex-col">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎁</div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {lang === 'en' ? 'Donate Supplies' : lang === 'si' ? 'සැපයුම් දන්නා' : 'வழங்கல்களை நன்கொடையாக வழங்குங்கள்'}
                </h3>
                {!loading && (
                  <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">
                    {stats.donations}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-gray-600 flex-1">
                {lang === 'en' 
                  ? 'Post what you can give - NGOs and collectors will contact you'
                  : lang === 'si'
                  ? 'ඔබට දිය හැකි දේ පළ කරන්න - NGO සහ එකතු කරන්නන් ඔබව සම්බන්ධ වනු ඇත'
                  : 'நீங்கள் கொடுக்கக்கூடியதை இடுகையிடுங்கள் - NGO கள் மற்றும் சேகரிப்பாளர்கள் உங்களைத் தொடர்பு கொள்வார்கள்'}
              </p>
            </div>
          </Link>

          {/* Collect Supplies */}
          <Link href="/gigs/new?type=collect" className="block group">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-orange-500 h-full flex flex-col">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📋</div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {lang === 'en' ? 'Need Supplies' : lang === 'si' ? 'සැපයුම් අවශ්‍ය' : 'வழங்கல்கள் தேவை'}
                </h3>
                {!loading && (
                  <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs sm:text-sm font-semibold">
                    {stats.collections}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-gray-600 flex-1">
                {lang === 'en' 
                  ? 'Post what you need - donors will contact you'
                  : lang === 'si'
                  ? 'ඔබට අවශ්‍ය දේ පළ කරන්න - දන්නාවන් ඔබව සම්බන්ධ වනු ඇත'
                  : 'உங்களுக்குத் தேவையானதை இடுகையிடுங்கள் - நன்கொடையாளர்கள் உங்களைத் தொடர்பு கொள்வார்கள்'}
              </p>
            </div>
          </Link>

          {/* Browse Marketplace */}
          <Link href="/gigs" className="block group">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-green-500 h-full flex flex-col">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🛒</div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {lang === 'en' ? 'Browse Marketplace' : lang === 'si' ? 'වෙළඳපොල ගවේෂණය කරන්න' : 'சந்தையை உலாவுங்கள்'}
                </h3>
                {!loading && (
                  <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold">
                    {stats.totalGigs}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-gray-600 flex-1">
                {lang === 'en' 
                  ? 'See all donations and collection requests'
                  : lang === 'si'
                  ? 'සියලු දන්නා සහ එකතු කිරීමේ ඉල්ලීම් බලන්න'
                  : 'அனைத்து நன்கொடைகள் மற்றும் சேகரிப்பு கோரிக்கைகளைப் பார்க்கவும்'}
              </p>
            </div>
          </Link>
        </div>

        {/* Additional Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-12">
          {/* Live Map */}
          <Link href="/map" className="block group">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-purple-500 h-full">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🗺️</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {lang === 'en' ? 'Live Map' : lang === 'si' ? 'සජීවී සිතියම' : 'நேரடி வரைபடம்'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {lang === 'en' 
                  ? 'View affected areas, donations, and collection points on map'
                  : lang === 'si'
                  ? 'සිතියමේ බලපෑමට ලක්වූ ප්‍රදේශ, දන්නා සහ එකතු කිරීමේ ස්ථාන බලන්න'
                  : 'வரைபடத்தில் பாதிக்கப்பட்ட பகுதிகள், நன்கொடைகள் மற்றும் சேகரிப்பு புள்ளிகளைக் காண்க'}
              </p>
            </div>
          </Link>

          {/* Critical Cases Alert */}
          {stats.criticalCases > 0 && (
            <Link href="/admin/verify" className="block group">
              <div className="bg-red-50 border-2 border-red-500 rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-200 h-full">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⚠️</div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-red-900">
                    {lang === 'en' ? 'Critical Cases' : lang === 'si' ? 'උත්තරීතර අවස්ථා' : 'முக்கியமான வழக்குகள்'}
                  </h3>
                  <span className="px-3 sm:px-4 py-1 sm:py-2 bg-red-600 text-white rounded-full text-sm sm:text-base font-bold animate-pulse">
                    {stats.criticalCases}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-red-700">
                  {lang === 'en' 
                    ? 'Urgent cases need immediate attention'
                    : lang === 'si'
                    ? 'උත්තරීතර අවස්ථා වහාම අවධානය අවශ්‍ය වේ'
                    : 'அவசர வழக்குகளுக்கு உடனடி கவனம் தேவை'}
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-12">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 sm:mb-8">
            {lang === 'en' ? 'How It Works' : lang === 'si' ? 'එය ක්‍රියා කරන ආකාරය' : 'இது எவ்வாறு செயல்படுகிறது'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">1️⃣</div>
              <h4 className="font-semibold text-lg sm:text-xl mb-2">
                {lang === 'en' ? 'Report Damage' : lang === 'si' ? 'හානි වාර්තා කරන්න' : 'சேதத்தைப் புகாரளிக்கவும்'}
              </h4>
              <p className="text-sm sm:text-base text-gray-600">
                {lang === 'en' 
                  ? 'Fill out a simple form with your flood impact details'
                  : lang === 'si'
                  ? 'ඔබේ ගංවතුර බලපෑම් විස්තර සමඟ සරල පෝරමයක් පුරවන්න'
                  : 'உங்கள் வெள்ள தாக்க விவரங்களுடன் ஒரு எளிய படிவத்தை நிரப்பவும்'}
              </p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">2️⃣</div>
              <h4 className="font-semibold text-lg sm:text-xl mb-2">
                {lang === 'en' ? 'Post or Browse' : lang === 'si' ? 'පළ කරන්න හෝ ගවේෂණය කරන්න' : 'இடுகையிடுங்கள் அல்லது உலாவுங்கள்'}
              </h4>
              <p className="text-sm sm:text-base text-gray-600">
                {lang === 'en' 
                  ? 'Post donations or needs, or browse the marketplace to connect'
                  : lang === 'si'
                  ? 'දන්නා හෝ අවශ්‍යතා පළ කරන්න, හෝ සම්බන්ධ වීමට වෙළඳපොල ගවේෂණය කරන්න'
                  : 'நன்கொடைகள் அல்லது தேவைகளை இடுகையிடுங்கள், அல்லது இணைக்க சந்தையை உலாவுங்கள்'}
              </p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">3️⃣</div>
              <h4 className="font-semibold text-lg sm:text-xl mb-2">
                {lang === 'en' ? 'Get Connected' : lang === 'si' ? 'සම්බන්ධ වන්න' : 'இணைக்கவும்'}
              </h4>
              <p className="text-sm sm:text-base text-gray-600">
                {lang === 'en' 
                  ? 'Donors, collectors, and NGOs connect directly to provide help'
                  : lang === 'si'
                  ? 'දන්නාවන්, එකතු කරන්නන් සහ NGO සෘජුව සම්බන්ධ වී උදව් ලබා දෙයි'
                  : 'நன்கொடையாளர்கள், சேகரிப்பாளர்கள் மற்றும் NGO கள் உதவி வழங்க நேரடியாக இணைக்கின்றன'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 text-sm sm:text-base">
          <p>© 2024 FloodRelief.lk - Helping Sri Lanka during floods</p>
        </div>
      </footer>
    </div>
  );
}
