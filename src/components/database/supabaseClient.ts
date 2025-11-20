import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// To set up:
// 1. Go to https://supabase.com and create a free account
// 2. Create a new project
// 3. Go to Settings > API
// 4. Copy your Project URL and anon/public key
// 5. Replace the values below with your actual credentials

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types
export interface DbCommand {
  id: number;
  name: string;
  age_week: number;
  description?: string;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbPracticeLog {
  id: number;
  command_id: number;
  date: string;
  time: string;
  attempts?: number;
  distractions?: string;
  reliability?: number;
  notes?: string;
  logged_by: string;
  created_at: string;
}

export interface DbPottyLog {
  id: number;
  command_id: number;
  type: 'pee' | 'poop' | 'both';
  time: string;
  location: 'inside' | 'outside';
  logged_by: string;
  date: string;
  notes?: string;
  created_at: string;
}

export interface DbMealLog {
  id: number;
  command_id: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  amount?: string;
  food?: string;
  logged_by: string;
  date: string;
  notes?: string;
  created_at: string;
}

export interface DbNapLog {
  id: number;
  command_id: number;
  start_time: string;
  end_time?: string;
  location: string;
  logged_by: string;
  date: string;
  notes?: string;
  created_at: string;
}

export interface DbMilestone {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  completed_date?: string;
  photo_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DbAppointment {
  id: number;
  title: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  reminder_enabled: boolean;
  reminder_time?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
