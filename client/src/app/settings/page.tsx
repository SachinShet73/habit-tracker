// src/app/settings/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AccountSettings from '@/components/settings/AccountSettings';
import { User, Bell, Palette, Shield } from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'theme' | 'account';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

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

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'theme' as const, label: 'Theme', icon: Palette },
    { id: 'account' as const, label: 'Account', icon: Shield },
  ];

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
              <Link href="/history" className="text-gray-500 hover:text-gray-700">
                History
              </Link>
              <Link href="/settings" className="text-blue-600 font-medium">
                Settings
              </Link>
            </div>
            <span className="text-gray-700">Welcome, {user.name}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-gray-600">Manage your preferences and account settings.</p>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 ${
                    activeTab === id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="p-6">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'account' && <AccountSettings />}
          </div>
        </div>
      </main>
    </div>
  );
}