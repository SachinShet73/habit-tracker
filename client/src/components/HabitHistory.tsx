// src/components/HabitHistory.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface Habit {
  name: string;
  completed: boolean;
  completedAt?: Date;
}

interface Category {
  title: string;
  habits: Habit[];
}

interface HabitDataForDay {
  date: Date;
  categories: {
    [key: string]: Category;
  };
  streakData: {
    currentStreak: number;
    longestStreak: number;
  };
}

export default function HabitHistory() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [historyData, setHistoryData] = useState<HabitDataForDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoryData();
  }, [selectedDate]);

  const fetchHistoryData = async () => {
    try {
      const token = localStorage.getItem('token');
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      const response = await fetch(
        `http://localhost:5000/api/habits/history?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      
      // Transform data into array format if it's not already
      const processedData = Array.isArray(data) ? data : [data];
      console.log('Processed history data:', processedData);
      
      setHistoryData(processedData);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const calculateCompletionRate = (habits: Habit[]) => {
    if (!habits.length) return 0;
    const completed = habits.filter(h => h.completed).length;
    return Math.round((completed / habits.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!historyData.length) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium text-gray-500">No history data available for this period.</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* History Grid */}
      <div className="grid gap-6">
        {historyData.map((day, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {new Date(day.date).toLocaleDateString()}
              </h3>
              <span className="text-sm text-gray-500">
                Streak: {day.streakData.currentStreak} days
              </span>
            </div>

            <div className="space-y-4">
              {Object.entries(day.categories).map(([categoryId, category]) => (
                <div key={categoryId} className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{category.title}</h4>
                    <span className="text-sm text-gray-500">
                      {calculateCompletionRate(category.habits)}% Complete
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {category.habits.map((habit, habitIndex) => (
                      <div
                        key={habitIndex}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span>{habit.name}</span>
                        <span className={habit.completed ? 'text-green-500' : 'text-red-500'}>
                          {habit.completed ? 'Completed' : 'Not Completed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}