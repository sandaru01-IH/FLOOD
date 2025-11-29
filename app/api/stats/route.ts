import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get assessment count
    const { count: assessmentCount } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true });

    // Get donation gigs count
    const { count: donationCount } = await supabase
      .from('gigs')
      .select('*', { count: 'exact', head: true })
      .eq('gig_type', 'donate')
      .eq('status', 'active');

    // Get collection gigs count
    const { count: collectionCount } = await supabase
      .from('gigs')
      .select('*', { count: 'exact', head: true })
      .eq('gig_type', 'collect')
      .eq('status', 'active');

    // Get total gigs count
    const { count: totalGigsCount } = await supabase
      .from('gigs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get critical cases count
    const { count: criticalCount } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('severity_score', 'Critical')
      .eq('verified', false);

    return NextResponse.json({
      success: true,
      stats: {
        assessments: assessmentCount || 0,
        donations: donationCount || 0,
        collections: collectionCount || 0,
        totalGigs: totalGigsCount || 0,
        criticalCases: criticalCount || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

