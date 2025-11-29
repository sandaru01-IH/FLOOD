'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { debug, generateTestData } from '@/lib/debug';
import { calculateSeverityScore } from '@/lib/severity-scoring';
import { getCurrentLocation, blurLocation } from '@/lib/geolocation';
import type { AssessmentFormData, GigFormData } from '@/types';

export default function TestPage() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const addResult = (message: string, success: boolean = true) => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = success ? '✅' : '❌';
    setResults(prev => [...prev, `${icon} [${timestamp}] ${message}`]);
    debug.info(message, { success });
  };

  const clearResults = () => {
    setResults([]);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('assessments').select('count').limit(1);
      if (error) throw error;
      addResult('Supabase connection: OK');
      return true;
    } catch (error: any) {
      addResult(`Supabase connection: FAILED - ${error.message}`, false);
      return false;
    }
  };

  const testStorageBucket = async () => {
    try {
      const { data, error } = await supabase.storage.from('photos').list('', { limit: 1 });
      if (error && error.message.includes('not found')) {
        addResult('Storage bucket: NOT FOUND - Create "photos" bucket in Supabase', false);
        return false;
      }
      if (error) throw error;
      addResult('Storage bucket: OK');
      return true;
    } catch (error: any) {
      addResult(`Storage bucket: FAILED - ${error.message}`, false);
      return false;
    }
  };

  const testDatabaseTables = async () => {
    const tables = ['assessments', 'gigs', 'helpers', 'matches', 'context_layers', 'admin_sessions'];
    let allOk = true;

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          addResult(`Table "${table}": FAILED - ${error.message}`, false);
          allOk = false;
        } else {
          addResult(`Table "${table}": OK`);
        }
      } catch (error: any) {
        addResult(`Table "${table}": ERROR - ${error.message}`, false);
        allOk = false;
      }
    }

    return allOk;
  };

  const testSeverityScoring = () => {
    try {
      const testData = generateTestData().assessment;
      const severity = calculateSeverityScore(testData);
      addResult(`Severity scoring: OK (result: ${severity})`);
      return true;
    } catch (error: any) {
      addResult(`Severity scoring: FAILED - ${error.message}`, false);
      return false;
    }
  };

  const testGeolocation = async () => {
    try {
      const location = await getCurrentLocation();
      const blurred = blurLocation(location);
      addResult(`Geolocation: OK (lat: ${location.lat.toFixed(4)}, lng: ${location.lng.toFixed(4)})`);
      return true;
    } catch (error: any) {
      addResult(`Geolocation: FAILED - ${error.message}`, false);
      return false;
    }
  };

  const testFormSubmission = async () => {
    try {
      const testData = generateTestData().assessment;
      const response = await fetch('/api/submit-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testData,
          photos: [], // No photos for test
        }),
      });

      const result = await response.json();
      if (response.ok) {
        addResult(`Form submission: OK (ID: ${result.data?.id?.substring(0, 8)})`);
        return true;
      } else {
        addResult(`Form submission: FAILED - ${result.error}`, false);
        return false;
      }
    } catch (error: any) {
      addResult(`Form submission: ERROR - ${error.message}`, false);
      return false;
    }
  };

  const testGigSubmission = async () => {
    try {
      const testData = generateTestData().donationGig;
      const response = await fetch('/api/submit-gig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      const result = await response.json();
      if (response.ok) {
        addResult(`Gig submission: OK (ID: ${result.data?.id?.substring(0, 8)})`);
        return true;
      } else {
        addResult(`Gig submission: FAILED - ${result.error}`, false);
        return false;
      }
    } catch (error: any) {
      addResult(`Gig submission: ERROR - ${error.message}`, false);
      return false;
    }
  };

  const testStatsAPI = async () => {
    try {
      const response = await fetch('/api/stats');
      const result = await response.json();
      if (response.ok) {
        addResult(`Stats API: OK (${result.stats.assessments} assessments, ${result.stats.totalGigs} gigs)`);
        return true;
      } else {
        addResult(`Stats API: FAILED - ${result.error}`, false);
        return false;
      }
    } catch (error: any) {
      addResult(`Stats API: ERROR - ${error.message}`, false);
      return false;
    }
  };

  const testRealTimeSubscription = async () => {
    return new Promise<boolean>((resolve) => {
      let received = false;
      const channel = supabase
        .channel('test-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'assessments',
          },
          () => {
            if (!received) {
              received = true;
              addResult('Real-time subscription: OK');
              channel.unsubscribe();
              resolve(true);
            }
          }
        )
        .subscribe();

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!received) {
          addResult('Real-time subscription: TIMEOUT (may need to enable replication)', false);
          channel.unsubscribe();
          resolve(false);
        }
      }, 5000);
    });
  };

  const runAllTests = async () => {
    setTesting(true);
    clearResults();
    addResult('Starting comprehensive system test...');

    // Basic connectivity
    addResult('--- Testing Connectivity ---');
    await testSupabaseConnection();
    await testStorageBucket();

    // Database structure
    addResult('--- Testing Database Structure ---');
    await testDatabaseTables();

    // Core functionality
    addResult('--- Testing Core Functionality ---');
    testSeverityScoring();
    await testGeolocation();

    // API endpoints
    addResult('--- Testing API Endpoints ---');
    await testStatsAPI();
    await testFormSubmission();
    await testGigSubmission();

    // Real-time features
    addResult('--- Testing Real-Time Features ---');
    await testRealTimeSubscription();

    addResult('--- Test Suite Complete ---');
    setTesting(false);
  };

  const runQuickTest = async () => {
    setTesting(true);
    clearResults();
    addResult('Running quick connectivity test...');
    
    const connectionOk = await testSupabaseConnection();
    if (connectionOk) {
      await testDatabaseTables();
      await testStatsAPI();
    }
    
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Testing & Debugging</h1>
          <p className="text-gray-600 mb-6">
            Comprehensive testing suite to identify issues before deployment
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={runQuickTest}
              disabled={testing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Quick Test
            </button>
            <button
              onClick={runAllTests}
              disabled={testing}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run All Tests
            </button>
            <button
              onClick={clearResults}
              disabled={testing}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Results
            </button>
          </div>

          {testing && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-700 font-medium">Running tests...</span>
            </div>
          )}

          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-auto max-h-[600px]">
            {results.length === 0 ? (
              <div className="text-gray-500">No test results yet. Click a button above to start testing.</div>
            ) : (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`${
                      result.includes('❌') ? 'text-red-400' : result.includes('✅') ? 'text-green-400' : 'text-gray-300'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Testing Notes</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Some tests require Supabase to be fully configured</li>
              <li>Geolocation test requires browser permission</li>
              <li>Real-time test may timeout if replication is not enabled</li>
              <li>Form/Gig submission tests will create actual test data</li>
            </ul>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
            </div>
            {mounted ? (
              <>
                <div>
                  <strong>Supabase URL:</strong>{' '}
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Not set'}
                </div>
                <div>
                  <strong>Supabase Key:</strong>{' '}
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Not set'}
                </div>
                <div>
                  <strong>Admin Password:</strong>{' '}
                  {process.env.ADMIN_PASSWORD ? '✅ Configured' : '❌ Not set'}
                </div>
              </>
            ) : (
              <>
                <div>
                  <strong>Supabase URL:</strong> <span className="text-gray-400">Loading...</span>
                </div>
                <div>
                  <strong>Supabase Key:</strong> <span className="text-gray-400">Loading...</span>
                </div>
                <div>
                  <strong>Admin Password:</strong> <span className="text-gray-400">Loading...</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

