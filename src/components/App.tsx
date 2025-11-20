import { useState, useEffect } from "react";
import { Home, Target, Trophy, Award, Camera, Calendar, Clock, Download, Bell, Trash2, Check, ChevronDown, ChevronRight, FileText, X, Upload, RefreshCw, Scale, Activity, Edit } from "lucide-react";
import UserAuth from "./UserAuth";
import { usePuppyDatabase } from "./database/usePuppyDatabase";
import { DataMigration } from "./database/migration";
import {
  commandsService,
  practiceLogsService,
  pottyLogsService,
  mealLogsService,
  napLogsService,
  milestonesService,
  appointmentsService,
  migrationService,
} from "./database/supabaseService";

interface PottyLog {
  id: number;
  type: 'pee' | 'poop' | 'both';
  time: string;
  location: 'inside' | 'outside';
  loggedBy: string;
  date: string;
  notes?: string;
}

interface MealLog {
  id: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  amount?: string;
  food?: string;
  loggedBy: string;
  date: string;
  notes?: string;
}

interface NapLog {
  id: number;
  startTime: string;
  endTime?: string;
  location: string;
  loggedBy: string;
  date: string;
  notes?: string;
}

interface PracticeLog {
  id: number;
  date: string;
  time: string;
  attempts?: number;
  successes?: number;
  distractions?: string;
  reliability?: number;
  notes?: string;
  loggedBy: string;
}

interface Command {
  id: number;
  name: string;
  practiced: boolean;
  lastPracticed?: string;
  practicedBy?: string;
  ageWeek?: number;
  pottyLogs?: PottyLog[];
  mealLogs?: MealLog[];
  napLogs?: NapLog[];
  practiceLogs?: PracticeLog[];
}

interface Milestone {
  id: number;
  title: string;
  completed: boolean;
  photo: string | null;
  completedDate?: string;
  completedBy?: string;
}

interface Appointment {
  id: number;
  title: string;
  type: 'vet' | 'grooming' | 'training' | 'vaccination' | 'other';
  date: string;
  time: string;
  location?: string;
  notes?: string;
  reminder?: boolean;
  completed: boolean;
  createdBy: string;
  recurring?: boolean;
  recurringType?: 'vaccination' | 'deworming' | 'flea-tick' | 'checkup' | 'grooming' | 'custom';
  nextDueDate?: string;
  documents?: string[]; // Array of base64 encoded documents
}

interface WeightEntry {
  id: number;
  date: string;
  weight: number;
  unit: 'lbs' | 'kg';
  weekNumber: number;
  loggedBy: string;
  notes?: string;
}

interface ToothLog {
  id: number;
  toothType: string;
  dateNoticed: string;
  notes?: string;
  loggedBy: string;
}

interface GroomingLog {
  id: number;
  activity: 'brushing' | 'nail-trim' | 'ear-cleaning' | 'bath' | 'paw-handling' | 'mouth-touching' | 'other';
  date: string;
  duration: string;
  tolerance: number; // 1-10 scale
  notes?: string;
  loggedBy: string;
}

interface FearLog {
  id: number;
  trigger: string;
  date: string;
  intensity: 'mild' | 'moderate' | 'severe';
  response: string;
  duration?: string;
  notes?: string;
  loggedBy: string;
}

