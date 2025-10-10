import React from "react";
import { Plus, Calendar, MapPin } from "lucide-react";

const appointments = [
  {
    id: 1,
    title: "Puppy Vaccination - Round 2",
    type: "vaccination",
    status: "upcoming",
    date: "9/20/2025",
    time: "10:30 AM",
    location: "Happy Paws Veterinary Clinic",
    notes: "Bring vaccination record"
  },
  {
    id: 2,
    title: "First Grooming Session",
    type: "grooming",
    status: "upcoming",
    date: "9/23/2025",
    time: "2:00 PM",
    location: "Pampered Paws Grooming",
    notes: ""
  }
];

export const AppointmentScheduler = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">3 upcoming this week</p>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800">
          <Plus className="h-4 w-4" />
          Add Appointment
        </button>
      </div>
      
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{appointment.title}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.type === "vaccination" ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"
                  }`}>
                    {appointment.type}
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {appointment.status}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{appointment.date} at {appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{appointment.location}</span>
                  </div>
                </div>
                
                {appointment.notes && (
                  <p className="text-sm text-gray-500">{appointment.notes}</p>
                )}
              </div>
              
              <div className="flex gap-2 ml-4">
                <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  Complete
                </button>
                <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
