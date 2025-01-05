// server/src/controllers/habitController.js
import { Habit } from '../models/Habit.js';

// @desc    Create initial habits for user
// @route   POST /api/habits/initialize
// @access  Private
export const initializeHabits = async (req, res) => {
  try {
    // Check if user already has habits
    const existingHabits = await Habit.findOne({ userId: req.user._id });
    if (existingHabits) {
      return res.status(400).json({ message: 'Habits already initialized for this user' });
    }

    // Default habit categories
    const defaultCategories = new Map([
      ['physical', {
        title: 'Physical Health',
        icon: 'dumbbell',
        habits: [
          { name: 'Exercise', completed: false },
          { name: 'Sleep 8 hours', completed: false },
          { name: 'Drink water', completed: false }
        ]
      }],
      ['mental', {
        title: 'Mental Health',
        icon: 'brain',
        habits: [
          { name: 'Meditation', completed: false },
          { name: 'Reading', completed: false },
          { name: 'Journaling', completed: false }
        ]
      }]
    ]);

    // Create initial monthly view array for current month
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const monthlyView = Array.from({ length: daysInMonth }, (_, index) => ({
      date: new Date(today.getFullYear(), today.getMonth(), index + 1),
      completed: false
    }));

    const habit = await Habit.create({
      userId: req.user._id,
      categories: defaultCategories,
      streakData: {
        currentStreak: 0,
        longestStreak: 0,
        lastUpdate: new Date()
      },
      monthlyView
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error('Initialize habits error:', error);
    res.status(400).json({ message: 'Error initializing habits', error: error.message });
  }
};

// @desc    Get user's habits
// @route   GET /api/habits
// @access  Private
export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.findOne({ userId: req.user._id });
    if (!habits) {
      return res.status(404).json({ message: 'No habits found' });
    }
    res.json(habits);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(400).json({ message: 'Error fetching habits', error: error.message });
  }
};

// Add to server/src/controllers/habitController.js

// @desc    Get habit history
// @route   GET /api/habits/history
// @access  Private
export const getHabitHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Find the user's habits document
    const habits = await Habit.findOne({ userId: req.user._id });
    
    if (!habits) {
      return res.json([]);
    }

    // Create daily entries for the date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dailyEntries = [];

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      dailyEntries.push({
        date: new Date(d),
        categories: habits.categories,
        streakData: {
          currentStreak: habits.streakData.currentStreak,
          longestStreak: habits.streakData.longestStreak
        }
      });
    }

    res.json(dailyEntries);
  } catch (error) {
    console.error('Get habit history error:', error);
    res.status(400).json({ message: 'Error fetching habit history', error: error.message });
  }
};

// @desc    Get habit analytics
// @route   GET /api/habits/analytics
// @access  Private
export const getHabitAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const habits = await Habit.find({
      userId: req.user._id,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });

    // Calculate analytics
    const analytics = {
      categoryStats: [],
      dailyStats: [],
      habitStats: []
    };

    // Process habits data to generate statistics
    // This is a simplified version - you can expand based on your needs
    habits.forEach(habit => {
      // Process categories
      Object.entries(habit.categories).forEach(([categoryId, category]) => {
        const completedHabits = category.habits.filter(h => h.completed).length;
        const totalHabits = category.habits.length;
        
        analytics.categoryStats.push({
          category: category.title,
          completionRate: (completedHabits / totalHabits) * 100,
          totalHabits,
          streakData: {
            bestStreak: habit.streakData.longestStreak,
            averageStreak: habit.streakData.currentStreak
          }
        });
      });
    });

    res.json(analytics);
  } catch (error) {
    console.error('Get habit analytics error:', error);
    res.status(400).json({ message: 'Error fetching habit analytics', error: error.message });
  }
};

