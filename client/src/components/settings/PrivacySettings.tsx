// src/components/settings/PrivacySettings.tsx
'use client';

import { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Globe, Lock, Eye, Users } from 'lucide-react';

export default function PrivacySettings() {
  const { settings, updateSettings } = useSettings();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings('privacy', settings.privacy);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Visibility */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="font-medium">Public Profile</h3>
              <p className="text-sm text-gray-500">Make your profile visible to others</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.privacy.publicProfile}
              onChange={(e) =>
                updateSettings('privacy', {
                  ...settings.privacy,
                  publicProfile: e.target.checked
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Progress Sharing */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="font-medium">Share Progress</h3>
              <p className="text-sm text-gray-500">Allow others to see your habit progress</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.privacy.shareProgress}
              onChange={(e) =>
                updateSettings('privacy', {
                  ...settings.privacy,
                  shareProgress: e.target.checked
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Data Usage */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-500" />
            <h3 className="font-medium">Data Usage & Privacy</h3>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                Store essential data for app functionality
              </span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.privacy.shareProgress}
                onChange={(e) =>
                  updateSettings('privacy', {
                    ...settings.privacy,
                    shareProgress: e.target.checked
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                Use data for personalized insights
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Policy Link */}
      <div className="text-sm text-gray-500">
        <p>
          Read our{' '}
          <a href="/privacy-policy" className="text-blue-500 hover:text-blue-600">
            Privacy Policy
          </a>{' '}
          to learn more about how we protect your data.
        </p>
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