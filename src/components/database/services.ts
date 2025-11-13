import { db, PottyLog, TrainingSession, Command, Appointment, DailyRoutine, Milestone, ProgressInsight, WeightEntry, ToothLog, GroomingLog, FearLog } from './db';

export class PottyService {
  static async addLog(log: Omit<PottyLog, 'id' | 'created_at'>): Promise<number> {
    return await db.potty_logs.add({
      ...log,
      created_at: new Date()
    });
  }

  static async getAllLogs(): Promise<PottyLog[]> {
    return await db.potty_logs.orderBy('created_at').reverse().toArray();
  }

  static async getLogsByDateRange(startDate: string, endDate: string): Promise<PottyLog[]> {
    return await db.potty_logs
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  static async getSuccessRate(days: number = 7): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = await db.potty_logs
      .where('created_at')
      .above(startDate)
      .toArray();
    
    if (logs.length === 0) return 0;
    const successCount = logs.filter(log => log.success).length;
    return Math.round((successCount / logs.length) * 100);
  }

  static async deleteLog(id: number): Promise<void> {
    await db.potty_logs.delete(id);
  }
}

export class TrainingService {
  static async addSession(session: Omit<TrainingSession, 'id' | 'created_at'>): Promise<number> {
    const id = await db.training_sessions.add({
      ...session,
      created_at: new Date()
    });

    // Update command progress
    await CommandService.updateProgress(session.command, session.success);
    return id;
  }

  static async getAllSessions(): Promise<TrainingSession[]> {
    return await db.training_sessions.orderBy('created_at').reverse().toArray();
  }

  static async getSessionsByCommand(command: string): Promise<TrainingSession[]> {
    return await db.training_sessions.where('command').equals(command).toArray();
  }

  static async deleteSession(id: number): Promise<void> {
    await db.training_sessions.delete(id);
  }
}

export class CommandService {
  static async addCommand(command: Omit<Command, 'id' | 'created_at'>): Promise<number> {
    return await db.commands.add({
      ...command,
      created_at: new Date()
    });
  }

  static async getAllCommands(): Promise<Command[]> {
    return await db.commands.toArray();
  }

  static async updateProgress(commandName: string, wasSuccessful: boolean): Promise<void> {
    const command = await db.commands.where('name').equals(commandName).first();
    if (!command) return;

    const sessions = await TrainingService.getSessionsByCommand(commandName);
    const successCount = sessions.filter(s => s.success).length;
    const totalSessions = sessions.length;
    const newProgress = totalSessions > 0 ? Math.round((successCount / totalSessions) * 100) : 0;

    await db.commands.update(command.id!, {
      progress: newProgress,
      sessions_count: totalSessions,
      last_practiced: new Date().toISOString().split('T')[0]
    });
  }

  static async deleteCommand(id: number): Promise<void> {
    await db.commands.delete(id);
  }
}

export class AppointmentService {
  static async addAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<number> {
    return await db.appointments.add({
      ...appointment,
      created_at: new Date()
    });
  }

  static async getAllAppointments(): Promise<Appointment[]> {
    return await db.appointments.orderBy('date').toArray();
  }

  static async getUpcomingAppointments(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db.appointments
      .where('date')
      .aboveOrEqual(today)
      .and(appointment => !appointment.completed)
      .toArray();
  }

  static async markCompleted(id: number): Promise<void> {
    await db.appointments.update(id, { completed: true });
  }

  static async deleteAppointment(id: number): Promise<void> {
    await db.appointments.delete(id);
  }
}

export class DailyRoutineService {
  static async addRoutine(routine: Omit<DailyRoutine, 'id' | 'created_at'>): Promise<number> {
    return await db.daily_routines.add({
      ...routine,
      created_at: new Date()
    });
  }

  static async getRoutineByDate(date: string): Promise<DailyRoutine | undefined> {
    return await db.daily_routines.where('date').equals(date).first();
  }

  static async getAllRoutines(): Promise<DailyRoutine[]> {
    return await db.daily_routines.orderBy('date').reverse().toArray();
  }

