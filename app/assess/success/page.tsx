'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment Submitted Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Your flood damage assessment has been received. Our system will match you with nearby helpers.
        </p>
        {id && (
          <p className="text-sm text-gray-500 mb-6">
            Reference ID: <code className="bg-gray-100 px-2 py-1 rounded">{id.substring(0, 8)}</code>
          </p>
        )}
        <div className="space-y-3">
          <Link
            href="/map"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            View Live Map
          </Link>
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

