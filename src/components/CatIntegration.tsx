import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CatInteraction,
  SafetyChecklist,
  SafetyItem,
  generateId,
  saveCatInteraction,
  loadCatInteractions,
  getCatIntegrationStage
} from '../utils/dataManager';

interface CatIntegrationProps {
  onUpdate?: () => void;
}

const CatIntegration: React.FC<CatIntegrationProps> = ({ onUpdate }) => {
  const [interactions, setInteractions] = useState<CatInteraction[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [integrationStage, setIntegrationStage] = useState<string>('Not Started');
  const [formData, setFormData] = useState({
    type: 'visual' as CatInteraction['type'],
    duration: '',
    catReaction: 'calm' as CatInteraction['catReaction'],
    puppyReaction: 'calm' as CatInteraction['puppyReaction'],
    supervised: true,
    success: true,
    notes: '',
    nextSteps: ''
  });

  // Safety checklist for cat-dog integration
  const [safetyChecklist] = useState<SafetyItem[]>([
    {
      id: '1',
      description: 'Create separate safe spaces for cat and puppy',
      completed: false,
      priority: 'critical'
    },
    {
      id: '2',
      description: 'Install baby gates to control access between areas',
      completed: false,
      priority: 'high'
    },
    {
      id: '3',
      description: 'Set up elevated perches/hiding spots for cat',
      completed: false,
      priority: 'critical'
    },
    {
      id: '4',
      description: 'Keep cat food and litter box in puppy-free zone',
      completed: false,
      priority: 'critical'
    },
    {
      id: '5',
      description: 'Prepare calming aids (pheromones, etc.) for both pets',
      completed: false,
      priority: 'medium'
    },
    {
      id: '6',
      description: 'Plan gradual introduction schedule',
      completed: false,
      priority: 'high'
    },
    {
      id: '7',
      description: 'Have treats ready for positive reinforcement',
      completed: false,
      priority: 'medium'
    },
    {
      id: '8',
      description: 'Ensure cat has quick escape routes in all rooms',
      completed: false,
      priority: 'high'
    }
  ]);

  const [psPrompt, setPsPrompt] = useState('');
  const [psOutput, setPsOutput] = useState('');
  const [psLoading, setPsLoading] = useState(false);
  const [psError, setPsError] = useState('');

  useEffect(() => {
    const loadedInteractions = loadCatInteractions();
    setInteractions(loadedInteractions);
    setIntegrationStage(getCatIntegrationStage(loadedInteractions));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newInteraction: CatInteraction = {
      id: generateId(),
      date: new Date(),
      type: formData.type,
      duration: Number(formData.duration),
      catReaction: formData.catReaction,
      puppyReaction: formData.puppyReaction,
      supervised: formData.supervised,
      success: formData.success,
      notes: formData.notes,
      nextSteps: formData.nextSteps
    };

    saveCatInteraction(newInteraction);
    
    const updatedInteractions = [...interactions, newInteraction];
    setInteractions(updatedInteractions);
    setIntegrationStage(getCatIntegrationStage(updatedInteractions));
    
    setFormData({
      type: 'visual',
      duration: '',
      catReaction: 'calm',
      puppyReaction: 'calm',
      supervised: true,
      success: true,
      notes: '',
      nextSteps: ''
    });
    setShowAddForm(false);
    onUpdate?.();
  };

  const handleRunPowerShell = async () => {
    setPsLoading(true);
    setPsError('');
    setPsOutput('');
    try {
      const response = await axios.post('http://localhost:5000/run-script', { script: psPrompt });
      setPsOutput(response.data.output);
    } catch (err) {
      setPsError(err.response?.data?.error || err.message);
    } finally {
      setPsLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Integrated': return 'bg-green-100 text-green-800 border-green-200';
      case 'Progressing Well': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Making Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Needs Attention': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReactionEmoji = (reaction: string) => {
    const emojis = {
      calm: '😌',
      curious: '🤔',
      nervous: '😰',
      aggressive: '😤',
      hiding: '🙈',
      playful: '😸',
      excited: '🤩',
      gentle: '😊',
      overwhelming: '😵',
      fearful: '😨'
    };
    return emojis[reaction as keyof typeof emojis] || '😐';
  };

  const getIntegrationTips = (stage: string) => {
    switch (stage) {
      case 'Not Started':
        return [
          'Start with scent introduction - let them smell each other\'s bedding',
          'Feed them on opposite sides of a closed door',
          'Keep initial visual contact brief and positive'
        ];
      case 'Making Progress':
        return [
          'Continue supervised meetings with barriers',
          'Reward calm behavior with treats',
          'Gradually increase interaction time'
        ];
      case 'Progressing Well':
        return [
          'Try parallel activities (eating, playing) in same room',
          'Allow controlled free interaction under supervision',
          'Watch for stress signals in both pets'
        ];
      case 'Integrated':
        return [
          'Maintain separate resources (food, beds, toys)',
          'Continue monitoring for any regression',
          'Celebrate this milestone! 🎉'
        ];
      default:
        return [
          'Take a step back to previous successful interaction level',
          'Consider consulting with a pet behaviorist',
          'Ensure both pets have adequate space and resources'
        ];
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🐱🐕 Cat-Dog Integration Tracker
        </h1>
        <p className="text-gray-600">
          Safely introducing your 4-year-old cat to your new bernedoodle puppy
        </p>
      </div>

      {/* Current Stage */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Integration Stage</h2>
        <div className={`inline-block px-4 py-2 rounded-full border text-lg font-medium ${getStageColor(integrationStage)}`}>
          {integrationStage}
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium text-gray-900 mb-2">Next Steps:</h3>
          <ul className="space-y-1">
            {getIntegrationTips(integrationStage).map((tip, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Safety Checklist */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Safety Preparation Checklist</h2>
        <div className="space-y-3">
          {safetyChecklist.map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => {
                  // Handle checkbox change
                }}
                className="h-4 w-4 text-blue-600"
              />
              <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {item.description}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {item.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Interactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Interactions</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            + Log Interaction
          </button>
        </div>

        {interactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No interactions logged yet.</p>
            <p className="text-sm mt-2">Start by logging your first supervised meeting!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interactions.slice(-5).reverse().map((interaction) => (
              <div key={interaction.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium capitalize">{interaction.type.replace('-', ' ')}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      interaction.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {interaction.success ? 'Successful' : 'Challenging'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(interaction.date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Cat Reaction:</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <span>{getReactionEmoji(interaction.catReaction)}</span>
                      <span className="text-sm capitalize">{interaction.catReaction}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Puppy Reaction:</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <span>{getReactionEmoji(interaction.puppyReaction)}</span>
                      <span className="text-sm capitalize">{interaction.puppyReaction}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <div className="mb-1">
                    <strong>Duration:</strong> {interaction.duration} minutes
                    {interaction.supervised && <span className="ml-2 text-green-600">• Supervised</span>}
                  </div>
                  {interaction.notes && (
                    <div><strong>Notes:</strong> {interaction.notes}</div>
                  )}
                  {interaction.nextSteps && (
                    <div className="mt-2 text-blue-600">
                      <strong>Next Steps:</strong> {interaction.nextSteps}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Interaction Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Log Cat-Dog Interaction</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interaction Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CatInteraction['type'] })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="visual">Visual Contact</option>
                    <option value="scent-introduction">Scent Introduction</option>
                    <option value="supervised-meeting">Supervised Meeting</option>
                    <option value="free-interaction">Free Interaction</option>
                    <option value="incident">Incident/Conflict</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="5"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cat's Reaction</label>
                    <select
                      value={formData.catReaction}
                      onChange={(e) => setFormData({ ...formData, catReaction: e.target.value as CatInteraction['catReaction'] })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="calm">Calm</option>
                      <option value="curious">Curious</option>
                      <option value="nervous">Nervous</option>
                      <option value="aggressive">Aggressive</option>
                      <option value="hiding">Hiding</option>
                      <option value="playful">Playful</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Puppy's Reaction</label>
                    <select
                      value={formData.puppyReaction}
                      onChange={(e) => setFormData({ ...formData, puppyReaction: e.target.value as CatInteraction['puppyReaction'] })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="calm">Calm</option>
                      <option value="excited">Excited</option>
                      <option value="gentle">Gentle</option>
                      <option value="overwhelming">Overwhelming</option>
                      <option value="fearful">Fearful</option>
                      <option value="playful">Playful</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.supervised}
                      onChange={(e) => setFormData({ ...formData, supervised: e.target.checked })}
                      className="mr-2"
                    />
                    Was this interaction supervised?
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.success}
                      onChange={(e) => setFormData({ ...formData, success: e.target.checked })}
                      className="mr-2"
                    />
                    Was this interaction successful?
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Describe what happened, body language, any concerns..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Next Steps</label>
                  <textarea
                    value={formData.nextSteps}
                    onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="What should you try next time?"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Save Interaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PowerShell Prompt Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Run PowerShell Script</h2>
        <div className="flex flex-col space-y-3">
          <input
            type="text"
            value={psPrompt}
            onChange={e => setPsPrompt(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
            placeholder="Enter PowerShell command..."
          />
          <button
            onClick={handleRunPowerShell}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            disabled={psLoading || !psPrompt}
          >
            {psLoading ? 'Running...' : 'Run Script'}
          </button>
          {psError && <div className="text-red-600">Error: {psError}</div>}
          {psOutput && (
            <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap mt-2">{psOutput}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatIntegration;