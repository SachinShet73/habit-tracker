// src/context/SettingsContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface UserSettings {
  profile: {
    name: string;
    email: string;
    timezone: string;
    weekStartsOn: 'monday' | 'sunday';
  };
  notifications: {
    dailyReminder: boolean;
    reminderTime: string;
    emailNotifications: boolean;
    weeklyDigest: boolean;
  };
  privacy: {
    shareProgress: boolean;
    publicProfile: boolean;
  };
}

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (section: keyof UserSettings, values: any) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: '',
      email: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      weekStartsOn: 'monday'
    },
    notifications: {
      dailyReminder: true,
      reminderTime: '09:00',
      emailNotifications: true,
      weeklyDigest: true
    },
    privacy: {
      shareProgress: false,
      publicProfile: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (section: keyof UserSettings, values: any) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/settings/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setSettings(prev => ({
        ...prev,
        [section]: values
      }));
    } catch (error) {
      console.error('Error updating settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to update settings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}