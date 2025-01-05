// src/components/settings/ProfileSettings.tsx
'use client';

import { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';

export default function ProfileSettings() {
  const { settings, updateSettings } = useSettings();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings('profile', settings.profile);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={settings.profile.name}
          onChange={(e) => 
            updateSettings('profile', { ...settings.profile, name: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={settings.profile.email}
          onChange={(e) => 
            updateSettings('profile', { ...settings.profile, email: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Timezone</label>
        <select
          value={settings.profile.timezone}
          onChange={(e) => 
            updateSettings('profile', { ...settings.profile, timezone: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {Intl.supportedValuesOf('timeZone').map((zone) => (
            <option key={zone} value={zone}>{zone}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Week Starts On</label>
        <select
          value={settings.profile.weekStartsOn}
          onChange={(e) => 
            updateSettings('profile', { 
              ...settings.profile, 
              weekStartsOn: e.target.value as 'monday' | 'sunday' 
            })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="monday">Monday</option>
          <option value="sunday">Sunday</option>
        </select>
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