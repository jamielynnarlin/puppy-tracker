import { useState } from "react";
import { User, LogOut } from "lucide-react";

interface UserAuthProps {
  onLogin: (username: string) => void;
  currentUser: string | null;
  onLogout: () => void;
}

const USERS = [
  { id: 1, name: "User 1", color: "bg-blue-500" },
  { id: 2, name: "User 2", color: "bg-green-500" },
  { id: 3, name: "User 3", color: "bg-purple-500" },
  { id: 4, name: "User 4", color: "bg-orange-500" },
];

export default function UserAuth({ onLogin, currentUser, onLogout }: UserAuthProps) {
  const [customName, setCustomName] = useState("");
  const [editingUser, setEditingUser] = useState<number | null>(null);

  const handleUserClick = (userName: string) => {
    onLogin(userName);
  };

  const handleCustomNameSave = (userId: number) => {
    if (customName.trim()) {
      const userIndex = USERS.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        USERS[userIndex].name = customName.trim();
        setCustomName("");
        setEditingUser(null);
      }
    }
  };

  if (currentUser) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
        <User className="text-blue-600" size={20} />
        <span className="font-medium text-gray-800">Logged in as: {currentUser}</span>
        <button
          onClick={onLogout}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-blue-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Puppy Tracker</h1>
          <p className="text-gray-600">Select your user to continue</p>
        </div>

        <div className="space-y-3">
          {USERS.map((user) => (
            <div key={user.id} className="relative">
              {editingUser === user.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomNameSave(user.id)}
                  />
                  <button
                    onClick={() => handleCustomNameSave(user.id)}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setCustomName("");
                    }}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleUserClick(user.name)}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all ${user.color} bg-opacity-10`}
                >
                  <div className={`w-10 h-10 ${user.color} rounded-full flex items-center justify-center text-white font-bold`}>
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-800">{user.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingUser(user.id);
                      setCustomName(user.name);
                    }}
                    className="ml-auto text-gray-400 hover:text-blue-600 text-sm"
                  >
                    Edit name
                  </button>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          All users share the same puppy training data
        </div>
      </div>
    </div>
  );
}
