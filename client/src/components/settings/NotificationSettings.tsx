// src/components/settings/NotificationSettings.tsx
'use client';

import { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Bell, Mail, Clock } from 'lucide-react';

export default function NotificationSettings() {
  const { settings, updateSettings } = useSettings();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings('notifications', settings.notifications);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Daily Reminder */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="font-medium">Daily Reminder</h3>
              <p className="text-sm text-gray-500">Get reminded to check your habits</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.dailyReminder}
              onChange={(e) => 
                updateSettings('notifications', {
                  ...settings.notifications,
                  dailyReminder: e.target.checked
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {settings.notifications.dailyReminder && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Reminder Time</label>
            <input
              type="time"
              value={settings.notifications.reminderTime}
              onChange={(e) =>
                updateSettings('notifications', {
                  ...settings.notifications,
                  reminderTime: e.target.value
                })
              }
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Email Notifications */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) =>
                updateSettings('notifications', {
                  ...settings.notifications,
                  emailNotifications: e.target.checked
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {settings.notifications.emailNotifications && (
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.notifications.weeklyDigest}
                onChange={(e) =>
                  updateSettings('notifications', {
                    ...settings.notifications,
                    weeklyDigest: e.target.checked
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Weekly Progress Digest</span>
            </label>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}