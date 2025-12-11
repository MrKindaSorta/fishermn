-- Migration 008: Add Lake Updates Table
-- Simple comments/updates about lakes for the Recent Activity feed

CREATE TABLE lake_updates (
  id TEXT PRIMARY KEY,
  lake_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,

  FOREIGN KEY (lake_id) REFERENCES lakes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_lake_updates_lake ON lake_updates(lake_id, created_at DESC);
CREATE INDEX idx_lake_updates_user ON lake_updates(user_id);
