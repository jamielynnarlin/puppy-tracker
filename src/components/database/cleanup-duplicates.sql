-- SQL script to remove duplicate commands from Supabase
-- Run this in your Supabase SQL Editor

-- First, let's see what duplicates we have
SELECT name, age_week, COUNT(*) as count
FROM commands
GROUP BY name, age_week
HAVING COUNT(*) > 1;

-- Delete all commands except the one with the lowest ID for each name/age_week combination
DELETE FROM commands
WHERE id NOT IN (
  SELECT MIN(id)
  FROM commands
  GROUP BY name, age_week
);

-- Verify the cleanup
SELECT id, name, age_week, is_custom, created_at
FROM commands
ORDER BY age_week, id;
