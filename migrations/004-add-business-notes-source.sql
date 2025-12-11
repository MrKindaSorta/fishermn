-- Add notes and source_reference columns to businesses table
-- This allows storing detailed descriptions and source references from CSV imports

ALTER TABLE businesses ADD COLUMN notes TEXT;
ALTER TABLE businesses ADD COLUMN source_reference TEXT;
