'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GigForm from '@/components/forms/GigForm';
import Header from '@/components/layout/Header';
import type { GigFormData, Language, GigType } from '@/types';

function NewGigContent() {
  const [lang, setLang] = useState<Language>('en');
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = (searchParams.get('type') as GigType) || 'donate';

  const handleSubmit = async (data: GigFormData) => {
    try {
      if (!data.location) {
        throw new Error('Location is required');
      }

      // Submit via API route
      const response = await fetch('/api/submit-gig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to post gig');
      }

      // Redirect to gigs page
      router.push('/gigs');
    } catch (error) {
      console.error('Error submitting gig:', error);
      alert('Failed to post gig. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header lang={lang} onLanguageChange={setLang} showNotifications={false} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GigForm lang={lang} onSubmit={handleSubmit} defaultType={defaultType} />
      </main>
    </div>
  );
}

export default function NewGigPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <NewGigContent />
    </Suspense>
  );
}

