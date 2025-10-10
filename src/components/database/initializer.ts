import { db } from './db';
import { CommandService, MilestoneService } from './services';

export class DatabaseInitializer {
  static async initializeDatabase(): Promise<void> {
    try {
      // Check if database is already initialized
      const commandCount = await db.commands.count();
      if (commandCount > 0) {
        console.log('Database already initialized');
        return;
      }

      console.log('Initializing database with default data...');

      // Initialize default commands
      const defaultCommands = [
        {
          name: 'Sit',
          description: 'Dog sits down on command',
          progress: 85,
          sessions_count: 12,
          last_practiced: new Date().toISOString().split('T')[0],
          difficulty: 'easy' as const,
          is_custom: false
        },
        {
          name: 'Stay',
          description: 'Dog remains in position until released',
          progress: 70,
          sessions_count: 8,
          last_practiced: new Date().toISOString().split('T')[0],
          difficulty: 'medium' as const,
          is_custom: false
        },
        {
          name: 'Come',
          description: 'Dog comes when called',
          progress: 65,
          sessions_count: 10,
          last_practiced: new Date().toISOString().split('T')[0],
          difficulty: 'medium' as const,
          is_custom: false
        },
        {
          name: 'Down',
          description: 'Dog lies down on command',
          progress: 75,
          sessions_count: 9,
          last_practiced: new Date().toISOString().split('T')[0],
          difficulty: 'easy' as const,
          is_custom: false
        },
        {
          name: 'Heel',
          description: 'Dog walks beside owner without pulling',
          progress: 45,
          sessions_count: 6,
          last_practiced: new Date().toISOString().split('T')[0],
          difficulty: 'hard' as const,
          is_custom: false
        },
        {
          name: 'Leave It',
          description: 'Dog ignores objects or food on command',
          progress: 55,
          sessions_count: 7,
          last_practiced: new Date().toISOString().split('T')[0],
          difficulty: 'medium' as const,
          is_custom: false
        }
      ];

      for (const command of defaultCommands) {
        await CommandService.addCommand(command);
      }

      // Initialize default milestones
      const defaultMilestones = [
        {
          name: 'First successful sit',
          description: 'Puppy sits on command for the first time',
          category: 'Commands',
          completed: true,
          completed_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          target_date: undefined
        },
        {
          name: 'Potty trained',
          description: 'Goes 7 days without accidents',
          category: 'House Training',
          completed: true,
          completed_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          target_date: undefined
        },
        {
          name: 'First walk without pulling',
          description: 'Completes a full walk without pulling on leash',
          category: 'Walking',
          completed: false,
          completed_date: undefined,
          target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          name: 'Comes when called',
          description: 'Reliably comes when called from across the yard',
          category: 'Commands',
          completed: false,
          completed_date: undefined,
          target_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          name: 'Stays for 30 seconds',
          description: 'Maintains stay position for 30 seconds',
          category: 'Commands',
          completed: false,
          completed_date: undefined,
          target_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          name: 'First night without whining',
          description: 'Sleeps through the night without whining',
          category: 'Sleep',
          completed: true,
          completed_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          target_date: undefined
        },
        {
          name: 'Learned 5 basic commands',
          description: 'Successfully knows sit, stay, come, down, and heel',
          category: 'Commands',
          completed: false,
          completed_date: undefined,
          target_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          name: 'First grooming session',
          description: 'Completes first professional grooming without stress',
          category: 'Care',
          completed: false,
          completed_date: undefined,
          target_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];

      for (const milestone of defaultMilestones) {
        await MilestoneService.addMilestone(milestone);
      }

      console.log('Database initialization completed successfully!');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  static async clearAllData(): Promise<void> {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) {
        await table.clear();
      }
    });
    console.log('All database data cleared');
  }

  static async exportData(): Promise<any> {
    const data = {
      potty_logs: await db.potty_logs.toArray(),
      training_sessions: await db.training_sessions.toArray(),
      commands: await db.commands.toArray(),
      appointments: await db.appointments.toArray(),
      daily_routines: await db.daily_routines.toArray(),
      milestones: await db.milestones.toArray(),
      progress_insights: await db.progress_insights.toArray(),
      export_date: new Date().toISOString()
    };
    return data;
  }

  static async importData(data: any): Promise<void> {
    await db.transaction('rw', db.tables, async () => {
      // Clear existing data
      for (const table of db.tables) {
        await table.clear();
      }

      // Import new data
      if (data.potty_logs) await db.potty_logs.bulkAdd(data.potty_logs);
      if (data.training_sessions) await db.training_sessions.bulkAdd(data.training_sessions);
      if (data.commands) await db.commands.bulkAdd(data.commands);
      if (data.appointments) await db.appointments.bulkAdd(data.appointments);
      if (data.daily_routines) await db.daily_routines.bulkAdd(data.daily_routines);
      if (data.milestones) await db.milestones.bulkAdd(data.milestones);
      if (data.progress_insights) await db.progress_insights.bulkAdd(data.progress_insights);
    });
    console.log('Data import completed successfully!');
  }
}