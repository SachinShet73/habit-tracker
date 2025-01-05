// src/components/HabitGrid.tsx
'use client';

import { useState, useEffect } from 'react';
import { Check, X, Plus, FolderPlus } from 'lucide-react';
import AddHabitForm from './AddHabitForm';
import AddCategoryForm from './AddCategoryForm';

interface Habit {
  _id: string;
  name: string;
  completed: boolean;
  completedAt?: Date;
}

interface Category {
  title: string;
  icon: string;
  habits: Habit[];
}

interface HabitData {
  _id: string;
  categories: {
    [key: string]: Category;
  };
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lastUpdate: Date;
  };
}

export default function HabitGrid() {
  const [habitData, setHabitData] = useState<HabitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/habits', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If no habits found, try to initialize them
        if (response.status === 404) {
          const initResponse = await fetch('http://localhost:5000/api/habits/initialize', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (initResponse.ok) {
            // Fetch habits again after initialization
            const newResponse = await fetch('http://localhost:5000/api/habits', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (newResponse.ok) {
              const data = await newResponse.json();
              setHabitData(data);
              return;
            }
          }
        }
        throw new Error('Failed to fetch habits');
      }

      const data = await response.json();
      setHabitData(data);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setError(error instanceof Error ? error.message : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async ({ categoryId, habitName }: { categoryId: string; habitName: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/habits/category/${categoryId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ habitName })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add habit');
      }

      await fetchHabits();
    } catch (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  };

  const handleAddCategory = async ({ title, icon }: { title: string; icon: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/habits/category', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, icon })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add category');
      }

      await fetchHabits();
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const toggleHabit = async (categoryId: string, habitId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/habits/category/${categoryId}/habit/${habitId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update habit');
      }

      await fetchHabits();
    } catch (error) {
      console.error('Error updating habit:', error);
      alert('Failed to update habit');
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
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setShowAddCategory(true)}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          <FolderPlus size={20} />
          Add Category
        </button>
        <button
          onClick={() => setShowAddHabit(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          <Plus size={20} />
          Add Habit
        </button>
      </div>

      {/* Streak Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Current Streak</h3>
            <p className="text-3xl font-bold text-blue-600">
              {habitData?.streakData?.currentStreak || 0} days
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Longest Streak</h3>
            <p className="text-3xl font-bold text-green-600">
              {habitData?.streakData?.longestStreak || 0} days
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habitData && Object.entries(habitData.categories).map(([categoryId, category]) => (
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

      {/* Modal Forms */}
      {showAddHabit && habitData && (
        <AddHabitForm
          onClose={() => setShowAddHabit(false)}
          onSubmit={handleAddHabit}
          categories={habitData.categories}
        />
      )}

      {showAddCategory && (
        <AddCategoryForm
          onClose={() => setShowAddCategory(false)}
          onSubmit={handleAddCategory}
        />
      )}
    </div>
  );
}