export default function App() {
  // FORCE NULL USER TO SHOW LOGIN SCREEN
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Debug log
  console.log("Current user state:", currentUser);
  
  // Initialize state with empty arrays - will be loaded from Supabase
  const [commands, setCommands] = useState<Command[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [customCommand, setCustomCommand] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Potty training states
  const [showPottyModal, setShowPottyModal] = useState(false);
  const [pottyType, setPottyType] = useState<'pee' | 'poop' | 'both'>('pee');
  const [pottyLocation, setPottyLocation] = useState<'inside' | 'outside'>('outside');
  const [pottyTime, setPottyTime] = useState('');
  const [pottyNotes, setPottyNotes] = useState('');

  // Meal log states
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [mealTime, setMealTime] = useState('');
  const [mealAmount, setMealAmount] = useState('');
  const [mealFood, setMealFood] = useState('');
  const [mealNotes, setMealNotes] = useState('');

  // Nap log states
  const [showNapModal, setShowNapModal] = useState(false);
  const [napStartTime, setNapStartTime] = useState('');
  const [napEndTime, setNapEndTime] = useState('');
  const [napLocation, setNapLocation] = useState('');
  const [napNotes, setNapNotes] = useState('');

  // Practice log states
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [selectedCommandId, setSelectedCommandId] = useState<number | null>(null);
  const [practiceAttempts, setPracticeAttempts] = useState('');
  const [practiceSuccesses, setPracticeSuccesses] = useState('');
  const [practiceDistractions, setPracticeDistractions] = useState('');
  const [practiceReliability, setPracticeReliability] = useState(5);
  const [practiceNotes, setPracticeNotes] = useState('');

  // Appointment modal states
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentTitle, setAppointmentTitle] = useState('');
  const [appointmentType, setAppointmentType] = useState<'vet' | 'grooming' | 'training' | 'vaccination' | 'other'>('vet');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentLocation, setAppointmentLocation] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointmentReminder, setAppointmentReminder] = useState(true);
  const [appointmentRecurring, setAppointmentRecurring] = useState(false);
  const [appointmentRecurringType, setAppointmentRecurringType] = useState<'vaccination' | 'deworming' | 'flea-tick' | 'checkup' | 'grooming' | 'custom'>('vaccination');
  const [appointmentDocuments, setAppointmentDocuments] = useState<string[]>([]);

  // Edit log states
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editingLogType, setEditingLogType] = useState<'potty' | 'practice' | 'nap' | null>(null);
  const [editingCommandId, setEditingCommandId] = useState<number | null>(null);

  // Expanded commands state
  const [expandedCommands, setExpandedCommands] = useState<Set<number>>(new Set());

  const toggleCommandExpanded = (commandId: number) => {
    const newExpanded = new Set(expandedCommands);
    if (newExpanded.has(commandId)) {
      newExpanded.delete(commandId);
    } else {
      newExpanded.add(commandId);
    }
    setExpandedCommands(newExpanded);
  };

  // Potty Training Schedule
  const pottySchedule = [
    { time: "7:00 AM", activity: "Wake Up", action: 'Immediate trip outside. (Use your cue: "Go Potty!")', mandatory: true },
    { time: "7:15 AM", activity: "Breakfast & Water", action: "Feed him. Give a small window for water.", mandatory: false },
    { time: "7:30 AM", activity: "After Eating", action: "Immediate trip outside.", mandatory: true },
    { time: "7:30 - 8:30 AM", activity: "Supervised Play", action: "30-60 min of playtime (inside or out, weather permitting).", mandatory: false },
    { time: "8:30 AM", activity: "After Play", action: "Trip outside before nap.", mandatory: true },
    { time: "8:30 - 10:30 AM", activity: "Nap Time", action: "Crate him for a nap. (2 hours is ideal.)", mandatory: false },
    { time: "10:30 AM", activity: "Wake Up", action: "Immediate trip outside.", mandatory: true },
    { time: "10:30 - 11:00 AM", activity: "Supervised Activity", action: "Quick training or mellow play/chew time.", mandatory: false },
    { time: "11:00 AM", activity: "Time Check", action: "Trip outside (even if he went at 10:30 AM).", mandatory: true },
    { time: "11:00 AM", activity: "Lunch & Water", action: "Feed him.", mandatory: false },
    { time: "11:15 AM", activity: "After Eating", action: "Immediate trip outside.", mandatory: true },
    { time: "11:30 AM - 1:30 PM", activity: "Nap Time", action: "Crate him for a nap.", mandatory: false },
    { time: "1:30 PM", activity: "Wake Up", action: "Immediate trip outside.", mandatory: true },
    { time: "1:30 - 2:00 PM", activity: "Supervised Activity", action: "Play or train.", mandatory: false },
    { time: "2:00 PM", activity: "Time Check", action: "Trip outside.", mandatory: true },
    { time: "2:00 - 4:00 PM", activity: "Nap Time", action: "Crate him for a nap.", mandatory: false },
    { time: "4:00 PM", activity: "Wake Up", action: "Immediate trip outside.", mandatory: true },
    { time: "4:00 - 5:00 PM", activity: "Supervised Play", action: "Time for high-energy play.", mandatory: false },
    { time: "5:00 PM", activity: "Time Check", action: "Trip outside.", mandatory: true },
    { time: "5:00 PM", activity: "Dinner & Water", action: "Feed him. Limit water after this time.", mandatory: false },
    { time: "5:15 PM", activity: "After Eating", action: "Immediate trip outside.", mandatory: true },
    { time: "5:30 - 7:30 PM", activity: "Quiet Time/Nap", action: "Mellow play, chewing, or a nap.", mandatory: false },
    { time: "7:30 PM", activity: "Wake Up/Time Check", action: "Trip outside.", mandatory: true },
    { time: "7:30 - 9:00 PM", activity: "Family Time/Mellow Play", action: "Snuggle, chew, or short training session.", mandatory: false },
    { time: "9:00 PM", activity: "Time Check", action: "Trip outside.", mandatory: true },
    { time: "10:45 PM", activity: "Last Call", action: "Final trip outside. Go potty, then immediately into the crate.", mandatory: true },
    { time: "11:00 PM", activity: "Bedtime", action: "Puppy is in the crate.", mandatory: false },
    { time: "2:00 AM", activity: "Mid-Night Break", action: "Alarm! Take him out, minimal interaction, back into the crate.", mandatory: true },
    { time: "5:00 AM", activity: "Early Morning Break", action: "Trip outside. If he's awake, you start the 7:00 AM routine early.", mandatory: true }
  ];

  // Expanded milestones state
  const [expandedMilestones, setExpandedMilestones] = useState<Set<number>>(new Set());

  const toggleMilestoneExpanded = (milestoneId: number) => {
    const newExpanded = new Set(expandedMilestones);
    if (newExpanded.has(milestoneId)) {
      newExpanded.delete(milestoneId);
    } else {
      newExpanded.add(milestoneId);
    }
    setExpandedMilestones(newExpanded);
  };

  // Navigate to specific week in Commands tab
  const navigateToWeek = (week: number) => {
    setActiveTab('commands');
    // Map weeks to their section IDs
    let targetWeek = week;
    if (week === 10) targetWeek = 8;  // Week 10 is in the 8-10 section
    if (week === 16) targetWeek = 12; // Week 16 is in the 12-16 section
    if (week === 52) targetWeek = 26; // Week 52 is in the 26-52 section
    
    // Wait for tab to render, then scroll to the week section
    setTimeout(() => {
      const element = document.getElementById(`week-${targetWeek}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Initialize database hook
  const {
    weightEntries,
    toothLogs,
    groomingLogs,
    fearLogs,
    addWeightEntry: saveWeightEntry,
    deleteWeightEntry: removeWeightEntry,
    addToothLog: saveToothLog,
    deleteToothLog: removeToothLog,
    addGroomingLog: saveGroomingLog,
    deleteGroomingLog: removeGroomingLog,
    addFearLog: saveFearLog,
    deleteFearLog: removeFearLog,
    isLoading: dbLoading,
    error: dbError
  } = usePuppyDatabase();

  // Physical Development modal states
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightValue, setWeightValue] = useState('');
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [weightWeek, setWeightWeek] = useState('');
  const [weightNotes, setWeightNotes] = useState('');

  const [showToothModal, setShowToothModal] = useState(false);
  const [toothType, setToothType] = useState('');
  const [toothDate, setToothDate] = useState('');
  const [toothNotes, setToothNotes] = useState('');

  const [showGroomingModal, setShowGroomingModal] = useState(false);
  const [groomingActivity, setGroomingActivity] = useState<'brushing' | 'nail-trim' | 'ear-cleaning' | 'bath' | 'paw-handling' | 'mouth-touching' | 'other'>('brushing');
  const [groomingDate, setGroomingDate] = useState('');
  const [groomingDuration, setGroomingDuration] = useState('');
  const [groomingTolerance, setGroomingTolerance] = useState(5);
  const [groomingNotes, setGroomingNotes] = useState('');

  const [showFearModal, setShowFearModal] = useState(false);
  const [fearTrigger, setFearTrigger] = useState('');
  const [fearDate, setFearDate] = useState('');
  const [fearIntensity, setFearIntensity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [fearResponse, setFearResponse] = useState('');
  const [fearDuration, setFearDuration] = useState('');
  const [fearNotes, setFearNotes] = useState('');

  // Load user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  // Load data from Supabase on mount
  useEffect(() => {
    loadDataFromSupabase();
  }, []);

  async function loadDataFromSupabase() {
    try {
      setIsLoadingData(true);
      console.log('🔄 Loading data from Supabase...');

      // Migrate localStorage data if needed (first time only)
      if (!migrationService.isMigrated()) {
        console.log('📦 Migrating data from localStorage...');
        await migrationService.migrateFromLocalStorage();
      }

      // Load all data
      const [commandsData, milestonesData, appointmentsData] = await Promise.all([
        commandsService.getAll(),
        milestonesService.getAll(),
        appointmentsService.getAll(),
      ]);

      // Transform and load commands with their logs
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
            practiceLogs: practiceLogs.map((log: any) => ({
              id: log.id,
              date: log.date,
              time: log.time,
              attempts: log.attempts,
              distractions: log.distractions,
              reliability: log.reliability,
              notes: log.notes,
              loggedBy: log.logged_by,
            })),
            pottyLogs: pottyLogs.map((log: any) => ({
              id: log.id,
              type: log.type,
              time: log.time,
              location: log.location,
              loggedBy: log.logged_by,
              date: log.date,
              notes: log.notes,
            })),
            mealLogs: mealLogs.map((log: any) => ({
              id: log.id,
              mealType: log.meal_type,
              time: log.time,
              amount: log.amount,
              food: log.food,
              loggedBy: log.logged_by,
              date: log.date,
              notes: log.notes,
            })),
            napLogs: napLogs.map((log: any) => ({
              id: log.id,
              startTime: log.start_time,
              endTime: log.end_time,
              location: log.location,
              loggedBy: log.logged_by,
              date: log.date,
              notes: log.notes,
            })),
          };
        })
      );

      const transformedMilestones = milestonesData.map((ms: any) => ({
        id: ms.id,
        title: ms.title,
        description: ms.description,
        completed: ms.completed,
        completedDate: ms.completed_date,
        photo: ms.photo_url,
        notes: ms.notes,
      }));

      const transformedAppointments = appointmentsData.map((apt: any) => ({
        id: apt.id,
        title: apt.title,
        type: 'other' as const,
        date: apt.date,
        time: apt.time || '',
        location: apt.location,
        notes: apt.notes,
        reminder: apt.reminder_enabled,
        completed: apt.completed,
        createdBy: 'system',
      }));

      setCommands(transformedCommands);
      setMilestones(transformedMilestones);
      setAppointments(transformedAppointments);

      console.log('✅ Data loaded from Supabase successfully!');
    } catch (error) {
      console.error('❌ Error loading from Supabase:', error);
    } finally {
      setIsLoadingData(false);
    }
  }

  // Note: Data is now saved to Supabase in real-time via individual functions
  // No more localStorage syncing needed!

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem("currentUser", username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const practiceCommand = (id: number) => {
    const today = new Date().toLocaleDateString();
    setCommands(commands.map(cmd => 
      cmd.id === id ? { ...cmd, practiced: true, lastPracticed: today, practicedBy: currentUser || undefined } : cmd
    ));
  };

  const addCustomCommand = () => {
    if (customCommand.trim()) {
      const newCommand: Command = {
        id: Date.now(),
        name: customCommand.trim(),
        practiced: false
      };
      setCommands([...commands, newCommand]);
      setCustomCommand("");
    }
  };

  const completeMilestone = (id: number) => {
    const today = new Date().toLocaleDateString();
    setMilestones(milestones.map(milestone => 
      milestone.id === id ? { ...milestone, completed: true, completedDate: today, completedBy: currentUser || undefined } : milestone
    ));
  };

  const addMilestonePhoto = (id: number, photoUrl: string) => {
    setMilestones(milestones.map(milestone => 
      milestone.id === id ? { ...milestone, photo: photoUrl } : milestone
    ));
  };

  const logPottyBreak = async () => {
    if (!currentUser) return;
    
    const now = new Date();
    const newLog: PottyLog = {
      id: Date.now(),
      type: pottyType,
      time: pottyTime || now.toLocaleTimeString(),
      location: pottyLocation,
      loggedBy: currentUser,
      date: now.toLocaleDateString(),
      notes: pottyNotes || undefined
    };
    
    try {
      // Save to Supabase
      await pottyLogsService.create({
        command_id: 1, // Potty Training command ID
        type: pottyType,
        time: newLog.time,
        location: pottyLocation,
        logged_by: currentUser,
        date: newLog.date,
        notes: pottyNotes || undefined,
      });
      
      // Update local state
      setCommands(commands.map(cmd => 
        cmd.id === 1 // Potty Training command ID
          ? { ...cmd, pottyLogs: [...(cmd.pottyLogs || []), newLog] }
          : cmd
      ));
      
      console.log('✅ Potty log saved to Supabase');
    } catch (error) {
      console.error('❌ Error saving potty log:', error);
      alert('Failed to save potty log. Please try again.');
      return;
    }
    
    // Reset form
    setShowPottyModal(false);
    setPottyType('pee');
    setPottyLocation('outside');
    setPottyTime('');
    setPottyNotes('');
  };

  const deletePottyLog = async (logId: number) => {
    if (window.confirm('Are you sure you want to delete this potty log?')) {
      try {
        await pottyLogsService.delete(logId);
        setCommands(commands.map(cmd => 
          cmd.id === 1 // Potty Training command ID
            ? { ...cmd, pottyLogs: cmd.pottyLogs?.filter(log => log.id !== logId) || [] }
            : cmd
        ));
        console.log('✅ Potty log deleted from Supabase');
      } catch (error) {
        console.error('❌ Error deleting potty log:', error);
        alert('Failed to delete potty log. Please try again.');
      }
    }
  };

  const startEditPottyLog = (commandId: number, logId: number) => {
    const command = commands.find(cmd => cmd.id === commandId);
    const log = command?.pottyLogs?.find(l => l.id === logId);
    if (log) {
      setPottyType(log.type);
      setPottyLocation(log.location);
      setPottyTime(log.time);
      setPottyNotes(log.notes || '');
      setEditingLogId(logId);
      setEditingLogType('potty');
      setEditingCommandId(commandId);
      setShowPottyModal(true);
    }
  };

  const updatePottyLog = async () => {
    if (!currentUser || editingLogId === null || editingCommandId === null) return;
    
    try {
      await pottyLogsService.update(editingLogId, {
        type: pottyType,
        location: pottyLocation,
        time: pottyTime,
        notes: pottyNotes || undefined,
      });
      
      setCommands(commands.map(cmd => 
        cmd.id === editingCommandId
          ? {
              ...cmd,
              pottyLogs: cmd.pottyLogs?.map(log =>
                log.id === editingLogId
                  ? { ...log, type: pottyType, location: pottyLocation, time: pottyTime, notes: pottyNotes || undefined }
                  : log
              )
            }
        : cmd
      ));
      
      console.log('✅ Potty log updated in Supabase');
    } catch (error) {
      console.error('❌ Error updating potty log:', error);
      alert('Failed to update potty log. Please try again.');
      return;
    }
    
    // Reset form
    setShowPottyModal(false);
    setPottyType('pee');
    setPottyLocation('outside');
    setPottyTime('');
    setPottyNotes('');
    setEditingLogId(null);
    setEditingLogType(null);
    setEditingCommandId(null);
  };

  const downloadPottyLog = () => {
    const pottyCommand = commands.find(cmd => cmd.id === 1);
    if (!pottyCommand || !pottyCommand.pottyLogs || pottyCommand.pottyLogs.length === 0) {
      alert('No potty logs to download!');
      return;
    }
    
    // Create CSV content
    let csvContent = "Date,Time,Type,Location,Logged By\n";
    pottyCommand.pottyLogs.forEach(log => {
      csvContent += `${log.date},${log.time},${log.type},${log.location},${log.loggedBy}\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `potty-training-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const logMeal = async () => {
    if (!currentUser) return;
    
    const now = new Date();
    const newLog: MealLog = {
      id: Date.now(),
      mealType: mealType,
      time: mealTime || now.toLocaleTimeString(),
      amount: mealAmount || undefined,
      food: mealFood || undefined,
      loggedBy: currentUser,
      date: now.toLocaleDateString(),
      notes: mealNotes || undefined
    };
    
    try {
      await mealLogsService.create({
        command_id: 1,
        meal_type: mealType,
        time: newLog.time,
        amount: mealAmount || undefined,
        food: mealFood || undefined,
        logged_by: currentUser,
        date: newLog.date,
        notes: mealNotes || undefined,
      });
      
      setCommands(commands.map(cmd => 
        cmd.id === 1
          ? { ...cmd, mealLogs: [...(cmd.mealLogs || []), newLog] }
          : cmd
      ));
      
      console.log('✅ Meal log saved to Supabase');
    } catch (error) {
      console.error('❌ Error saving meal log:', error);
      alert('Failed to save meal log. Please try again.');
      return;
    }
    
    // Reset form
    setShowMealModal(false);
    setMealType('breakfast');
    setMealTime('');
    setMealAmount('');
    setMealFood('');
    setMealNotes('');
  };

  const deleteMealLog = async (logId: number) => {
    if (window.confirm('Are you sure you want to delete this meal log?')) {
      try {
        await mealLogsService.delete(logId);
        setCommands(commands.map(cmd => 
          cmd.id === 1
            ? { ...cmd, mealLogs: cmd.mealLogs?.filter(log => log.id !== logId) || [] }
            : cmd
        ));
        console.log('✅ Meal log deleted from Supabase');
      } catch (error) {
        console.error('❌ Error deleting meal log:', error);
        alert('Failed to delete meal log. Please try again.');
      }
    }
  };

  const startEditMealLog = (commandId: number, logId: number) => {
    const command = commands.find(cmd => cmd.id === commandId);
    const log = command?.mealLogs?.find(l => l.id === logId);
    if (log) {
      setMealType(log.mealType);
      setMealTime(log.time);
      setMealAmount(log.amount || '');
      setMealFood(log.food || '');
      setMealNotes(log.notes || '');
      setEditingLogId(logId);
      setEditingLogType('potty'); // Reusing the editing state
      setEditingCommandId(commandId);
      setShowMealModal(true);
    }
  };

  const updateMealLog = () => {
    if (!currentUser || editingLogId === null || editingCommandId === null) return;
    
    setCommands(commands.map(cmd => 
      cmd.id === editingCommandId
        ? {
            ...cmd,
            mealLogs: cmd.mealLogs?.map(log =>
              log.id === editingLogId
                ? { 
                    ...log, 
                    mealType: mealType, 
                    time: mealTime,
                    amount: mealAmount || undefined,
                    food: mealFood || undefined,
                    notes: mealNotes || undefined 
                  }
                : log
            )
          }
        : cmd
    ));
    
    // Reset form
    setShowMealModal(false);
    setMealType('breakfast');
    setMealTime('');
    setMealAmount('');
    setMealFood('');
    setMealNotes('');
    setEditingLogId(null);
    setEditingLogType(null);
    setEditingCommandId(null);
  };

  const logNap = async () => {
    if (!currentUser) return;
    
    const now = new Date();
    const newLog: NapLog = {
      id: Date.now(),
      startTime: napStartTime || now.toLocaleTimeString(),
      endTime: napEndTime || undefined,
      location: napLocation,
      loggedBy: currentUser,
      date: now.toLocaleDateString(),
      notes: napNotes || undefined
    };
    
    try {
      await napLogsService.create({
        command_id: 1,
        start_time: newLog.startTime,
        end_time: napEndTime || undefined,
        location: napLocation,
        logged_by: currentUser,
        date: newLog.date,
        notes: napNotes || undefined,
      });
      
      setCommands(commands.map(cmd => 
        cmd.id === 1
          ? { ...cmd, napLogs: [...(cmd.napLogs || []), newLog] }
          : cmd
      ));
      
      console.log('✅ Nap log saved to Supabase');
    } catch (error) {
      console.error('❌ Error saving nap log:', error);
      alert('Failed to save nap log. Please try again.');
      return;
    }
    
    // Reset form
    setShowNapModal(false);
    setNapStartTime('');
    setNapEndTime('');
    setNapLocation('');
    setNapNotes('');
  };

  const deleteNapLog = (logId: number) => {
    if (window.confirm('Are you sure you want to delete this nap log?')) {
      setCommands(commands.map(cmd => 
        cmd.id === 1 // Potty Training command ID
          ? { ...cmd, napLogs: cmd.napLogs?.filter(log => log.id !== logId) || [] }
          : cmd
      ));
    }
  };

  const startEditNapLog = (commandId: number, logId: number) => {
    const command = commands.find(cmd => cmd.id === commandId);
    const log = command?.napLogs?.find(l => l.id === logId);
    if (log) {
      setNapStartTime(log.startTime);
      setNapEndTime(log.endTime || '');
      setNapLocation(log.location);
      setNapNotes(log.notes || '');
      setEditingLogId(logId);
      setEditingLogType('nap');
      setEditingCommandId(commandId);
      setShowNapModal(true);
    }
  };

  const updateNapLog = () => {
    if (!currentUser || editingLogId === null || editingCommandId === null) return;
    
    setCommands(commands.map(cmd => 
      cmd.id === editingCommandId
        ? {
            ...cmd,
            napLogs: cmd.napLogs?.map(log =>
              log.id === editingLogId
                ? { 
                    ...log, 
                    startTime: napStartTime, 
                    endTime: napEndTime || undefined,
                    location: napLocation,
                    notes: napNotes || undefined 
                  }
                : log
            )
          }
        : cmd
    ));
    
    // Reset form
    setShowNapModal(false);
    setNapStartTime('');
    setNapEndTime('');
    setNapLocation('');
    setNapNotes('');
    setEditingLogId(null);
    setEditingLogType(null);
    setEditingCommandId(null);
  };

  const openPracticeModal = (commandId: number) => {
    setSelectedCommandId(commandId);
    setShowPracticeModal(true);
  };

  const addPracticeLog = () => {
    if (!currentUser || selectedCommandId === null) return;
    
    const now = new Date();
    const newLog: PracticeLog = {
      id: Date.now(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      attempts: practiceAttempts ? parseInt(practiceAttempts) : undefined,
      successes: practiceSuccesses ? parseInt(practiceSuccesses) : undefined,
      distractions: practiceDistractions || undefined,
      reliability: practiceReliability,
      notes: practiceNotes || undefined,
      loggedBy: currentUser
    };
    
    setCommands(commands.map(cmd => 
      cmd.id === selectedCommandId
        ? { ...cmd, practiceLogs: [...(cmd.practiceLogs || []), newLog], practiced: true, lastPracticed: now.toLocaleDateString(), practicedBy: currentUser }
        : cmd
    ));
    
    // Reset form
    setShowPracticeModal(false);
    setSelectedCommandId(null);
    setPracticeAttempts('');
    setPracticeSuccesses('');
    setPracticeDistractions('');
    setPracticeReliability(5);
    setPracticeNotes('');
  };

  const deletePracticeLog = (commandId: number, logId: number) => {
    if (window.confirm('Are you sure you want to delete this practice log?')) {
      setCommands(commands.map(cmd => 
        cmd.id === commandId
          ? { ...cmd, practiceLogs: cmd.practiceLogs?.filter(log => log.id !== logId) || [] }
          : cmd
      ));
    }
  };

  const startEditPracticeLog = (commandId: number, logId: number) => {
    const command = commands.find(cmd => cmd.id === commandId);
    const log = command?.practiceLogs?.find(l => l.id === logId);
    if (log) {
      setPracticeAttempts(log.attempts?.toString() || '');
      setPracticeSuccesses(log.successes?.toString() || '');
      setPracticeDistractions(log.distractions || '');
      setPracticeReliability(log.reliability || 5);
      setPracticeNotes(log.notes || '');
      setEditingLogId(logId);
      setEditingLogType('practice');
      setEditingCommandId(commandId);
      setSelectedCommandId(commandId);
      setShowPracticeModal(true);
    }
  };

  const updatePracticeLog = () => {
    if (!currentUser || editingLogId === null || editingCommandId === null) return;
    
    setCommands(commands.map(cmd => 
      cmd.id === editingCommandId
        ? {
            ...cmd,
            practiceLogs: cmd.practiceLogs?.map(log =>
              log.id === editingLogId
                ? {
                    ...log,
                    attempts: practiceAttempts ? parseInt(practiceAttempts) : undefined,
                    successes: practiceSuccesses ? parseInt(practiceSuccesses) : undefined,
                    distractions: practiceDistractions || undefined,
                    reliability: practiceReliability,
                    notes: practiceNotes || undefined
                  }
                : log
            )
          }
        : cmd
    ));
    
    // Reset form
    setShowPracticeModal(false);
    setSelectedCommandId(null);
    setPracticeAttempts('');
    setPracticeSuccesses('');
    setPracticeDistractions('');
    setPracticeReliability(5);
    setPracticeNotes('');
    setEditingLogId(null);
    setEditingLogType(null);
    setEditingCommandId(null);
  };

  const downloadCommandLog = (commandId: number) => {
    const command = commands.find(cmd => cmd.id === commandId);
    if (!command || !command.practiceLogs || command.practiceLogs.length === 0) {
      alert('No practice logs to download!');
      return;
    }
    
    // Create CSV content
    let csvContent = "Date,Time,Attempts,Successes,Distractions,Reliability,Notes,Logged By\n";
    command.practiceLogs.forEach(log => {
      csvContent += `${log.date},${log.time},${log.attempts || ''},${log.successes || ''},${log.distractions || ''},${log.reliability},${log.notes || ''},${log.loggedBy}\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${command.name.toLowerCase().replace(/\s+/g, '-')}-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const calculateNextDueDate = (currentDate: string, recurringType: string): string => {
    const date = new Date(currentDate);
    
    switch (recurringType) {
      case 'vaccination':
        // Puppy vaccinations typically every 3-4 weeks
        date.setDate(date.getDate() + 21); // 3 weeks
        break;
      case 'deworming':
        // Deworming every 2 weeks for puppies, then monthly
        date.setDate(date.getDate() + 14); // 2 weeks
        break;
      case 'flea-tick':
        // Monthly flea and tick prevention
        date.setMonth(date.getMonth() + 1);
        break;
      case 'checkup':
        // Quarterly checkups for puppies
        date.setMonth(date.getMonth() + 3);
        break;
      case 'grooming':
        // Grooming every 6-8 weeks
        date.setDate(date.getDate() + 42); // 6 weeks
        break;
      default:
        // Custom - default to 1 month
        date.setMonth(date.getMonth() + 1);
        break;
    }
    
    return date.toISOString().split('T')[0];
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setAppointmentDocuments(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeDocument = (index: number) => {
    setAppointmentDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const addAppointment = () => {
    if (!currentUser || !appointmentTitle || !appointmentDate || !appointmentTime) {
      alert('Please fill in required fields (title, date, time)');
      return;
    }

    const nextDue = appointmentRecurring 
      ? calculateNextDueDate(appointmentDate, appointmentRecurringType)
      : undefined;

    const newAppointment: Appointment = {
      id: Date.now(),
      title: appointmentTitle,
      type: appointmentType,
      date: appointmentDate,
      time: appointmentTime,
      location: appointmentLocation || undefined,
      notes: appointmentNotes || undefined,
      reminder: appointmentReminder,
      completed: false,
      createdBy: currentUser,
      recurring: appointmentRecurring,
      recurringType: appointmentRecurring ? appointmentRecurringType : undefined,
      nextDueDate: nextDue,
      documents: appointmentDocuments.length > 0 ? appointmentDocuments : undefined
    };

    setAppointments([...appointments, newAppointment]);

    // Reset form
    setShowAppointmentModal(false);
    setAppointmentTitle('');
    setAppointmentType('vet');
    setAppointmentDate('');
    setAppointmentTime('');
    setAppointmentLocation('');
    setAppointmentNotes('');
    setAppointmentReminder(true);
    setAppointmentRecurring(false);
    setAppointmentRecurringType('vaccination');
    setAppointmentDocuments([]);
  };

  const toggleAppointmentComplete = (id: number) => {
    setAppointments(appointments.map(apt =>
      apt.id === id ? { ...apt, completed: !apt.completed } : apt
    ));
  };

  const deleteAppointment = (id: number) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setAppointments(appointments.filter(apt => apt.id !== id));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, milestoneId: number) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          addMilestonePhoto(milestoneId, e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Physical Development handlers
  const addWeightEntry = async () => {
    if (!currentUser || !weightValue || !weightWeek) {
      alert('Please fill in required fields (weight, week number)');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newEntry = {
      date: today,
      weight: parseFloat(weightValue),
      unit: weightUnit,
      weekNumber: parseInt(weightWeek),
      loggedBy: currentUser,
      notes: weightNotes || undefined
    };

    try {
      await saveWeightEntry(newEntry);
      setShowWeightModal(false);
      setWeightValue('');
      setWeightWeek('');
      setWeightNotes('');
    } catch (error) {
      console.error('Failed to add weight entry:', error);
      alert('Failed to save weight entry. Please try again.');
    }
  };

  const addToothLog = async () => {
    if (!currentUser || !toothType || !toothDate) {
      alert('Please fill in required fields (tooth type, date)');
      return;
    }

    const newLog = {
      toothType,
      dateNoticed: toothDate,
      notes: toothNotes || undefined,
      loggedBy: currentUser
    };

    try {
      await saveToothLog(newLog);
      setShowToothModal(false);
      setToothType('');
      setToothDate('');
      setToothNotes('');
    } catch (error) {
      console.error('Failed to add tooth log:', error);
      alert('Failed to save tooth log. Please try again.');
    }
  };

  const addGroomingLog = async () => {
    if (!currentUser || !groomingDate || !groomingDuration) {
      alert('Please fill in required fields (date, duration)');
      return;
    }

    const newLog = {
      activity: groomingActivity,
      date: groomingDate,
      duration: groomingDuration,
      tolerance: groomingTolerance,
      notes: groomingNotes || undefined,
      loggedBy: currentUser
    };

    try {
      await saveGroomingLog(newLog);
      setShowGroomingModal(false);
      setGroomingDate('');
      setGroomingDuration('');
      setGroomingTolerance(5);
      setGroomingNotes('');
    } catch (error) {
      console.error('Failed to add grooming log:', error);
      alert('Failed to save grooming log. Please try again.');
    }
  };

  const addFearLog = async () => {
    if (!currentUser || !fearTrigger || !fearDate || !fearResponse) {
      alert('Please fill in required fields (trigger, date, response)');
      return;
    }

    const newLog = {
      trigger: fearTrigger,
      date: fearDate,
      intensity: fearIntensity,
      response: fearResponse,
      duration: fearDuration || undefined,
      notes: fearNotes || undefined,
      loggedBy: currentUser
    };

    try {
      await saveFearLog(newLog);
      setShowFearModal(false);
      setFearTrigger('');
      setFearDate('');
      setFearResponse('');
      setFearDuration('');
      setFearNotes('');
    } catch (error) {
      console.error('Failed to add fear log:', error);
      alert('Failed to save fear log. Please try again.');
    }
  };

  const deleteWeightEntry = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this weight entry?')) {
      try {
        await removeWeightEntry(id);
      } catch (error) {
        console.error('Failed to delete weight entry:', error);
        alert('Failed to delete weight entry. Please try again.');
      }
    }
  };

  const deleteToothLog = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tooth log?')) {
      try {
        await removeToothLog(id);
      } catch (error) {
        console.error('Failed to delete tooth log:', error);
        alert('Failed to delete tooth log. Please try again.');
      }
    }
  };

  const deleteGroomingLog = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this grooming log?')) {
      try {
        await removeGroomingLog(id);
      } catch (error) {
        console.error('Failed to delete grooming log:', error);
        alert('Failed to delete grooming log. Please try again.');
      }
    }
  };

  const deleteFearLog = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this fear log?')) {
      try {
        await removeFearLog(id);
      } catch (error) {
        console.error('Failed to delete fear log:', error);
        alert('Failed to delete fear log. Please try again.');
      }
    }
  };

  const practiceCount = commands.filter(cmd => cmd.practiced).length;
  const completedMilestones = milestones.filter(m => m.completed).length;
  const recentPracticed = commands.filter(cmd => cmd.practiced).slice(-3);
  const recentCompleted = milestones.filter(m => m.completed).slice(-3);

  // Mock upcoming appointments
  const upcomingAppointments = [
    { id: 1, title: "Vet Checkup", date: "Oct 15, 2025", time: "2:00 PM" },
    { id: 2, title: "Training Session", date: "Oct 18, 2025", time: "10:00 AM" },
  ];

  // Training suggestions based on progress
  const trainingIdeas = [
    "Practice 'Stay' command for longer durations",
    "Work on leash walking without pulling", 
    "Introduce basic agility exercises",
    "Practice commands with distractions around",
  ];

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <UserAuth onLogin={handleLogin} currentUser={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Sidebar */}
      <div className="w-full md:w-64 bg-white shadow-sm md:border-r border-b md:border-b-0 border-gray-200 p-4 md:p-6">
        {/* Profile Picture */}
        <div className="mb-4 md:mb-6 flex justify-center">
          <div className="relative">
            <img 
              src="/images/puppy-profile.jpg" 
              alt="Puppy Profile"
              className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover border-2 md:border-4 border-blue-200 shadow-lg"
              onLoad={() => console.log('✅ Puppy image loaded successfully!')}
              onError={(e) => {
                console.error('❌ Failed to load puppy image from /images/puppy-profile.jpg');
                // Fallback to emoji if image fails to load
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-2 md:border-4 border-blue-200 shadow-lg flex items-center justify-center text-3xl md:text-5xl';
                fallback.textContent = '🐶';
                target.parentElement?.appendChild(fallback);
              }}
            />
          </div>
        </div>
        
        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 text-left rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "dashboard"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Home size={18} className="md:w-5 md:h-5" />
            <span className="font-medium text-sm md:text-base">Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab("commands")}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 text-left rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "commands"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Target size={18} className="md:w-5 md:h-5" />
            <span className="font-medium text-sm md:text-base">Commands</span>
          </button>
          
          <button
            onClick={() => setActiveTab("milestones")}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 text-left rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "milestones"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Trophy size={18} className="md:w-5 md:h-5" />
            <span className="font-medium text-sm md:text-base">Milestones</span>
          </button>
          
          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 text-left rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "appointments"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Calendar size={18} className="md:w-5 md:h-5" />
            <span className="font-medium text-sm md:text-base">Appointments</span>
          </button>
          
          <button
            onClick={() => setActiveTab("physical")}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 text-left rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "physical"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Activity size={18} className="md:w-5 md:h-5" />
            <span className="font-medium text-sm md:text-base">Physical</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        {activeTab === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold text-gray-800">Welcome back, {currentUser}!</h2>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm md:text-base font-medium"
              >
                Log Out
              </button>
            </div>
            
            {/* Growth Chart */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 mb-4 md:mb-8">
              <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">📈 Growth Timeline</h3>

              <div className="space-y-3 md:space-y-4">
                <button 
                  onClick={() => navigateToWeek(8)}
                  className="w-full p-3 md:p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-all cursor-pointer text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm md:text-lg">Week 8 - Adoption Day! 🏠</span>
                    <span className="text-xs md:text-sm bg-purple-200 px-2 md:px-3 py-1 rounded-full">Week 8</span>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Coming home</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">November 7th, 2025</p>
                </button>

                <button 
                  onClick={() => navigateToWeek(10)}
                  className="w-full p-3 md:p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm md:text-lg">Week 10 - First Vaccinations 💉</span>
                    <span className="text-xs md:text-sm bg-blue-200 px-2 md:px-3 py-1 rounded-full">Week 10</span>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Begin vaccination schedule</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">November 21st, 2025</p>
                </button>

                <button 
                  onClick={() => navigateToWeek(12)}
                  className="w-full p-3 md:p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all cursor-pointer text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm md:text-lg">Week 12 - Socialization Period 🐕</span>
                    <span className="text-xs md:text-sm bg-green-200 px-2 md:px-3 py-1 rounded-full">Week 12</span>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Critical socialization window</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">December 5th, 2025</p>
                </button>

                <button 
                  onClick={() => navigateToWeek(16)}
                  className="w-full p-3 md:p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg hover:bg-yellow-100 hover:border-yellow-300 transition-all cursor-pointer text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm md:text-lg">Week 16 - Basic Training 📚</span>
                    <span className="text-xs md:text-sm bg-yellow-200 px-2 md:px-3 py-1 rounded-full">Week 16</span>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Start formal training</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">January 2nd, 2026</p>
                </button>

                <button 
                  onClick={() => navigateToWeek(20)}
                  className="w-full p-3 md:p-4 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-all cursor-pointer text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm md:text-lg">Week 20 - Teething Phase 🦷</span>
                    <span className="text-xs md:text-sm bg-orange-200 px-2 md:px-3 py-1 rounded-full">Week 20</span>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Adult teeth coming in</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">January 30th, 2026</p>
                </button>

                <button 
                  onClick={() => navigateToWeek(26)}
                  className="w-full p-3 md:p-4 bg-pink-50 border-2 border-pink-200 rounded-lg hover:bg-pink-100 hover:border-pink-300 transition-all cursor-pointer text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm md:text-lg">Week 26 - 6 Month Milestone 🎉</span>
                    <span className="text-xs md:text-sm bg-pink-200 px-2 md:px-3 py-1 rounded-full">Week 26</span>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Rapid growth phase</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">March 13th, 2026</p>
                </button>

                <button 
                  onClick={() => navigateToWeek(52)}
                  className="w-full p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-all cursor-pointer text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Week 52 - One Year Old! 🎂</span>
                    <span className="text-sm bg-indigo-200 px-3 py-1 rounded-full">Week 52</span>
                  </div>
                  <p className="text-gray-600 mt-2">Approaching adulthood</p>
                  <p className="text-sm text-gray-500 mt-1">November 5th, 2026</p>
                </button>
              </div>
            </div>
            
            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-blue-500" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800">Commands Practiced</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">{practiceCount}</p>
                <p className="text-gray-600">out of {commands.length} commands</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="text-green-500" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800">Milestones</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{completedMilestones}</p>
                <p className="text-gray-600">out of {milestones.length} completed</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="text-purple-500" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800">Overall Progress</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round(((practiceCount + completedMilestones) / (commands.length + milestones.length)) * 100)}%
                </p>
                <p className="text-gray-600">training completion</p>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-orange-500" size={24} />
                  <h3 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h3>
                </div>
                <div className="space-y-3">
                  {upcomingAppointments.map(appointment => (
                    <div key={appointment.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Clock className="text-orange-500" size={16} />
                      <div>
                        <div className="font-medium text-gray-800">{appointment.title}</div>
                        <div className="text-sm text-gray-600">{appointment.date} at {appointment.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Training Ideas</h3>
                <div className="space-y-3">
                  {trainingIdeas.slice(0, 4).map((idea, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Target className="text-blue-500 mt-0.5" size={16} />
                      <span className="text-gray-700 text-sm">{idea}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentPracticed.map(cmd => (
                  <div key={cmd.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Target className="text-green-500" size={16} />
                    <span className="text-gray-700">Practiced command: <strong>{cmd.name}</strong></span>
                    {cmd.lastPracticed && (
                      <span className="text-gray-500 text-sm">({cmd.lastPracticed})</span>
                    )}
                  </div>
                ))}
                {recentCompleted.map(milestone => (
                  <div key={milestone.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Trophy className="text-blue-500" size={16} />
                    <span className="text-gray-700">Completed milestone: <strong>{milestone.title}</strong></span>
                    {milestone.completedDate && (
                      <span className="text-gray-500 text-sm">({milestone.completedDate})</span>
                    )}
                  </div>
                ))}
                {recentPracticed.length === 0 && recentCompleted.length === 0 && (
                  <div className="text-gray-500 text-center py-4">
                    No recent activity. Start by practicing a command or completing a milestone!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "commands" && (
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-8">Training Commands by Age</h2>
            
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">Add Custom Command</h3>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <input
                  type="text"
                  value={customCommand}
                  onChange={(e) => setCustomCommand(e.target.value)}
                  placeholder="Enter command name..."
                  className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomCommand()}
                />
                <button
                  onClick={addCustomCommand}
                  className="px-4 md:px-6 py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Add Command
                </button>
              </div>
            </div>

            {/* Week 8-10: Foundation Training */}
            <div id="week-8" className="mb-6 md:mb-8 scroll-mt-4">
              <div className="bg-purple-100 p-3 md:p-4 rounded-lg mb-3 md:mb-4">
                <h3 className="text-lg md:text-2xl font-bold text-purple-800">Week 8-10: Foundation Training 🐾</h3>
                <p className="text-sm md:text-base text-purple-700 mt-1">Building blocks for a well-behaved puppy</p>
              </div>
              <div className="space-y-2">
                {commands.filter(cmd => cmd.ageWeek === 8).map((command) => {
                  const isExpanded = expandedCommands.has(command.id);
                  const logCount = command.id === 1 
                    ? (command.pottyLogs?.length || 0)
                    : (command.practiceLogs?.length || 0);
                  
                  return (
                    <div
                      key={command.id}
                      className="bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-all overflow-hidden"
                    >
                      {/* Command Header - Always Visible */}
                      <div className="flex items-center justify-between p-4">
                        <button
                          onClick={() => toggleCommandExpanded(command.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="text-gray-500" size={20} />
                          ) : (
                            <ChevronRight className="text-gray-500" size={20} />
                          )}
                          <h3 className="text-lg font-semibold text-gray-800">{command.name}</h3>
                        </button>
                        
                        <div className="flex items-center gap-3">
                          {logCount > 0 && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {logCount} log{logCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          {command.id === 1 && (
                            <>
                              <button
                                onClick={() => setShowMealModal(true)}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                              >
                                🍽️ Log Meal
                              </button>
                              <button
                                onClick={() => setShowNapModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                😴 Log Nap
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => command.id === 1 ? setShowPottyModal(true) : openPracticeModal(command.id)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            {command.id === 1 ? '🚽 Log Potty' : '+ Log Practice'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content - Logs */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          {/* Potty Training Schedule */}
                          {command.id === 1 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">📅 Daily Potty Schedule</h4>
                              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                  {pottySchedule.map((item, index) => (
                                    <div 
                                      key={index} 
                                      className={`p-3 rounded-lg border-l-4 ${
                                        item.mandatory 
                                          ? 'bg-white border-l-red-400 shadow-sm' 
                                          : 'bg-purple-50/50 border-l-purple-300'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-28">
                                          <span className="text-xs font-bold text-purple-700">{item.time}</span>
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-gray-800">{item.activity}</span>
                                            {item.mandatory && (
                                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                                POTTY BREAK
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-600">{item.action}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">
                              {command.id === 1 ? 'Potty Logs' : command.id === 2 ? 'Crate Time Logs' : 'Practice Logs'}
                            </h4>
                            {logCount > 0 && (
                              <button
                                onClick={() => command.id === 1 ? downloadPottyLog() : downloadCommandLog(command.id)}
                                className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                title="Download Logs"
                              >
                                <Download size={16} />
                              </button>
                            )}
                          </div>

                          {/* Potty Logs for Potty Training */}
                          {command.id === 1 && command.pottyLogs && command.pottyLogs.length > 0 ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {command.pottyLogs.map((log) => (
                                <div key={log.id} className="bg-white p-3 rounded border border-purple-200">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-purple-800 capitalize text-sm">{log.type} - {log.location}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">{log.date}</span>
                                      <button
                                        onClick={() => startEditPottyLog(command.id, log.id)}
                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                        title="Edit log"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        onClick={() => deletePottyLog(log.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Delete log"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>{log.time}</span>
                                    <span className="text-purple-600">by {log.loggedBy}</span>
                                  </div>
                                  {log.notes && (
                                    <p className="text-xs text-gray-600 italic mt-2 pt-2 border-t border-gray-200">
                                      Note: {log.notes}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {/* Meal Logs for Potty Training */}
                          {command.id === 1 && (
                            <>
                              <div className="mt-6 mb-3">
                                <h4 className="text-sm font-semibold text-gray-700">🍽️ Meal Logs</h4>
                              </div>
                              {command.mealLogs && command.mealLogs.length > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
                                  {command.mealLogs.map((log) => (
                                    <div key={log.id} className="bg-white p-3 rounded border border-orange-200">
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-orange-800 capitalize text-sm">
                                          {log.mealType === 'breakfast' ? '🌅' : log.mealType === 'lunch' ? '☀️' : log.mealType === 'dinner' ? '🌙' : '🍪'} {log.mealType}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-500">{log.date}</span>
                                          <button
                                            onClick={() => startEditMealLog(command.id, log.id)}
                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                            title="Edit log"
                                          >
                                            <Edit size={16} />
                                          </button>
                                          <button
                                            onClick={() => deleteMealLog(log.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            title="Delete log"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-600 mb-1">
                                        <span className="font-medium">Time:</span> {log.time}
                                      </div>
                                      {log.amount && (
                                        <div className="text-xs text-gray-600 mb-1">
                                          <span className="font-medium">Amount:</span> {log.amount}
                                        </div>
                                      )}
                                      {log.food && (
                                        <div className="text-xs text-gray-600 mb-1">
                                          <span className="font-medium">Food:</span> {log.food}
                                        </div>
                                      )}
                                      <div className="text-xs text-gray-600">
                                        <span className="text-orange-600">by {log.loggedBy}</span>
                                      </div>
                                      {log.notes && (
                                        <p className="text-xs text-gray-600 italic mt-2 pt-2 border-t border-gray-200">
                                          Note: {log.notes}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-400 italic text-center py-4 text-sm mb-6">No meals logged yet</p>
                              )}
                            </>
                          )}

                          {/* Nap Logs for Potty Training */}
                          {command.id === 1 && (
                            <>
                              <div className="mt-6 mb-3">
                                <h4 className="text-sm font-semibold text-gray-700">😴 Nap Logs</h4>
                              </div>
                              {command.napLogs && command.napLogs.length > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
                                  {command.napLogs.map((log) => (
                                    <div key={log.id} className="bg-white p-3 rounded border border-blue-200">
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-blue-800 text-sm">
                                          😴 Nap Time
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-500">{log.date}</span>
                                          <button
                                            onClick={() => startEditNapLog(command.id, log.id)}
                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                            title="Edit log"
                                          >
                                            <Edit size={16} />
                                          </button>
                                          <button
                                            onClick={() => deleteNapLog(log.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            title="Delete log"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-600 mb-1">
                                        <span className="font-medium">Start:</span> {log.startTime}
                                        {log.endTime && (
                                          <span className="ml-3">
                                            <span className="font-medium">End:</span> {log.endTime}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-600 mb-1">
                                        <span className="font-medium">Location:</span> {log.location}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        <span className="text-blue-600">by {log.loggedBy}</span>
                                      </div>
                                      {log.notes && (
                                        <p className="text-xs text-gray-600 italic mt-2 pt-2 border-t border-gray-200">
                                          Note: {log.notes}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-400 italic text-center py-4 text-sm mb-6">No naps logged yet</p>
                              )}
                            </>
                          )}

                          {command.practiceLogs && command.practiceLogs.length > 0 ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {command.practiceLogs.map((log) => (
                                <div key={log.id} className="bg-white p-3 rounded border border-purple-200">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <span className="text-xs text-gray-500">{log.date} at {log.time}</span>
                                      <span className="text-xs text-purple-600 ml-3">by {log.loggedBy}</span>
                                    </div>
                                    <button
                                      onClick={() => deletePracticeLog(command.id, log.id)}
                                      className="text-red-500 hover:text-red-700 transition-colors"
                                      title="Delete log"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  {log.attempts && (
                                    <div className="text-sm text-gray-700 mb-1">
                                      <span className="font-medium">Attempts: {log.attempts}</span>
                                    </div>
                                  )}
                                  {log.distractions && (
                                    <p className="text-xs text-gray-600 mb-1">Distractions: {log.distractions}</p>
                                  )}
                                  <div className="text-xs text-gray-700 mb-1">
                                    Reliability: <span className="font-medium text-purple-600">{log.reliability}/10</span>
                                  </div>
                                  {log.notes && (
                                    <p className="text-xs text-gray-600 italic">Notes: {log.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 italic text-center py-6 text-sm">No logs yet. Start practicing to add logs!</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Week 12-16: Basic Commands */}
            <div id="week-12" className="mb-8 scroll-mt-4">
              <div className="bg-blue-100 p-4 rounded-lg mb-4">
                <h3 className="text-2xl font-bold text-blue-800">Week 12-16: Basic Commands 📚</h3>
                <p className="text-blue-700 mt-1">Essential obedience training</p>
              </div>
              <div className="space-y-2">
                {commands.filter(cmd => cmd.ageWeek === 12).map((command) => {
                  const isExpanded = expandedCommands.has(command.id);
                  const logCount = command.practiceLogs?.length || 0;
                  
                  return (
                    <div
                      key={command.id}
                      className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all overflow-hidden"
                    >
                      {/* Command Header - Always Visible */}
                      <div className="flex items-center justify-between p-4">
                        <button
                          onClick={() => toggleCommandExpanded(command.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="text-gray-500" size={20} />
                          ) : (
                            <ChevronRight className="text-gray-500" size={20} />
                          )}
                          <h3 className="text-lg font-semibold text-gray-800">{command.name}</h3>
                        </button>
                        
                        <div className="flex items-center gap-3">
                          {logCount > 0 && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {logCount} log{logCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          <button
                            onClick={() => openPracticeModal(command.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            + Log Practice
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content - Logs */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">Practice Logs</h4>
                            {logCount > 0 && (
                              <button
                                onClick={() => downloadCommandLog(command.id)}
                                className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                title="Download Logs"
                              >
                                <Download size={16} />
                              </button>
                            )}
                          </div>

                          {command.practiceLogs && command.practiceLogs.length > 0 ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {command.practiceLogs.map((log) => (
                                <div key={log.id} className="bg-white p-3 rounded border border-blue-200">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <span className="text-xs text-gray-500">{log.date} at {log.time}</span>
                                      <span className="text-xs text-blue-600 ml-3">by {log.loggedBy}</span>
                                    </div>
                                    <button
                                      onClick={() => deletePracticeLog(command.id, log.id)}
                                      className="text-red-500 hover:text-red-700 transition-colors"
                                      title="Delete log"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  {(log.attempts || log.successes) && (
                                    <div className="text-sm text-gray-700 mb-1">
                                      <span className="font-medium">Attempts: {log.attempts || 0}</span>
                                      <span className="ml-3 font-medium text-green-600">Successes: {log.successes || 0}</span>
                                    </div>
                                  )}
                                  {log.distractions && (
                                    <p className="text-xs text-gray-600 mb-1">Distractions: {log.distractions}</p>
                                  )}
                                  <div className="text-xs text-gray-700 mb-1">
                                    Reliability: <span className="font-medium text-blue-600">{log.reliability}/10</span>
                                  </div>
                                  {log.notes && (
                                    <p className="text-xs text-gray-600 italic">Notes: {log.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 italic text-center py-6 text-sm">No logs yet. Start practicing to add logs!</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Week 20-26: Intermediate Training */}
            <div id="week-20" className="mb-8 scroll-mt-4">
              <div className="bg-orange-100 p-4 rounded-lg mb-4">
                <h3 className="text-2xl font-bold text-orange-800">Week 20-26: Intermediate Training 🎯</h3>
                <p className="text-orange-700 mt-1">Building impulse control and manners</p>
              </div>
              <div className="space-y-2">
                {commands.filter(cmd => cmd.ageWeek === 20).map((command) => {
                  const isExpanded = expandedCommands.has(command.id);
                  const logCount = command.practiceLogs?.length || 0;
                  
                  return (
                    <div
                      key={command.id}
                      className="bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-all overflow-hidden"
                    >
                      {/* Command Header - Always Visible */}
                      <div className="flex items-center justify-between p-4">
                        <button
                          onClick={() => toggleCommandExpanded(command.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="text-gray-500" size={20} />
                          ) : (
                            <ChevronRight className="text-gray-500" size={20} />
                          )}
                          <h3 className="text-lg font-semibold text-gray-800">{command.name}</h3>
                        </button>
                        
                        <div className="flex items-center gap-3">
                          {logCount > 0 && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {logCount} log{logCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          <button
                            onClick={() => openPracticeModal(command.id)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                          >
                            + Log Practice
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content - Logs */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">Practice Logs</h4>
                            {logCount > 0 && (
                              <button
                                onClick={() => downloadCommandLog(command.id)}
                                className="p-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                                title="Download Logs"
                              >
                                <Download size={16} />
                              </button>
                            )}
                          </div>

                          {command.practiceLogs && command.practiceLogs.length > 0 ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {command.practiceLogs.map((log) => (
                                <div key={log.id} className="bg-white p-3 rounded border border-orange-200">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <span className="text-xs text-gray-500">{log.date} at {log.time}</span>
                                      <span className="text-xs text-orange-600 ml-3">by {log.loggedBy}</span>
                                    </div>
                                    <button
                                      onClick={() => deletePracticeLog(command.id, log.id)}
                                      className="text-red-500 hover:text-red-700 transition-colors"
                                      title="Delete log"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  {(log.attempts || log.successes) && (
                                    <div className="text-sm text-gray-700 mb-1">
                                      <span className="font-medium">Attempts: {log.attempts || 0}</span>
                                      <span className="ml-3 font-medium text-green-600">Successes: {log.successes || 0}</span>
                                    </div>
                                  )}
                                  {log.distractions && (
                                    <p className="text-xs text-gray-600 mb-1">Distractions: {log.distractions}</p>
                                  )}
                                  <div className="text-xs text-gray-700 mb-1">
                                    Reliability: <span className="font-medium text-orange-600">{log.reliability}/10</span>
                                  </div>
                                  {log.notes && (
                                    <p className="text-xs text-gray-600 italic">Notes: {log.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 italic text-center py-6 text-sm">No logs yet. Start practicing to add logs!</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Week 26-52: Advanced Commands */}
            <div id="week-26" className="mb-8 scroll-mt-4">
              <div className="bg-indigo-100 p-4 rounded-lg mb-4">
                <h3 className="text-2xl font-bold text-indigo-800">Week 26-52: Advanced Training 🏆</h3>
                <p className="text-indigo-700 mt-1">Fun tricks and advanced obedience</p>
              </div>
              <div className="space-y-2">
                {commands.filter(cmd => cmd.ageWeek === 26).map((command) => {
                  const isExpanded = expandedCommands.has(command.id);
                  const logCount = command.practiceLogs?.length || 0;
                  
                  return (
                    <div
                      key={command.id}
                      className="bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-all overflow-hidden"
                    >
                      {/* Command Header - Always Visible */}
                      <div className="flex items-center justify-between p-4">
                        <button
                          onClick={() => toggleCommandExpanded(command.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="text-gray-500" size={20} />
                          ) : (
                            <ChevronRight className="text-gray-500" size={20} />
                          )}
                          <h3 className="text-lg font-semibold text-gray-800">{command.name}</h3>
                        </button>
                        
                        <div className="flex items-center gap-3">
                          {logCount > 0 && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {logCount} log{logCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          <button
                            onClick={() => openPracticeModal(command.id)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                          >
                            + Log Practice
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content - Logs */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">Practice Logs</h4>
                            {logCount > 0 && (
                              <button
                                onClick={() => downloadCommandLog(command.id)}
                                className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                                title="Download Logs"
                              >
                                <Download size={16} />
                              </button>
                            )}
                          </div>

                          {command.practiceLogs && command.practiceLogs.length > 0 ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {command.practiceLogs.map((log) => (
                                <div key={log.id} className="bg-white p-3 rounded border border-indigo-200">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <span className="text-xs text-gray-500">{log.date} at {log.time}</span>
                                      <span className="text-xs text-indigo-600 ml-3">by {log.loggedBy}</span>
                                    </div>
                                    <button
                                      onClick={() => deletePracticeLog(command.id, log.id)}
                                      className="text-red-500 hover:text-red-700 transition-colors"
                                      title="Delete log"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  {(log.attempts || log.successes) && (
                                    <div className="text-sm text-gray-700 mb-1">
                                      <span className="font-medium">Attempts: {log.attempts || 0}</span>
                                      <span className="ml-3 font-medium text-green-600">Successes: {log.successes || 0}</span>
                                    </div>
                                  )}
                                  {log.distractions && (
                                    <p className="text-xs text-gray-600 mb-1">Distractions: {log.distractions}</p>
                                  )}
                                  <div className="text-xs text-gray-700 mb-1">
                                    Reliability: <span className="font-medium text-indigo-600">{log.reliability}/10</span>
                                  </div>
                                  {log.notes && (
                                    <p className="text-xs text-gray-600 italic">Notes: {log.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 italic text-center py-6 text-sm">No logs yet. Start practicing to add logs!</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "milestones" && (
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-8">Training Milestones</h2>
            
            <div className="space-y-2">
              {milestones.map((milestone) => {
                const isExpanded = expandedMilestones.has(milestone.id);
                
                return (
                  <div
                    key={milestone.id}
                    className={`rounded-lg border transition-all overflow-hidden ${
                      milestone.completed
                        ? "bg-green-50 border-green-300 hover:border-green-400"
                        : "bg-white border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    {/* Milestone Header - Always Visible */}
                    <div className="flex items-center justify-between p-3 md:p-4">
                      <button
                        onClick={() => toggleMilestoneExpanded(milestone.id)}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        {isExpanded ? (
                          <ChevronDown className="text-gray-500" size={18} />
                        ) : (
                          <ChevronRight className="text-gray-500" size={18} />
                        )}
                        <h3 className="text-base md:text-lg font-semibold text-gray-800">{milestone.title}</h3>
                        {milestone.completed && (
                          <span className="ml-2 text-green-600">✓</span>
                        )}
                      </button>
                      
                      <div className="flex items-center gap-2">
                        {milestone.completed ? (
                          <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full font-medium">
                            Completed
                          </span>
                        ) : (
                          <button
                            onClick={() => completeMilestone(milestone.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Award size={16} />
                            Mark Complete
                          </button>
                        )}
                        
                        {/* Photo Upload Icon Button */}
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e, milestone.id)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <button 
                            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            title={milestone.photo ? "Change Photo" : "Add Photo"}
                          >
                            <Camera size={18} />
                          </button>
                        </div>
                        
                        {milestone.photo && (
                          <span className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                            📷
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expanded Content - Details and Photo */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4">
                        <div className="space-y-4">
                          {/* Completion Info */}
                          {milestone.completedDate && (
                            <div className="bg-white p-3 rounded border border-green-200">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Completed:</span> {milestone.completedDate}
                              </p>
                              {milestone.completedBy && (
                                <p className="text-sm text-blue-600 mt-1">
                                  <span className="font-medium">By:</span> {milestone.completedBy}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Photo Section */}
                          {milestone.photo ? (
                            <div className="bg-white p-3 rounded border border-purple-200">
                              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <Camera size={14} />
                                Milestone Photo:
                              </p>
                              <div className="flex justify-center">
                                <img
                                  src={milestone.photo}
                                  alt={milestone.title}
                                  className="w-64 h-64 object-cover rounded-lg"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white p-6 rounded border border-dashed border-gray-300 text-center">
                              <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">No photo added yet</p>
                              <p className="text-xs text-gray-400 mt-1">Click the camera icon above to add a photo</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-8 gap-3">
              <h2 className="text-xl md:text-3xl font-bold text-gray-800">Appointments & Reminders</h2>
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
              >
                <Calendar size={18} className="md:w-5 md:h-5" />
                Add Appointment
              </button>
            </div>

            {/* Upcoming Appointments */}
            <div className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                <Bell className="text-blue-600" size={20} />
                Upcoming Appointments
              </h3>
              <div className="space-y-3 md:space-y-4">
                {appointments
                  .filter(apt => !apt.completed && new Date(apt.date) >= new Date(new Date().toDateString()))
                  .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-white p-6 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              appointment.type === 'vet' ? 'bg-red-100 text-red-700' :
                              appointment.type === 'grooming' ? 'bg-purple-100 text-purple-700' :
                              appointment.type === 'training' ? 'bg-blue-100 text-blue-700' :
                              appointment.type === 'vaccination' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {appointment.type.toUpperCase()}
                            </span>
                            {appointment.reminder && (
                              <Bell className="text-yellow-500" size={16} />
                            )}
                          </div>
                          <h4 className="text-xl font-bold text-gray-800 mb-2">{appointment.title}</h4>
                          <div className="space-y-1 text-gray-600">
                            <p className="flex items-center gap-2">
                              <Calendar size={16} />
                              {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="flex items-center gap-2">
                              <Clock size={16} />
                              {appointment.time}
                            </p>
                            {appointment.location && (
                              <p className="text-sm text-gray-500">📍 {appointment.location}</p>
                            )}
                            {appointment.recurring && appointment.nextDueDate && (
                              <div className="flex items-center gap-2 mt-2 bg-blue-50 px-3 py-2 rounded">
                                <RefreshCw size={14} className="text-blue-600" />
                                <span className="text-sm text-blue-700 font-medium">
                                  Next Due: {new Date(appointment.nextDueDate).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-blue-600 ml-2">({appointment.recurringType})</span>
                              </div>
                            )}
                            {appointment.documents && appointment.documents.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                  <FileText size={14} />
                                  Documents ({appointment.documents.length}):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {appointment.documents.map((doc, idx) => (
                                    <a
                                      key={idx}
                                      href={doc}
                                      download={`document-${idx + 1}.pdf`}
                                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700"
                                    >
                                      <FileText size={12} />
                                      Doc {idx + 1}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            {appointment.notes && (
                              <p className="text-sm text-gray-500 italic mt-2">{appointment.notes}</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Created by {appointment.createdBy}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleAppointmentComplete(appointment.id)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            title="Mark as Complete"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={() => deleteAppointment(appointment.id)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                {appointments.filter(apt => !apt.completed && new Date(apt.date) >= new Date(new Date().toDateString())).length === 0 && (
                  <p className="text-center text-gray-400 italic py-8">No upcoming appointments. Click "Add Appointment" to schedule one!</p>
                )}
              </div>
            </div>

            {/* Past/Completed Appointments */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Past & Completed</h3>
              <div className="space-y-4">
                {appointments
                  .filter(apt => apt.completed || new Date(apt.date) < new Date(new Date().toDateString()))
                  .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200 opacity-75"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              appointment.type === 'vet' ? 'bg-red-100 text-red-700' :
                              appointment.type === 'grooming' ? 'bg-purple-100 text-purple-700' :
                              appointment.type === 'training' ? 'bg-blue-100 text-blue-700' :
                              appointment.type === 'vaccination' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {appointment.type.toUpperCase()}
                            </span>
                            {appointment.completed && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">COMPLETED</span>
                            )}
                          </div>
                          <h4 className="text-lg font-bold text-gray-700 mb-2">{appointment.title}</h4>
                          <div className="space-y-1 text-gray-500 text-sm">
                            <p>{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</p>
                            {appointment.location && <p>📍 {appointment.location}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteAppointment(appointment.id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                {appointments.filter(apt => apt.completed || new Date(apt.date) < new Date(new Date().toDateString())).length === 0 && (
                  <p className="text-center text-gray-400 italic py-8">No past appointments</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "physical" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Physical Development & Handling</h2>

            {/* Four sections in a grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Weight Tracker */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Scale size={24} className="text-blue-600" />
                    Weight Tracker
                  </h3>
                  <button
                    onClick={() => setShowWeightModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    + Add Weight
                  </button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {weightEntries.map((entry) => (
                    <div key={entry.id} className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">Week {entry.weekNumber}: {entry.weight} {entry.unit}</p>
                          <p className="text-xs text-gray-500">{entry.date} • by {entry.loggedBy}</p>
                          {entry.notes && <p className="text-sm text-gray-600 mt-1 italic">{entry.notes}</p>}
                        </div>
                        <button
                          onClick={() => entry.id && deleteWeightEntry(entry.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {weightEntries.length === 0 && (
                    <p className="text-center text-gray-400 italic py-8">No weight entries yet</p>
                  )}
                </div>
              </div>

              {/* Loose Tooth Log */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">🦷 Loose Tooth Log</h3>
                  <button
                    onClick={() => setShowToothModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    + Add Tooth
                  </button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {toothLogs.map((log) => (
                    <div key={log.id} className="bg-purple-50 p-3 rounded border border-purple-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{log.toothType}</p>
                          <p className="text-xs text-gray-500">Noticed: {log.dateNoticed} • by {log.loggedBy}</p>
                          {log.notes && <p className="text-sm text-gray-600 mt-1 italic">{log.notes}</p>}
                        </div>
                        <button
                          onClick={() => log.id && deleteToothLog(log.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {toothLogs.length === 0 && (
                    <p className="text-center text-gray-400 italic py-8">No tooth logs yet</p>
                  )}
                </div>
              </div>

              {/* Grooming Desensitization */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">✂️ Grooming Desensitization</h3>
                  <button
                    onClick={() => setShowGroomingModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    + Add Session
                  </button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {groomingLogs.map((log) => (
                    <div key={log.id} className="bg-green-50 p-3 rounded border border-green-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 capitalize">{log.activity.replace('-', ' ')}</p>
                          <p className="text-xs text-gray-500">{log.date} • {log.duration} • by {log.loggedBy}</p>
                          <div className="mt-1">
                            <span className="text-xs text-gray-600">Tolerance: </span>
                            <span className="text-sm font-medium text-green-700">{log.tolerance}/10</span>
                          </div>
                          {log.notes && <p className="text-sm text-gray-600 mt-1 italic">{log.notes}</p>}
                        </div>
                        <button
                          onClick={() => log.id && deleteGroomingLog(log.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {groomingLogs.length === 0 && (
                    <p className="text-center text-gray-400 italic py-8">No grooming sessions yet</p>
                  )}
                </div>
              </div>

              {/* Fear Observation Log */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">⚠️ Fear Observation Log</h3>
                  <button
                    onClick={() => setShowFearModal(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    + Add Observation
                  </button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {fearLogs.map((log) => (
                    <div key={log.id} className={`p-3 rounded border ${
                      log.intensity === 'severe' ? 'bg-red-50 border-red-300' :
                      log.intensity === 'moderate' ? 'bg-orange-50 border-orange-300' :
                      'bg-yellow-50 border-yellow-300'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-800">{log.trigger}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              log.intensity === 'severe' ? 'bg-red-200 text-red-800' :
                              log.intensity === 'moderate' ? 'bg-orange-200 text-orange-800' :
                              'bg-yellow-200 text-yellow-800'
                            }`}>
                              {log.intensity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{log.date} • by {log.loggedBy}</p>
                          <p className="text-sm text-gray-700 mt-1"><strong>Response:</strong> {log.response}</p>
                          {log.duration && <p className="text-xs text-gray-600">Duration: {log.duration}</p>}
                          {log.notes && <p className="text-sm text-gray-600 mt-1 italic">{log.notes}</p>}
                        </div>
                        <button
                          onClick={() => log.id && deleteFearLog(log.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {fearLogs.length === 0 && (
                    <p className="text-center text-gray-400 italic py-8">No fear observations yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Potty Training Modal */}
      {showPottyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              {editingLogId ? 'Edit Potty Break 🚽' : 'Log Potty Break 🚽'}
            </h3>
            
            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPottyType('pee')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      pottyType === 'pee'
                        ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-yellow-300'
                    }`}
                  >
                    💧 Pee
                  </button>
                  <button
                    onClick={() => setPottyType('poop')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      pottyType === 'poop'
                        ? 'bg-brown-100 border-amber-700 text-amber-900'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    💩 Poop
                  </button>
                  <button
                    onClick={() => setPottyType('both')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      pottyType === 'both'
                        ? 'bg-purple-100 border-purple-500 text-purple-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-purple-300'
                    }`}
                  >
                    💧💩 Both
                  </button>
                </div>
              </div>

              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPottyLocation('outside')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      pottyLocation === 'outside'
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-green-300'
                    }`}
                  >
                    🌳 Outside
                  </button>
                  <button
                    onClick={() => setPottyLocation('inside')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      pottyLocation === 'inside'
                        ? 'bg-red-100 border-red-500 text-red-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-red-300'
                    }`}
                  >
                    🏠 Inside
                  </button>
                </div>
              </div>

              {/* Time Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time (optional)</label>
                <input
                  type="time"
                  value={pottyTime}
                  onChange={(e) => setPottyTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use current time</p>
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={pottyNotes}
                  onChange={(e) => setPottyNotes(e.target.value)}
                  placeholder="Add any notes about this potty break..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPottyModal(false);
                  setPottyType('pee');
                  setPottyLocation('outside');
                  setPottyTime('');
                  setPottyNotes('');
                  setEditingLogId(null);
                  setEditingLogType(null);
                  setEditingCommandId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingLogId ? updatePottyLog : logPottyBreak}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {editingLogId ? 'Update Log' : 'Save Log'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meal Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">
              {editingLogId ? '✏️ Edit Meal' : '🍽️ Log Meal'}
            </h3>

            <div className="space-y-3 md:space-y-4">
              {/* Meal Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMealType('breakfast')}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                      mealType === 'breakfast'
                        ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-yellow-400'
                    }`}
                  >
                    🌅 Breakfast
                  </button>
                  <button
                    onClick={() => setMealType('lunch')}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                      mealType === 'lunch'
                        ? 'bg-orange-100 border-orange-500 text-orange-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-orange-400'
                    }`}
                  >
                    ☀️ Lunch
                  </button>
                  <button
                    onClick={() => setMealType('dinner')}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                      mealType === 'dinner'
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    🌙 Dinner
                  </button>
                  <button
                    onClick={() => setMealType('snack')}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                      mealType === 'snack'
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'
                    }`}
                  >
                    🍪 Snack
                  </button>
                </div>
              </div>

              {/* Time Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                <input
                  type="time"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (optional)</label>
                <input
                  type="text"
                  value={mealAmount}
                  onChange={(e) => setMealAmount(e.target.value)}
                  placeholder="e.g., 1 cup, 2 oz"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Food Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food (optional)</label>
                <input
                  type="text"
                  value={mealFood}
                  onChange={(e) => setMealFood(e.target.value)}
                  placeholder="e.g., puppy kibble, chicken & rice"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={mealNotes}
                  onChange={(e) => setMealNotes(e.target.value)}
                  placeholder="Add any notes about this meal..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMealModal(false);
                  setMealType('breakfast');
                  setMealTime('');
                  setMealAmount('');
                  setMealFood('');
                  setMealNotes('');
                  setEditingLogId(null);
                  setEditingLogType(null);
                  setEditingCommandId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingLogId ? updateMealLog : logMeal}
                disabled={!mealTime}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingLogId ? 'Update Meal' : 'Save Meal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nap Modal */}
      {showNapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">
              {editingLogId ? '✏️ Edit Nap' : '😴 Log Nap'}
            </h3>

            <div className="space-y-3 md:space-y-4">
              {/* Start Time Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                <input
                  type="time"
                  value={napStartTime}
                  onChange={(e) => setNapStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* End Time Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time (optional)</label>
                <input
                  type="time"
                  value={napEndTime}
                  onChange={(e) => setNapEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={napLocation}
                  onChange={(e) => setNapLocation(e.target.value)}
                  placeholder="e.g., crate, bed, couch, play pen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={napNotes}
                  onChange={(e) => setNapNotes(e.target.value)}
                  placeholder="Add any notes about this nap..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNapModal(false);
                  setNapStartTime('');
                  setNapEndTime('');
                  setNapLocation('');
                  setNapNotes('');
                  setEditingLogId(null);
                  setEditingLogType(null);
                  setEditingCommandId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingLogId ? updateNapLog : logNap}
                disabled={!napStartTime}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingLogId ? 'Update Nap' : 'Save Nap'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Practice Log Modal */}
      {showPracticeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingLogId ? 'Edit Practice Log 📝' : 'Add Practice Log 📝'}
            </h3>
            
            <div className="space-y-4">
              {/* Attempts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attempts</label>
                <input
                  type="number"
                  min="0"
                  value={practiceAttempts}
                  onChange={(e) => setPracticeAttempts(e.target.value)}
                  placeholder="Number of attempts"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Distractions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distractions Present</label>
                <input
                  type="text"
                  value={practiceDistractions}
                  onChange={(e) => setPracticeDistractions(e.target.value)}
                  placeholder="e.g., other dogs, loud noises, toys"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Reliability Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reliability Rating: {practiceReliability}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={practiceReliability}
                  onChange={(e) => setPracticeReliability(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Needs Work</span>
                  <span>Perfect!</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={practiceNotes}
                  onChange={(e) => setPracticeNotes(e.target.value)}
                  placeholder="Any additional observations or notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPracticeModal(false);
                  setSelectedCommandId(null);
                  setPracticeAttempts('');
                  setPracticeSuccesses('');
                  setPracticeDistractions('');
                  setPracticeReliability(5);
                  setPracticeNotes('');
                  setEditingLogId(null);
                  setEditingLogType(null);
                  setEditingCommandId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingLogId ? updatePracticeLog : addPracticeLog}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {editingLogId ? 'Update Log' : 'Save Log'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar size={24} className="text-blue-600" />
              New Appointment
            </h3>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={appointmentTitle}
                  onChange={(e) => setAppointmentTitle(e.target.value)}
                  placeholder="e.g., Vet Checkup, Grooming Session"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['vet', 'grooming', 'training', 'vaccination', 'other'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setAppointmentType(type)}
                      className={`px-3 py-2 rounded-lg border-2 transition-colors capitalize ${
                        appointmentType === type
                          ? type === 'vet' ? 'bg-red-100 border-red-500 text-red-800' :
                            type === 'grooming' ? 'bg-purple-100 border-purple-500 text-purple-800' :
                            type === 'training' ? 'bg-blue-100 border-blue-500 text-blue-800' :
                            type === 'vaccination' ? 'bg-green-100 border-green-500 text-green-800' :
                            'bg-gray-100 border-gray-500 text-gray-800'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
                <input
                  type="text"
                  value={appointmentLocation}
                  onChange={(e) => setAppointmentLocation(e.target.value)}
                  placeholder="e.g., Happy Paws Veterinary Clinic"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  placeholder="Any special instructions or reminders..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Reminder */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={appointmentReminder}
                  onChange={(e) => setAppointmentReminder(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="reminder" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Bell size={16} className="text-yellow-500" />
                  Set reminder for this appointment
                </label>
              </div>

              {/* Recurring Appointment */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={appointmentRecurring}
                    onChange={(e) => setAppointmentRecurring(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="recurring" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <RefreshCw size={16} className="text-blue-600" />
                    Recurring appointment (auto-schedule next)
                  </label>
                </div>

                {appointmentRecurring && (
                  <div className="space-y-3 ml-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recurring Type</label>
                      <select
                        value={appointmentRecurringType}
                        onChange={(e) => setAppointmentRecurringType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="vaccination">Vaccination (every 3 weeks)</option>
                        <option value="deworming">Deworming (every 2 weeks)</option>
                        <option value="flea-tick">Flea/Tick Prevention (monthly)</option>
                        <option value="checkup">Checkup (every 3 months)</option>
                        <option value="grooming">Grooming (every 6 weeks)</option>
                        <option value="custom">Custom (monthly)</option>
                      </select>
                    </div>
                    {appointmentDate && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Next Due Date:</strong>{' '}
                          {new Date(calculateNextDueDate(appointmentDate, appointmentRecurringType)).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Document Upload */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <FileText size={16} className="text-gray-600" />
                  Upload Documents (optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Attach vaccination records, health certificates, or other documents
                </p>
                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors">
                    <Upload size={18} className="text-gray-500" />
                    <span className="text-sm text-gray-600">Choose files to upload</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf,.doc,.docx"
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                  </label>

                  {appointmentDocuments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-gray-600">
                        Attached Documents ({appointmentDocuments.length}):
                      </p>
                      {appointmentDocuments.map((_, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-sm text-gray-700 flex items-center gap-1">
                            <FileText size={14} />
                            Document {idx + 1}
                          </span>
                          <button
                            onClick={() => removeDocument(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAppointmentModal(false);
                  setAppointmentTitle('');
                  setAppointmentType('vet');
                  setAppointmentDate('');
                  setAppointmentTime('');
                  setAppointmentLocation('');
                  setAppointmentNotes('');
                  setAppointmentReminder(true);
                  setAppointmentRecurring(false);
                  setAppointmentRecurringType('vaccination');
                  setAppointmentDocuments([]);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addAppointment}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weight Entry Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Scale size={24} className="text-blue-600" />
              Add Weight Entry
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={weightValue}
                    onChange={(e) => setWeightValue(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value as 'lbs' | 'kg')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={weightWeek}
                  onChange={(e) => setWeightWeek(e.target.value)}
                  placeholder="e.g., 8, 12, 16"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={weightNotes}
                  onChange={(e) => setWeightNotes(e.target.value)}
                  placeholder="Any observations about growth..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowWeightModal(false);
                  setWeightValue('');
                  setWeightWeek('');
                  setWeightNotes('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addWeightEntry}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooth Log Modal */}
      {showToothModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">🦷 Log Loose Tooth</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tooth Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={toothType}
                  onChange={(e) => setToothType(e.target.value)}
                  placeholder="e.g., Front incisor, Canine, Molar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Noticed <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={toothDate}
                  onChange={(e) => setToothDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={toothNotes}
                  onChange={(e) => setToothNotes(e.target.value)}
                  placeholder="Any observations, if it fell out, etc..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowToothModal(false);
                  setToothType('');
                  setToothDate('');
                  setToothNotes('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addToothLog}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grooming Session Modal */}
      {showGroomingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">✂️ Log Grooming Session</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                <select
                  value={groomingActivity}
                  onChange={(e) => setGroomingActivity(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="brushing">Brushing</option>
                  <option value="nail-trim">Nail Trimming</option>
                  <option value="ear-cleaning">Ear Cleaning</option>
                  <option value="bath">Bath</option>
                  <option value="paw-handling">Paw Handling</option>
                  <option value="mouth-touching">Mouth/Teeth Touching</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={groomingDate}
                  onChange={(e) => setGroomingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={groomingDuration}
                  onChange={(e) => setGroomingDuration(e.target.value)}
                  placeholder="e.g., 5 minutes, 10 minutes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tolerance Level: {groomingTolerance}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={groomingTolerance}
                  onChange={(e) => setGroomingTolerance(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Stressed</span>
                  <span>Calm & Relaxed</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={groomingNotes}
                  onChange={(e) => setGroomingNotes(e.target.value)}
                  placeholder="Reactions, progress notes, treats used..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowGroomingModal(false);
                  setGroomingDate('');
                  setGroomingDuration('');
                  setGroomingTolerance(5);
                  setGroomingNotes('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addGroomingLog}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fear Observation Modal */}
      {showFearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">⚠️ Log Fear Observation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fear Trigger <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fearTrigger}
                  onChange={(e) => setFearTrigger(e.target.value)}
                  placeholder="e.g., Loud noises, strangers, other dogs"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={fearDate}
                  onChange={(e) => setFearDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Intensity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['mild', 'moderate', 'severe'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setFearIntensity(level)}
                      className={`px-3 py-2 rounded-lg border-2 transition-colors capitalize ${
                        fearIntensity === level
                          ? level === 'mild' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                            level === 'moderate' ? 'bg-orange-100 border-orange-500 text-orange-800' :
                            'bg-red-100 border-red-500 text-red-800'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puppy's Response <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={fearResponse}
                  onChange={(e) => setFearResponse(e.target.value)}
                  placeholder="e.g., Cowering, barking, hiding, trembling"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (optional)</label>
                <input
                  type="text"
                  value={fearDuration}
                  onChange={(e) => setFearDuration(e.target.value)}
                  placeholder="e.g., 5 minutes, 30 seconds"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={fearNotes}
                  onChange={(e) => setFearNotes(e.target.value)}
                  placeholder="Context, what helped calm them, follow-up needed..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowFearModal(false);
                  setFearTrigger('');
                  setFearDate('');
                  setFearResponse('');
                  setFearDuration('');
                  setFearNotes('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addFearLog}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Observation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
