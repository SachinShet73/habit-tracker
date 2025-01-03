// server/src/models/Habit.js
import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  categories: {
    type: Map,
    of: {
      title: String,
      icon: String,
      habits: [{
        name: String,
        completed: Boolean,
        completedAt: Date
      }]
    }
  },
  streakData: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastUpdate: Date
  },
  monthlyView: [{
    date: Date,
    completed: Boolean
  }]
}, {
  timestamps: true
});

export const Habit = mongoose.model('Habit', habitSchema);