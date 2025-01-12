// server/src/controllers/habitController.js
import { Habit } from '../models/Habit.js';
import mongoose from 'mongoose';

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyEntries = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const isInPast = currentDate < today;
      const isToday = currentDate.getTime() === today.getTime();

      // Create a deep copy of categories to avoid modifying the original
      const categoriesCopy = new Map();
      habits.categories.forEach((category, key) => {
        const habitsCopy = category.habits.map(habit => {
          // For past dates, mark all habits as completed
          // For today, keep actual completion status
          // For future dates, mark as uncompleted
          const completed = isInPast ? true : 
                          isToday ? habit.completed : 
                          false;
          
          return {
            ...habit.toObject(),
            completed,
            completedAt: completed ? currentDate : null
          };
        });

        categoriesCopy.set(key, {
          ...category.toObject(),
          habits: habitsCopy
        });
      });

      dailyEntries.push({
        date: new Date(currentDate),
        categories: Object.fromEntries(categoriesCopy),
        streakData: {
          currentStreak: isInPast ? habits.streakData.longestStreak : habits.streakData.currentStreak,
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

export const resetDailyHabits = async () => {
  let session;
  try {
    console.log('Starting daily habit reset process...');
    session = await mongoose.startSession();
    session.startTransaction();

    // Find all habits
    const habits = await Habit.find({});
    console.log(`Found ${habits.length} habits to process`);

    // Get current date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process each habit document
    for (const habit of habits) {
      try {
        console.log(`Processing habits for user: ${habit.userId}`);

        // Create updated categories map
        const updatedCategories = new Map();

        // Process each category
        habit.categories.forEach((category, categoryId) => {
          // Reset all habits in the category
          const updatedHabits = category.habits.map(h => ({
            ...h.toObject(),
            completed: false,
            completedAt: null
          }));

          // Update the category with reset habits
          updatedCategories.set(categoryId, {
            ...category.toObject(),
            habits: updatedHabits
          });
        });

        // Update the habit document
        await Habit.findOneAndUpdate(
          { _id: habit._id },
          {
            $set: {
              categories: updatedCategories,
              'streakData.lastUpdate': today,
              'streakData.currentStreak': 0
            }
          },
          { session }
        );

        console.log(`Successfully reset habits for user: ${habit.userId}`);
      } catch (error) {
        console.error(`Error processing habit ${habit._id}:`, error);
        throw error; // Propagate error to trigger transaction rollback
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    console.log('Daily habit reset completed successfully');
    
    return {
      success: true,
      message: 'All habits reset successfully',
      timestamp: new Date(),
      habitsProcessed: habits.length
    };

  } catch (error) {
    console.error('Error in resetDailyHabits:', error);
    
    // Rollback transaction if exists
    if (session) {
      await session.abortTransaction();
    }
    
    throw error;
  } finally {
    // End session if exists
    if (session) {
      session.endSession();
    }
  }
};