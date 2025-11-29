'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HelperForm from '@/components/forms/HelperForm';
import LanguageToggle from '@/components/ui/LanguageToggle';
import type { HelperFormData, Language } from '@/types';

export default function HelpPage() {
  const [lang, setLang] = useState<Language>('en');
  const router = useRouter();

  const handleSubmit = async (data: HelperFormData) => {
    try {
      if (!data.location) {
        throw new Error('Location is required');
      }

      // Submit via API route
      const response = await fetch('/api/submit-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register as helper');
      }

      // Redirect to matches page
      router.push(`/help/matches?helper_id=${result.data.id}`);
    } catch (error) {
      console.error('Error submitting helper registration:', error);
      alert('Failed to register as helper. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">FloodRelief.lk</h1>
            <LanguageToggle currentLang={lang} onLanguageChange={setLang} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <HelperForm lang={lang} onSubmit={handleSubmit} />
      </main>
    </div>
  );
}

