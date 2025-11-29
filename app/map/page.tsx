'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MapFilters from '@/components/map/MapFilters';
import Header from '@/components/layout/Header';
import type { Language, Assessment } from '@/types';

// Dynamically import map component to avoid SSR issues with Leaflet
const FloodMap = dynamic(() => import('@/components/map/FloodMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [lang, setLang] = useState<Language>('en');
  const [filters, setFilters] = useState<{
    severity?: string[];
    needs?: string[];
    verified?: boolean;
    district?: string;
  }>({});
  const [mounted, setMounted] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMarkerClick = (assessment: Assessment) => {
    // Could open a modal or navigate to detail page
    console.log('Clicked assessment:', assessment);
  };

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header lang={lang} onLanguageChange={setLang} showNotifications={true} />

      <div className="flex-1 flex relative overflow-hidden">
        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="md:hidden fixed top-20 left-4 z-[1001] bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors"
          aria-label="Toggle filters"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="font-medium text-gray-700">Filters</span>
          {Object.keys(filters).length > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              {Object.values(filters).filter(v => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)).length}
            </span>
          )}
        </button>

        {/* Filters Sidebar - Desktop: Always visible, Mobile: Slide-in drawer */}
        <div
          className={`
            fixed md:relative
            top-0 left-0
            h-full w-80 max-w-[85vw]
            bg-white shadow-xl md:shadow-lg
            z-[1000] md:z-auto
            transform transition-transform duration-300 ease-in-out
            ${filtersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            overflow-y-auto
          `}
        >
          {/* Mobile Close Button */}
          <div className="md:hidden sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button
              onClick={() => setFiltersOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              aria-label="Close filters"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters Content */}
          <div className="p-4">
            <MapFilters onFiltersChange={setFilters} />
          </div>
        </div>

        {/* Mobile Overlay */}
        {filtersOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[999]"
            onClick={() => setFiltersOpen(false)}
          />
        )}

        {/* Map */}
        <div className="flex-1 relative">
          <FloodMap
            isAdmin={false}
            filters={filters}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </div>
    </div>
  );
}
