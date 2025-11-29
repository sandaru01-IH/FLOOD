'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { getGigTypeColor, getStatusColor } from '@/lib/colors';
import type { Gig, Language, GigType, SupplyType } from '@/types';

const SUPPLY_ICONS: Record<SupplyType, string> = {
  food: '🍚',
  water: '💧',
  clothes: '👕',
  medicine: '💊',
  blankets: '🛏️',
  toiletries: '🧴',
  'baby-items': '👶',
  'cooking-items': '🍳',
  'cleaning-supplies': '🧹',
  other: '📦',
};

export default function GigsPage() {
  const [lang, setLang] = useState<Language>('en');
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [filter, setFilter] = useState<'all' | 'donate' | 'collect'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGigs();
    
    // Real-time subscription
    const channel = supabase
      .channel('gigs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gigs',
        },
        () => {
          loadGigs();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadGigs = async () => {
    try {
      let query = supabase
        .from('gigs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('gig_type', filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Parse locations
      const parsedGigs = (data || []).map((gig: any) => ({
        ...gig,
        location: parsePostGISPoint(gig.location),
      }));

      setGigs(parsedGigs as Gig[]);
    } catch (error) {
      console.error('Error loading gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGigs();
  }, [filter]);

  const handleContact = (gig: Gig) => {
    // Track contact
    supabase.from('gig_contacts').insert({
      gig_id: gig.id,
      contacted_by: 'User',
      contact_type: 'phone',
    });

    // Open phone dialer
    window.open(`tel:${gig.phone}`, '_self');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header lang={lang} onLanguageChange={setLang} showNotifications={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Supply Marketplace</h2>
          <Link
            href="/gigs/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            + Post a Gig
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('donate')}
            className={`px-6 py-2 rounded-lg font-medium ${
              filter === 'donate'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🎁 Donations
          </button>
          <button
            onClick={() => setFilter('collect')}
            className={`px-6 py-2 rounded-lg font-medium ${
              filter === 'collect'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📋 Collections
          </button>
        </div>

        {/* Gig List */}
        {gigs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No gigs found</h3>
            <p className="text-gray-600 mb-6">Be the first to post a donation or collection request!</p>
            <Link
              href="/gigs/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Post a Gig
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <div
                key={gig.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white mb-2"
                      style={{ backgroundColor: getGigTypeColor(gig.gig_type) }}
                    >
                      {gig.gig_type === 'donate' ? '🎁 Donating' : '📋 Collecting'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{gig.name}</h3>
                    {gig.organization_name && (
                      <p className="text-sm text-gray-600">{gig.organization_name}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {gig.user_type === 'ngo' ? 'NGO' : gig.user_type}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Supplies:</p>
                  <div className="flex flex-wrap gap-2">
                    {gig.supplies.map((supply) => (
                      <span
                        key={supply}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center gap-1"
                      >
                        <span>{SUPPLY_ICONS[supply]}</span>
                        <span className="capitalize">{supply.replace('-', ' ')}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Quantity:</p>
                  <p className="text-sm text-gray-600">{gig.quantity_description}</p>
                </div>

                {gig.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{gig.description}</p>
                  </div>
                )}

                <div className="mb-4 text-sm text-gray-600">
                  <p>📍 {gig.area}</p>
                  {gig.gig_type === 'donate' && gig.can_deliver && (
                    <p>🚚 Can deliver {gig.delivery_radius ? `(${gig.delivery_radius} km)` : ''}</p>
                  )}
                  {gig.gig_type === 'collect' && gig.pickup_available && (
                    <p>✅ Pickup available</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleContact(gig)}
                    className="flex-1 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90"
                    style={{ backgroundColor: getGigTypeColor(gig.gig_type) }}
                  >
                    📞 Contact
                  </button>
                  <Link
                    href={`/map?focus=gig_${gig.id}`}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                  >
                    🗺️
                  </Link>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  {gig.contact_count || 0} contacts • {new Date(gig.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function parsePostGISPoint(point: string | any): { lat: number; lng: number } | null {
  if (!point) return null;
  if (typeof point === 'object' && point.lat && point.lng) {
    return point;
  }
  if (typeof point === 'string') {
    const match = point.match(/POINT\(([\d.]+)\s+([\d.]+)\)/);
    if (match) {
      return {
        lng: parseFloat(match[1]),
        lat: parseFloat(match[2]),
      };
    }
  }
  return null;
}

