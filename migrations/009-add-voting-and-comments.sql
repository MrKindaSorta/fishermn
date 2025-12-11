-- Migration 009: Add Voting and Comments System
-- Extends voting to snow_reports and lake_updates, adds comments functionality

-- Add vote columns to lake_updates (snow_reports already has them from migration 007)
ALTER TABLE lake_updates ADD COLUMN upvotes INTEGER DEFAULT 0;
ALTER TABLE lake_updates ADD COLUMN downvotes INTEGER DEFAULT 0;

-- Create comments table (polymorphic relationship to all content types)
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content_type TEXT NOT NULL,  -- 'ice', 'catch', 'snow', 'update'
  content_id TEXT NOT NULL,
  body TEXT NOT NULL,          -- Max 144 chars (enforced at API level)
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for efficient comment queries
CREATE INDEX idx_comments_content ON comments(content_type, content_id, created_at DESC);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_votes ON comments(content_type, content_id, upvotes DESC);

-- Create comment_votes table
CREATE TABLE comment_votes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  comment_id TEXT NOT NULL,
  vote_type TEXT NOT NULL,     -- 'up', 'down'
  created_at TEXT NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  UNIQUE(user_id, comment_id)
);

-- Indexes for comment votes
CREATE INDEX idx_comment_votes_comment ON comment_votes(comment_id);
CREATE INDEX idx_comment_votes_user ON comment_votes(user_id);
