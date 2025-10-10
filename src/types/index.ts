// Core data types for the Puppy Tracker app

export interface PuppyProfile {
  id: string;
  name: string;
  breed: string; // "Bernedoodle"
  birthDate: Date;
  arrivalDate: Date; // When puppy comes home (8 weeks)
  gender: 'male' | 'female';
  color: string;
  currentWeight?: number;
  expectedAdultWeight?: number;
  microchipId?: string;
  photo?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'physical' | 'training' | 'social' | 'health' | 'cat-integration';
  targetWeek: number; // Weeks of age
  completed: boolean;
  completedDate?: Date;
  notes?: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface TrainingSession {
  id: string;
  date: Date;
  type: 'potty' | 'commands' | 'socialization' | 'leash' | 'crate' | 'cat-introduction';
  command?: string; // For command training
  success: boolean;
  duration: number; // minutes
  notes: string;
  location: string;
  treats?: number;
}

export interface PottyRecord {
  id: string;
  date: Date;
  type: 'pee' | 'poop' | 'accident';
  location: 'outside' | 'inside' | 'crate' | 'designated-spot';
  success: boolean;
  notes?: string;
}

export interface HealthRecord {
  id: string;
  date: Date;
  type: 'vet-visit' | 'vaccination' | 'medication' | 'weight-check' | 'grooming' | 'observation';
  title: string;
  description: string;
  weight?: number;
  temperature?: number;
  vetName?: string;
  nextAppointment?: Date;
  cost?: number;
  photos?: string[];
}

export interface MealRecord {
  id: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'treat' | 'training-treat';
  foodBrand: string;
  amount: number; // cups or grams
  finished: boolean;
  notes?: string;
  treatCount?: number;
}

export interface ExerciseSession {
  id: string;
  date: Date;
  type: 'walk' | 'play' | 'training' | 'free-play' | 'mental-stimulation';
  duration: number; // minutes
  intensity: 'low' | 'medium' | 'high';
  location: string;
  notes?: string;
  companions?: string[]; // Other dogs, people, etc.
}

export interface CatInteraction {
  id: string;
  date: Date;
  type: 'visual' | 'scent-introduction' | 'supervised-meeting' | 'free-interaction' | 'incident';
  duration: number; // minutes
  catReaction: 'calm' | 'curious' | 'nervous' | 'aggressive' | 'hiding' | 'playful';
  puppyReaction: 'calm' | 'excited' | 'gentle' | 'overwhelming' | 'fearful' | 'playful';
  supervised: boolean;
  success: boolean;
  notes: string;
  nextSteps?: string;
}

export interface SafetyChecklist {
  id: string;
  category: 'home-prep' | 'cat-safety' | 'puppy-proofing' | 'integration';
  items: SafetyItem[];
  completedDate?: Date;
}

export interface SafetyItem {
  id: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  date: Date;
  type: 'milestone' | 'training' | 'health' | 'meal' | 'exercise' | 'cat-interaction' | 'photo';
  title: string;
  description: string;
  category: string;
  importance: 'low' | 'medium' | 'high';
  relatedId?: string; // Reference to specific record
  photo?: string;
}

// Predefined milestones for 8-week-old puppies
export const DEFAULT_MILESTONES: Omit<Milestone, 'id' | 'completed' | 'completedDate'>[] = [
  {
    title: "First Night Home",
    description: "Puppy's first night in their new home. Expect some crying and restlessness.",
    category: "social",
    targetWeek: 8,
    importance: "critical",
  },
  {
    title: "First Vet Visit",
    description: "Initial health check and vaccination schedule setup.",
    category: "health",
    targetWeek: 8,
    importance: "critical",
  },
  {
    title: "Cat Visual Introduction",
    description: "Allow cat and puppy to see each other from a safe distance.",
    category: "cat-integration",
    targetWeek: 8,
    importance: "high",
  },
  {
    title: "House Training Begins",
    description: "Start consistent potty training routine and crate training.",
    category: "training",
    targetWeek: 8,
    importance: "critical",
  },
  {
    title: "Basic Commands",
    description: "Start teaching sit, stay, and come commands.",
    category: "training",
    targetWeek: 9,
    importance: "high",
  },
  {
    title: "Leash Introduction",
    description: "Introduce collar and leash indoors before outdoor walks.",
    category: "training",
    targetWeek: 10,
    importance: "medium",
  },
  {
    title: "First Outdoor Walk",
    description: "First supervised walk outside after vaccinations are current.",
    category: "physical",
    targetWeek: 12,
    importance: "high",
  },
  {
    title: "Cat Scent Introduction",
    description: "Allow puppy to explore cat's scent through bedding/toys.",
    category: "cat-integration",
    targetWeek: 9,
    importance: "high",
  },
  {
    title: "Supervised Cat Meeting",
    description: "First controlled meeting between cat and puppy with barriers.",
    category: "cat-integration",
    targetWeek: 10,
    importance: "high",
  },
  {
    title: "Independent Play Time",
    description: "Cat and puppy can be in same room with supervision.",
    category: "cat-integration",
    targetWeek: 14,
    importance: "medium",
  }
];

// Helper functions
export const calculatePuppyAgeInWeeks = (birthDate: Date, currentDate: Date = new Date()): number => {
  const diffTime = Math.abs(currentDate.getTime() - birthDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
};

export const getAgeAppropriateWeight = (ageInWeeks: number, expectedAdultWeight: number): number => {
  // Bernedoodles typically reach 50% adult weight by 4-5 months, 75% by 6 months
  if (ageInWeeks < 12) return expectedAdultWeight * 0.2; // 20% at 3 months
  if (ageInWeeks < 16) return expectedAdultWeight * 0.4; // 40% at 4 months
  if (ageInWeeks < 20) return expectedAdultWeight * 0.5; // 50% at 5 months
  if (ageInWeeks < 24) return expectedAdultWeight * 0.65; // 65% at 6 months
  if (ageInWeeks < 32) return expectedAdultWeight * 0.8; // 80% at 8 months
  return expectedAdultWeight * 0.9; // 90% at adult
};