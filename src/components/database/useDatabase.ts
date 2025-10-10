import { useState, useEffect } from 'react';
import { 
  PottyService, 
  TrainingService, 
  CommandService, 
  AppointmentService, 
  DailyRoutineService, 
  MilestoneService,
  AnalyticsService 
} from './services';
import { DatabaseInitializer } from './initializer';
import { 
  PottyLog, 
  TrainingSession, 
  Command, 
  Appointment, 
  DailyRoutine, 
  Milestone 
} from './db';

export function useDatabase() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [pottyLogs, setPottyLogs] = useState<PottyLog[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dailyRoutines, setDailyRoutines] = useState<DailyRoutine[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Initialize database and load data
  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        setIsLoading(true);
        await DatabaseInitializer.initializeDatabase();
        await loadAllData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAndLoad();
  }, []);

  const loadAllData = async () => {
    try {
      const [
        pottyData,
        sessionData,
        commandData,
        appointmentData,
        routineData,
        milestoneData
      ] = await Promise.all([
        PottyService.getAllLogs(),
        TrainingService.getAllSessions(),
        CommandService.getAllCommands(),
        AppointmentService.getAllAppointments(),
        DailyRoutineService.getAllRoutines(),
        MilestoneService.getAllMilestones()
      ]);

      setPottyLogs(pottyData);
      setTrainingSessions(sessionData);
      setCommands(commandData);
      setAppointments(appointmentData);
      setDailyRoutines(routineData);
      setMilestones(milestoneData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  };

  // Potty functions
  const addPottyLog = async (log: Omit<PottyLog, 'id' | 'created_at'>) => {
    try {
      await PottyService.addLog(log);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add potty log');
    }
  };

  const deletePottyLog = async (id: number) => {
    try {
      await PottyService.deleteLog(id);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete potty log');
    }
  };

  // Training functions
  const addTrainingSession = async (session: Omit<TrainingSession, 'id' | 'created_at'>) => {
    try {
      await TrainingService.addSession(session);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add training session');
    }
  };

  // Command functions
  const addCustomCommand = async (command: Omit<Command, 'id' | 'created_at'>) => {
    try {
      await CommandService.addCommand(command);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add command');
    }
  };

  // Appointment functions
  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at'>) => {
    try {
      await AppointmentService.addAppointment(appointment);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add appointment');
    }
  };

  const markAppointmentCompleted = async (id: number) => {
    try {
      await AppointmentService.markCompleted(id);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark appointment as completed');
    }
  };

  // Daily routine functions
  const addDailyRoutine = async (routine: Omit<DailyRoutine, 'id' | 'created_at'>) => {
    try {
      await DailyRoutineService.addRoutine(routine);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add daily routine');
    }
  };

  const deleteDailyRoutine = async (id: number) => {
    try {
      await DailyRoutineService.deleteRoutine(id);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete daily routine');
    }
  };

  const updateDailyRoutine = async (id: number, updates: Partial<DailyRoutine>) => {
    try {
      await DailyRoutineService.updateRoutine(id, updates);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update daily routine');
    }
  };

  // Milestone functions
  const addMilestone = async (milestone: Omit<Milestone, 'id' | 'created_at'>) => {
    try {
      await MilestoneService.addMilestone(milestone);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add milestone');
    }
  };

  const markMilestoneCompleted = async (id: number, completedDate: string) => {
    try {
      await MilestoneService.markCompleted(id, completedDate);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark milestone as completed');
    }
  };

  // Analytics functions
  const getWeeklyProgress = async () => {
    try {
      return await AnalyticsService.calculateWeeklyProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get weekly progress');
      return null;
    }
  };

  const getCommandTrends = async () => {
    try {
      return await AnalyticsService.getCommandTrends();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get command trends');
      return [];
    }
  };

  const getPottySuccessRate = async (days: number = 7) => {
    try {
      return await PottyService.getSuccessRate(days);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get potty success rate');
      return 0;
    }
  };

  // Utility functions
  const clearError = () => setError(null);
  
  const refreshData = () => loadAllData();

  return {
    // State
    isLoading,
    error,
    pottyLogs,
    trainingSessions,
    commands,
    appointments,
    dailyRoutines,
    milestones,

    // Actions
    addPottyLog,
    deletePottyLog,
    addTrainingSession,
    addCustomCommand,
    addAppointment,
    markAppointmentCompleted,
    addDailyRoutine,
    deleteDailyRoutine,
    updateDailyRoutine,
    addMilestone,
    markMilestoneCompleted,

    // Analytics
    getWeeklyProgress,
    getCommandTrends,
    getPottySuccessRate,

    // Utilities
    clearError,
    refreshData
  };
}