// @desc    Update habit completion status
// @route   PUT /api/habits/category/:categoryId/habit/:habitId
// @access  Private
export const updateHabitStatus = async (req, res) => {
  try {
    const { categoryId, habitId } = req.params;
    const habit = await Habit.findOne({ userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habits not found' });
    }

    // Get the category from categories Map
    const category = habit.categories.get(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if habit exists at the specified index
    if (!category.habits[parseInt(habitId)]) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Toggle completion and add timestamp
    category.habits[parseInt(habitId)].completed = !category.habits[parseInt(habitId)].completed;
    category.habits[parseInt(habitId)].completedAt = category.habits[parseInt(habitId)].completed ? new Date() : null;

    // Set the modified category back in the Map
    habit.categories.set(categoryId, category);

    // Check for streak update
    const allHabitsCompleted = Array.from(habit.categories.values()).every(cat => 
      cat.habits.every(h => h.completed)
    );

    if (allHabitsCompleted) {
      habit.streakData.currentStreak += 1;
      habit.streakData.longestStreak = Math.max(
        habit.streakData.longestStreak,
        habit.streakData.currentStreak
      );
      habit.streakData.lastUpdate = new Date();

      // Update monthly view
      const today = new Date();
      const todayIndex = today.getDate() - 1;

      // Ensure monthlyView array is initialized for current month
      if (!habit.monthlyView[todayIndex]) {
        const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        habit.monthlyView[todayIndex] = {
          date: currentDate,
          completed: true
        };
      } else {
        habit.monthlyView[todayIndex].completed = true;
      }
    }

    // Save all changes
    const updatedHabit = await habit.save();
    res.json(updatedHabit);

  } catch (error) {
    console.error('Update habit error:', error);
    res.status(400).json({ message: 'Error updating habit', error: error.message });
  }
};

// @desc    Add new habit to category
// @route   POST /api/habits/category/:categoryId
// @access  Private
export const addHabit = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { habitName } = req.body;

    if (!habitName) {
      return res.status(400).json({ message: 'Habit name is required' });
    }

    const habit = await Habit.findOne({ userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: 'Habits not found' });
    }

    const category = habit.categories.get(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Add new habit
    category.habits.push({
      name: habitName,
      completed: false,
      completedAt: null
    });

    // Update the category in the Map
    habit.categories.set(categoryId, category);

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (error) {
    console.error('Add habit error:', error);
    res.status(400).json({ message: 'Error adding habit', error: error.message });
  }
};

// @desc    Delete habit
// @route   DELETE /api/habits/category/:categoryId/habit/:habitId
// @access  Private
export const deleteHabit = async (req, res) => {
  try {
    const { categoryId, habitId } = req.params;
    const habit = await Habit.findOne({ userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habits not found' });
    }

    const category = habit.categories.get(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Remove habit at specified index
    category.habits.splice(parseInt(habitId), 1);

    // Update category in the Map
    habit.categories.set(categoryId, category);

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(400).json({ message: 'Error deleting habit', error: error.message });
  }
};

// @desc    Add new category
// @route   POST /api/habits/category
// @access  Private
export const addCategory = async (req, res) => {
  try {
    const { title, icon } = req.body;

    if (!title || !icon) {
      return res.status(400).json({ message: 'Title and icon are required' });
    }

    const habit = await Habit.findOne({ userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: 'Habits not found' });
    }

    // Generate a unique category ID
    const categoryId = title.toLowerCase().replace(/\s+/g, '_');

    // Check if category already exists
    if (habit.categories.has(categoryId)) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Add new category
    habit.categories.set(categoryId, {
      title,
      icon,
      habits: []
    });

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (error) {
    console.error('Add category error:', error);
    res.status(400).json({ message: 'Error adding category', error: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/habits/category/:categoryId
// @access  Private
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const habit = await Habit.findOne({ userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habits not found' });
    }

    // Remove category from Map
    if (!habit.categories.delete(categoryId)) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(400).json({ message: 'Error deleting category', error: error.message });
  }
};

// Utility function to reset daily habits (called by cron job)
export const resetDailyHabits = async () => {
  try {
    const habits = await Habit.find({});
    const today = new Date();
    
    for (const habit of habits) {
      let lastUpdate = habit.streakData.lastUpdate;
      let resetNeeded = false;

      // If lastUpdate is more than 24 hours ago
      if ((today - lastUpdate) / (1000 * 60 * 60 * 24) >= 1) {
        resetNeeded = true;

        // If more than 1 day has passed, reset streak
        if ((today - lastUpdate) / (1000 * 60 * 60 * 24) > 1) {
          habit.streakData.currentStreak = 0;
        }

        // Reset all habits to incomplete
        for (const [key, category] of habit.categories.entries()) {
          category.habits = category.habits.map(h => ({
            ...h,
            completed: false,
            completedAt: null
          }));
          habit.categories.set(key, category);
        }

        habit.streakData.lastUpdate = today;
        await habit.save();
      }
    }
  } catch (error) {
    console.error('Reset daily habits error:', error);
  }
};