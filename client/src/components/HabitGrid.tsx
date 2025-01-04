// src/components/HabitGrid.tsx
'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface Habit {
  _id: string;
  name: string;
  completed: boolean;
  completedAt?: Date;
}

interface Category {
  _id: string;
  title: string;
  icon: string;
  habits: Habit[];
}

interface HabitData {
  _id: string;
  userId: string;
  categories: {
    [key: string]: Category;
  };
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lastUpdate: Date;
  };
  monthlyView: any[];
  createdAt: Date;
  updatedAt: Date;
}

export default function HabitGrid() {
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
        if (response.status === 404) {
          await initializeHabits();
          return;
        }
        throw new Error('Failed to fetch habits');
      }

      const data = await response.json();
      if (!data) {
        throw new Error('No data received');
      }
      console.log('Fetched habits:', data);
      setHabitData(data);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setError(error instanceof Error ? error.message : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const initializeHabits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/habits/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to initialize habits');
      }

      const data = await response.json();
      console.log('Initialized habits:', data);
      setHabitData(data);
    } catch (error) {
      console.error('Error initializing habits:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize habits');
    }
  };

  const toggleHabit = async (categoryId: string, habitId: number) => {
    if (!habitData) return;

    try {
      // Optimistic update
      const updatedData = { ...habitData };
      const category = updatedData.categories[categoryId];
      if (category && category.habits[habitId]) {
        category.habits[habitId].completed = !category.habits[habitId].completed;
        category.habits[habitId].completedAt = category.habits[habitId].completed ? new Date() : undefined;
        setHabitData(updatedData);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/habits/category/${categoryId}/habit/${habitId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // Revert optimistic update if request fails
        await fetchHabits();
        throw new Error('Failed to update habit');
      }

      const data = await response.json();
      console.log('Updated habit data:', data);
      setHabitData(data);
    } catch (error) {
      console.error('Error updating habit:', error);
      alert(error instanceof Error ? error.message : 'Failed to update habit');
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

  if (!habitData || !habitData.categories) {
    return (
      <div className="text-center p-4">
        <p>No habits found.</p>
        <button 
          onClick={initializeHabits}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Initialize Habits
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Streak Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Current Streak</h3>
            <p className="text-3xl font-bold text-blue-600">
              {habitData.streakData?.currentStreak || 0} days
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Longest Streak</h3>
            <p className="text-3xl font-bold text-green-600">
              {habitData.streakData?.longestStreak || 0} days
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(habitData.categories).map(([categoryId, category]) => (
          <div key={categoryId} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">{category.title}</h3>
            <div className="space-y-3">
              {category.habits.map((habit, index) => (
                <div
                  key={habit._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span>{habit.name}</span>
                  <button
                    onClick={() => toggleHabit(categoryId, index)}
                    className={`p-2 rounded-full ${
                      habit.completed
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {habit.completed ? <Check size={20} /> : <X size={20} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}