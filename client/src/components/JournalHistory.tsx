// src/components/JournalHistory.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Star, AlertTriangle, Smile, Meh, Frown } from 'lucide-react';

interface JournalEntry {
  _id: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  reflection: string;
  habitNotes: Array<{
    habitId: string;
    habitName: string;
    note: string;
  }>;
  highlights: string[];
  improvementAreas: string[];
}

export default function JournalHistory() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJournalEntries();
  }, [selectedDate]);

  const fetchJournalEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      const response = await fetch(
        `http://localhost:5000/api/journal?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch journal entries');
      }

      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
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

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'great':
      case 'good':
        return <Smile className="w-6 h-6 text-green-500" />;
      case 'okay':
        return <Meh className="w-6 h-6 text-yellow-500" />;
      case 'bad':
      case 'terrible':
        return <Frown className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

      {/* Journal Entries */}
      {entries.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No journal entries found for this month.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <div key={entry._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium">
                    {new Date(entry.date).toLocaleDateString(undefined, { 
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  {getMoodIcon(entry.mood)}
                </div>
              </div>

              {/* Reflection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Daily Reflection</h4>
                <p className="text-gray-700">{entry.reflection}</p>
              </div>

              {/* Highlights */}
              {entry.highlights.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Highlights
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {entry.highlights.map((highlight, index) => (
                      <li key={index} className="text-gray-700">{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {entry.improvementAreas.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Areas for Improvement
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {entry.improvementAreas.map((area, index) => (
                      <li key={index} className="text-gray-700">{area}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}