  static async updateRoutine(id: number, updates: Partial<DailyRoutine>): Promise<void> {
    await db.daily_routines.update(id, updates);
  }

  static async deleteRoutine(id: number): Promise<void> {
    await db.daily_routines.delete(id);
  }
}

export class MilestoneService {
  static async addMilestone(milestone: Omit<Milestone, 'id' | 'created_at'>): Promise<number> {
    return await db.milestones.add({
      ...milestone,
      created_at: new Date()
    });
  }

  static async getAllMilestones(): Promise<Milestone[]> {
    return await db.milestones.toArray();
  }

  static async markCompleted(id: number, completedDate: string): Promise<void> {
    await db.milestones.update(id, {
      completed: true,
      completed_date: completedDate
    });
  }

  static async getCompletedMilestones(): Promise<Milestone[]> {
    return await db.milestones.filter(milestone => milestone.completed === true).toArray();
  }

  static async deleteMilestone(id: number): Promise<void> {
    await db.milestones.delete(id);
  }
}

export class AnalyticsService {
  static async calculateWeeklyProgress(): Promise<any> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const sessions = await db.training_sessions
      .where('created_at')
      .above(oneWeekAgo)
      .toArray();

    const pottyLogs = await db.potty_logs
      .where('created_at')
      .above(oneWeekAgo)
      .toArray();

    return {
      training_sessions: sessions.length,
      successful_sessions: sessions.filter(s => s.success).length,
      potty_success_rate: await PottyService.getSuccessRate(7),
      total_potty_breaks: pottyLogs.length
    };
  }

  static async getCommandTrends(): Promise<any[]> {
    const commands = await CommandService.getAllCommands();
    return commands.map(cmd => ({
      name: cmd.name,
      progress: cmd.progress,
      sessions: cmd.sessions_count,
      lastPracticed: cmd.last_practiced
    }));
  }

  static async saveInsight(insight: Omit<ProgressInsight, 'id' | 'created_at'>): Promise<number> {
    return await db.progress_insights.add({
      ...insight,
      created_at: new Date()
    });
  }
}

export class WeightService {
  static async addEntry(entry: Omit<WeightEntry, 'id' | 'created_at'>): Promise<number> {
    return await db.weight_entries.add({
      ...entry,
      created_at: new Date()
    });
  }

  static async getAllEntries(): Promise<WeightEntry[]> {
    return await db.weight_entries.orderBy('date').toArray();
  }

  static async deleteEntry(id: number): Promise<void> {
    await db.weight_entries.delete(id);
  }
}

export class ToothLogService {
  static async addLog(log: Omit<ToothLog, 'id' | 'created_at'>): Promise<number> {
    return await db.tooth_logs.add({
      ...log,
      created_at: new Date()
    });
  }

  static async getAllLogs(): Promise<ToothLog[]> {
    return await db.tooth_logs.orderBy('dateNoticed').reverse().toArray();
  }

  static async deleteLog(id: number): Promise<void> {
    await db.tooth_logs.delete(id);
  }
}

export class GroomingLogService {
  static async addLog(log: Omit<GroomingLog, 'id' | 'created_at'>): Promise<number> {
    return await db.grooming_logs.add({
      ...log,
      created_at: new Date()
    });
  }

  static async getAllLogs(): Promise<GroomingLog[]> {
    return await db.grooming_logs.orderBy('date').reverse().toArray();
  }

  static async deleteLog(id: number): Promise<void> {
    await db.grooming_logs.delete(id);
  }
}

export class FearLogService {
  static async addLog(log: Omit<FearLog, 'id' | 'created_at'>): Promise<number> {
    return await db.fear_logs.add({
      ...log,
      created_at: new Date()
    });
  }

  static async getAllLogs(): Promise<FearLog[]> {
    return await db.fear_logs.orderBy('date').reverse().toArray();
  }

  static async deleteLog(id: number): Promise<void> {
    await db.fear_logs.delete(id);
  }
}