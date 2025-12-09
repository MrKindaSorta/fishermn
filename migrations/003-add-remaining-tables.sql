-- Migration 003: Add remaining tables from fishermn-plan.md
-- This completes the database schema for V1

-- ============================================
-- NEW TABLES
-- ============================================

-- 1. businesses - Bars, bait shops, resorts, casinos
CREATE TABLE businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,                     -- 'BAR', 'BAIT', 'RESORT', 'CASINO', 'OTHER'
  lake_id TEXT,                           -- nullable, for nearby but not on-lake
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,

  -- Amenities
  has_pull_tabs INTEGER DEFAULT 0,
  has_food INTEGER DEFAULT 0,
  has_lodging INTEGER DEFAULT 0,
  has_live_bait INTEGER DEFAULT 0,
  has_tackle INTEGER DEFAULT 0,
  has_ice_house_rental INTEGER DEFAULT 0,

  -- Contact
  website TEXT,
  phone TEXT,
  address TEXT,

  -- Ratings
  avg_rating REAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  -- Business status
  is_partner INTEGER DEFAULT 0,           -- Paying business
  is_verified INTEGER DEFAULT 0,          -- Admin verified

  -- Metadata
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (lake_id) REFERENCES lakes(id)
);

CREATE INDEX idx_businesses_lake ON businesses(lake_id);
CREATE INDEX idx_businesses_type ON businesses(type);

-- 2. checkins - GPS-verified business check-ins
CREATE TABLE checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  business_id TEXT NOT NULL,

  -- Check-in data
  rating INTEGER,                         -- 1-5 stars
  notes TEXT,

  -- GPS verification
  latitude REAL,
  longitude REAL,
  is_verified INTEGER DEFAULT 0,          -- GPS within 100m radius

  -- Metadata
  created_at TEXT NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE INDEX idx_checkins_user ON checkins(user_id);
CREATE INDEX idx_checkins_business ON checkins(business_id);

-- 3. votes - Upvotes/downvotes on reports
CREATE TABLE votes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  report_type TEXT NOT NULL,              -- 'ice', 'catch'
  report_id TEXT NOT NULL,
  vote_type TEXT NOT NULL,                -- 'up', 'down'
  created_at TEXT NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, report_type, report_id)
);

CREATE INDEX idx_votes_report ON votes(report_type, report_id);

-- 4. fact_checks - Community verification of reports
CREATE TABLE fact_checks (
  id TEXT PRIMARY KEY,
  report_type TEXT NOT NULL,              -- 'ice', 'catch'
  report_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  verdict TEXT NOT NULL,                  -- 'AGREE', 'DISAGREE', 'DANGEROUS'
  created_at TEXT NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, report_type, report_id)
);

CREATE INDEX idx_fact_checks_report ON fact_checks(report_type, report_id);

-- 5. xp_events - XP transaction log
CREATE TABLE xp_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,               -- 'ICE_REPORT', 'CATCH_REPORT', 'CHECKIN', 'UPVOTE_RECEIVED', etc.
  xp_amount INTEGER NOT NULL,
  reference_type TEXT,                    -- 'ice_report', 'catch_report', 'checkin', etc.
  reference_id TEXT,
  description TEXT,
  created_at TEXT NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_xp_events_user ON xp_events(user_id);
CREATE INDEX idx_xp_events_date ON xp_events(created_at DESC);

-- 6. discussion_threads - Forum threads
CREATE TABLE discussion_threads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  lake_id TEXT,                           -- nullable for general discussions
  title TEXT NOT NULL,
  body TEXT NOT NULL,

  -- Stats
  reply_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- Status
  is_pinned INTEGER DEFAULT 0,
  is_locked INTEGER DEFAULT 0,

  -- Metadata
  last_reply_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (lake_id) REFERENCES lakes(id)
);

CREATE INDEX idx_threads_lake ON discussion_threads(lake_id);
CREATE INDEX idx_threads_user ON discussion_threads(user_id);
CREATE INDEX idx_threads_recent ON discussion_threads(last_reply_at DESC);

