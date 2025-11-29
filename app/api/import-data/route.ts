import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { LayerType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const layerType = formData.get('layer_type') as LayerType;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!file || !layerType || !name) {
      return NextResponse.json(
        { error: 'File, layer_type, and name are required' },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();
    let geojsonData: any;

    // Parse GeoJSON
    try {
      geojsonData = JSON.parse(text);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid GeoJSON file' },
        { status: 400 }
      );
    }

    // Validate GeoJSON structure
    if (!geojsonData.type || !['FeatureCollection', 'Feature'].includes(geojsonData.type)) {
      return NextResponse.json(
        { error: 'Invalid GeoJSON format. Expected FeatureCollection or Feature' },
        { status: 400 }
      );
    }

    // Insert context layer
    const { data, error } = await supabase
      .from('context_layers')
      .insert({
        layer_type: layerType,
        name,
        description: description || null,
        geojson_data: geojsonData,
        metadata: {
          imported_at: new Date().toISOString(),
          file_name: file.name,
          file_size: file.size,
        },
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
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    );
  }
}

