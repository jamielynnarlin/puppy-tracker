import React from "react";
import { Plus, Check, Star, ChevronDown } from "lucide-react";

const milestones = [
  {
    id: 1,
    title: "First Successful Potty Outside",
    description: "Puppy goes potty outside for the first time",
    category: "potty",
    ageWeeks: "8 weeks",
    completed: true,
    completedDate: "9/13/2025",
    starred: true
  },
  {
    id: 2,
    title: "Responds to Name",
    description: "Consistently looks when name is called",
    category: "commands",
    ageWeeks: "9 weeks",
    completed: true,
    completedDate: "9/15/2025",
    starred: false
  },
  {
    id: 3,
    title: "Sits on Command",
    description: "Sits reliably when asked",
    category: "commands",
    ageWeeks: "10 weeks",
    completed: false,
    completedDate: null,
    starred: true
  }
];

export const MilestoneTracker = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Milestones</h1>
          <p className="text-gray-600">2 of 6 completed</p>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800">
          Add Milestone
        </button>
      </div>
      
      <div className="space-y-4">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {milestone.completed ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`text-lg font-semibold ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {milestone.title}
                  </h3>
                  {milestone.starred && (
                    <Star className="h-4 w-4 text-red-400 fill-current" />
                  )}
                </div>
                
                <p className="text-gray-600 mb-3">{milestone.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className={`px-2 py-1 rounded-full font-medium ${
                    milestone.category === "potty" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                  }`}>
                    {milestone.category}
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>{milestone.ageWeeks}</span>
                  </div>
                  
                  {milestone.completed && milestone.completedDate && (
                    <div className="text-gray-500">
                      Completed {milestone.completedDate}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
