-- Migration 007: Add Snow Reports and Fish Species Tables
-- Adds snow reporting functionality and fish species database

-- Create fish_species table
CREATE TABLE fish_species (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  sort_order INTEGER DEFAULT 999,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_fish_species_category ON fish_species(category, sort_order);
CREATE INDEX idx_fish_species_slug ON fish_species(slug);

-- Populate fish species - Common 20 (Most Popular)
INSERT INTO fish_species (id, name, slug, category, sort_order, created_at) VALUES
  ('fish-1', 'Walleye', 'walleye', 'Common', 1, datetime('now')),
  ('fish-2', 'Northern Pike', 'northern-pike', 'Common', 2, datetime('now')),
  ('fish-3', 'Muskellunge', 'muskellunge', 'Common', 3, datetime('now')),
  ('fish-4', 'Largemouth Bass', 'largemouth-bass', 'Common', 4, datetime('now')),
  ('fish-5', 'Smallmouth Bass', 'smallmouth-bass', 'Common', 5, datetime('now')),
  ('fish-6', 'Yellow Perch', 'yellow-perch', 'Common', 6, datetime('now')),
  ('fish-7', 'Black Crappie', 'black-crappie', 'Common', 7, datetime('now')),
  ('fish-8', 'White Crappie', 'white-crappie', 'Common', 8, datetime('now')),
  ('fish-9', 'Bluegill', 'bluegill', 'Common', 9, datetime('now')),
  ('fish-10', 'Pumpkinseed', 'pumpkinseed', 'Common', 10, datetime('now')),
  ('fish-11', 'Lake Trout', 'lake-trout', 'Common', 11, datetime('now')),
  ('fish-12', 'Rainbow Trout', 'rainbow-trout', 'Common', 12, datetime('now')),
  ('fish-13', 'Brook Trout', 'brook-trout', 'Common', 13, datetime('now')),
  ('fish-14', 'Brown Trout', 'brown-trout', 'Common', 14, datetime('now')),
  ('fish-15', 'Channel Catfish', 'channel-catfish', 'Common', 15, datetime('now')),
  ('fish-16', 'Flathead Catfish', 'flathead-catfish', 'Common', 16, datetime('now')),
  ('fish-17', 'Lake Sturgeon', 'lake-sturgeon', 'Common', 17, datetime('now')),
  ('fish-18', 'Sauger', 'sauger', 'Common', 18, datetime('now')),
  ('fish-19', 'Cisco', 'cisco', 'Common', 19, datetime('now')),
  ('fish-20', 'Burbot', 'burbot', 'Common', 20, datetime('now'));

-- Sportfish
INSERT INTO fish_species (id, name, slug, category, created_at) VALUES
  ('fish-21', 'Rock Bass', 'rock-bass', 'Sportfish', datetime('now')),
  ('fish-22', 'Tiger Muskie', 'tiger-muskie', 'Sportfish', datetime('now')),
  ('fish-23', 'Green Sunfish', 'green-sunfish', 'Sportfish', datetime('now')),
  ('fish-24', 'Hybrid Sunfish', 'hybrid-sunfish', 'Sportfish', datetime('now')),
  ('fish-25', 'Splake', 'splake', 'Sportfish', datetime('now')),
  ('fish-26', 'Coho Salmon', 'coho-salmon', 'Sportfish', datetime('now')),
  ('fish-27', 'Chinook Salmon', 'chinook-salmon', 'Sportfish', datetime('now')),
  ('fish-28', 'Pink Salmon', 'pink-salmon', 'Sportfish', datetime('now')),
  ('fish-29', 'Atlantic Salmon', 'atlantic-salmon', 'Sportfish', datetime('now')),
  ('fish-30', 'Lake Whitefish', 'lake-whitefish', 'Sportfish', datetime('now')),
  ('fish-31', 'Bloater', 'bloater', 'Sportfish', datetime('now')),
  ('fish-32', 'Round Whitefish', 'round-whitefish', 'Sportfish', datetime('now')),
  ('fish-33', 'Shovelnose Sturgeon', 'shovelnose-sturgeon', 'Sportfish', datetime('now'));

-- Rough Fish
INSERT INTO fish_species (id, name, slug, category, created_at) VALUES
  ('fish-34', 'Common Carp', 'common-carp', 'Rough Fish', datetime('now')),
  ('fish-35', 'Bigmouth Buffalo', 'bigmouth-buffalo', 'Rough Fish', datetime('now')),
  ('fish-36', 'Smallmouth Buffalo', 'smallmouth-buffalo', 'Rough Fish', datetime('now')),
  ('fish-37', 'Quillback', 'quillback', 'Rough Fish', datetime('now')),
  ('fish-38', 'Highfin Carpsucker', 'highfin-carpsucker', 'Rough Fish', datetime('now')),
  ('fish-39', 'River Carpsucker', 'river-carpsucker', 'Rough Fish', datetime('now')),
  ('fish-40', 'White Sucker', 'white-sucker', 'Rough Fish', datetime('now')),
  ('fish-41', 'Longnose Sucker', 'longnose-sucker', 'Rough Fish', datetime('now')),
  ('fish-42', 'Shorthead Redhorse', 'shorthead-redhorse', 'Rough Fish', datetime('now')),
  ('fish-43', 'River Redhorse', 'river-redhorse', 'Rough Fish', datetime('now')),
  ('fish-44', 'Greater Redhorse', 'greater-redhorse', 'Rough Fish', datetime('now')),
  ('fish-45', 'Silver Redhorse', 'silver-redhorse', 'Rough Fish', datetime('now')),
  ('fish-46', 'Golden Redhorse', 'golden-redhorse', 'Rough Fish', datetime('now')),
  ('fish-47', 'Black Redhorse', 'black-redhorse', 'Rough Fish', datetime('now')),
  ('fish-48', 'Hog Sucker', 'hog-sucker', 'Rough Fish', datetime('now')),
  ('fish-49', 'Black Bullhead', 'black-bullhead', 'Rough Fish', datetime('now')),
  ('fish-50', 'Yellow Bullhead', 'yellow-bullhead', 'Rough Fish', datetime('now')),
  ('fish-51', 'Brown Bullhead', 'brown-bullhead', 'Rough Fish', datetime('now')),
  ('fish-52', 'Freshwater Drum', 'freshwater-drum', 'Rough Fish', datetime('now')),
  ('fish-53', 'Bowfin', 'bowfin', 'Rough Fish', datetime('now')),
  ('fish-54', 'Longnose Gar', 'longnose-gar', 'Rough Fish', datetime('now')),
  ('fish-55', 'Shortnose Gar', 'shortnose-gar', 'Rough Fish', datetime('now'));

-- Minnows & Baitfish
INSERT INTO fish_species (id, name, slug, category, created_at) VALUES
  ('fish-56', 'Fathead Minnow', 'fathead-minnow', 'Minnows & Baitfish', datetime('now')),
  ('fish-57', 'Emerald Shiner', 'emerald-shiner', 'Minnows & Baitfish', datetime('now')),
  ('fish-58', 'Spottail Shiner', 'spottail-shiner', 'Minnows & Baitfish', datetime('now')),
  ('fish-59', 'Golden Shiner', 'golden-shiner', 'Minnows & Baitfish', datetime('now')),
  ('fish-60', 'Common Shiner', 'common-shiner', 'Minnows & Baitfish', datetime('now')),
  ('fish-61', 'Bigmouth Shiner', 'bigmouth-shiner', 'Minnows & Baitfish', datetime('now')),
  ('fish-62', 'Red Shiner', 'red-shiner', 'Minnows & Baitfish', datetime('now')),
  ('fish-63', 'Sand Shiner', 'sand-shiner', 'Minnows & Baitfish', datetime('now')),
  ('fish-64', 'Bluntnose Minnow', 'bluntnose-minnow', 'Minnows & Baitfish', datetime('now')),
  ('fish-65', 'Creek Chub', 'creek-chub', 'Minnows & Baitfish', datetime('now')),
  ('fish-66', 'Hornyhead Chub', 'hornyhead-chub', 'Minnows & Baitfish', datetime('now')),
  ('fish-67', 'Pearl Dace', 'pearl-dace', 'Minnows & Baitfish', datetime('now')),
  ('fish-68', 'Northern Redbelly Dace', 'northern-redbelly-dace', 'Minnows & Baitfish', datetime('now')),
  ('fish-69', 'Finescale Dace', 'finescale-dace', 'Minnows & Baitfish', datetime('now')),
  ('fish-70', 'Brassy Minnow', 'brassy-minnow', 'Minnows & Baitfish', datetime('now')),
  ('fish-71', 'Central Stoneroller', 'central-stoneroller', 'Minnows & Baitfish', datetime('now')),
  ('fish-72', 'Rainbow Darter', 'rainbow-darter', 'Minnows & Baitfish', datetime('now')),
  ('fish-73', 'Johnny Darter', 'johnny-darter', 'Minnows & Baitfish', datetime('now')),
  ('fish-74', 'Iowa Darter', 'iowa-darter', 'Minnows & Baitfish', datetime('now')),
  ('fish-75', 'Fantail Darter', 'fantail-darter', 'Minnows & Baitfish', datetime('now')),
  ('fish-76', 'Logperch', 'logperch', 'Minnows & Baitfish', datetime('now')),
  ('fish-77', 'Blackside Darter', 'blackside-darter', 'Minnows & Baitfish', datetime('now')),
  ('fish-78', 'Least Darter', 'least-darter', 'Minnows & Baitfish', datetime('now')),
  ('fish-79', 'American Eel', 'american-eel', 'Minnows & Baitfish', datetime('now')),
  ('fish-80', 'Goldeye', 'goldeye', 'Minnows & Baitfish', datetime('now')),
  ('fish-81', 'Mooneye', 'mooneye', 'Minnows & Baitfish', datetime('now')),
  ('fish-82', 'Pirate Perch', 'pirate-perch', 'Minnows & Baitfish', datetime('now')),
  ('fish-83', 'Brook Stickleback', 'brook-stickleback', 'Minnows & Baitfish', datetime('now')),
  ('fish-84', 'Ninespine Stickleback', 'ninespine-stickleback', 'Minnows & Baitfish', datetime('now')),
  ('fish-85', 'Threespine Stickleback', 'threespine-stickleback', 'Minnows & Baitfish', datetime('now')),
  ('fish-86', 'Banded Killifish', 'banded-killifish', 'Minnows & Baitfish', datetime('now')),
  ('fish-87', 'Plains Killifish', 'plains-killifish', 'Minnows & Baitfish', datetime('now')),
  ('fish-88', 'Trout-Perch', 'trout-perch', 'Minnows & Baitfish', datetime('now')),
  ('fish-89', 'Slimy Sculpin', 'slimy-sculpin', 'Minnows & Baitfish', datetime('now')),
  ('fish-90', 'Deepwater Sculpin', 'deepwater-sculpin', 'Minnows & Baitfish', datetime('now')),
  ('fish-91', 'Mottled Sculpin', 'mottled-sculpin', 'Minnows & Baitfish', datetime('now')),
  ('fish-92', 'Round Goby', 'round-goby', 'Minnows & Baitfish', datetime('now')),
  ('fish-93', 'Ruffe', 'ruffe', 'Minnows & Baitfish', datetime('now')),
  ('fish-94', 'White Perch', 'white-perch', 'Minnows & Baitfish', datetime('now')),
  ('fish-95', 'Grass Carp', 'grass-carp', 'Minnows & Baitfish', datetime('now')),
  ('fish-96', 'Bighead Carp', 'bighead-carp', 'Minnows & Baitfish', datetime('now')),
  ('fish-97', 'Silver Carp', 'silver-carp', 'Minnows & Baitfish', datetime('now'));

-- Create snow_reports table
CREATE TABLE snow_reports (
  id TEXT PRIMARY KEY,
  lake_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- Snow data
  thickness_inches INTEGER NOT NULL,
  snow_type TEXT NOT NULL,
  coverage TEXT NOT NULL,
  location_notes TEXT,

  -- Metadata
  reported_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,

  FOREIGN KEY (lake_id) REFERENCES lakes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_snow_reports_lake ON snow_reports(lake_id);
CREATE INDEX idx_snow_reports_user ON snow_reports(user_id);
CREATE INDEX idx_snow_reports_date ON snow_reports(reported_at DESC);

-- Add snow_reports column to users table
ALTER TABLE users ADD COLUMN snow_reports INTEGER DEFAULT 0;
