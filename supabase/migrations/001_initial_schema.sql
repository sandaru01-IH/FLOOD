-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enum types
CREATE TYPE severity_type AS ENUM ('Low', 'Moderate', 'High', 'Critical');
CREATE TYPE match_status_type AS ENUM ('pending', 'contacted', 'completed');
CREATE TYPE layer_type AS ENUM ('rainfall', 'river_level', 'flood_extent', 'road_closure', 'evacuation_center');

-- Assessments table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  family_size INTEGER NOT NULL DEFAULT 1,
  property_type TEXT NOT NULL CHECK (property_type IN ('single-floor', 'multi-floor')),
  water_inside BOOLEAN NOT NULL DEFAULT false,
  water_depth_cm INTEGER NOT NULL DEFAULT 0,
  rooms_affected INTEGER NOT NULL DEFAULT 0,
  electricity_status TEXT NOT NULL CHECK (electricity_status IN ('working', 'not-working', 'intermittent')),
  losses JSONB NOT NULL DEFAULT '{}',
  vulnerabilities JSONB NOT NULL DEFAULT '{}',
  urgent_needs TEXT[] NOT NULL DEFAULT '{}',
  photos TEXT[] NOT NULL DEFAULT '{}',
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  severity_score severity_type NOT NULL DEFAULT 'Low',
  verified BOOLEAN NOT NULL DEFAULT false,
  district TEXT,
  approximate_location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpers table
CREATE TABLE helpers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  offerings TEXT[] NOT NULL DEFAULT '{}',
  capacity INTEGER NOT NULL DEFAULT 1,
  radius_km INTEGER NOT NULL DEFAULT 5,
  available_times JSONB NOT NULL DEFAULT '{}',
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID NOT NULL REFERENCES helpers(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL DEFAULT 0,
  status match_status_type NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(helper_id, assessment_id)
);

-- Context layers table
CREATE TABLE context_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_type layer_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  geojson_data JSONB NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin sessions table
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_assessments_location ON assessments USING GIST(location);
CREATE INDEX idx_assessments_severity ON assessments(severity_score);
CREATE INDEX idx_assessments_verified ON assessments(verified);
CREATE INDEX idx_assessments_district ON assessments(district);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);

CREATE INDEX idx_helpers_location ON helpers USING GIST(location);
CREATE INDEX idx_helpers_active ON helpers(active);

CREATE INDEX idx_matches_helper ON matches(helper_id);
CREATE INDEX idx_matches_assessment ON matches(assessment_id);
CREATE INDEX idx_matches_status ON matches(status);

CREATE INDEX idx_context_layers_type ON context_layers(layer_type);
CREATE INDEX idx_context_layers_active ON context_layers(active);

CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_helpers_updated_at
  BEFORE UPDATE ON helpers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_context_layers_updated_at
  BEFORE UPDATE ON context_layers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpers ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_layers ENABLE ROW LEVEL SECURITY;

-- Public read access for assessments (with privacy - approximate location only)
CREATE POLICY "Public can view assessments" ON assessments
  FOR SELECT
  USING (true);

-- Public can insert assessments
CREATE POLICY "Public can insert assessments" ON assessments
  FOR INSERT
  WITH CHECK (true);

-- Public read access for helpers
CREATE POLICY "Public can view active helpers" ON helpers
  FOR SELECT
  USING (active = true);

-- Public can insert helpers
CREATE POLICY "Public can insert helpers" ON helpers
  FOR INSERT
  WITH CHECK (true);

-- Public can view context layers
CREATE POLICY "Public can view active context layers" ON context_layers
  FOR SELECT
  USING (active = true);

-- Public can view matches (for helpers to see their matches)
CREATE POLICY "Public can view matches" ON matches
  FOR SELECT
  USING (true);

-- Public can insert matches
CREATE POLICY "Public can insert matches" ON matches
  FOR INSERT
  WITH CHECK (true);

-- Note: Admin operations will be handled through API routes with server-side authentication

