-- Create lakes table for lake information
CREATE TABLE lakes (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT,

  -- Location
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,

  -- Amenities (boolean flags stored as INTEGER 0/1)
  has_casino INTEGER DEFAULT 0,
  has_bait_shop INTEGER DEFAULT 0,
  has_ice_house_rental INTEGER DEFAULT 0,
  has_lodging INTEGER DEFAULT 0,
  has_restaurant INTEGER DEFAULT 0,
  has_boat_launch INTEGER DEFAULT 0,
  has_gas_station INTEGER DEFAULT 0,
  has_grocery INTEGER DEFAULT 0,
  has_guide_service INTEGER DEFAULT 0,
  bars_count INTEGER DEFAULT 0,

  -- Admin-managed official ice data
  official_ice_thickness REAL,
  official_ice_condition TEXT,
  official_ice_updated_at TEXT,

  -- Metadata
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_lakes_slug ON lakes(slug);

-- Create ice reports table for user-submitted ice conditions
CREATE TABLE ice_reports (
  id TEXT PRIMARY KEY,
  lake_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- Ice data
  thickness_inches REAL NOT NULL,
  condition TEXT,
  location_notes TEXT,

  -- GPS coordinates of measurement (optional)
  latitude REAL,
  longitude REAL,

  -- Metadata
  reported_at TEXT NOT NULL,
  created_at TEXT NOT NULL,

  FOREIGN KEY (lake_id) REFERENCES lakes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_ice_reports_lake ON ice_reports(lake_id);
CREATE INDEX idx_ice_reports_user ON ice_reports(user_id);
CREATE INDEX idx_ice_reports_date ON ice_reports(reported_at DESC);

-- Create catch reports table for user-submitted fish catches
CREATE TABLE catch_reports (
  id TEXT PRIMARY KEY,
  lake_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- Catch data
  fish_species TEXT NOT NULL,
  fish_count INTEGER DEFAULT 1,
  largest_size_inches REAL,
  largest_weight_lbs REAL,

  -- Location/method
  depth_feet REAL,
  bait_used TEXT,
  location_notes TEXT,

  -- Photo (optional)
  photo_url TEXT,

  -- Metadata
  caught_at TEXT NOT NULL,
  created_at TEXT NOT NULL,

  FOREIGN KEY (lake_id) REFERENCES lakes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_catch_reports_lake ON catch_reports(lake_id);
CREATE INDEX idx_catch_reports_user ON catch_reports(user_id);
CREATE INDEX idx_catch_reports_species ON catch_reports(fish_species);

-- Create lake favorites table for user's favorite lakes
CREATE TABLE lake_favorites (
  user_id TEXT NOT NULL,
  lake_id TEXT NOT NULL,
  created_at TEXT NOT NULL,

  PRIMARY KEY (user_id, lake_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (lake_id) REFERENCES lakes(id)
);

-- Seed data: 10 lakes from hardcoded lakes.html
INSERT INTO lakes (id, slug, name, region, latitude, longitude, has_casino, has_bait_shop, has_ice_house_rental, has_lodging, has_restaurant, has_boat_launch, has_gas_station, has_grocery, has_guide_service, bars_count, official_ice_thickness, official_ice_condition, official_ice_updated_at, created_at, updated_at) VALUES
  ('lake-1', 'upper-red-lake', 'Upper Red Lake', 'Northern Minnesota', 48.0635, -94.8797, 0, 1, 1, 1, 1, 1, 1, 1, 1, 3, 14, 'excellent', datetime('now'), datetime('now'), datetime('now')),
  ('lake-2', 'lake-of-the-woods', 'Lake of the Woods', 'Northern Minnesota', 49.0, -94.6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 16, 'excellent', datetime('now'), datetime('now'), datetime('now')),
  ('lake-3', 'mille-lacs', 'Mille Lacs Lake', 'Central Minnesota', 46.2633, -93.6578, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 10, 'good', datetime('now'), datetime('now'), datetime('now')),
  ('lake-4', 'leech-lake', 'Leech Lake', 'North Central Minnesota', 47.2158, -94.4194, 1, 1, 1, 1, 1, 1, 1, 0, 1, 3, 13, 'excellent', datetime('now'), datetime('now'), datetime('now')),
  ('lake-5', 'winnibigoshish', 'Lake Winnibigoshish', 'North Central Minnesota', 47.4417, -94.1575, 0, 1, 1, 1, 0, 1, 0, 0, 1, 2, 15, 'excellent', datetime('now'), datetime('now'), datetime('now')),
  ('lake-6', 'vermilion', 'Lake Vermilion', 'Northern Minnesota', 47.9356, -92.3375, 1, 1, 1, 1, 1, 1, 0, 0, 1, 2, 11, 'good', datetime('now'), datetime('now'), datetime('now')),
  ('lake-7', 'gull-lake', 'Gull Lake', 'Brainerd Lakes', 46.4069, -94.3553, 0, 1, 1, 1, 1, 1, 1, 1, 0, 3, 8, 'fair', datetime('now'), datetime('now'), datetime('now')),
  ('lake-8', 'rainy-lake', 'Rainy Lake', 'International Falls', 48.6167, -93.3808, 0, 1, 1, 1, 0, 1, 1, 0, 1, 2, 17, 'excellent', datetime('now'), datetime('now'), datetime('now')),
  ('lake-9', 'otter-tail', 'Otter Tail Lake', 'West Central Minnesota', 46.4236, -95.6978, 0, 1, 0, 1, 1, 1, 0, 1, 0, 2, 9, 'good', datetime('now'), datetime('now'), datetime('now')),
  ('lake-10', 'cass-lake', 'Cass Lake', 'North Central Minnesota', 47.3919, -94.6050, 1, 1, 1, 1, 1, 1, 0, 0, 1, 2, 12, 'excellent', datetime('now'), datetime('now'), datetime('now'));
