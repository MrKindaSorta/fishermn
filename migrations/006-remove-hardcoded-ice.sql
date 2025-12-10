-- Migration 006: Remove hardcoded ice data from launch lakes
-- Forces system to use real user-submitted ice reports

UPDATE lakes
SET
  official_ice_thickness = NULL,
  official_ice_condition = NULL,
  official_ice_updated_at = NULL
WHERE id IN (
  'lake-1',  -- Upper Red Lake
  'lake-2',  -- Lake of the Woods
  'lake-3',  -- Mille Lacs Lake
  'lake-4',  -- Leech Lake
  'lake-5',  -- Lake Winnibigoshish
  'lake-6',  -- Lake Vermilion
  'lake-7',  -- Gull Lake
  'lake-8',  -- Rainy Lake
  'lake-9',  -- Otter Tail Lake
  'lake-10'  -- Cass Lake
);

-- Result: All 10 launch lakes now have NULL ice data
-- Ice status will be computed from ice_reports table dynamically