-- 7. discussion_posts - Forum replies
CREATE TABLE discussion_posts (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  body TEXT NOT NULL,

  -- Metadata
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  FOREIGN KEY (thread_id) REFERENCES discussion_threads(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_posts_thread ON discussion_posts(thread_id);
CREATE INDEX idx_posts_user ON discussion_posts(user_id);

-- 8. rewards - Prizes and rewards
CREATE TABLE rewards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sponsor_type TEXT NOT NULL,             -- 'FISHERMN', 'BUSINESS'
  business_id TEXT,

  -- Requirements
  min_rank_level INTEGER DEFAULT 1,
  max_claims_per_user INTEGER DEFAULT 1,

  -- Validity
  valid_from TEXT,
  valid_to TEXT,
  is_active INTEGER DEFAULT 1,

  -- Metadata
  created_at TEXT NOT NULL,

  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- 9. reward_claims - User reward claims
CREATE TABLE reward_claims (
  id TEXT PRIMARY KEY,
  reward_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  claimed_at TEXT NOT NULL,
  redeemed_at TEXT,

  FOREIGN KEY (reward_id) REFERENCES rewards(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_claims_user ON reward_claims(user_id);

-- ============================================
-- ALTER EXISTING TABLES
-- ============================================

-- Add quadrant to ice_reports (for location privacy)
ALTER TABLE ice_reports ADD COLUMN quadrant TEXT DEFAULT 'WHOLE_LAKE';

-- Add confidence to ice_reports
ALTER TABLE ice_reports ADD COLUMN confidence TEXT DEFAULT 'MEDIUM';

-- Add depth_band to catch_reports
ALTER TABLE catch_reports ADD COLUMN depth_band TEXT;

-- Add quadrant to catch_reports
ALTER TABLE catch_reports ADD COLUMN quadrant TEXT DEFAULT 'WHOLE_LAKE';

-- Add vote counts to ice_reports
ALTER TABLE ice_reports ADD COLUMN upvotes INTEGER DEFAULT 0;
ALTER TABLE ice_reports ADD COLUMN downvotes INTEGER DEFAULT 0;

-- Add vote counts to catch_reports
ALTER TABLE catch_reports ADD COLUMN upvotes INTEGER DEFAULT 0;
ALTER TABLE catch_reports ADD COLUMN downvotes INTEGER DEFAULT 0;

-- ============================================
-- SEED DATA: BUSINESSES FOR 10 LAUNCH LAKES
-- ============================================

-- Upper Red Lake (lake-1) businesses
INSERT INTO businesses (id, name, type, lake_id, latitude, longitude, has_food, has_lodging, has_pull_tabs, has_live_bait, has_tackle, has_ice_house_rental, created_at, updated_at) VALUES
  ('biz-1', 'West Wind Resort Bar & Grill', 'BAR', 'lake-1', 48.0635, -94.8797, 1, 1, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-2', 'JRs Corner Access Bar', 'BAR', 'lake-1', 48.0700, -94.8800, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-3', 'Rogers on Red Bar', 'BAR', 'lake-1', 48.0550, -94.8750, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-4', 'West Wind Bait', 'BAIT', 'lake-1', 48.0635, -94.8797, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-5', 'JRs Bait', 'BAIT', 'lake-1', 48.0700, -94.8800, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-6', 'Morts Dock Bait', 'BAIT', 'lake-1', 48.0600, -94.8850, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-7', 'West Wind Resort', 'RESORT', 'lake-1', 48.0635, -94.8797, 1, 1, 0, 1, 1, 1, datetime('now'), datetime('now')),
  ('biz-8', 'Rogers on Red Resort', 'RESORT', 'lake-1', 48.0550, -94.8750, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-9', 'Beacon Harbor', 'RESORT', 'lake-1', 48.0680, -94.8820, 0, 1, 0, 0, 0, 1, datetime('now'), datetime('now'));

-- Lake of the Woods (lake-2) businesses
INSERT INTO businesses (id, name, type, lake_id, latitude, longitude, has_food, has_lodging, has_pull_tabs, has_live_bait, has_tackle, has_ice_house_rental, created_at, updated_at) VALUES
  ('biz-10', 'Sportsmans Lodge Bar', 'BAR', 'lake-2', 49.0, -94.6, 1, 1, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-11', 'Wigwam Resort Bar', 'BAR', 'lake-2', 49.01, -94.62, 1, 1, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-12', 'Arnesens Rocky Point Bar', 'BAR', 'lake-2', 48.98, -94.58, 1, 1, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-13', 'The Igloo Bar', 'BAR', 'lake-2', 49.02, -94.65, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-14', 'Lake of the Woods Bait & Tackle', 'BAIT', 'lake-2', 49.0, -94.6, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-15', 'Adrians Resort Bait', 'BAIT', 'lake-2', 48.99, -94.61, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-16', 'Sportsmans Lodge', 'RESORT', 'lake-2', 49.0, -94.6, 1, 1, 0, 1, 1, 1, datetime('now'), datetime('now')),
  ('biz-17', 'Ballards Resort', 'RESORT', 'lake-2', 49.01, -94.59, 1, 1, 0, 1, 0, 1, datetime('now'), datetime('now')),
  ('biz-18', 'Arnesens Rocky Point', 'RESORT', 'lake-2', 48.98, -94.58, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-19', 'River Bend Resort', 'RESORT', 'lake-2', 49.03, -94.63, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-20', 'Seven Clans Casino', 'CASINO', 'lake-2', 48.9067, -95.3164, 1, 1, 0, 0, 0, 0, datetime('now'), datetime('now'));

-- Mille Lacs Lake (lake-3) businesses
INSERT INTO businesses (id, name, type, lake_id, latitude, longitude, has_food, has_lodging, has_pull_tabs, has_live_bait, has_tackle, has_ice_house_rental, created_at, updated_at) VALUES
  ('biz-21', 'The Blue Goose', 'BAR', 'lake-3', 46.2633, -93.6578, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-22', 'Castaways Bar', 'BAR', 'lake-3', 46.27, -93.66, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-23', 'Twin Pines Bar', 'BAR', 'lake-3', 46.25, -93.65, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-24', 'Beachside Bar at Appeldoorns', 'BAR', 'lake-3', 46.26, -93.67, 1, 1, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-25', 'Lybacks Bait', 'BAIT', 'lake-3', 46.2633, -93.6578, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-26', 'Johnsons Portside', 'BAIT', 'lake-3', 46.27, -93.66, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-27', 'Hunters Point Bait', 'BAIT', 'lake-3', 46.25, -93.65, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-28', 'Appeldoorns Resort', 'RESORT', 'lake-3', 46.26, -93.67, 1, 1, 0, 1, 1, 1, datetime('now'), datetime('now')),
  ('biz-29', 'Hunters Point Resort', 'RESORT', 'lake-3', 46.25, -93.65, 1, 1, 0, 1, 0, 1, datetime('now'), datetime('now')),
  ('biz-30', 'Red Door Resort', 'RESORT', 'lake-3', 46.28, -93.68, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-31', 'Twin Pines Resort', 'RESORT', 'lake-3', 46.25, -93.65, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-32', 'Grand Casino Mille Lacs', 'CASINO', 'lake-3', 46.2167, -93.6253, 1, 1, 0, 0, 0, 0, datetime('now'), datetime('now'));

-- Leech Lake (lake-4) businesses
INSERT INTO businesses (id, name, type, lake_id, latitude, longitude, has_food, has_lodging, has_pull_tabs, has_live_bait, has_tackle, has_ice_house_rental, created_at, updated_at) VALUES
  ('biz-33', 'Chase on the Lake Bar', 'BAR', 'lake-4', 47.2158, -94.4194, 1, 1, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-34', 'Walker Bay Bar & Grill', 'BAR', 'lake-4', 47.22, -94.42, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-35', 'Tianna Country Club Bar', 'BAR', 'lake-4', 47.21, -94.41, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-36', 'Reeds Sporting Goods', 'BAIT', 'lake-4', 47.2158, -94.4194, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-37', 'Shrivers Bait', 'BAIT', 'lake-4', 47.22, -94.42, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-38', 'Swansons Bait', 'BAIT', 'lake-4', 47.21, -94.41, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-39', 'Trappers Landing', 'RESORT', 'lake-4', 47.2158, -94.4194, 1, 1, 0, 1, 1, 1, datetime('now'), datetime('now')),
  ('biz-40', 'Hiawatha Beach Resort', 'RESORT', 'lake-4', 47.23, -94.43, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-41', 'Chase on the Lake', 'RESORT', 'lake-4', 47.2158, -94.4194, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-42', 'Northern Lights Casino', 'CASINO', 'lake-4', 47.0842, -94.5883, 1, 1, 0, 0, 0, 0, datetime('now'), datetime('now'));

-- Lake Winnibigoshish (lake-5) businesses
INSERT INTO businesses (id, name, type, lake_id, latitude, longitude, has_food, has_lodging, has_pull_tabs, has_live_bait, has_tackle, has_ice_house_rental, created_at, updated_at) VALUES
  ('biz-43', 'Gosh-Dam Place', 'BAR', 'lake-5', 47.4417, -94.1575, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-44', 'High Banks Bar', 'BAR', 'lake-5', 47.45, -94.16, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-45', 'Winnie Bait & Tackle', 'BAIT', 'lake-5', 47.4417, -94.1575, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-46', 'High Banks Bait', 'BAIT', 'lake-5', 47.45, -94.16, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-47', 'High Banks Resort', 'RESORT', 'lake-5', 47.45, -94.16, 1, 1, 0, 1, 1, 1, datetime('now'), datetime('now')),
  ('biz-48', 'Nodak Lodge', 'RESORT', 'lake-5', 47.43, -94.15, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-49', 'Eagle Nest Lodge', 'RESORT', 'lake-5', 47.44, -94.17, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now'));

-- Lake Vermilion (lake-6) businesses
INSERT INTO businesses (id, name, type, lake_id, latitude, longitude, has_food, has_lodging, has_pull_tabs, has_live_bait, has_tackle, has_ice_house_rental, created_at, updated_at) VALUES
  ('biz-50', 'The Vermilion Club', 'BAR', 'lake-6', 47.9356, -92.3375, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-51', 'The Landing Restaurant', 'BAR', 'lake-6', 47.94, -92.34, 1, 0, 0, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-52', 'Vermilion House Bait', 'BAIT', 'lake-6', 47.9356, -92.3375, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-53', 'Bens Bait', 'BAIT', 'lake-6', 47.94, -92.34, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-54', 'Ludlows Island Resort', 'RESORT', 'lake-6', 47.9356, -92.3375, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-55', 'Everett Bay Lodge', 'RESORT', 'lake-6', 47.93, -92.33, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-56', 'White Eagle Resort', 'RESORT', 'lake-6', 47.94, -92.35, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-57', 'Fortune Bay Resort Casino', 'CASINO', 'lake-6', 47.9089, -92.2817, 1, 1, 0, 0, 0, 0, datetime('now'), datetime('now'));

-- Gull Lake (lake-7) businesses
INSERT INTO businesses (id, name, type, lake_id, latitude, longitude, has_food, has_lodging, has_pull_tabs, has_live_bait, has_tackle, has_ice_house_rental, created_at, updated_at) VALUES
  ('biz-58', 'Zorbaz on Gull Lake', 'BAR', 'lake-7', 46.4069, -94.3553, 1, 0, 0, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-59', 'Ernies on Gull Lake', 'BAR', 'lake-7', 46.41, -94.36, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-60', 'Quarterdeck Bar', 'BAR', 'lake-7', 46.40, -94.35, 1, 1, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-61', 'S&W Bait', 'BAIT', 'lake-7', 46.4069, -94.3553, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-62', 'Oars-N-Mine Bait', 'BAIT', 'lake-7', 46.41, -94.36, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-63', 'Quarterdeck Resort', 'RESORT', 'lake-7', 46.40, -94.35, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-64', 'Craguns Resort', 'RESORT', 'lake-7', 46.42, -94.37, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-65', 'Maddens Resort', 'RESORT', 'lake-7', 46.43, -94.38, 1, 1, 0, 0, 0, 0, datetime('now'), datetime('now'));

-- Rainy Lake (lake-8) businesses
INSERT INTO businesses (id, name, type, lake_id, latitude, longitude, has_food, has_lodging, has_pull_tabs, has_live_bait, has_tackle, has_ice_house_rental, created_at, updated_at) VALUES
  ('biz-66', 'Thunderbird Lodge Bar', 'BAR', 'lake-8', 48.6167, -93.3808, 1, 1, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-67', 'Sha Sha Resort Bar', 'BAR', 'lake-8', 48.62, -93.38, 1, 1, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-68', 'Rainy Lake One Stop', 'BAIT', 'lake-8', 48.6167, -93.3808, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-69', 'Loons Nest Bait', 'BAIT', 'lake-8', 48.62, -93.38, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-70', 'Thunderbird Lodge', 'RESORT', 'lake-8', 48.6167, -93.3808, 1, 1, 0, 1, 1, 1, datetime('now'), datetime('now')),
  ('biz-71', 'Sha Sha Resort', 'RESORT', 'lake-8', 48.62, -93.38, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-72', 'Rainy Lake Resort & Outfitters', 'RESORT', 'lake-8', 48.61, -93.37, 1, 1, 0, 1, 1, 1, datetime('now'), datetime('now'));

-- Otter Tail Lake (lake-9) businesses
INSERT INTO businesses (id, name, type, lake_id, latitude, longitude, has_food, has_lodging, has_pull_tabs, has_live_bait, has_tackle, has_ice_house_rental, created_at, updated_at) VALUES
  ('biz-73', 'Beach Bums Bar & Grill', 'BAR', 'lake-9', 46.4236, -95.6978, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-74', 'Zorbaz Ottertail', 'BAR', 'lake-9', 46.43, -95.70, 1, 0, 0, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-75', 'Ottertail Country Bait Shop', 'BAIT', 'lake-9', 46.4236, -95.6978, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-76', 'Genes Sport Shop', 'BAIT', 'lake-9', 46.43, -95.70, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-77', 'The Lodge at Otter Tail', 'RESORT', 'lake-9', 46.4236, -95.6978, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-78', 'Hollys Resort', 'RESORT', 'lake-9', 46.42, -95.69, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now'));

-- Cass Lake (lake-10) businesses
INSERT INTO businesses (id, name, type, lake_id, latitude, longitude, has_food, has_lodging, has_pull_tabs, has_live_bait, has_tackle, has_ice_house_rental, created_at, updated_at) VALUES
  ('biz-79', 'Cass Lake Lodge Bar', 'BAR', 'lake-10', 47.3919, -94.6050, 1, 1, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-80', 'Pike Hole Bar & Grill', 'BAR', 'lake-10', 47.40, -94.61, 1, 0, 1, 0, 0, 0, datetime('now'), datetime('now')),
  ('biz-81', 'The Fish Shop', 'BAIT', 'lake-10', 47.3919, -94.6050, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-82', 'Froggys Bait', 'BAIT', 'lake-10', 47.40, -94.61, 0, 0, 0, 1, 1, 0, datetime('now'), datetime('now')),
  ('biz-83', 'Cass Lake Lodge', 'RESORT', 'lake-10', 47.3919, -94.6050, 1, 1, 0, 1, 1, 1, datetime('now'), datetime('now')),
  ('biz-84', 'Stony Point Resort', 'RESORT', 'lake-10', 47.38, -94.60, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-85', 'Wishbone Resort', 'RESORT', 'lake-10', 47.39, -94.62, 1, 1, 0, 0, 0, 1, datetime('now'), datetime('now')),
  ('biz-86', 'Cedar Lakes Casino', 'CASINO', 'lake-10', 47.3800, -94.6100, 1, 1, 0, 0, 0, 0, datetime('now'), datetime('now'));
