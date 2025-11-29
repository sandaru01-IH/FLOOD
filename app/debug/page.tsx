'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { debug } from '@/lib/debug';

export default function DebugPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      setLogs(prev => [...prev, { type: 'log', time: new Date(), args }]);
    };

    console.error = (...args) => {
      originalError(...args);
      setLogs(prev => [...prev, { type: 'error', time: new Date(), args }]);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      setLogs(prev => [...prev, { type: 'warn', time: new Date(), args }]);
    };

    // Collect system info
    setSystemInfo({
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      platform: navigator.platform,
    });

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const testDatabaseQuery = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.from('assessments').select('*').limit(1);
      
      if (error) {
        const errorMsg = `❌ Database query failed: ${error.message}`;
        setTestResult(errorMsg);
        debug.error('Database query failed', error);
        console.error('Database query error:', error);
      } else {
        const successMsg = `✅ Database query successful! Found ${data?.length || 0} record(s)`;
        setTestResult(successMsg);
        debug.info('Database query test', { data, error });
        console.log('Database query result:', { data, error });
      }
    } catch (error: any) {
      const errorMsg = `❌ Database query error: ${error.message}`;
      setTestResult(errorMsg);
      debug.error('Database query failed', error);
      console.error('Database query exception:', error);
    } finally {
      setTesting(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Debug Console</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={testDatabaseQuery}
              disabled={testing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Testing...
                </>
              ) : (
                'Test Database Query'
              )}
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Clear Logs
            </button>
          </div>

          {testResult && (
            <div className={`mb-6 p-4 rounded-lg ${
              testResult.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="font-medium">{testResult}</p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="font-semibold mb-2">System Information</h2>
            <div className="bg-gray-100 rounded-lg p-4 text-sm space-y-1">
              {Object.entries(systemInfo).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> {String(value)}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Console Logs ({logs.length})</h2>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs max-h-96 overflow-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet</div>
              ) : (
                logs.slice(-50).map((log, index) => (
                  <div
                    key={index}
                    className={`mb-1 ${
                      log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'warn'
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    <span className="text-gray-500">
                      [{log.time.toLocaleTimeString()}]
                    </span>{' '}
                    {log.args.map((arg: any, i: number) => (
                      <span key={i}>
                        {typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)}{' '}
                      </span>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    );
}

