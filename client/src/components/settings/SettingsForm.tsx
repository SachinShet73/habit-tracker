import { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { User, Bell, Lock } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';

export default function SettingsForm() {
  const { loading, error } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow">
      {/* Tab Navigation */}
      <div className="border-b">
        <div className="flex">
          {[
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'privacy', icon: Lock, label: 'Privacy' }
          ].map(({ id, icon: Icon, label }) => (
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
        {activeTab === 'privacy' && <PrivacySettings />}
      </div>
    </div>
  );
}