// Supabase client configuration

import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set');
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (for API routes)
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      assessments: {
        Row: {
          id: string;
          name: string;
          phone: string;
          family_size: number;
          property_type: string;
          water_inside: boolean;
          water_depth_cm: number;
          rooms_affected: number;
          electricity_status: string;
          losses: any;
          vulnerabilities: any;
          urgent_needs: string[];
          photos: string[];
          location: any; // PostGIS geography point
          severity_score: string;
          verified: boolean;
          district: string;
          approximate_location: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assessments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['assessments']['Insert']>;
      };
      helpers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          offerings: string[];
          capacity: number;
          radius_km: number;
          available_times: any;
          location: any;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['helpers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['helpers']['Insert']>;
      };
      matches: {
        Row: {
          id: string;
          helper_id: string;
          assessment_id: string;
          match_score: number;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['matches']['Insert']>;
      };
      context_layers: {
        Row: {
          id: string;
          layer_type: string;
          name: string;
          description: string | null;
          geojson_data: any;
          metadata: any;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['context_layers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['context_layers']['Insert']>;
      };
      admin_sessions: {
        Row: {
          id: string;
          session_token: string;
          expires_at: string;
        };
        Insert: Omit<Database['public']['Tables']['admin_sessions']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['admin_sessions']['Insert']>;
      };
    };
  };
};

