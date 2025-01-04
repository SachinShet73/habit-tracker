// src/components/AnalyticsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface HabitData {
  _id: string;
  categories: {
    [key: string]: {
      title: string;
      habits: {
        name: string;
        completed: boolean;
        completedAt?: Date;
      }[];
    };
  };
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lastUpdate: Date;
  };
  monthlyView: any[]; // Changed to any[] to handle varying data structures
}

export default function AnalyticsDashboard() {
  const [habitData, setHabitData] = useState<HabitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/habits', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch habits');
      }

      const data = await response.json();
      console.log('Fetched habit data:', data);
      setHabitData(data);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setError(error instanceof Error ? error.message : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const calculateCategoryCompletion = () => {
    if (!habitData?.categories) return [];

    return Object.entries(habitData.categories).map(([id, category]) => {
      const totalHabits = category.habits.length;
      const completedHabits = category.habits.filter(h => h.completed).length;
      const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

      return {
        name: category.title,
        completionRate: Math.round(completionRate),
      };
    });
  };

  const calculateMonthlyProgress = () => {
    // Create default monthly data
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const defaultData = Array.from({ length: daysInMonth }, (_, i) => ({
      date: new Date(today.getFullYear(), today.getMonth(), i + 1).toLocaleDateString(),
      completed: 0
    }));

    // If no habit data or no monthly view, return default data
    if (!habitData?.monthlyView) {
      console.log('No monthly data available, using default');
      return defaultData;
    }

    try {
      // Try to use actual data, fall back to default for any errors
      return habitData.monthlyView.map((day, index) => {
        try {
          return {
            date: defaultData[index].date, // Use the default date format
            completed: day?.completed ? 1 : 0
          };
        } catch (error) {
          console.warn('Error processing day data:', error);
          return defaultData[index];
        }
      });
    } catch (error) {
      console.error('Error processing monthly data:', error);
      return defaultData;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <button 
          onClick={fetchHabits}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Streak Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Current Streak</h3>
          <p className="text-4xl font-bold text-blue-600">
            {habitData?.streakData?.currentStreak || 0} days
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Longest Streak</h3>
          <p className="text-4xl font-bold text-green-600">
            {habitData?.streakData?.longestStreak || 0} days
          </p>
        </div>
      </div>

      {/* Category Completion Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Category Completion Rates</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={calculateCategoryCompletion()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completionRate" fill="#3B82F6" name="Completion Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Progress Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Monthly Progress</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calculateMonthlyProgress()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#10B981" 
                name="Days Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded-lg mt-4">
          <h4 className="font-bold mb-2">Debug Information:</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              monthlyView: habitData?.monthlyView || [],
              processedData: calculateMonthlyProgress()
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}