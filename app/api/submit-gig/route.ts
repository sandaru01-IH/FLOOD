import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { blurLocation } from '@/lib/geolocation';
import type { GigFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: GigFormData = await request.json();

    if (!body.location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    // Calculate approximate location for privacy
    const approximateLocation = blurLocation(body.location);

    // Insert gig
    const { data, error } = await supabase
      .from('gigs')
      .insert({
        gig_type: body.gig_type,
        user_type: body.user_type,
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        organization_name: body.organization_name || null,
        supplies: body.supplies,
        quantity_description: body.quantity_description,
        description: body.description || null,
        location: `POINT(${body.location.lng} ${body.location.lat})`,
        approximate_location: `POINT(${approximateLocation.lng} ${approximateLocation.lat})`,
        area: body.area,
        can_deliver: body.can_deliver || false,
        delivery_radius: body.delivery_radius || null,
        pickup_available: body.pickup_available || false,
        preferred_contact: body.preferred_contact,
        status: 'active',
        contact_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error submitting gig:', error);
    return NextResponse.json(
      { error: 'Failed to submit gig' },
      { status: 500 }
    );
  }
}

