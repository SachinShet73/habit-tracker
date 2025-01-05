// server/src/controllers/settingsController.js
import { User } from '../models/User.js';

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      profile: {
        name: user.name,
        email: user.email,
        timezone: user.settings?.timezone || 'UTC',
        weekStartsOn: user.settings?.weekStartsOn || 'monday'
      },
      notifications: {
        dailyReminder: user.settings?.notifications?.dailyReminder ?? true,
        reminderTime: user.settings?.notifications?.reminderTime || '09:00',
        emailNotifications: user.settings?.notifications?.email ?? true,
        weeklyDigest: user.settings?.notifications?.weeklyDigest ?? true
      },
      appearance: {
        darkMode: user.settings?.theme?.darkMode ?? false,
        colorScheme: user.settings?.theme?.colorScheme || 'blue',
        fontSize: user.settings?.theme?.fontSize || 'medium'
      },
      privacy: {
        shareProgress: user.settings?.privacy?.shareProgress ?? false,
        publicProfile: user.settings?.privacy?.publicProfile ?? false
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(400).json({ message: 'Error fetching settings' });
  }
};

// @desc    Update user settings
// @route   PUT /api/settings/:section
// @access  Private
export const updateSettings = async (req, res) => {
  try {
    const { section } = req.params;
    const updateData = req.body;

    // Validate section
    const validSections = ['profile', 'notifications', 'appearance', 'privacy'];
    if (!validSections.includes(section)) {
      return res.status(400).json({ message: 'Invalid settings section' });
    }

    // Create update object based on section
    let update = {};
    switch (section) {
      case 'profile':
        update = {
          name: updateData.name,
          email: updateData.email,
          'settings.timezone': updateData.timezone,
          'settings.weekStartsOn': updateData.weekStartsOn
        };
        break;
      case 'notifications':
        update = {
          'settings.notifications.dailyReminder': updateData.dailyReminder,
          'settings.notifications.reminderTime': updateData.reminderTime,
          'settings.notifications.email': updateData.emailNotifications,
          'settings.notifications.weeklyDigest': updateData.weeklyDigest
        };
        break;
      case 'privacy':
        update = {
          'settings.privacy.shareProgress': updateData.shareProgress,
          'settings.privacy.publicProfile': updateData.publicProfile
        };
        break;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(400).json({ message: 'Error updating settings' });
  }
};