import { useState, useEffect } from "react";
import { Home, Target, Trophy, Award, Camera, Calendar, Clock, Download, Bell, Trash2, Check, ChevronDown, ChevronRight, FileText, X, Upload, RefreshCw, Scale, Activity } from "lucide-react";
import UserAuth from "./UserAuth";

interface PottyLog {
  id: number;
  type: 'pee' | 'poop';
  time: string;
  location: 'inside' | 'outside';
  loggedBy: string;
  date: string;
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
  
  // Debug log
  console.log("Current user state:", currentUser);
  const [commands, setCommands] = useState<Command[]>([
    // Week 8-10 Commands
    { id: 1, name: "Potty Training", practiced: false, ageWeek: 8 },
    { id: 2, name: "Crate Training", practiced: false, ageWeek: 8 },
    { id: 3, name: "Name Recognition", practiced: false, ageWeek: 8 },
    { id: 4, name: "Sit", practiced: false, ageWeek: 8 },
    { id: 5, name: "Come", practiced: false, ageWeek: 8 },
    { id: 6, name: "Chewing on Toys", practiced: false, ageWeek: 8 },
    { id: 7, name: "Socialization", practiced: false, ageWeek: 8 },
    { id: 8, name: "Handling (paws, ears, mouth)", practiced: false, ageWeek: 8 },
    
    // Week 12-16 Commands
    { id: 9, name: "Stay", practiced: false, ageWeek: 12 },
    { id: 10, name: "Down", practiced: false, ageWeek: 12 },
    { id: 11, name: "Leave It", practiced: false, ageWeek: 12 },
    { id: 12, name: "Drop It", practiced: false, ageWeek: 12 },
    { id: 13, name: "Leash Walking", practiced: false, ageWeek: 12 },
    { id: 14, name: "Wait", practiced: false, ageWeek: 12 },
    
    // Week 20-26 Commands
    { id: 15, name: "Heel", practiced: false, ageWeek: 20 },
    { id: 16, name: "Place/Go to Bed", practiced: false, ageWeek: 20 },
    { id: 17, name: "Quiet", practiced: false, ageWeek: 20 },
    { id: 18, name: "Off", practiced: false, ageWeek: 20 },
    { id: 19, name: "Settle", practiced: false, ageWeek: 20 },
    
    // Week 26-52 Advanced Commands
    { id: 20, name: "Roll Over", practiced: false, ageWeek: 26 },
    { id: 21, name: "Shake/Paw", practiced: false, ageWeek: 26 },
    { id: 22, name: "Spin", practiced: false, ageWeek: 26 },
    { id: 23, name: "Fetch", practiced: false, ageWeek: 26 },
    { id: 24, name: "Distance Commands", practiced: false, ageWeek: 26 },
    { id: 25, name: "Advanced Stay", practiced: false, ageWeek: 26 },
  ]);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 1, title: "First Vet Visit", completed: false, photo: null },
    { id: 2, title: "First Walk", completed: false, photo: null },
    { id: 3, title: "House Trained", completed: false, photo: null },
    { id: 4, title: "Learned to Sit", completed: false, photo: null },
    { id: 5, title: "First Successful Stay", completed: false, photo: null },
    { id: 6, title: "Mastered Roll Over", completed: false, photo: null },
  ]);
  const [customCommand, setCustomCommand] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Potty training states
  const [showPottyModal, setShowPottyModal] = useState(false);
  const [pottyType, setPottyType] = useState<'pee' | 'poop'>('pee');
  const [pottyLocation, setPottyLocation] = useState<'inside' | 'outside'>('outside');
  const [pottyTime, setPottyTime] = useState('');

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

  // Physical Development states
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [toothLogs, setToothLogs] = useState<ToothLog[]>([]);
  const [groomingLogs, setGroomingLogs] = useState<GroomingLog[]>([]);
  const [fearLogs, setFearLogs] = useState<FearLog[]>([]);

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

  // Load user session - TEMPORARILY DISABLED TO FORCE LOGIN SCREEN
  useEffect(() => {
    // Clear any existing session to show login screen
    localStorage.removeItem("currentUser");
    // const savedUser = localStorage.getItem("currentUser");
    // if (savedUser) {
    //   setCurrentUser(savedUser);
    // }
  }, []);

  // Load data from localStorage
  useEffect(() => {
    const savedCommands = localStorage.getItem("puppyCommands");
    const savedMilestones = localStorage.getItem("puppyMilestones");
    const savedAppointments = localStorage.getItem("puppyAppointments");
    const savedWeightEntries = localStorage.getItem("puppyWeightEntries");
    const savedToothLogs = localStorage.getItem("puppyToothLogs");
    const savedGroomingLogs = localStorage.getItem("puppyGroomingLogs");
    const savedFearLogs = localStorage.getItem("puppyFearLogs");
    
    if (savedCommands) {
      setCommands(JSON.parse(savedCommands));
    }
    if (savedMilestones) {
      setMilestones(JSON.parse(savedMilestones));
    }
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
    if (savedWeightEntries) {
      setWeightEntries(JSON.parse(savedWeightEntries));
    }
    if (savedToothLogs) {
      setToothLogs(JSON.parse(savedToothLogs));
    }
    if (savedGroomingLogs) {
      setGroomingLogs(JSON.parse(savedGroomingLogs));
    }
    if (savedFearLogs) {
      setFearLogs(JSON.parse(savedFearLogs));
    }
  }, []);

  // Save commands to localStorage
  useEffect(() => {
    localStorage.setItem("puppyCommands", JSON.stringify(commands));
  }, [commands]);

  // Save milestones to localStorage
  useEffect(() => {
    localStorage.setItem("puppyMilestones", JSON.stringify(milestones));
  }, [milestones]);

  // Save appointments to localStorage
  useEffect(() => {
    localStorage.setItem("puppyAppointments", JSON.stringify(appointments));
  }, [appointments]);

  // Save physical development data to localStorage
  useEffect(() => {
    localStorage.setItem("puppyWeightEntries", JSON.stringify(weightEntries));
  }, [weightEntries]);

  useEffect(() => {
    localStorage.setItem("puppyToothLogs", JSON.stringify(toothLogs));
  }, [toothLogs]);

  useEffect(() => {
    localStorage.setItem("puppyGroomingLogs", JSON.stringify(groomingLogs));
  }, [groomingLogs]);

  useEffect(() => {
    localStorage.setItem("puppyFearLogs", JSON.stringify(fearLogs));
  }, [fearLogs]);

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

  const logPottyBreak = () => {
    if (!currentUser) return;
    
    const now = new Date();
    const newLog: PottyLog = {
      id: Date.now(),
      type: pottyType,
      time: pottyTime || now.toLocaleTimeString(),
      location: pottyLocation,
      loggedBy: currentUser,
      date: now.toLocaleDateString()
    };
    
    setCommands(commands.map(cmd => 
      cmd.id === 1 // Potty Training command ID
        ? { ...cmd, pottyLogs: [...(cmd.pottyLogs || []), newLog] }
        : cmd
    ));
    
    // Reset form
    setShowPottyModal(false);
    setPottyType('pee');
    setPottyLocation('outside');
    setPottyTime('');
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
  const addWeightEntry = () => {
    if (!currentUser || !weightValue || !weightWeek) {
      alert('Please fill in required fields (weight, week number)');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newEntry: WeightEntry = {
      id: Date.now(),
      date: today,
      weight: parseFloat(weightValue),
      unit: weightUnit,
      weekNumber: parseInt(weightWeek),
      loggedBy: currentUser,
      notes: weightNotes || undefined
    };

    setWeightEntries([...weightEntries, newEntry].sort((a, b) => a.weekNumber - b.weekNumber));
    setShowWeightModal(false);
    setWeightValue('');
    setWeightWeek('');
    setWeightNotes('');
  };

  const addToothLog = () => {
    if (!currentUser || !toothType || !toothDate) {
      alert('Please fill in required fields (tooth type, date)');
      return;
    }

    const newLog: ToothLog = {
      id: Date.now(),
      toothType,
      dateNoticed: toothDate,
      notes: toothNotes || undefined,
      loggedBy: currentUser
    };

    setToothLogs([...toothLogs, newLog]);
    setShowToothModal(false);
    setToothType('');
    setToothDate('');
    setToothNotes('');
  };

  const addGroomingLog = () => {
    if (!currentUser || !groomingDate || !groomingDuration) {
      alert('Please fill in required fields (date, duration)');
      return;
    }

    const newLog: GroomingLog = {
      id: Date.now(),
      activity: groomingActivity,
      date: groomingDate,
      duration: groomingDuration,
      tolerance: groomingTolerance,
      notes: groomingNotes || undefined,
      loggedBy: currentUser
    };

    setGroomingLogs([...groomingLogs, newLog]);
    setShowGroomingModal(false);
    setGroomingDate('');
    setGroomingDuration('');
    setGroomingTolerance(5);
    setGroomingNotes('');
  };

  const addFearLog = () => {
    if (!currentUser || !fearTrigger || !fearDate || !fearResponse) {
      alert('Please fill in required fields (trigger, date, response)');
      return;
    }

    const newLog: FearLog = {
      id: Date.now(),
      trigger: fearTrigger,
      date: fearDate,
      intensity: fearIntensity,
      response: fearResponse,
      duration: fearDuration || undefined,
      notes: fearNotes || undefined,
      loggedBy: currentUser
    };

    setFearLogs([...fearLogs, newLog]);
    setShowFearModal(false);
    setFearTrigger('');
    setFearDate('');
    setFearResponse('');
    setFearDuration('');
    setFearNotes('');
  };

  const deleteWeightEntry = (id: number) => {
    if (window.confirm('Are you sure you want to delete this weight entry?')) {
      setWeightEntries(weightEntries.filter(entry => entry.id !== id));
    }
  };

  const deleteToothLog = (id: number) => {
    if (window.confirm('Are you sure you want to delete this tooth log?')) {
      setToothLogs(toothLogs.filter(log => log.id !== id));
    }
  };

  const deleteGroomingLog = (id: number) => {
    if (window.confirm('Are you sure you want to delete this grooming log?')) {
      setGroomingLogs(groomingLogs.filter(log => log.id !== id));
    }
  };

  const deleteFearLog = (id: number) => {
    if (window.confirm('Are you sure you want to delete this fear log?')) {
      setFearLogs(fearLogs.filter(log => log.id !== id));
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Puppy Tracker</h1>
        
        {/* User Info */}
        <UserAuth onLogin={handleLogin} currentUser={currentUser} onLogout={handleLogout} />
        
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
              activeTab === "dashboard"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Home size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab("commands")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
              activeTab === "commands"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Target size={20} />
            <span className="font-medium">Commands</span>
          </button>
          
          <button
            onClick={() => setActiveTab("milestones")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
              activeTab === "milestones"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Trophy size={20} />
            <span className="font-medium">Milestones</span>
          </button>
          
          <button
            onClick={() => setActiveTab("appointments")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
              activeTab === "appointments"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Calendar size={20} />
            <span className="font-medium">Appointments</span>
          </button>
          
          <button
            onClick={() => setActiveTab("physical")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
              activeTab === "physical"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Activity size={20} />
            <span className="font-medium text-sm">Physical Development</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h2>
            
            {/* Growth Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📈 Puppy Growth Timeline</h3>
              
              {/* Adoption countdown - MOVED TO TOP */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-purple-200">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-700 mb-2">Days Until Adoption Day!</p>
                  <p className="text-4xl font-bold text-purple-600">25 days</p>
                  <p className="text-sm text-gray-600 mt-2">November 7th, 2025 🏠</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Week 8 - Adoption Day! 🏠</span>
                    <span className="text-sm bg-purple-200 px-3 py-1 rounded-full">Week 8</span>
                  </div>
                  <p className="text-gray-600 mt-2">Puppy comes home</p>
                </div>

                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Week 10 - First Vaccinations 💉</span>
                    <span className="text-sm bg-blue-200 px-3 py-1 rounded-full">Week 10</span>
                  </div>
                  <p className="text-gray-600 mt-2">Begin vaccination schedule</p>
                </div>

                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Week 12 - Socialization Period 🐕</span>
                    <span className="text-sm bg-green-200 px-3 py-1 rounded-full">Week 12</span>
                  </div>
                  <p className="text-gray-600 mt-2">Critical socialization window</p>
                </div>

                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Week 16 - Basic Training 📚</span>
                    <span className="text-sm bg-yellow-200 px-3 py-1 rounded-full">Week 16</span>
                  </div>
                  <p className="text-gray-600 mt-2">Start formal training</p>
                </div>

                <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Week 20 - Teething Phase 🦷</span>
                    <span className="text-sm bg-orange-200 px-3 py-1 rounded-full">Week 20</span>
                  </div>
                  <p className="text-gray-600 mt-2">Adult teeth coming in</p>
                </div>

                <div className="p-4 bg-pink-50 border-2 border-pink-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Week 26 - 6 Month Milestone 🎉</span>
                    <span className="text-sm bg-pink-200 px-3 py-1 rounded-full">Week 26</span>
                  </div>
                  <p className="text-gray-600 mt-2">Rapid growth phase</p>
                </div>

                <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Week 52 - One Year Old! 🎂</span>
                    <span className="text-sm bg-indigo-200 px-3 py-1 rounded-full">Week 52</span>
                  </div>
                  <p className="text-gray-600 mt-2">Approaching adulthood</p>
                </div>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Training Commands by Age</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Custom Command</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={customCommand}
                  onChange={(e) => setCustomCommand(e.target.value)}
                  placeholder="Enter command name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomCommand()}
                />
                <button
                  onClick={addCustomCommand}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Command
                </button>
              </div>
            </div>

            {/* Week 8-10: Foundation Training */}
            <div className="mb-8">
              <div className="bg-purple-100 p-4 rounded-lg mb-4">
                <h3 className="text-2xl font-bold text-purple-800">Week 8-10: Foundation Training 🐾</h3>
                <p className="text-purple-700 mt-1">Building blocks for a well-behaved puppy</p>
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
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {logCount} log{logCount !== 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() => command.id === 1 ? setShowPottyModal(true) : openPracticeModal(command.id)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
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
                                    <span className="text-xs text-gray-500">{log.date}</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>{log.time}</span>
                                    <span className="text-purple-600">by {log.loggedBy}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : command.practiceLogs && command.practiceLogs.length > 0 ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {command.practiceLogs.map((log) => (
                                <div key={log.id} className="bg-white p-3 rounded border border-purple-200">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-gray-500">{log.date} at {log.time}</span>
                                    <span className="text-xs text-purple-600">by {log.loggedBy}</span>
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
            <div className="mb-8">
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
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {logCount} log{logCount !== 1 ? 's' : ''}
                          </span>
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
                                    <span className="text-xs text-gray-500">{log.date} at {log.time}</span>
                                    <span className="text-xs text-blue-600">by {log.loggedBy}</span>
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
            <div className="mb-8">
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
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {logCount} log{logCount !== 1 ? 's' : ''}
                          </span>
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
                                    <span className="text-xs text-gray-500">{log.date} at {log.time}</span>
                                    <span className="text-xs text-orange-600">by {log.loggedBy}</span>
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
            <div className="mb-8">
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
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {logCount} log{logCount !== 1 ? 's' : ''}
                          </span>
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
                                    <span className="text-xs text-gray-500">{log.date} at {log.time}</span>
                                    <span className="text-xs text-indigo-600">by {log.loggedBy}</span>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Training Milestones</h2>
            
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
                    <div className="flex items-center justify-between p-4">
                      <button
                        onClick={() => toggleMilestoneExpanded(milestone.id)}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        {isExpanded ? (
                          <ChevronDown className="text-gray-500" size={20} />
                        ) : (
                          <ChevronRight className="text-gray-500" size={20} />
                        )}
                        <h3 className="text-lg font-semibold text-gray-800">{milestone.title}</h3>
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
                              <img
                                src={milestone.photo}
                                alt={milestone.title}
                                className="w-full h-64 object-cover rounded-lg"
                              />
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
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Appointments & Reminders</h2>
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <Calendar size={20} />
                Add Appointment
              </button>
            </div>

            {/* Upcoming Appointments */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell className="text-blue-600" size={24} />
                Upcoming Appointments
              </h3>
              <div className="space-y-4">
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
                          onClick={() => deleteWeightEntry(entry.id)}
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
                          onClick={() => deleteToothLog(log.id)}
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
                          onClick={() => deleteGroomingLog(log.id)}
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
                          onClick={() => deleteFearLog(log.id)}
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
            <h3 className="text-xl font-semibold mb-4">Log Potty Break 🚽</h3>
            
            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPottyType('pee')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      pottyType === 'pee'
                        ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-yellow-300'
                    }`}
                  >
                    💧 Pee
                  </button>
                  <button
                    onClick={() => setPottyType('poop')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      pottyType === 'poop'
                        ? 'bg-brown-100 border-amber-700 text-amber-900'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    💩 Poop
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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPottyModal(false);
                  setPottyType('pee');
                  setPottyLocation('outside');
                  setPottyTime('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={logPottyBreak}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Practice Log Modal */}
      {showPracticeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Add Practice Log 📝</h3>
            
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

              {/* Successes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Successes</label>
                <input
                  type="number"
                  min="0"
                  value={practiceSuccesses}
                  onChange={(e) => setPracticeSuccesses(e.target.value)}
                  placeholder="Number of successful attempts"
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
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addPracticeLog}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Log
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
