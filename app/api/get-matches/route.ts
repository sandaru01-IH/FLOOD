import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { findMatchesForHelper } from '@/lib/matching';
import type { Helper, Assessment } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const helperId = searchParams.get('helper_id');

    if (!helperId) {
      return NextResponse.json({ error: 'helper_id is required' }, { status: 400 });
    }

    // Load helper
    const { data: helper, error: helperError } = await supabase
      .from('helpers')
      .select('*')
      .eq('id', helperId)
      .single();

    if (helperError) {
      return NextResponse.json({ error: helperError.message }, { status: 500 });
    }

    // Load all assessments
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (assessmentsError) {
      return NextResponse.json({ error: assessmentsError.message }, { status: 500 });
    }

    // Parse locations
    const assessmentsWithLocation = (assessments || []).map((a: any) => ({
      ...a,
      location: parsePostGISPoint(a.location),
    }));

    const helperWithLocation = {
      ...helper,
      location: parsePostGISPoint(helper.location),
    } as Helper;

    // Find matches
    const matches = findMatchesForHelper(
      helperId,
      [helperWithLocation],
      assessmentsWithLocation as Assessment[]
    );

    return NextResponse.json({ success: true, matches }, { status: 200 });
  } catch (error) {
    console.error('Error getting matches:', error);
    return NextResponse.json(
      { error: 'Failed to get matches' },
      { status: 500 }
    );
  }
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

