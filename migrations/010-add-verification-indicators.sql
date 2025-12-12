-- Migration 010: Add Location and Timing Verification Indicators
-- Adds columns to track whether reports were submitted from the lake and timing accuracy

-- Add on_lake column to ice_reports (1 = user was on lake when reporting)
ALTER TABLE ice_reports ADD COLUMN on_lake INTEGER DEFAULT 0;

-- Add on_lake column to snow_reports (1 = user was on lake when reporting)
ALTER TABLE snow_reports ADD COLUMN on_lake INTEGER DEFAULT 0;

-- Add reported_later column to catch_reports (1 = catch reported later without exact time)
ALTER TABLE catch_reports ADD COLUMN reported_later INTEGER DEFAULT 0;
