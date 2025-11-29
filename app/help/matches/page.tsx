'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { supabase } from '@/lib/supabase';
import { findMatchesForHelper } from '@/lib/matching';
import { getSeverityColor, getSeverityLabel } from '@/lib/severity-scoring';
import type { Helper, Assessment, Match, Language } from '@/types';

export default function HelperMatchesPage() {
  const [lang, setLang] = useState<Language>('en');
  const searchParams = useSearchParams();
  const helperId = searchParams.get('helper_id');
  
  const [helper, setHelper] = useState<Helper | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!helperId) return;

    const loadMatches = async () => {
      try {
        // Load helper
        const { data: helperData, error: helperError } = await supabase
          .from('helpers')
          .select('*')
          .eq('id', helperId)
          .single();

        if (helperError) throw helperError;
        setHelper(helperData as Helper);

        // Load all assessments
        const { data: assessments, error: assessmentsError } = await supabase
          .from('assessments')
          .select('*')
          .order('created_at', { ascending: false });

        if (assessmentsError) throw assessmentsError;

        // Convert PostGIS points to Location objects
        const assessmentsWithLocation = (assessments || []).map((a: any) => ({
          ...a,
          location: a.location ? parsePostGISPoint(a.location) : null,
        }));

        // Find matches
        const helperWithLocation = {
          ...helperData,
          location: helperData.location ? parsePostGISPoint(helperData.location) : null,
        } as Helper;

        const matched = findMatchesForHelper(
          helperId,
          [helperWithLocation],
          assessmentsWithLocation as Assessment[]
        );

        // Load existing matches from database
        const { data: existingMatches } = await supabase
          .from('matches')
          .select('*')
          .eq('helper_id', helperId);

        // Merge with existing matches
        const mergedMatches = matched.map((match) => {
          const existing = existingMatches?.find(
            (m) => m.assessment_id === match.assessment_id
          );
          return {
            ...match,
            id: existing?.id || match.id,
            status: existing?.status || match.status,
            assessment: assessmentsWithLocation.find(
              (a: any) => a.id === match.assessment_id
            ),
          };
        });

        setMatches(mergedMatches);
      } catch (error) {
        console.error('Error loading matches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [helperId]);

  const handleContact = (assessment: Assessment) => {
    // Update match status to 'contacted'
    const match = matches.find((m) => m.assessment_id === assessment.id);
    if (match && match.id) {
      supabase
        .from('matches')
        .update({ status: 'contacted' })
        .eq('id', match.id);
    }
    
    // Open phone dialer or copy phone number
    window.open(`tel:${assessment.phone}`, '_self');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Matched Victims</h2>
          <p className="text-gray-600">
            {helper?.name}, here are people who need your help nearby
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any victims within your radius. Try expanding your search radius or check back later.
            </p>
            <Link
              href="/help"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Update Your Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const assessment = match.assessment as Assessment;
              if (!assessment) return null;

              return (
                <div
                  key={match.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{assessment.name}</h3>
                      <p className="text-sm text-gray-500">Family: {assessment.family_size} people</p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: getSeverityColor(assessment.severity_score) }}
                    >
                      {getSeverityLabel(assessment.severity_score, lang)}
                    </span>
                  </div>

                  {match.distance_km && (
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {match.distance_km.toFixed(1)} km away
                    </p>
                  )}

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Urgent Needs:</p>
                    <div className="flex flex-wrap gap-2">
                      {assessment.urgent_needs.map((need) => (
                        <span
                          key={need}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {need.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {assessment.vulnerabilities && (
                    <div className="mb-4 text-sm text-gray-600">
                      {(assessment.vulnerabilities.elderly > 0 ||
                        assessment.vulnerabilities.infants > 0 ||
                        assessment.vulnerabilities.disabled > 0) && (
                        <p>
                          ⚠️ Vulnerable: {assessment.vulnerabilities.elderly} elderly,{' '}
                          {assessment.vulnerabilities.infants} infants,{' '}
                          {assessment.vulnerabilities.disabled} disabled
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleContact(assessment)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                    >
                      📞 Contact
                    </button>
                    <Link
                      href={`/map?focus=${assessment.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    >
                      🗺️ Map
                    </Link>
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    Match Score: {match.match_score}/100
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// Helper function to parse PostGIS POINT format
function parsePostGISPoint(point: string): { lat: number; lng: number } | null {
  if (!point) return null;
  // PostGIS returns as "POINT(lng lat)" or similar
  const match = point.match(/POINT\(([\d.]+)\s+([\d.]+)\)/);
  if (match) {
    return {
      lng: parseFloat(match[1]),
      lat: parseFloat(match[2]),
    };
  }
  return null;
}

