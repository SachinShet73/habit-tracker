// src/components/HabitHistoricalAnalytics.tsx
'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, TrendingUp, Award } from 'lucide-react';

interface AnalyticsData {
  categoryStats: {
    category: string;
    completionRate: number;
    totalHabits: number;
    streakData: {
      bestStreak: number;
      averageStreak: number;
    };
  }[];
  dailyStats: {
    date: string;
    completionRate: number;
    totalCompleted: number;
  }[];
  habitStats: {
    habitName: string;
    completionRate: number;
    streak: number;
  }[];
}

export default function HabitHistoricalAnalytics() {
  const [startDate, setStartDate] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [startDate]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const endDate = new Date();
      const response = await fetch(
        `http://localhost:5000/api/habits/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Time Period Selection */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">View data from:</label>
          <select
            value={startDate.toISOString().split('T')[0]}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="border rounded-md px-3 py-2"
          >
            <option value={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}>
              Last 7 days
            </option>
            <option value={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}>
              Last 30 days
            </option>
            <option value={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}>
              Last 90 days
            </option>
          </select>
        </div>
      </div>

      {/* Daily Progress Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Completion Rates</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#3B82F6" 
                name="Completion Rate %" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.categoryStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completionRate" fill="#10B981" name="Completion Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best Performing Habits */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Habits</h3>
        <div className="space-y-4">
          {analyticsData.habitStats
            .sort((a, b) => b.completionRate - a.completionRate)
            .slice(0, 5)
            .map((habit, index) => (
              <div key={habit.habitName} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-500">{index + 1}</span>
                  <span>{habit.habitName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {habit.completionRate}% completion
                  </span>
                  <span className="text-sm text-blue-500">
                    {habit.streak} day streak
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}