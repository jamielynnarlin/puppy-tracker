import { 
  PuppyProfile, 
  Milestone, 
  TrainingSession, 
  PottyRecord, 
  HealthRecord, 
  MealRecord, 
  ExerciseSession, 
  CatInteraction,
  TimelineEvent,
  SafetyChecklist,
  SafetyItem,
  DEFAULT_MILESTONES
} from '../types';

// Re-export types for easier importing
export type {
  PuppyProfile,
  Milestone,
  TrainingSession,
  PottyRecord,
  HealthRecord,
  MealRecord,
  ExerciseSession,
  CatInteraction,
  TimelineEvent,
  SafetyChecklist,
  SafetyItem
};

// Storage keys for localStorage
const STORAGE_KEYS = {
  PUPPY_PROFILE: 'puppy_profile',
  MILESTONES: 'milestones',
  TRAINING_SESSIONS: 'training_sessions',
  POTTY_RECORDS: 'potty_records',
  HEALTH_RECORDS: 'health_records',
  MEAL_RECORDS: 'meal_records',
  EXERCISE_SESSIONS: 'exercise_sessions',
  CAT_INTERACTIONS: 'cat_interactions',
  TIMELINE_EVENTS: 'timeline_events'
};

// Generic localStorage functions
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// Puppy Profile Management
export const savePuppyProfile = (profile: PuppyProfile): void => {
  saveToStorage(STORAGE_KEYS.PUPPY_PROFILE, profile);
};

export const loadPuppyProfile = (): PuppyProfile | null => {
  return loadFromStorage<PuppyProfile | null>(STORAGE_KEYS.PUPPY_PROFILE, null);
};

// Milestone Management
export const initializeMilestones = (puppyBirthDate: Date): Milestone[] => {
  return DEFAULT_MILESTONES.map((milestone, index) => ({
    ...milestone,
    id: `milestone_${index + 1}`,
    completed: false
  }));
};

export const saveMilestones = (milestones: Milestone[]): void => {
  saveToStorage(STORAGE_KEYS.MILESTONES, milestones);
};

export const loadMilestones = (): Milestone[] => {
  return loadFromStorage<Milestone[]>(STORAGE_KEYS.MILESTONES, []);
};

// Training Session Management
export const saveTrainingSession = (session: TrainingSession): void => {
  const sessions = loadFromStorage<TrainingSession[]>(STORAGE_KEYS.TRAINING_SESSIONS, []);
  sessions.push(session);
  saveToStorage(STORAGE_KEYS.TRAINING_SESSIONS, sessions);
};

export const loadTrainingSessions = (): TrainingSession[] => {
  return loadFromStorage<TrainingSession[]>(STORAGE_KEYS.TRAINING_SESSIONS, []);
};

// Potty Record Management
export const savePottyRecord = (record: PottyRecord): void => {
  const records = loadFromStorage<PottyRecord[]>(STORAGE_KEYS.POTTY_RECORDS, []);
  records.push(record);
  saveToStorage(STORAGE_KEYS.POTTY_RECORDS, records);
};

export const loadPottyRecords = (): PottyRecord[] => {
  return loadFromStorage<PottyRecord[]>(STORAGE_KEYS.POTTY_RECORDS, []);
};

// Health Record Management
export const saveHealthRecord = (record: HealthRecord): void => {
  const records = loadFromStorage<HealthRecord[]>(STORAGE_KEYS.HEALTH_RECORDS, []);
  records.push(record);
  saveToStorage(STORAGE_KEYS.HEALTH_RECORDS, records);
};

export const loadHealthRecords = (): HealthRecord[] => {
  return loadFromStorage<HealthRecord[]>(STORAGE_KEYS.HEALTH_RECORDS, []);
};

// Meal Record Management
export const saveMealRecord = (record: MealRecord): void => {
  const records = loadFromStorage<MealRecord[]>(STORAGE_KEYS.MEAL_RECORDS, []);
  records.push(record);
  saveToStorage(STORAGE_KEYS.MEAL_RECORDS, records);
};

export const loadMealRecords = (): MealRecord[] => {
  return loadFromStorage<MealRecord[]>(STORAGE_KEYS.MEAL_RECORDS, []);
};

// Exercise Session Management
export const saveExerciseSession = (session: ExerciseSession): void => {
  const sessions = loadFromStorage<ExerciseSession[]>(STORAGE_KEYS.EXERCISE_SESSIONS, []);
  sessions.push(session);
  saveToStorage(STORAGE_KEYS.EXERCISE_SESSIONS, sessions);
};

export const loadExerciseSessions = (): ExerciseSession[] => {
  return loadFromStorage<ExerciseSession[]>(STORAGE_KEYS.EXERCISE_SESSIONS, []);
};

// Cat Interaction Management
export const saveCatInteraction = (interaction: CatInteraction): void => {
  const interactions = loadFromStorage<CatInteraction[]>(STORAGE_KEYS.CAT_INTERACTIONS, []);
  interactions.push(interaction);
  saveToStorage(STORAGE_KEYS.CAT_INTERACTIONS, interactions);
};

export const loadCatInteractions = (): CatInteraction[] => {
  return loadFromStorage<CatInteraction[]>(STORAGE_KEYS.CAT_INTERACTIONS, []);
};

// Timeline Event Management
export const saveTimelineEvent = (event: TimelineEvent): void => {
  const events = loadFromStorage<TimelineEvent[]>(STORAGE_KEYS.TIMELINE_EVENTS, []);
  events.push(event);
  saveToStorage(STORAGE_KEYS.TIMELINE_EVENTS, events);
};

export const loadTimelineEvents = (): TimelineEvent[] => {
  return loadFromStorage<TimelineEvent[]>(STORAGE_KEYS.TIMELINE_EVENTS, []);
};

// Helper functions for data analysis
export const getPottySuccessRate = (records: PottyRecord[], days: number = 7): number => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentRecords = records.filter(record => 
    new Date(record.date) >= cutoffDate && record.type !== 'accident'
  );
  
  if (recentRecords.length === 0) return 0;
  
  const successes = recentRecords.filter(record => record.success).length;
  return (successes / recentRecords.length) * 100;
};

export const getTrainingProgress = (sessions: TrainingSession[], type: string): number => {
  const typeSessions = sessions.filter(session => session.type === type);
  if (typeSessions.length === 0) return 0;
  
  const successes = typeSessions.filter(session => session.success).length;
  return (successes / typeSessions.length) * 100;
};

export const getCatIntegrationStage = (interactions: CatInteraction[]): string => {
  if (interactions.length === 0) return 'Not Started';
  
  const recent = interactions.slice(-3); // Last 3 interactions
  const allPositive = recent.every(interaction => 
    interaction.success && 
    ['calm', 'curious', 'playful'].includes(interaction.catReaction) &&
    ['calm', 'gentle', 'playful'].includes(interaction.puppyReaction)
  );
  
  if (allPositive && recent.some(i => i.type === 'free-interaction')) {
    return 'Integrated';
  } else if (allPositive) {
    return 'Progressing Well';
  } else if (recent.some(i => i.success)) {
    return 'Making Progress';
  } else {
    return 'Needs Attention';
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};