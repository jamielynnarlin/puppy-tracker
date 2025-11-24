-- FULL RESET: Delete all commands and reload fresh defaults
-- Run this in your Supabase SQL Editor to completely reset commands

-- Step 1: Delete ALL commands (this will cascade delete all logs due to foreign keys)
DELETE FROM commands;

-- Step 2: Reset the sequence (so new IDs start from 1)
ALTER SEQUENCE commands_id_seq RESTART WITH 1;

-- Step 3: Insert fresh default commands (no duplicates)
INSERT INTO commands (name, age_week, description, is_custom) VALUES
('Potty Training', 8, 'Teaching proper bathroom habits', false),
('Name Recognition', 8, 'Responding to their name', false),
('Basic Handling', 8, 'Getting comfortable with touch', false);

-- Step 4: Verify the fresh data
SELECT id, name, age_week, is_custom, created_at
FROM commands
ORDER BY age_week, id;
