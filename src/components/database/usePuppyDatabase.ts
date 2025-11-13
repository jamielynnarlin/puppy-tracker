import { useState, useEffect } from 'react';
import { 
  WeightService,
  ToothLogService,
  GroomingLogService,
  FearLogService
} from './services';
import { DatabaseInitializer } from './initializer';
import { 
  WeightEntry, 
  ToothLog, 
  GroomingLog, 
  FearLog 
} from './db';

// This hook provides additional database functionality for the App.tsx component
// It handles the physical development tracking features
export function usePuppyDatabase() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [toothLogs, setToothLogs] = useState<ToothLog[]>([]);
  const [groomingLogs, setGroomingLogs] = useState<GroomingLog[]>([]);
  const [fearLogs, setFearLogs] = useState<FearLog[]>([]);

  // Initialize database and load data
  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        setIsLoading(true);
        await DatabaseInitializer.initializeDatabase();
        await loadAllData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
        console.error('Database initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAndLoad();
  }, []);

  const loadAllData = async () => {
    try {
      const [
        weightData,
        toothData,
        groomingData,
        fearData
      ] = await Promise.all([
        WeightService.getAllEntries(),
        ToothLogService.getAllLogs(),
        GroomingLogService.getAllLogs(),
        FearLogService.getAllLogs()
      ]);

      setWeightEntries(weightData);
      setToothLogs(toothData);
      setGroomingLogs(groomingData);
      setFearLogs(fearData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Data loading error:', err);
    }
  };

  // Weight functions
  const addWeightEntry = async (entry: Omit<WeightEntry, 'id' | 'created_at'>) => {
    try {
      const id = await WeightService.addEntry(entry);
      await loadAllData(); // Refresh data
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add weight entry');
      console.error('Add weight entry error:', err);
      throw err;
    }
  };

  const deleteWeightEntry = async (id: number) => {
    try {
      await WeightService.deleteEntry(id);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete weight entry');
      console.error('Delete weight entry error:', err);
    }
  };

  // Tooth log functions
  const addToothLog = async (log: Omit<ToothLog, 'id' | 'created_at'>) => {
    try {
      const id = await ToothLogService.addLog(log);
      await loadAllData(); // Refresh data
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tooth log');
      console.error('Add tooth log error:', err);
      throw err;
    }
  };

  const deleteToothLog = async (id: number) => {
    try {
      await ToothLogService.deleteLog(id);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tooth log');
      console.error('Delete tooth log error:', err);
    }
  };

  // Grooming log functions
  const addGroomingLog = async (log: Omit<GroomingLog, 'id' | 'created_at'>) => {
    try {
      const id = await GroomingLogService.addLog(log);
      await loadAllData(); // Refresh data
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add grooming log');
      console.error('Add grooming log error:', err);
      throw err;
    }
  };

  const deleteGroomingLog = async (id: number) => {
    try {
      await GroomingLogService.deleteLog(id);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete grooming log');
      console.error('Delete grooming log error:', err);
    }
  };

  // Fear log functions
  const addFearLog = async (log: Omit<FearLog, 'id' | 'created_at'>) => {
    try {
      const id = await FearLogService.addLog(log);
      await loadAllData(); // Refresh data
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add fear log');
      console.error('Add fear log error:', err);
      throw err;
    }
  };

  const deleteFearLog = async (id: number) => {
    try {
      await FearLogService.deleteLog(id);
      await loadAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete fear log');
      console.error('Delete fear log error:', err);
    }
  };

  // Utility functions
  const clearError = () => setError(null);
  const refreshData = () => loadAllData();

  return {
    // State
    isLoading,
    error,
    weightEntries,
    toothLogs,
    groomingLogs,
    fearLogs,

    // Actions
    addWeightEntry,
    deleteWeightEntry,
    addToothLog,
    deleteToothLog,
    addGroomingLog,
    deleteGroomingLog,
    addFearLog,
    deleteFearLog,

    // Utilities
    clearError,
    refreshData
  };
}
