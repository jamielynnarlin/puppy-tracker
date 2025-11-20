-- Supabase Database Schema for Puppy Tracker
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Commands table
CREATE TABLE commands (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age_week INTEGER NOT NULL,
  description TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice logs table
CREATE TABLE practice_logs (
  id BIGSERIAL PRIMARY KEY,
  command_id BIGINT REFERENCES commands(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  attempts INTEGER,
  distractions TEXT,
  reliability INTEGER,
  notes TEXT,
  logged_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Potty logs table
CREATE TABLE potty_logs (
  id BIGSERIAL PRIMARY KEY,
  command_id BIGINT REFERENCES commands(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pee', 'poop', 'both')),
  time TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('inside', 'outside')),
  logged_by TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal logs table
CREATE TABLE meal_logs (
  id BIGSERIAL PRIMARY KEY,
  command_id BIGINT REFERENCES commands(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  time TEXT NOT NULL,
  amount TEXT,
  food TEXT,
  logged_by TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nap logs table
CREATE TABLE nap_logs (
  id BIGSERIAL PRIMARY KEY,
  command_id BIGINT REFERENCES commands(id) ON DELETE CASCADE,
  start_time TEXT NOT NULL,
  end_time TEXT,
  location TEXT NOT NULL,
  logged_by TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones table
CREATE TABLE milestones (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_date TEXT,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT,
  notes TEXT,
  reminder_enabled BOOLEAN DEFAULT FALSE,
  reminder_time TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_practice_logs_command_id ON practice_logs(command_id);
CREATE INDEX idx_practice_logs_date ON practice_logs(date);
CREATE INDEX idx_potty_logs_command_id ON potty_logs(command_id);
CREATE INDEX idx_potty_logs_date ON potty_logs(date);
CREATE INDEX idx_meal_logs_command_id ON meal_logs(command_id);
CREATE INDEX idx_meal_logs_date ON meal_logs(date);
CREATE INDEX idx_nap_logs_command_id ON nap_logs(command_id);
CREATE INDEX idx_nap_logs_date ON nap_logs(date);
CREATE INDEX idx_appointments_date ON appointments(date);

-- Enable Row Level Security (RLS)
ALTER TABLE commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE potty_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nap_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since we're using simple auth)
-- In production, you'd want to tie these to authenticated users

CREATE POLICY "Enable all for commands" ON commands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for practice_logs" ON practice_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for potty_logs" ON potty_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for meal_logs" ON meal_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for nap_logs" ON nap_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for milestones" ON milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);

-- Insert default commands (Week 8-10)
INSERT INTO commands (name, age_week, description, is_custom) VALUES
('Potty Training', 8, 'Teaching proper bathroom habits', false),
('Name Recognition', 8, 'Responding to their name', false),
('Basic Handling', 8, 'Getting comfortable with touch', false);

-- Insert default milestones
INSERT INTO milestones (title, description, completed) VALUES
('First Vet Visit', 'Initial health checkup and vaccinations', false),
('First Walk', 'First walk outside the home', false),
('House Trained', 'Consistently uses bathroom outside', false),
('Learned to Sit', 'Can sit on command reliably', false),
('First Successful Stay', 'Stays in place when commanded', false),
('Mastered Roll Over', 'Can roll over on command', false);

-- Insert default appointments
INSERT INTO appointments (title, date, time, reminder_enabled, completed) VALUES
('First Vet Visit', '2025-11-21', '10:00', true, false),
('Second Vaccination', '2025-12-19', '10:00', true, false),
('Puppy Training Class', '2026-01-05', '14:00', true, false);
