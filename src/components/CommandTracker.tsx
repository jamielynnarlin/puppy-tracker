import React from "react";
import { Plus, Star } from "lucide-react";

const commands = [
  { name: "Sit", level: "basic", progress: 85, attempts: "17/20", lastPracticed: "9/18/2025 at 12:33 PM" },
  { name: "Stay", level: "basic", progress: 60, attempts: "9/15", lastPracticed: "9/18/2025 at 11:33 AM" },
  { name: "Come", level: "intermediate", progress: 40, attempts: "4/10", lastPracticed: "9/1/2025 at 01:13 PM" },
  { name: "Down", level: "basic", progress: 75, attempts: "9/12", lastPracticed: "" },
];

export const CommandTracker = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Command Training</h1>
        <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800">
          <Plus className="h-4 w-4" />
          Log Session
        </button>
      </div>
      
      <div className="space-y-6">
        {commands.map((command, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{command.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    command.level === "basic" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {command.level}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{command.attempts} attempts</div>
                <div className="text-lg font-bold text-gray-900">{command.progress}%</div>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-1">Success Rate</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${command.progress}%` }}
                ></div>
              </div>
            </div>
            
            {command.lastPracticed && (
              <div className="text-sm text-gray-500">
                Last practiced: {command.lastPracticed}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
