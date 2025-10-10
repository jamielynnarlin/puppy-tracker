import { useState } from "react";
import { Home, Target, Trophy } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Family Tracker</h1>
        
        <nav className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
            <Home size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg text-gray-600 hover:bg-gray-100">
            <Target size={20} />
            <span className="font-medium">Commands</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg text-gray-600 hover:bg-gray-100">
            <Trophy size={20} />
            <span className="font-medium">Milestones</span>
          </button>
        </nav>
      </div>

      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Welcome to Family Tracker!</h3>
          <p className="text-gray-600">This is your light-themed puppy training app with left navigation.</p>
        </div>
      </div>
    </div>
  );
}
