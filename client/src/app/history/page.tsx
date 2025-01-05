// src/app/history/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HabitHistory from '@/components/HabitHistory';
import HabitHistoricalAnalytics from '@/components/HabitHistoricalAnalytics';
import { Clock, BarChart2 } from 'lucide-react';

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<'history' | 'analytics'>('history');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                Dashboard
              </Link>
              <Link href="/analytics" className="text-gray-500 hover:text-gray-700">
                Analytics
              </Link>
              <Link href="/journal" className="text-gray-500 hover:text-gray-700">
                Journal
              </Link>
              <Link href="/history" className="text-blue-600 font-medium">
                History
              </Link>
            </div>
            <span className="text-gray-700">Welcome, {user.name}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">History & Analytics</h2>
          <p className="text-gray-600">View your past habits and detailed analytics.</p>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex">
            <button
              onClick={() => setView('history')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
                view === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="w-5 h-5" />
              Past Entries
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
                view === 'analytics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart2 className="w-5 h-5" />
              Historical Analytics
            </button>
          </div>
        </div>

        {/* Content */}
        {view === 'history' ? (
          <HabitHistory />
        ) : (
          <HabitHistoricalAnalytics />
        )}
      </main>
    </div>
  );
}