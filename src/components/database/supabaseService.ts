import { supabase } from './supabaseClient';
import type { DbCommand, DbPracticeLog, DbPottyLog, DbMealLog, DbNapLog, DbMilestone, DbAppointment } from './supabaseClient';

/**
 * Supabase Service Layer
 * Provides CRUD operations for all puppy tracker data
 */

// ============= COMMANDS =============

export const commandsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('commands')
      .select('*')
      .order('age_week', { ascending: true })
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data as DbCommand[];
  },

  async create(command: Omit<DbCommand, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('commands')
      .insert(command)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbCommand;
  },

  async update(id: number, updates: Partial<DbCommand>) {
    const { data, error } = await supabase
      .from('commands')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbCommand;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('commands')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ============= PRACTICE LOGS =============

export const practiceLogsService = {
  async getByCommandId(commandId: number) {
    const { data, error } = await supabase
      .from('practice_logs')
      .select('*')
      .eq('command_id', commandId)
      .order('date', { ascending: false })
      .order('time', { ascending: false });
    
    if (error) throw error;
    return data as DbPracticeLog[];
  },

  async create(log: Omit<DbPracticeLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('practice_logs')
      .insert(log)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbPracticeLog;
  },

  async update(id: number, updates: Partial<DbPracticeLog>) {
    const { data, error } = await supabase
      .from('practice_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbPracticeLog;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('practice_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ============= POTTY LOGS =============

export const pottyLogsService = {
  async getByCommandId(commandId: number) {
    const { data, error } = await supabase
      .from('potty_logs')
      .select('*')
      .eq('command_id', commandId)
      .order('date', { ascending: false })
      .order('time', { ascending: false });
    
    if (error) throw error;
    return data as DbPottyLog[];
  },

  async create(log: Omit<DbPottyLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('potty_logs')
      .insert(log)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbPottyLog;
  },

  async update(id: number, updates: Partial<DbPottyLog>) {
    const { data, error } = await supabase
      .from('potty_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbPottyLog;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('potty_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ============= MEAL LOGS =============

export const mealLogsService = {
  async getByCommandId(commandId: number) {
    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('command_id', commandId)
      .order('date', { ascending: false })
      .order('time', { ascending: false });
    
    if (error) throw error;
    return data as DbMealLog[];
  },

  async create(log: Omit<DbMealLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('meal_logs')
      .insert(log)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbMealLog;
  },

  async update(id: number, updates: Partial<DbMealLog>) {
    const { data, error } = await supabase
      .from('meal_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbMealLog;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ============= NAP LOGS =============

export const napLogsService = {
  async getByCommandId(commandId: number) {
    const { data, error } = await supabase
      .from('nap_logs')
      .select('*')
      .eq('command_id', commandId)
      .order('date', { ascending: false })
      .order('start_time', { ascending: false });
    
    if (error) throw error;
    return data as DbNapLog[];
  },

  async create(log: Omit<DbNapLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('nap_logs')
      .insert(log)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbNapLog;
  },

  async update(id: number, updates: Partial<DbNapLog>) {
    const { data, error } = await supabase
      .from('nap_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbNapLog;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('nap_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ============= MILESTONES =============

export const milestonesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data as DbMilestone[];
  },

  async create(milestone: Omit<DbMilestone, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('milestones')
      .insert(milestone)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbMilestone;
  },

  async update(id: number, updates: Partial<DbMilestone>) {
    const { data, error } = await supabase
      .from('milestones')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbMilestone;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ============= APPOINTMENTS =============

export const appointmentsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    
    if (error) throw error;
    return data as DbAppointment[];
  },

  async create(appointment: Omit<DbAppointment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbAppointment;
  },

  async update(id: number, updates: Partial<DbAppointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DbAppointment;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ============= MIGRATION =============

export const migrationService = {
  async migrateFromLocalStorage() {
    try {
      // Check if there are already commands in Supabase
      const existingCommands = await commandsService.getAll();
      
      // Migrate commands only if localStorage has data and we should migrate
      const savedCommands = localStorage.getItem('puppyCommands');
      if (savedCommands && existingCommands.length === 0) {
        const commands = JSON.parse(savedCommands);
        for (const cmd of commands) {
          await commandsService.create({
            name: cmd.name,
            age_week: cmd.ageWeek,
            description: cmd.description,
            is_custom: cmd.isCustom || false,
          });
        }
        console.log('✅ Migrated commands from localStorage');
      } else if (existingCommands.length > 0) {
        console.log('ℹ️ Commands already exist in Supabase, skipping migration');
      }

      // Migrate milestones
      const savedMilestones = localStorage.getItem('puppyMilestones');
      if (savedMilestones) {
        const milestones = JSON.parse(savedMilestones);
        for (const ms of milestones) {
          await milestonesService.create({
            title: ms.title,
            description: ms.description,
            completed: ms.completed,
            completed_date: ms.completedDate,
            photo_url: ms.photoUrl,
            notes: ms.notes,
          });
        }
        console.log('✅ Migrated milestones from localStorage');
      }

      // Migrate appointments
      const savedAppointments = localStorage.getItem('puppyAppointments');
      if (savedAppointments) {
        const appointments = JSON.parse(savedAppointments);
        for (const apt of appointments) {
          await appointmentsService.create({
            title: apt.title,
            date: apt.date,
            time: apt.time,
            location: apt.location,
            notes: apt.notes,
            reminder_enabled: apt.reminderEnabled || false,
            reminder_time: apt.reminderTime,
            completed: apt.completed || false,
          });
        }
        console.log('✅ Migrated appointments from localStorage');
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('puppyCommands');
      localStorage.removeItem('puppyMilestones');
      localStorage.removeItem('puppyAppointments');
      localStorage.setItem('supabase_migrated', 'true');
      
      console.log('✅ Migration complete! LocalStorage data cleared.');
      return true;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }
  },

  isMigrated() {
    return localStorage.getItem('supabase_migrated') === 'true';
  },
};
