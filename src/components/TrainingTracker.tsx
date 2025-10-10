import React from 'react';

const getMonthDays = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const TrainingTracker: React.FC = () => {
  const today = new Date();
  const [viewDate, setViewDate] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get first and last day of month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Build 7x6 grid (weeks)
  const calendarGrid: (Date | null)[][] = [];
  let week: (Date | null)[] = [];
  let dayCount = 1;
  for (let i = 0; i < 42; i++) { // 6 weeks x 7 days
    if (i < startDay || dayCount > daysInMonth) {
      week.push(null);
    } else {
      week.push(new Date(year, month, dayCount));
      dayCount++;
    }
    if (week.length === 7) {
      calendarGrid.push(week);
      week = [];
    }
  }

  // Navigation handlers
  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">📋 Training Tracker</h2>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="px-2 py-1 rounded hover:bg-gray-200">◀</button>
          <h3 className="text-lg font-bold">{monthName} {year}</h3>
          <button onClick={nextMonth} className="px-2 py-1 rounded hover:bg-gray-200">▶</button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600">{day}</div>
          ))}
        </div>
        <div className="grid grid-rows-6 grid-cols-7 gap-2">
          {calendarGrid.flat().map((date, idx) =>
            date ? (
              <div
                key={date.toISOString()}
                className={`flex items-center justify-center h-10 w-10 rounded-full border text-sm font-medium ${date.toDateString() === today.toDateString() ? 'bg-blue-500 text-white border-blue-700' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
              >
                {date.getDate()}
              </div>
            ) : (
              <div key={idx} />
            )
          )}
        </div>
      </div>
      {/* Add more interactive training features here */}
    </div>
  );
};

export default TrainingTracker;
