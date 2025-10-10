import React, { useState, useEffect } from 'react';
import { 
  PuppyProfile, 
  TrainingSession,
  generateId,
  saveTrainingSession,
  loadTrainingSessions
} from '../utils/dataManager';

interface TrainingProgram {
  id: string;
  title: string;
  category: 'basics' | 'tricks' | 'behavior' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  description: string;
  steps: TrainingStep[];
  videoUrl?: string;
  completed: boolean;
  progress: number; // 0-100
}

interface TrainingStep {
  id: string;
  title: string;
  instruction: string;
  tips: string[];
  commonMistakes: string[];
  completed: boolean;
}

interface DogoTrainingProps {
  puppyProfile: PuppyProfile | null;
  onProgressUpdate?: () => void;
}

const DogoTraining: React.FC<DogoTrainingProps> = ({ puppyProfile, onProgressUpdate }) => {
  const [activeTab, setActiveTab] = useState<'programs' | 'progress' | 'tools' | 'feedback'>('programs');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basics' | 'tricks' | 'behavior' | 'advanced'>('all');
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [showClicker, setShowClicker] = useState(false);
  const [showWhistle, setShowWhistle] = useState(false);

  // Comprehensive training programs
  const [trainingPrograms] = useState<TrainingProgram[]>([
    // PUPPY BASICS
    {
      id: 'potty-training',
      title: 'Potty Training Mastery',
      category: 'basics',
      difficulty: 'beginner',
      estimatedTime: 15,
      description: 'Master house training with proven techniques that work for bernedoodles',
      steps: [
        {
          id: 'step1',
          title: 'Establish a Schedule',
          instruction: 'Take your puppy outside every 2 hours and immediately after meals, naps, and play',
          tips: ['Use the same door each time', 'Stay with them until they go', 'Use a consistent verbal cue like "go potty"'],
          commonMistakes: ['Inconsistent timing', 'Not supervising', 'Punishing accidents'],
          completed: false
        },
        {
          id: 'step2',
          title: 'Reward Success',
          instruction: 'Immediately praise and treat when they go potty outside',
          tips: ['Praise while they\'re going', 'Use high-value treats', 'Make it a celebration'],
          commonMistakes: ['Waiting too long to reward', 'Insufficient enthusiasm', 'Forgetting treats'],
          completed: false
        }
      ],
      completed: false,
      progress: 0
    },
    {
      id: 'crate-training',
      title: 'Crate Training Comfort',
      category: 'basics',
      difficulty: 'beginner',
      estimatedTime: 20,
      description: 'Create a safe haven that your bernedoodle loves',
      steps: [
        {
          id: 'step1',
          title: 'Make the Crate Inviting',
          instruction: 'Add comfortable bedding, favorite toys, and feed meals inside',
          tips: ['Leave door open initially', 'Place in family area', 'Never use as punishment'],
          commonMistakes: ['Forcing them in', 'Using it only for timeouts', 'Making it uncomfortable'],
          completed: false
        }
      ],
      completed: false,
      progress: 0
    },
    
    // BASIC COMMANDS
    {
      id: 'sit-command',
      title: 'Perfect Sit Command',
      category: 'basics',
      difficulty: 'beginner',
      estimatedTime: 10,
      description: 'The foundation command that every dog should know',
      steps: [
        {
          id: 'step1',
          title: 'Lure into Position',
          instruction: 'Hold treat above nose, slowly move up and back over head',
          tips: ['Keep treat close to nose', 'Move slowly', 'Say "sit" once as they sit'],
          commonMistakes: ['Holding treat too high', 'Repeating command', 'Not timing the reward'],
          completed: false
        }
      ],
      completed: false,
      progress: 0
    },
    
    // TRICKS
    {
      id: 'spin-trick',
      title: 'Spin Like a Pro',
      category: 'tricks',
      difficulty: 'intermediate',
      estimatedTime: 15,
      description: 'Teach your bernedoodle to spin on command - great for mental stimulation',
      steps: [
        {
          id: 'step1',
          title: 'Lure the Spin',
          instruction: 'Use treat to guide your dog in a complete circle',
          tips: ['Start with small movements', 'Keep treat at nose level', 'Practice both directions'],
          commonMistakes: ['Moving too fast', 'Treat too high/low', 'Only practicing one direction'],
          completed: false
        }
      ],
      completed: false,
      progress: 0
    },
    
    // BEHAVIOR SOLUTIONS
    {
      id: 'leash-pulling',
      title: 'Stop Leash Pulling',
      category: 'behavior',
      difficulty: 'intermediate',
      estimatedTime: 25,
      description: 'Transform walks into enjoyable experiences for both of you',
      steps: [
        {
          id: 'step1',
          title: 'Stop When They Pull',
          instruction: 'Immediately stop moving forward when leash becomes tight',
          tips: ['Be consistent every time', 'Wait for slack before moving', 'Reward loose leash walking'],
          commonMistakes: ['Inconsistent stopping', 'Pulling back', 'Not rewarding good behavior'],
          completed: false
        }
      ],
      completed: false,
      progress: 0
    },
    
    // CAT INTEGRATION SPECIFIC
    {
      id: 'cat-introduction',
      title: 'Safe Cat Introduction',
      category: 'behavior',
      difficulty: 'advanced',
      estimatedTime: 30,
      description: 'Specialized program for introducing your bernedoodle to your 4-year-old cat',
      steps: [
        {
          id: 'step1',
          title: 'Calm Greetings',
          instruction: 'Teach your puppy to remain calm when seeing the cat',
          tips: ['Start with distance', 'Reward calm behavior', 'Keep sessions short'],
          commonMistakes: ['Allowing excitement', 'Forcing interactions', 'Sessions too long'],
          completed: false
        }
      ],
      completed: false,
      progress: 0
    }
  ]);

  useEffect(() => {
    const sessions = loadTrainingSessions();
    setTrainingSessions(sessions);
  }, []);

  const getCategoryIcon = (category: string) => {
    const icons = {
      basics: '🎯',
      tricks: '✨',
      behavior: '🔧',
      advanced: '🏆'
    };
    return icons[category as keyof typeof icons] || '📚';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredPrograms = selectedCategory === 'all' 
    ? trainingPrograms 
    : trainingPrograms.filter(p => p.category === selectedCategory);

  const playClickerSound = () => {
    // In a real app, you'd play an actual sound file
    console.log('🔔 CLICK!');
  };

  const playWhistleSound = () => {
    // In a real app, you'd play an actual sound file
    console.log('🎵 WHISTLE!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🐕 Dogo Training Program</h1>
            <p className="text-blue-100 text-lg">
              Expert-designed training that takes the guesswork out of raising your bernedoodle
            </p>
            <div className="flex items-center mt-4 space-x-4">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                🏆 Apple's "Ones to Watch"
              </span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                🥇 App of the Year
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">100+</div>
            <div className="text-blue-100">Training Programs</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'programs', label: 'Training Programs', icon: '📚' },
          { id: 'progress', label: 'Progress Tracker', icon: '📊' },
          { id: 'tools', label: 'Interactive Tools', icon: '🛠️' },
          { id: 'feedback', label: 'Trainer Feedback', icon: '👨‍🏫' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Training Programs Tab */}
      {activeTab === 'programs' && (
        <div>
          {/* Category Filter */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {[
              { id: 'all', label: 'All Programs', icon: '📋' },
              { id: 'basics', label: 'Puppy Basics', icon: '🎯' },
              { id: 'tricks', label: 'Fun Tricks', icon: '✨' },
              { id: 'behavior', label: 'Behavior Fix', icon: '🔧' },
              { id: 'advanced', label: 'Advanced', icon: '🏆' }
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedProgram(program)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getCategoryIcon(program.category)}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(program.difficulty)}`}>
                        {program.difficulty}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{program.estimatedTime} min</span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{program.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{program.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{program.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${program.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {program.steps.length} steps
                    </span>
                    {program.completed && (
                      <span className="text-green-500 text-sm font-medium">✓ Completed</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Tools Tab */}
      {activeTab === 'tools' && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactive Training Tools</h2>
            <p className="text-gray-600">Built-in clicker and whistle for precise training sessions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Clicker Tool */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Training Clicker</h3>
              <p className="text-gray-600 mb-6">
                Mark exact moments of good behavior with precise timing
              </p>
              <button
                onClick={() => {
                  playClickerSound();
                  setShowClicker(true);
                  setTimeout(() => setShowClicker(false), 200);
                }}
                className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
                  showClicker 
                    ? 'bg-green-500 scale-95' 
                    : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
                }`}
              >
                {showClicker ? 'CLICKED!' : 'CLICK'}
              </button>
              <div className="mt-4 text-sm text-gray-500">
                <p>💡 <strong>Tip:</strong> Click the moment your dog does the right behavior</p>
              </div>
            </div>

            {/* Whistle Tool */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Training Whistle</h3>
              <p className="text-gray-600 mb-6">
                Get your dog's attention from a distance during training
              </p>
              <button
                onClick={() => {
                  playWhistleSound();
                  setShowWhistle(true);
                  setTimeout(() => setShowWhistle(false), 500);
                }}
                className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
                  showWhistle 
                    ? 'bg-yellow-500 scale-95' 
                    : 'bg-purple-500 hover:bg-purple-600 active:scale-95'
                }`}
              >
                {showWhistle ? 'WHISTLING!' : 'WHISTLE'}
              </button>
              <div className="mt-4 text-sm text-gray-500">
                <p>💡 <strong>Tip:</strong> Use for recall training and getting attention</p>
              </div>
            </div>
          </div>

          {/* Training Timer */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Training Session Timer</h3>
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">05:00</div>
                <p className="text-gray-600">Recommended session length for puppies</p>
              </div>
              <div className="flex space-x-4">
                <button className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600">
                  Start Session
                </button>
                <button className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Tracker Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Training Progress Overview</h2>
            <p className="text-gray-600">Monitor your bernedoodle's learning journey and celebrate milestones</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
              <div className="text-gray-600">Programs Completed</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">24</div>
              <div className="text-gray-600">Training Hours</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">7</div>
              <div className="text-gray-600">Week Streak</div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements 🏆</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-medium text-gray-900">Mastered "Sit" Command</div>
                  <div className="text-sm text-gray-600">Completed 2 days ago</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-2xl">🏠</span>
                <div>
                  <div className="font-medium text-gray-900">3 Days Accident-Free</div>
                  <div className="text-sm text-gray-600">Potty training progress</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-2xl">🐱</span>
                <div>
                  <div className="font-medium text-gray-900">Peaceful Cat Interaction</div>
                  <div className="text-sm text-gray-600">10 minutes supervised play</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trainer Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Trainer Feedback</h2>
            <p className="text-gray-600">Submit videos and get personalized advice from certified trainers</p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Submit Training Video</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📹</div>
              <p className="text-gray-600 mb-4">
                Upload a video of your training session to get expert feedback
              </p>
              <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
                Choose Video File
              </button>
            </div>
          </div>

          {/* Previous Feedback */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Feedback</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">ST</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">Sarah Thompson, Certified Trainer</span>
                      <span className="text-sm text-gray-500">2 days ago</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-gray-700">
                        Great progress on the 'sit' command! I noticed your timing with the treats could be improved. 
                        Try giving the treat the moment their bottom touches the ground, not after they're already sitting.
                      </p>
                    </div>
                    <div className="text-sm text-blue-600">
                      📹 Video: "Sit Command Practice Session"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expert Tips */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Expert Tips for Bernedoodles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Energy Management</h4>
                <p className="text-sm text-gray-600">
                  Bernedoodles need mental stimulation as much as physical exercise. 
                  Puzzle toys and training sessions help tire them out effectively.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Socialization Window</h4>
                <p className="text-sm text-gray-600">
                  The critical socialization period ends around 16 weeks. 
                  Introduce your puppy to various experiences safely during this time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProgram.title}</h2>
                  <p className="text-gray-600 mt-2">{selectedProgram.description}</p>
                </div>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {selectedProgram.steps.map((step, index) => (
                  <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {index + 1}
                      </div>
                      <h3 className="font-bold text-gray-900">{step.title}</h3>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{step.instruction}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-800 mb-2">💡 Pro Tips</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {step.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-red-800 mb-2">⚠️ Avoid These</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {step.commonMistakes.map((mistake, mistakeIndex) => (
                            <li key={mistakeIndex} className="flex items-start">
                              <span className="text-red-500 mr-2">•</span>
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Start Training Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DogoTraining;