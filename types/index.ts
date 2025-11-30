// Type definitions for FloodRelief.lk

export type Severity = 'Low' | 'Moderate' | 'High' | 'Critical';

export type GigType = 'donate' | 'collect'; // donate = giving things, collect = need things
export type GigStatus = 'active' | 'fulfilled' | 'closed';

export type SupplyType = 
  | 'food' 
  | 'water' 
  | 'clothes' 
  | 'medicine' 
  | 'blankets' 
  | 'toiletries'
  | 'baby-items'
  | 'cooking-items'
  | 'cleaning-supplies'
  | 'other';

export type UserType = 'individual' | 'ngo' | 'organization';

export type LayerType = 
  | 'rainfall' 
  | 'river_level' 
  | 'flood_extent' 
  | 'road_closure' 
  | 'evacuation_center';

export type MatchStatus = 'pending' | 'contacted' | 'completed';

export type Language = 'en' | 'si' | 'ta';

export type HelperOffering = 
  | 'food' 
  | 'water' 
  | 'temporary-shelter' 
  | 'transport' 
  | 'dry-rations' 
  | 'cleanup-support' 
  | 'medicine-pickup' 
  | 'charging-support';

export interface HelperFormData {
  name: string;
  phone: string;
  email?: string;
  offerings: HelperOffering[];
  capacity: number;
  radius_km: number;
  available_times: {
    start: string;
    end: string;
    days: string[];
  };
  location: Location | null;
}

export interface Helper extends Omit<HelperFormData, 'location'> {
  id: string;
  location: Location;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  helper_id: string;
  assessment_id: string;
  match_score: number;
  status: MatchStatus;
  created_at: string;
  distance_km: number;
}

export interface Location {
  lat: number;
  lng: number;
}

// Simplified, practical damage assessment form
export interface AssessmentFormData {
  // Basic Info
  name: string;
  phone: string;
  family_size: number;
  
  // Simple property questions
  water_inside: 'yes' | 'no' | 'partially';
  can_stay_home: 'yes' | 'no' | 'unsure';
  electricity_working: 'yes' | 'no' | 'sometimes';
  
  // What's damaged (simple checkboxes)
  damaged_items: string[]; // food, furniture, documents, electronics, other
  
  // Special needs
  has_elderly: boolean;
  has_children: boolean;
  has_sick_person: boolean;
  special_notes: string; // Free text for any urgent needs
  
  // Media
  photos: File[];
  location: Location | null;
  area: string; // Village/town name (simpler than district)
}

export interface Assessment extends Omit<AssessmentFormData, 'photos'> {
  id: string;
  photos: string[]; // URLs
  severity_score: Severity;
  verified: boolean;
  approximate_location?: Location; // For privacy
  created_at: string;
  updated_at: string;
}

// Gig system - for people who want to donate or collect supplies
export interface GigFormData {
  gig_type: GigType; // 'donate' or 'collect'
  user_type: UserType; // 'individual', 'ngo', 'organization'
  
  // Basic info
  name: string;
  phone: string;
  email?: string;
  organization_name?: string; // If NGO/organization
  
  // What they're offering or need
  supplies: SupplyType[];
  quantity_description: string; // e.g., "50 packets of rice", "20 blankets"
  description: string; // Additional details
  
  // Location and availability
  location: Location | null;
  area: string; // Village/town
  can_deliver: boolean; // For donors
  delivery_radius?: number; // km, for donors
  pickup_available: boolean; // For collectors
  
  // Contact preference
  preferred_contact: 'phone' | 'email' | 'both';
}

export interface Gig extends Omit<GigFormData, 'location'> {
  id: string;
  location: Location;
  status: GigStatus;
  created_at: string;
  updated_at: string;
  contact_count: number; // Track how many times contacted
}

// Contact/interaction tracking
export interface GigContact {
  id: string;
  gig_id: string;
  contacted_by: string; // Name/org of person who contacted
  contact_type: 'phone' | 'email' | 'visit';
  notes?: string;
  created_at: string;
  gig?: Gig;
}

export interface ContextLayer {
  id: string;
  layer_type: LayerType;
  name: string;
  description?: string;
  geojson_data: any; // GeoJSON object
  metadata: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminSession {
  id: string;
  session_token: string;
  expires_at: string;
}

export interface DashboardStats {
  total_reports: number;
  severity_distribution: Record<Severity, number>;
  urgent_needs_summary: Record<string, number>;
  district_counts: Record<string, number>;
  high_priority_count: number;
  active_helpers_count: number;
}

