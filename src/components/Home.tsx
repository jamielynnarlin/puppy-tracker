import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col items-center py-8 space-y-6">
        <div className="mb-6">
          <div className="bg-black rounded-full w-16 h-16 flex items-center justify-center mb-2">
            <span className="text-white text-3xl">🐾</span>
          </div>
        </div>
        <nav className="w-full space-y-2">
          <button className="w-full text-left px-6 py-2 rounded hover:bg-gray-100 font-medium">Dashboard</button>
          <button className="w-full text-left px-6 py-2 rounded hover:bg-gray-100 font-medium">Training</button>
          <button className="w-full text-left px-6 py-2 rounded hover:bg-gray-100 font-medium">Milestones</button>
          <button className="w-full text-left px-6 py-2 rounded hover:bg-gray-100 font-medium">Journal</button>
          <button className="w-full text-left px-6 py-2 rounded hover:bg-gray-100 font-medium">Cat Integration</button>
        </nav>
        <div className="w-full px-6 space-y-2 mt-8">
          <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 font-semibold">+ Log Training Session</button>
          <button className="w-full bg-blue-100 text-blue-700 py-2 rounded hover:bg-blue-200 font-semibold">+ Add Milestone</button>
          <button className="w-full bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 font-semibold">+ Upload Photo</button>
        </div>
      </aside>
      {/* Main Dashboard */}
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Hi Dave! Here's [Puppy's Name]'s progress today.</h1>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 border rounded-full flex items-center justify-center">
              {/* Profile image placeholder */}
            </div>
            <span className="font-medium">Profile</span>
          </div>
        </div>
        {/* Progress Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="border rounded-lg p-6 flex flex-col items-center">
            <div className="font-semibold mb-2">POTTY PROGRESS</div>
            <div className="text-3xl font-bold mb-1">60%</div>
            <div className="text-gray-500">Complete</div>
          </div>
          <div className="border rounded-lg p-6 flex flex-col items-center">
            <div className="font-semibold mb-2">COMMANDS PROGRESS</div>
            <div className="text-3xl font-bold mb-1">4/10</div>
            <div className="text-gray-500">Mastered</div>
          </div>
          <div className="border rounded-lg p-6 flex flex-col items-center">
            <div className="font-semibold mb-2">UPCOMING GOALS</div>
            <div className="bg-gray-100 w-full h-16 rounded mb-1"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="border rounded-lg p-6 flex flex-col items-center">
            <div className="font-semibold mb-2">LEASH PROGRESS</div>
            <div className="text-xl font-bold mb-1">In Progress</div>
          </div>
          <div className="border rounded-lg p-6 flex flex-col items-center">
            <div className="font-semibold mb-2">CAT INTEGRATION PROGRESS</div>
            <div className="text-2xl font-bold mb-1">3/5</div>
            <div className="text-gray-500">Steps Completed</div>
          </div>
          <div className="border rounded-lg p-6 flex flex-col items-center">
            <div className="font-semibold mb-2">PHOTOS & TIPS OF THE DAY</div>
            <div className="bg-gray-100 w-full h-16 rounded mb-1"></div>
          </div>
        </div>
        {/* Recent Activity Feed */}
        <div className="mt-8">
          <div className="font-bold text-lg mb-4">RECENT ACTIVITY FEED</div>
          <div className="space-y-2">
            <div className="bg-gray-100 h-6 rounded w-full"></div>
            <div className="bg-gray-100 h-6 rounded w-full"></div>
            <div className="bg-gray-100 h-6 rounded w-full"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
