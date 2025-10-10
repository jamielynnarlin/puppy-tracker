import React, { useState } from 'react';
import { 
  PottyRecord, 
  MealRecord, 
  ExerciseSession, 
  TrainingSession,
  generateId,
  savePottyRecord,
  saveMealRecord,
  saveExerciseSession,
  saveTrainingSession
} from '../utils/dataManager';

interface QuickAddProps {
  onActivityAdded: () => void;
}

type ActivityType = 'potty' | 'meal' | 'exercise' | 'training';

const QuickAdd: React.FC<QuickAddProps> = ({ onActivityAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeType, setActiveType] = useState<ActivityType | null>(null);
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseData = {
      id: generateId(),
      date: new Date(),
      ...formData
    };

    switch (activeType) {
      case 'potty':
        const pottyRecord: PottyRecord = {
          ...baseData,
          type: formData.type || 'pee',
          location: formData.location || 'outside',
          success: formData.success ?? true,
          notes: formData.notes || ''
        };
        savePottyRecord(pottyRecord);
        break;

      case 'meal':
        const mealRecord: MealRecord = {
          ...baseData,
          mealType: formData.mealType || 'breakfast',
          foodBrand: formData.foodBrand || '',
          amount: Number(formData.amount) || 0,
          finished: formData.finished ?? true,
          notes: formData.notes || ''
        };
        saveMealRecord(mealRecord);
        break;

      case 'exercise':
        const exerciseSession: ExerciseSession = {
          ...baseData,
          type: formData.type || 'walk',
          duration: Number(formData.duration) || 0,
          intensity: formData.intensity || 'medium',
          location: formData.location || '',
          notes: formData.notes || ''
        };
        saveExerciseSession(exerciseSession);
        break;

      case 'training':
        const trainingSession: TrainingSession = {
          ...baseData,
          type: formData.type || 'commands',
          command: formData.command || '',
          success: formData.success ?? true,
          duration: Number(formData.duration) || 0,
          notes: formData.notes || '',
          location: formData.location || 'home',
          treats: Number(formData.treats) || 0
        };
        saveTrainingSession(trainingSession);
        break;
    }

    // Reset form
    setFormData({});
    setActiveType(null);
    setIsOpen(false);
    onActivityAdded();
  };

  const renderPottyForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">🚽 Log Potty Break</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <select
          value={formData.type || 'pee'}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="pee">Pee</option>
          <option value="poop">Poop</option>
          <option value="accident">Accident</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <select
          value={formData.location || 'outside'}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="outside">Outside</option>
          <option value="inside">Inside</option>
          <option value="crate">Crate</option>
          <option value="designated-spot">Designated Spot</option>
        </select>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.success ?? true}
            onChange={(e) => setFormData({ ...formData, success: e.target.checked })}
            className="mr-2"
          />
          Success
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          rows={2}
          placeholder="Any observations..."
        />
      </div>
    </div>
  );

  const renderMealForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">🍽️ Log Meal</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
        <select
          value={formData.mealType || 'breakfast'}
          onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="treat">Treat</option>
          <option value="training-treat">Training Treat</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Food Brand</label>
        <input
          type="text"
          value={formData.foodBrand || ''}
          onChange={(e) => setFormData({ ...formData, foodBrand: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="e.g., Blue Buffalo Puppy"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount (cups)</label>
        <input
          type="number"
          step="0.25"
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="0.5"
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.finished ?? true}
            onChange={(e) => setFormData({ ...formData, finished: e.target.checked })}
            className="mr-2"
          />
          Finished all food
        </label>
      </div>
    </div>
  );

  const renderExerciseForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">🏃‍♂️ Log Exercise</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <select
          value={formData.type || 'walk'}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="walk">Walk</option>
          <option value="play">Play</option>
          <option value="training">Training</option>
          <option value="free-play">Free Play</option>
          <option value="mental-stimulation">Mental Stimulation</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
        <input
          type="number"
          value={formData.duration || ''}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="15"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
        <select
          value={formData.intensity || 'medium'}
          onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <input
          type="text"
          value={formData.location || ''}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="e.g., backyard, park"
        />
      </div>
    </div>
  );

  const renderTrainingForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">🎓 Log Training</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <select
          value={formData.type || 'commands'}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="commands">Commands</option>
          <option value="potty">Potty Training</option>
          <option value="socialization">Socialization</option>
          <option value="leash">Leash Training</option>
          <option value="crate">Crate Training</option>
          <option value="cat-introduction">Cat Introduction</option>
        </select>
      </div>

      {formData.type === 'commands' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Command</label>
          <input
            type="text"
            value={formData.command || ''}
            onChange={(e) => setFormData({ ...formData, command: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., sit, stay, come"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
        <input
          type="number"
          value={formData.duration || ''}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="10"
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.success ?? true}
            onChange={(e) => setFormData({ ...formData, success: e.target.checked })}
            className="mr-2"
          />
          Successful session
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Treats used</label>
        <input
          type="number"
          value={formData.treats || ''}
          onChange={(e) => setFormData({ ...formData, treats: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="5"
        />
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center text-2xl z-50"
      >
        ➕
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {!activeType ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Quick Add Activity</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveType('potty')}
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-2">🚽</div>
                  <div className="text-sm font-medium">Potty</div>
                </button>
                <button
                  onClick={() => setActiveType('meal')}
                  className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-2">🍽️</div>
                  <div className="text-sm font-medium">Meal</div>
                </button>
                <button
                  onClick={() => setActiveType('exercise')}
                  className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-2">🏃‍♂️</div>
                  <div className="text-sm font-medium">Exercise</div>
                </button>
                <button
                  onClick={() => setActiveType('training')}
                  className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-2">🎓</div>
                  <div className="text-sm font-medium">Training</div>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {activeType === 'potty' && renderPottyForm()}
              {activeType === 'meal' && renderMealForm()}
              {activeType === 'exercise' && renderExerciseForm()}
              {activeType === 'training' && renderTrainingForm()}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveType(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ← Back
                </button>
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setActiveType(null);
                      setFormData({});
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickAdd;