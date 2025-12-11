-- Migration: Add weather_history table for historical weather data tracking
-- Purpose: Store 4 daily weather snapshots (morning/midday/evening/night) per lake
--          to enable accurate bite forecasting based on multi-day weather patterns
--
-- Retention: Last 7 days (28 records per lake)
-- Collection: Automated cron job every 6 hours

-- Create weather history table
CREATE TABLE IF NOT EXISTS weather_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lake_id INTEGER NOT NULL,
  date DATE NOT NULL,
  time_period TEXT NOT NULL CHECK(time_period IN ('morning', 'midday', 'evening', 'night')),

  -- Core Weather Metrics
  avg_temp REAL,
  min_temp REAL,
  max_temp REAL,
  avg_pressure REAL,
  pressure_change REAL,      -- Change from previous period (mb)
  avg_humidity INTEGER,
  avg_clouds INTEGER,         -- Cloud cover % (0-100)

  -- Wind Data
  avg_wind_speed REAL,
  max_wind_gust REAL,

  -- Precipitation
  total_precip REAL,          -- Total mm for period
  precip_type TEXT CHECK(precip_type IN ('none', 'rain', 'snow', 'mixed')),
  avg_pop INTEGER,            -- Average probability of precipitation %

  -- Sun/Moon Times
  sunrise_time TEXT,          -- ISO timestamp (only populated for morning period)
  sunset_time TEXT,           -- ISO timestamp (only populated for evening period)

  -- Calculated Trend Metrics
  pressure_trend TEXT CHECK(pressure_trend IN ('falling_fast', 'falling', 'stable', 'rising', 'rising_fast')),
  temp_trend TEXT CHECK(temp_trend IN ('extreme_cold', 'cold_front', 'warming', 'stable', 'mild')),
  storm_phase TEXT CHECK(storm_phase IN ('pre_storm', 'storm_active', 'post_storm', 'none')),

  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Ensure one record per lake per date per time period
  UNIQUE(lake_id, date, time_period),

  -- Foreign key to lakes table
  FOREIGN KEY (lake_id) REFERENCES lakes(id) ON DELETE CASCADE
);

-- Index for efficient lookups by lake and date (descending for recent first)
CREATE INDEX IF NOT EXISTS idx_weather_history_lookup
  ON weather_history(lake_id, date DESC);

-- Index for efficient cleanup of old records
CREATE INDEX IF NOT EXISTS idx_weather_history_cleanup
  ON weather_history(date);

-- Add last_activity column to lakes table for cron optimization
-- (Only collect weather for lakes visited in last 30 days)
ALTER TABLE lakes ADD COLUMN last_activity DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Initialize last_activity with current timestamp for existing lakes
UPDATE lakes SET last_activity = CURRENT_TIMESTAMP WHERE last_activity IS NULL;
