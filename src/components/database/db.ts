import Dexie, { Table } from 'dexie';

// Define database interfaces
export interface PottyLog {
  id?: number;
  date: string;
  time: string;
  location: 'indoor' | 'outdoor' | 'accident';
  success: boolean;
  notes?: string;
  created_at: Date;
}

export interface TrainingSession {
  id?: number;
  command: string;
  date: string;
  start_time: string;
  end_time: string;
  success: boolean;
  notes?: string;
  treats_used: number;
  created_at: Date;
}

export interface Command {
  id?: number;
  name: string;
  description: string;
  progress: number; // 0-100
  sessions_count: number;
  last_practiced: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_custom: boolean;
  created_at: Date;
}

export interface Appointment {
  id?: number;
  title: string;
  date: string;
  time: string;
  provider: string;
  type: 'Veterinary' | 'Training' | 'Grooming' | 'Other';
  notes?: string;
  completed: boolean;
  created_at: Date;
}

export interface DailyRoutine {
  id?: number;
  date: string;
  feeding_times: string[];
  sleep_start: string;
  sleep_end: string;
  exercise_duration: number; // minutes
  crate_time_duration: number; // minutes
  notes?: string;
  created_at: Date;
}

export interface Milestone {
  id?: number;
  name: string;
  description: string;
  category: string;
  completed: boolean;
  completed_date?: string;
  target_date?: string;
  created_at: Date;
}

export interface ProgressInsight {
  id?: number;
  date: string;
  metric_type: 'potty_success_rate' | 'command_progress' | 'behavior_trend';
  value: number;
  notes?: string;
  created_at: Date;
}

// Database class
export class PuppyTrackerDB extends Dexie {
  potty_logs!: Table<PottyLog>;
  training_sessions!: Table<TrainingSession>;
  commands!: Table<Command>;
  appointments!: Table<Appointment>;
  daily_routines!: Table<DailyRoutine>;
  milestones!: Table<Milestone>;
  progress_insights!: Table<ProgressInsight>;

  constructor() {
    super('PuppyTrackerDB');
    
    this.version(1).stores({
      potty_logs: '++id, date, time, location, success, created_at',
      training_sessions: '++id, command, date, start_time, success, created_at',
      commands: '++id, name, progress, sessions_count, last_practiced, is_custom, created_at',
      appointments: '++id, title, date, time, type, completed, created_at',
      daily_routines: '++id, date, created_at',
      milestones: '++id, name, category, completed, completed_date, target_date, created_at',
      progress_insights: '++id, date, metric_type, value, created_at'
    });
  }
}

// Export database instance
export const db = new PuppyTrackerDB();