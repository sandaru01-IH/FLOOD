-- Gigs table for donation/collection marketplace
CREATE TABLE gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_type TEXT NOT NULL CHECK (gig_type IN ('donate', 'collect')),
  user_type TEXT NOT NULL CHECK (user_type IN ('individual', 'ngo', 'organization')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  organization_name TEXT,
  supplies TEXT[] NOT NULL DEFAULT '{}',
  quantity_description TEXT NOT NULL,
  description TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  approximate_location GEOGRAPHY(POINT, 4326),
  area TEXT NOT NULL,
  can_deliver BOOLEAN NOT NULL DEFAULT false,
  delivery_radius INTEGER,
  pickup_available BOOLEAN NOT NULL DEFAULT false,
  preferred_contact TEXT NOT NULL CHECK (preferred_contact IN ('phone', 'email', 'both')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'closed')),
  contact_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gig contacts table to track who contacted whom
CREATE TABLE gig_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  contacted_by TEXT NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('phone', 'email', 'visit')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update assessments table to match new simplified schema
ALTER TABLE assessments 
  DROP COLUMN IF EXISTS property_type,
  DROP COLUMN IF EXISTS water_depth_cm,
  DROP COLUMN IF EXISTS rooms_affected,
  DROP COLUMN IF EXISTS electricity_status,
  DROP COLUMN IF EXISTS losses,
  DROP COLUMN IF EXISTS vulnerabilities,
  DROP COLUMN IF EXISTS urgent_needs,
  DROP COLUMN IF EXISTS district;

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS water_inside TEXT CHECK (water_inside IN ('yes', 'no', 'partially')),
  ADD COLUMN IF NOT EXISTS can_stay_home TEXT CHECK (can_stay_home IN ('yes', 'no', 'unsure')),
  ADD COLUMN IF NOT EXISTS electricity_working TEXT CHECK (electricity_working IN ('yes', 'no', 'sometimes')),
  ADD COLUMN IF NOT EXISTS damaged_items TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS has_elderly BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_children BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_sick_person BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS special_notes TEXT,
  ADD COLUMN IF NOT EXISTS area TEXT;

-- Create indexes
CREATE INDEX idx_gigs_type ON gigs(gig_type);
CREATE INDEX idx_gigs_status ON gigs(status);
CREATE INDEX idx_gigs_location ON gigs USING GIST(location);
CREATE INDEX idx_gigs_area ON gigs(area);
CREATE INDEX idx_gigs_created_at ON gigs(created_at DESC);

CREATE INDEX idx_gig_contacts_gig ON gig_contacts(gig_id);
CREATE INDEX idx_gig_contacts_created ON gig_contacts(created_at DESC);

-- RLS policies
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_contacts ENABLE ROW LEVEL SECURITY;

-- Public can view active gigs
CREATE POLICY "Public can view active gigs" ON gigs
  FOR SELECT
  USING (status = 'active');

-- Public can insert gigs
CREATE POLICY "Public can insert gigs" ON gigs
  FOR INSERT
  WITH CHECK (true);

-- Public can view gig contacts (for tracking)
CREATE POLICY "Public can view gig contacts" ON gig_contacts
  FOR SELECT
  USING (true);

-- Public can insert gig contacts
CREATE POLICY "Public can insert gig contacts" ON gig_contacts
  FOR INSERT
  WITH CHECK (true);

-- Trigger to update updated_at
CREATE TRIGGER update_gigs_updated_at
  BEFORE UPDATE ON gigs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

