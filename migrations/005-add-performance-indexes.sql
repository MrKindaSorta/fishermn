-- Migration: Add Performance Indexes for Lakes
-- Created: 2025-12-10
-- Purpose: Optimize search queries and future map-based filtering

-- Index for search queries (WHERE LOWER(name) LIKE ?)
-- This dramatically speeds up name-based searches across 6,542 lakes
CREATE INDEX IF NOT EXISTS idx_lakes_name_lower ON lakes(LOWER(name));

-- Index for region filtering (future feature)
CREATE INDEX IF NOT EXISTS idx_lakes_region ON lakes(region);

-- Index for coordinate-based queries (future map bounds filtering)
CREATE INDEX IF NOT EXISTS idx_lakes_coords ON lakes(latitude, longitude);

-- Note: The following indexes already exist from migration 003:
--   - idx_ice_reports_lake on ice_reports(lake_id)
--   - idx_catch_reports_lake on catch_reports(lake_id)
