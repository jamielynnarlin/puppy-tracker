import React, { useMemo } from 'react';
import { format, isToday, isFuture, differenceInDays } from 'date-fns';
import { TimelineEvent, PuppyProfile, calculatePuppyAgeInWeeks } from '../types';

interface TimelineProps {
  events: TimelineEvent[];
  puppyProfile: PuppyProfile | null;
  onEventClick?: (event: TimelineEvent) => void;
}

interface TimelineDay {
  date: Date;
  events: TimelineEvent[];
  puppyAgeWeeks: number;
  isToday: boolean;
  isFuture: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ events, puppyProfile, onEventClick }) => {
  const timelineData = useMemo(() => {
    if (!puppyProfile) return [];

    // Get date range from puppy arrival to 6 months ahead
    const startDate = new Date(puppyProfile.arrivalDate);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);

    // Group events by date
    const eventsByDate = new Map<string, TimelineEvent[]>();
    events.forEach(event => {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey)!.push(event);
    });

    // Create timeline days
    const timelineDays: TimelineDay[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const dayEvents = eventsByDate.get(dateKey) || [];
      
      timelineDays.push({
        date: new Date(currentDate),
        events: dayEvents,
        puppyAgeWeeks: calculatePuppyAgeInWeeks(new Date(puppyProfile.birthDate), currentDate),
        isToday: isToday(currentDate),
        isFuture: isFuture(currentDate)
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return timelineDays.reverse(); // Most recent first
  }, [events, puppyProfile]);

  const getEventIcon = (type: string) => {
    const icons = {
      milestone: '🎯',
      training: '🎓',
      health: '⚕️',
      meal: '🍽️',
      exercise: '🏃‍♂️',
      'cat-interaction': '🐱',
      photo: '📸'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getEventColor = (type: string) => {
    const colors = {
      milestone: 'bg-purple-100 border-purple-300',
      training: 'bg-blue-100 border-blue-300',
      health: 'bg-red-100 border-red-300',
      meal: 'bg-green-100 border-green-300',
      exercise: 'bg-orange-100 border-orange-300',
      'cat-interaction': 'bg-pink-100 border-pink-300',
      photo: 'bg-yellow-100 border-yellow-300'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 border-gray-300';
  };

  const getImportanceIndicator = (importance: string) => {
    switch (importance) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '';
    }
  };

  if (!puppyProfile) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Puppy Tracker!</h3>
          <p className="text-gray-600">Create your puppy's profile to start tracking their journey.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {puppyProfile.name}'s Journey
        </h1>
        <p className="text-gray-600">
          {puppyProfile.breed} • {calculatePuppyAgeInWeeks(new Date(puppyProfile.birthDate))} weeks old
        </p>
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <p className="text-sm text-gray-700">
            🏠 Home since: {format(new Date(puppyProfile.arrivalDate), 'MMM dd, yyyy')} 
            ({differenceInDays(new Date(), new Date(puppyProfile.arrivalDate))} days)
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {timelineData.map((day, index) => (
          <div key={format(day.date, 'yyyy-MM-dd')} className="relative flex items-start mb-6">
            {/* Date marker */}
            <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-sm font-medium ${
              day.isToday 
                ? 'bg-blue-500 text-white' 
                : day.isFuture 
                ? 'bg-gray-100 text-gray-400'
                : 'bg-white border-2 border-gray-200 text-gray-700'
            }`}>
              <div className="text-center">
                <div className="text-xs">{format(day.date, 'MMM')}</div>
                <div className="font-bold">{format(day.date, 'd')}</div>
              </div>
            </div>

            {/* Events for this day */}
            <div className="ml-6 flex-1">
              {day.events.length > 0 ? (
                <div className="space-y-3">
                  {day.events.map((event, eventIndex) => (
                    <div
                      key={`${event.id}-${eventIndex}`}
                      className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${getEventColor(event.type)}`}
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{getEventIcon(event.type)}</span>
                          <div>
                            <h3 className="font-medium text-gray-900 flex items-center">
                              {event.title}
                              {getImportanceIndicator(event.importance) && (
                                <span className="ml-2">{getImportanceIndicator(event.importance)}</span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                              <span>📅 {format(new Date(event.date), 'h:mm a')}</span>
                              <span>🗓️ Week {day.puppyAgeWeeks}</span>
                              <span className="capitalize">📊 {event.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty day
                <div className="py-2">
                  <div className="text-sm text-gray-400 italic">
                    {day.isFuture ? 'Future' : 'No activities logged'}
                  </div>
                  {day.isToday && (
                    <div className="mt-2 text-sm text-blue-600 font-medium">
                      🌟 Today - Week {day.puppyAgeWeeks}
                    </div>
                  )}
                </div>
              )}

              {/* Week milestone indicators */}
              {day.puppyAgeWeeks % 2 === 0 && day.puppyAgeWeeks >= 8 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800">
                    🎂 {day.puppyAgeWeeks} Week Milestone
                  </div>
                  <div className="text-xs text-yellow-700 mt-1">
                    Check for new developmental milestones and training opportunities
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Timeline end */}
        <div className="relative flex items-center">
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-2xl">🐕</span>
          </div>
          <div className="ml-6">
            <div className="text-sm text-gray-500 italic">Beginning of journey...</div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{events.length}</div>
          <div className="text-sm text-blue-800">Total Events</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {events.filter(e => e.type === 'milestone').length}
          </div>
          <div className="text-sm text-green-800">Milestones</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {calculatePuppyAgeInWeeks(new Date(puppyProfile.birthDate))}
          </div>
          <div className="text-sm text-purple-800">Weeks Old</div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;