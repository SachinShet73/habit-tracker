// src/components/JournalEntry.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Smile, Frown, Meh, Star, AlertTriangle, Save } from 'lucide-react';

interface HabitNote {
  habitId: string;
  habitName: string;
  note: string;
}

interface JournalEntry {
  _id?: string;
  date: Date;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  reflection: string;
  habitNotes: HabitNote[];
  highlights: string[];
  improvementAreas: string[];
}

export default function JournalEntry() {
  const [entry, setEntry] = useState<JournalEntry>({
    date: new Date(),
    mood: 'okay',
    reflection: '',
    habitNotes: [],
    highlights: [''],
    improvementAreas: ['']
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchTodayEntry();
  }, []);

  const fetchTodayEntry = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/journal/${new Date().toISOString().split('T')[0]}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEntry(data);
      }
    } catch (error) {
      console.error('Error fetching journal entry:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaved(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/journal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        throw new Error('Failed to save journal entry');
      }

      const savedEntry = await response.json();
      setEntry(savedEntry);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving journal:', error);
      setError(error instanceof Error ? error.message : 'Failed to save journal');
    } finally {
      setLoading(false);
    }
  };

  const addHighlight = () => {
    setEntry(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const addImprovementArea = () => {
    setEntry(prev => ({
      ...prev,
      improvementAreas: [...prev.improvementAreas, '']
    }));
  };

  const updateHighlight = (index: number, value: string) => {
    setEntry(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? value : h)
    }));
  };

  const updateImprovementArea = (index: number, value: string) => {
    setEntry(prev => ({
      ...prev,
      improvementAreas: prev.improvementAreas.map((a, i) => i === index ? value : a)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Daily Journal
      </h2>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-green-50 text-green-500 p-4 rounded-md mb-4">
          Journal entry saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How are you feeling today?
          </label>
          <div className="flex gap-4">
            {['terrible', 'bad', 'okay', 'good', 'great'].map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => setEntry(prev => ({ ...prev, mood: mood as any }))}
                className={`p-2 rounded-full ${
                  entry.mood === mood
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                } hover:bg-blue-50 transition-colors`}
              >
                {mood === 'great' && <Smile className="w-6 h-6" />}
                {mood === 'good' && <Smile className="w-6 h-6" />}
                {mood === 'okay' && <Meh className="w-6 h-6" />}
                {mood === 'bad' && <Frown className="w-6 h-6" />}
                {mood === 'terrible' && <Frown className="w-6 h-6" />}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Reflection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Daily Reflection
          </label>
          <textarea
            value={entry.reflection}
            onChange={(e) => setEntry(prev => ({ ...prev, reflection: e.target.value }))}
            className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Write your thoughts about today..."
            required
          />
        </div>

        {/* Highlights */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Today's Highlights
          </label>
          {entry.highlights.map((highlight, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={highlight}
                onChange={(e) => updateHighlight(index, e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="What went well today?"
              />
              {index === entry.highlights.length - 1 && (
                <button
                  type="button"
                  onClick={addHighlight}
                  className="p-2 text-blue-500 hover:text-blue-600"
                >
                  <Star className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Areas for Improvement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Areas for Improvement
          </label>
          {entry.improvementAreas.map((area, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={area}
                onChange={(e) => updateImprovementArea(index, e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="What could be improved?"
              />
              {index === entry.improvementAreas.length - 1 && (
                <button
                  type="button"
                  onClick={addImprovementArea}
                  className="p-2 text-yellow-500 hover:text-yellow-600"
                >
                  <AlertTriangle className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Saving...' : 'Save Journal Entry'}
        </button>
      </form>
    </div>
  );
}