import React, { useState } from "react";
import { Plus, MapPin } from "lucide-react";

const pottyEntries = [
  { type: "pee", location: "outside", time: "11:32 AM", note: "Good job!" },
  { type: "poop", location: "outside", time: "09:32 AM", note: "" },
  { type: "accident", location: "inside", time: "07:32 AM", note: "Near the door" },
];

export const PottyTracker = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Potty Training Log</h1>
        <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800">
          <Plus className="h-4 w-4" />
          Add Entry
        </button>
      </div>
      
      <div className="space-y-4">
        {pottyEntries.map((entry, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                entry.type === "pee" ? "bg-blue-100 text-blue-800" :
                entry.type === "poop" ? "bg-green-100 text-green-800" :
                "bg-red-100 text-red-800"
              }`}>
                {entry.type}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{entry.location}</span>
              </div>
              {entry.note && (
                <span className="text-gray-500">{entry.note}</span>
              )}
            </div>
            <div className="text-sm text-gray-500">{entry.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
