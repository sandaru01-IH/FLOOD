'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AssessmentForm from '@/components/forms/AssessmentForm';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { debug, captureError } from '@/lib/debug';
import type { AssessmentFormData, Language } from '@/types';

export default function AssessPage() {
  const [lang, setLang] = useState<Language>('en');
  const router = useRouter();

  const handleSubmit = async (data: AssessmentFormData) => {
    return debug.trackPerformance('Assessment Submission', async () => {
      try {
        debug.info('Starting assessment submission', { hasPhotos: data.photos?.length || 0 });
        
        // Upload photos to Supabase Storage
        const photoUrls: string[] = [];
        if (data.photos && data.photos.length > 0) {
          for (const photo of data.photos) {
            const fileExt = photo.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            debug.debug('Uploading photo', { fileName, size: photo.size });
            
            const { error: uploadError } = await supabase.storage
              .from('photos')
              .upload(fileName, photo);

            if (uploadError) {
              debug.warn('Photo upload error', uploadError);
              // Continue even if photo upload fails
              continue;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('photos')
              .getPublicUrl(fileName);

            photoUrls.push(publicUrl);
            debug.debug('Photo uploaded successfully', { publicUrl });
          }
        }

        // Submit via API route
        debug.debug('Submitting to API', { photoCount: photoUrls.length });
        
        const response = await fetch('/api/submit-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            photos: photoUrls, // Send URLs instead of File objects
          }),
        });

        const result = await response.json();
        debug.logApiCall('POST', '/api/submit-assessment', data, result);

        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit assessment');
        }

        debug.info('Assessment submitted successfully', { id: result.data?.id });
        
        // Redirect to success page
        router.push(`/assess/success?id=${result.data.id}`);
      } catch (error: any) {
        captureError(error, 'Assessment Submission');
        debug.error('Assessment submission failed', error);
        alert('Failed to submit assessment. Please try again.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header lang={lang} onLanguageChange={setLang} showNotifications={false} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AssessmentForm lang={lang} onSubmit={handleSubmit} />
      </main>
    </div>
  );
}

