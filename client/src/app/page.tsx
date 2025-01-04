// src/app/page.tsx
'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Habit Tracker</h1>
        <p className="text-xl text-gray-600 mb-8">Build better habits, achieve your goals.</p>
        
        <div className="space-x-4">
          <Link 
            href="/login"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-block bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}