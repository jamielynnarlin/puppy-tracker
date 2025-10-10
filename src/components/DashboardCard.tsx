import React from "react";

export const DashboardCard = ({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon: React.ReactNode }) => (
  <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="text-gray-400">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-500">{subtitle}</div>
  </div>
);
