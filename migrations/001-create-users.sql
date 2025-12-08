-- Create users table for authentication
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  display_name TEXT NOT NULL,
  oauth_provider TEXT,
  oauth_provider_id TEXT,

  -- Rank/XP data
  rank_level INTEGER DEFAULT 1,
  rank_tier TEXT DEFAULT 'Rookie',
  rank_band TEXT DEFAULT 'Bronze',
  xp INTEGER DEFAULT 0,
  next_level_xp INTEGER DEFAULT 100,
  reliability_score REAL DEFAULT 0.0,
  reliability_votes INTEGER DEFAULT 0,

  -- Stats
  ice_reports INTEGER DEFAULT 0,
  catch_reports INTEGER DEFAULT 0,
  lakes_visited INTEGER DEFAULT 0,
  check_ins INTEGER DEFAULT 0,

  -- Metadata
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_provider_id);

-- Seed with existing hardcoded user
INSERT INTO users VALUES (
  'user-current',
  'fisherdude42@fishermn.com',
  NULL,
  'FisherDude42',
  NULL,
  NULL,
  11,
  'Local Legend',
  'Silver',
  980,
  1100,
  4.7,
  142,
  34,
  28,
  8,
  15,
  '2024-11-01T10:00:00Z',
  datetime('now'),
  NULL
);
