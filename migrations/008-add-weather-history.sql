-- Migration: Add weather_history table for regional historical weather data
-- Purpose: Store 4 daily weather snapshots (morning/midday/evening/night) per REGION
--          to enable accurate bite forecasting based on multi-day weather patterns
--
-- Strategy: 20 Minnesota regions × 4 periods/day = 80 API calls/day (sustainable)
-- Retention: Last 7 days (560 total records: 20 regions × 4 periods × 7 days)

-- Create weather history table (REGIONAL, not per-lake)
CREATE TABLE IF NOT EXISTS weather_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  region_id INTEGER NOT NULL,  -- References weather_regions table
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

  -- Sun/Moon Times (from region centroid)
  sunrise_time TEXT,          -- ISO timestamp (only populated for morning period)
  sunset_time TEXT,           -- ISO timestamp (only populated for evening period)

  -- Calculated Trend Metrics
  pressure_trend TEXT CHECK(pressure_trend IN ('falling_fast', 'falling', 'stable', 'rising', 'rising_fast')),
  temp_trend TEXT CHECK(temp_trend IN ('extreme_cold', 'cold_front', 'warming', 'stable', 'mild')),
  storm_phase TEXT CHECK(storm_phase IN ('pre_storm', 'storm_active', 'post_storm', 'none')),

  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Ensure one record per region per date per time period
  UNIQUE(region_id, date, time_period),

  -- Foreign key to weather_regions table (must run migration 009 first!)
  FOREIGN KEY (region_id) REFERENCES weather_regions(region_id) ON DELETE CASCADE
);

-- Index for efficient lookups by region and date (descending for recent first)
CREATE INDEX IF NOT EXISTS idx_weather_history_lookup
  ON weather_history(region_id, date DESC);

-- Index for efficient cleanup of old records
CREATE INDEX IF NOT EXISTS idx_weather_history_cleanup
  ON weather_history(date);
