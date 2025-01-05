// src/app/journal/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import JournalEntry from '@/components/JournalEntry';
import JournalHistory from '@/components/JournalHistory';
import { Edit, History } from 'lucide-react';

export default function JournalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<'write' | 'history'>('write');

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
              <Link href="/journal" className="text-blue-600 font-medium">
                Journal
              </Link>
              <Link href="/history" className="text-gray-500 hover:text-gray-700">
                History
              </Link>
            </div>
            <span className="text-gray-700">Welcome, {user.name}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Daily Journal</h2>
            <p className="text-gray-600">Reflect on your day and track your progress.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('write')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                view === 'write'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Edit className="w-4 h-4" />
              Write
            </button>
            <button
              onClick={() => setView('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                view === 'history'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>
        </div>

        {view === 'write' ? <JournalEntry /> : <JournalHistory />}
      </main>
    </div>
  );
}