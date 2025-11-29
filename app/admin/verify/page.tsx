'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSeverityColor, getSeverityLabel } from '@/lib/severity-scoring';
import type { Assessment } from '@/types';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      let query = supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (assessmentId) {
        query = query.eq('id', assessmentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAssessments((data || []) as Assessment[]);
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .update({ verified })
        .eq('id', id);

      if (error) throw error;
      await loadAssessments();
    } catch (error) {
      console.error('Error verifying assessment:', error);
      alert('Failed to update verification status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Verify Submissions</h1>

      <div className="space-y-4">
        {assessments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500">No assessments found</p>
          </div>
        ) : (
          assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{assessment.name}</h3>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{
                        backgroundColor: getSeverityColor(assessment.severity_score),
                      }}
                    >
                      {getSeverityLabel(assessment.severity_score, 'en')}
                    </span>
                    {assessment.verified && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    📞 {assessment.phone} • 👨‍👩‍👧‍👦 Family: {assessment.family_size} • 📍{' '}
                    {assessment.area || 'Unknown area'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Situation Details</p>
                  <p className="text-sm text-gray-600">
                    Water inside: {assessment.water_inside || 'N/A'} • Can stay home: {assessment.can_stay_home || 'N/A'} • Electricity: {assessment.electricity_working || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Damaged Items</p>
                  <div className="flex flex-wrap gap-2">
                    {assessment.damaged_items && assessment.damaged_items.length > 0 ? (
                      assessment.damaged_items.map((item) => (
                        <span
                          key={item}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {item.replace('_', ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">None reported</span>
                    )}
                  </div>
                </div>
              </div>

              {(assessment.has_elderly || assessment.has_children || assessment.has_sick_person) && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Special Needs</p>
                  <div className="flex flex-wrap gap-2">
                    {assessment.has_elderly && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                        Elderly
                      </span>
                    )}
                    {assessment.has_children && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Children
                      </span>
                    )}
                    {assessment.has_sick_person && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        Sick Person
                      </span>
                    )}
                  </div>
                </div>
              )}

              {assessment.special_notes && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Additional Notes</p>
                  <p className="text-sm text-gray-600 italic">{assessment.special_notes}</p>
                </div>
              )}

              {assessment.photos && assessment.photos.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Photos</p>
                  <div className="flex gap-2">
                    {assessment.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {!assessment.verified ? (
                  <button
                    onClick={() => handleVerify(assessment.id, true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  >
                    ✓ Verify
                  </button>
                ) : (
                  <button
                    onClick={() => handleVerify(assessment.id, false)}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700"
                  >
                    Unverify
                  </button>
                )}
                <a
                  href={`/map?focus=${assessment.id}`}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  View on Map
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

