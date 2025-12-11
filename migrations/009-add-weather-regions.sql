-- Migration: Add weather_regions table for regional weather data collection
-- Purpose: Define 20 Minnesota zones for efficient weather history tracking
--          Reduces API calls from per-lake to 20 regions (80 calls/day total)
--
-- Grid: North (N), North-Central (NC), Central (C), South-Central (SC), South (S)
-- Each region covers ~50-mile zone with similar weather patterns

-- Create weather regions table
CREATE TABLE IF NOT EXISTS weather_regions (
  region_id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  lat_min REAL NOT NULL,
  lat_max REAL NOT NULL,
  lon_min REAL NOT NULL,
  lon_max REAL NOT NULL,
  centroid_lat REAL NOT NULL,  -- Center point for weather API calls
  centroid_lon REAL NOT NULL,  -- Calculated as midpoint of bounding box
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert 20 Minnesota weather regions
-- Centroids calculated as midpoint: ((lat_min + lat_max) / 2, (lon_min + lon_max) / 2)
INSERT INTO weather_regions (region_id, code, name, lat_min, lat_max, lon_min, lon_max, centroid_lat, centroid_lon) VALUES
  -- North regions (47.5 - 49.5 latitude)
  (1,  'N1',  'Northwest Border',     47.5, 49.5, -97.5, -95.9, 48.5, -96.7),
  (2,  'N2',  'North Central West',   47.5, 49.5, -95.9, -94.3, 48.5, -95.1),
  (3,  'N3',  'North Central',        47.5, 49.5, -94.3, -92.7, 48.5, -93.5),
  (4,  'N4',  'North Central East',   47.5, 49.5, -92.7, -91.1, 48.5, -91.9),
  (5,  'N5',  'Northeast Arrowhead',  47.5, 49.5, -91.1, -89.5, 48.5, -90.3),

  -- North-Central regions (46.5 - 47.5 latitude)
  (6,  'NC1', 'Upper Red River',      46.5, 47.5, -97.5, -95.9, 47.0, -96.7),
  (7,  'NC2', 'Upper Mississippi',    46.5, 47.5, -95.9, -94.3, 47.0, -95.1),
  (8,  'NC3', 'Chippewa National',    46.5, 47.5, -94.3, -92.7, 47.0, -93.5),
  (9,  'NC4', 'Iron Range West',      46.5, 47.5, -92.7, -91.1, 47.0, -91.9),
  (10, 'NC5', 'Iron Range East',      46.5, 47.5, -91.1, -89.5, 47.0, -90.3),

  -- Central regions (45.5 - 46.5 latitude)
  (11, 'C1',  'West Central',         45.5, 46.5, -97.5, -95.5, 46.0, -96.5),
  (12, 'C2',  'Brainerd Lakes',       45.5, 46.5, -95.5, -93.5, 46.0, -94.5),
  (13, 'C3',  'Mille Lacs',           45.5, 46.5, -93.5, -91.5, 46.0, -92.5),
  (14, 'C4',  'North Shore',          45.5, 46.5, -91.5, -89.5, 46.0, -90.5),

  -- South-Central regions (44.5 - 45.5 latitude)
  (15, 'SC1', 'Southwest Prairie',    44.5, 45.5, -97.5, -95.5, 45.0, -96.5),
  (16, 'SC2', 'Twin Cities Metro',    44.5, 45.5, -95.5, -93.5, 45.0, -94.5),
  (17, 'SC3', 'St. Croix Valley',     44.5, 45.5, -93.5, -91.5, 45.0, -92.5),
  (18, 'SC4', 'Southeast Bluffs',     44.5, 45.5, -91.5, -89.5, 45.0, -90.5),

  -- South regions (43.5 - 44.5 latitude)
  (19, 'S1',  'Southern Prairie',     43.5, 44.5, -97.5, -93.5, 44.0, -95.5),
  (20, 'S2',  'Southern Mississippi', 43.5, 44.5, -93.5, -89.5, 44.0, -91.5);

-- Index for efficient region lookups
CREATE INDEX IF NOT EXISTS idx_regions_bounds ON weather_regions(lat_min, lat_max, lon_min, lon_max);

-- Add region_id column to lakes table
ALTER TABLE lakes ADD COLUMN region_id INTEGER REFERENCES weather_regions(region_id);

-- Calculate and assign regions for all existing lakes
UPDATE lakes
SET region_id = (
  SELECT region_id
  FROM weather_regions
  WHERE lakes.latitude >= lat_min
    AND lakes.latitude < lat_max
    AND lakes.longitude >= lon_min
    AND lakes.longitude < lon_max
  LIMIT 1
);

-- Index for lake region lookups
CREATE INDEX IF NOT EXISTS idx_lakes_region ON lakes(region_id);

-- Verify assignment (should show 0 unassigned lakes)
-- SELECT COUNT(*) FROM lakes WHERE region_id IS NULL;
