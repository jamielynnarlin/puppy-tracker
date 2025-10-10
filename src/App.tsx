import { useState, useEffect } from "react";
import { Home, Target, Trophy, Award, Camera, Calendar, Clock } from "lucide-react";
import UserAuth from "./components/UserAuth";

interface Command {
  id: number;
  name: string;
  practiced: boolean;
  lastPracticed?: string;
  practicedBy?: string;
}

interface Milestone {
  id: number;
  title: string;
  completed: boolean;
  photo: string | null;
  completedDate?: string;
  completedBy?: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [commands, setCommands] = useState<Command[]>([
    { id: 1, name: "Sit", practiced: false },
    { id: 2, name: "Stay", practiced: false },
    { id: 3, name: "Come", practiced: false },
    { id: 4, name: "Down", practiced: false },
    { id: 5, name: "Heel", practiced: false },
    { id: 6, name: "Roll Over", practiced: false },
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

  // Load user session
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  // Load data from localStorage
  useEffect(() => {
    const savedCommands = localStorage.getItem("puppyCommands");
    const savedMilestones = localStorage.getItem("puppyMilestones");
    
    if (savedCommands) {
      setCommands(JSON.parse(savedCommands));
    }
    if (savedMilestones) {
      setMilestones(JSON.parse(savedMilestones));
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
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h2>
            
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
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Training Commands</h2>
            
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commands.map((command) => (
                <div
                  key={command.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    command.practiced
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{command.name}</h3>
                    {command.practiced && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  
                  {command.lastPracticed && (
                    <div className="text-sm text-gray-600 mb-3">
                      <p>Last practiced: {command.lastPracticed}</p>
                      {command.practicedBy && <p className="text-blue-600">by {command.practicedBy}</p>}
                    </div>
                  )}
                  
                  {!command.practiced && (
                    <button
                      onClick={() => practiceCommand(command.id)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark as Practiced
                    </button>
                  )}
                  
                  {command.practiced && (
                    <div className="text-green-600 font-medium">
                      Practiced! ✨
                      {command.practicedBy && <span className="text-sm text-gray-600"> by {command.practicedBy}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "milestones" && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Training Milestones</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    milestone.completed
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{milestone.title}</h3>
                    {milestone.completed && (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white">✓</span>
                      </div>
                    )}
                  </div>

                  {milestone.completedDate && (
                    <div className="text-sm text-gray-600 mb-3">
                      <p>Completed: {milestone.completedDate}</p>
                      {milestone.completedBy && <p className="text-blue-600">by {milestone.completedBy}</p>}
                    </div>
                  )}

                  {milestone.photo && (
                    <div className="mb-4">
                      <img
                        src={milestone.photo}
                        alt={milestone.title}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    {!milestone.completed && (
                      <button
                        onClick={() => completeMilestone(milestone.id)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}

                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, milestone.id)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <Camera size={18} />
                        {milestone.photo ? "Change Photo" : "Add Photo"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
