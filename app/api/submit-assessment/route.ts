import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { calculateSeverityScore } from '@/lib/severity-scoring';
import { blurLocation } from '@/lib/geolocation';
import type { AssessmentFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: AssessmentFormData & { photos?: string[] } = await request.json();

    // Calculate severity
    const severity = calculateSeverityScore(body);

    // Calculate approximate location for privacy
    const approximateLocation = body.location ? blurLocation(body.location) : null;

    // Photo URLs should be passed from client (already uploaded)
    const photoUrls = body.photos || [];

    // Insert assessment with simplified schema
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        name: body.name,
        phone: body.phone,
        family_size: body.family_size,
        water_inside: body.water_inside,
        can_stay_home: body.can_stay_home,
        electricity_working: body.electricity_working,
        damaged_items: body.damaged_items || [],
        has_elderly: body.has_elderly || false,
        has_children: body.has_children || false,
        has_sick_person: body.has_sick_person || false,
        special_notes: body.special_notes || null,
        photos: photoUrls,
        location: body.location ? `POINT(${body.location.lng} ${body.location.lat})` : null,
        approximate_location: approximateLocation
          ? `POINT(${approximateLocation.lng} ${approximateLocation.lat})`
          : null,
        severity_score: severity,
        area: body.area,
        verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}
