import { db } from './db';

export class DataMigration {
  /**
   * Migrate data from localStorage to Dexie database
   * This is a one-time migration that preserves existing user data
   */
  static async migrateFromLocalStorage(): Promise<void> {
    try {
      // Check if migration has already been completed
      const migrationKey = 'database_migration_completed';
      if (localStorage.getItem(migrationKey) === 'true') {
        console.log('Migration already completed');
        return;
      }

      console.log('Starting data migration from localStorage to Dexie...');

      // Migrate weight entries
      const savedWeightEntries = localStorage.getItem('puppyWeightEntries');
      if (savedWeightEntries) {
        const entries = JSON.parse(savedWeightEntries);
        for (const entry of entries) {
          await db.weight_entries.add({
            ...entry,
            created_at: new Date()
          });
        }
        console.log(`Migrated ${entries.length} weight entries`);
      }

      // Migrate tooth logs
      const savedToothLogs = localStorage.getItem('puppyToothLogs');
      if (savedToothLogs) {
        const logs = JSON.parse(savedToothLogs);
        for (const log of logs) {
          await db.tooth_logs.add({
            ...log,
            created_at: new Date()
          });
        }
        console.log(`Migrated ${logs.length} tooth logs`);
      }

      // Migrate grooming logs
      const savedGroomingLogs = localStorage.getItem('puppyGroomingLogs');
      if (savedGroomingLogs) {
        const logs = JSON.parse(savedGroomingLogs);
        for (const log of logs) {
          await db.grooming_logs.add({
            ...log,
            created_at: new Date()
          });
        }
        console.log(`Migrated ${logs.length} grooming logs`);
      }

      // Migrate fear logs
      const savedFearLogs = localStorage.getItem('puppyFearLogs');
      if (savedFearLogs) {
        const logs = JSON.parse(savedFearLogs);
        for (const log of logs) {
          await db.fear_logs.add({
            ...log,
            created_at: new Date()
          });
        }
        console.log(`Migrated ${logs.length} fear logs`);
      }

      // Mark migration as complete
      localStorage.setItem(migrationKey, 'true');
      console.log('Data migration completed successfully');

      // Optionally clean up old localStorage data (commented out for safety)
      // localStorage.removeItem('puppyWeightEntries');
      // localStorage.removeItem('puppyToothLogs');
      // localStorage.removeItem('puppyGroomingLogs');
      // localStorage.removeItem('puppyFearLogs');

    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Reset migration flag (for testing purposes)
   */
  static resetMigration(): void {
    localStorage.removeItem('database_migration_completed');
    console.log('Migration flag reset');
  }

  /**
   * Clear all database data (for testing purposes)
   */
  static async clearAllData(): Promise<void> {
    await db.weight_entries.clear();
    await db.tooth_logs.clear();
    await db.grooming_logs.clear();
    await db.fear_logs.clear();
    console.log('All database data cleared');
  }
}
