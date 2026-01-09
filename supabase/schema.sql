-- ============================================================================
-- AI Inventory + Readiness App - Supabase Postgres Schema
-- ============================================================================
-- 
-- This schema creates tables, enums, indexes, and RLS policies for:
-- - Vehicles (trucks, vans, etc.)
-- - Equipment assets (tools, machinery)
-- - Readiness requirements (what equipment each vehicle needs)
-- - Asset status history (audit trail)
--
-- TO APPLY:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Paste this entire file into the editor
-- 3. Click "Run" to execute
-- 4. Verify tables appear in Table Editor
--
-- ============================================================================

-- ============================================================================
-- 1. CREATE ENUMS
-- ============================================================================

-- Asset status enum: tracks availability status
CREATE TYPE asset_status AS ENUM (
  'available',
  'unavailable',
  'conditional',
  'unknown'
);

-- Asset condition enum: tracks physical condition
CREATE TYPE asset_condition AS ENUM (
  'good',
  'needs_repair',
  'out_of_service'
);

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- Vehicles table: tracks trucks, vans, and other vehicles
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text NOT NULL UNIQUE,                    -- e.g., "PT-3"
  description text,
  license_plate text,
  vin text,
  status asset_status NOT NULL DEFAULT 'available',
  condition asset_condition NOT NULL DEFAULT 'good',
  last_verified_at timestamptz,
  default_image_url text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Equipment assets table: tracks tools, machinery, and equipment
CREATE TABLE equipment_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,                          -- e.g., "Core Drill", "Concrete Saw"
  manufacturer text,
  model text,
  serial_number text,
  status asset_status NOT NULL DEFAULT 'available',
  condition asset_condition NOT NULL DEFAULT 'good',
  assigned_vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  last_verified_at timestamptz,
  default_image_url text,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Readiness requirements table: defines what equipment each vehicle needs
CREATE TABLE readiness_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  required_category text NOT NULL,                 -- e.g., "Concrete Saw"
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(vehicle_id, required_category)
);

-- Asset status history table: audit trail for status and condition changes
CREATE TABLE asset_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type text NOT NULL,                         -- 'vehicle' | 'equipment'
  asset_id uuid NOT NULL,
  status asset_status NOT NULL,
  condition asset_condition NOT NULL,
  note text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. CREATE INDEXES
-- ============================================================================

-- Index on vehicles.asset_id for quick lookups by asset ID
CREATE INDEX idx_vehicles_asset_id ON vehicles(asset_id);

-- Index on equipment_assets.category for filtering by category
CREATE INDEX idx_equipment_assets_category ON equipment_assets(category);

-- Index on equipment_assets.assigned_vehicle_id for finding equipment by vehicle
CREATE INDEX idx_equipment_assets_assigned_vehicle_id ON equipment_assets(assigned_vehicle_id);

-- Index on readiness_requirements.vehicle_id for quick requirement lookups
CREATE INDEX idx_readiness_requirements_vehicle_id ON readiness_requirements(vehicle_id);

-- Composite index on asset_status_history for efficient history queries
CREATE INDEX idx_asset_status_history_lookup ON asset_status_history(asset_type, asset_id, updated_at DESC);

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_status_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE RLS POLICIES
-- ============================================================================

-- VEHICLES POLICIES
-- Allow authenticated users to SELECT all vehicles
CREATE POLICY "Authenticated users can view all vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to INSERT vehicles with created_by = auth.uid()
CREATE POLICY "Authenticated users can create vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Allow authenticated users to UPDATE all vehicles (simple for working concept)
CREATE POLICY "Authenticated users can update all vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- EQUIPMENT_ASSETS POLICIES
-- Allow authenticated users to SELECT all equipment
CREATE POLICY "Authenticated users can view all equipment"
  ON equipment_assets FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to INSERT equipment with created_by = auth.uid()
CREATE POLICY "Authenticated users can create equipment"
  ON equipment_assets FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Allow authenticated users to UPDATE all equipment
CREATE POLICY "Authenticated users can update all equipment"
  ON equipment_assets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- READINESS_REQUIREMENTS POLICIES
-- Allow authenticated users to SELECT all requirements
CREATE POLICY "Authenticated users can view all requirements"
  ON readiness_requirements FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to INSERT requirements
CREATE POLICY "Authenticated users can create requirements"
  ON readiness_requirements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to UPDATE all requirements
CREATE POLICY "Authenticated users can update all requirements"
  ON readiness_requirements FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to DELETE requirements
CREATE POLICY "Authenticated users can delete requirements"
  ON readiness_requirements FOR DELETE
  TO authenticated
  USING (true);

-- ASSET_STATUS_HISTORY POLICIES
-- Allow authenticated users to SELECT all history
CREATE POLICY "Authenticated users can view all history"
  ON asset_status_history FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to INSERT history with updated_by = auth.uid()
CREATE POLICY "Authenticated users can create history"
  ON asset_status_history FOR INSERT
  TO authenticated
  WITH CHECK (updated_by = auth.uid());

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================
-- 
-- Next steps:
-- 1. Verify tables in Supabase Dashboard → Table Editor
-- 2. Test RLS by creating a test user and querying tables
-- 3. Consider adding triggers to auto-populate asset_status_history on updates
--
-- ============================================================================
