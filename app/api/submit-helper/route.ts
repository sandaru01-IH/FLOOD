import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { HelperFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: HelperFormData = await request.json();

    if (!body.location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    // Insert helper
    const { data, error } = await supabase
      .from('helpers')
      .insert({
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        offerings: body.offerings,
        capacity: body.capacity,
        radius_km: body.radius_km,
        available_times: body.available_times,
        location: `POINT(${body.location.lng} ${body.location.lat})`,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error submitting helper:', error);
    return NextResponse.json(
      { error: 'Failed to submit helper registration' },
      { status: 500 }
    );
  }
}

