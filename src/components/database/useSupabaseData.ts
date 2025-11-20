import { useState, useEffect } from 'react';
import {
  commandsService,
  practiceLogsService,
  pottyLogsService,
  mealLogsService,
  napLogsService,
  milestonesService,
  appointmentsService,
  migrationService,
} from './supabaseService';

/**
 * Custom hook for managing puppy tracker data with Supabase
 * Handles loading, syncing, and real-time updates
 */
export function useSupabaseData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commands, setCommands] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setIsLoading(true);
      setError(null);

      // Check if migration is needed
      if (!migrationService.isMigrated()) {
        console.log('🔄 Migrating data from localStorage to Supabase...');
        await migrationService.migrateFromLocalStorage();
      }

      // Load all data from Supabase
      const [commandsData, milestonesData, appointmentsData] = await Promise.all([
        commandsService.getAll(),
        milestonesService.getAll(),
        appointmentsService.getAll(),
      ]);

      // Transform database format to app format
      const transformedCommands = await Promise.all(
        commandsData.map(async (cmd) => {
          const [practiceLogs, pottyLogs, mealLogs, napLogs] = await Promise.all([
            practiceLogsService.getByCommandId(cmd.id),
            pottyLogsService.getByCommandId(cmd.id),
            mealLogsService.getByCommandId(cmd.id),
            napLogsService.getByCommandId(cmd.id),
          ]);

          return {
            id: cmd.id,
            name: cmd.name,
            practiced: false,
            ageWeek: cmd.age_week,
            description: cmd.description,
            isCustom: cmd.is_custom,
            practiceLogs: practiceLogs.map(transformPracticeLog),
            pottyLogs: pottyLogs.map(transformPottyLog),
            mealLogs: mealLogs.map(transformMealLog),
            napLogs: napLogs.map(transformNapLog),
          };
        })
      );

      const transformedMilestones = milestonesData.map((ms) => ({
        id: ms.id,
        title: ms.title,
        description: ms.description,
        completed: ms.completed,
        completedDate: ms.completed_date,
        photo: ms.photo_url,
        notes: ms.notes,
      }));

      const transformedAppointments = appointmentsData.map((apt) => ({
        id: apt.id,
        title: apt.title,
        date: apt.date,
        time: apt.time,
        location: apt.location,
        notes: apt.notes,
        reminderEnabled: apt.reminder_enabled,
        reminderTime: apt.reminder_time,
        completed: apt.completed,
      }));

      setCommands(transformedCommands);
      setMilestones(transformedMilestones);
      setAppointments(transformedAppointments);

      console.log('✅ Data loaded from Supabase successfully!');
    } catch (err: any) {
      console.error('❌ Error loading data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    commands,
    setCommands,
    milestones,
    setMilestones,
    appointments,
    setAppointments,
    reload: loadAllData,
  };
}

// Transform functions to convert between database and app formats
function transformPracticeLog(log: any) {
  return {
    id: log.id,
    date: log.date,
    time: log.time,
    attempts: log.attempts,
    distractions: log.distractions,
    reliability: log.reliability,
    notes: log.notes,
    loggedBy: log.logged_by,
  };
}

function transformPottyLog(log: any) {
  return {
    id: log.id,
    type: log.type,
    time: log.time,
    location: log.location,
    loggedBy: log.logged_by,
    date: log.date,
    notes: log.notes,
  };
}

function transformMealLog(log: any) {
  return {
    id: log.id,
    mealType: log.meal_type,
    time: log.time,
    amount: log.amount,
    food: log.food,
    loggedBy: log.logged_by,
    date: log.date,
    notes: log.notes,
  };
}

function transformNapLog(log: any) {
  return {
    id: log.id,
    startTime: log.start_time,
    endTime: log.end_time,
    location: log.location,
    loggedBy: log.logged_by,
    date: log.date,
    notes: log.notes,
  };
}
