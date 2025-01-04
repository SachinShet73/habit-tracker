// server/src/models/Journal.js
import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  date: {
    type: Date,
    required: true
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'bad', 'terrible'],
    required: true
  },
  reflection: {
    type: String,
    required: true
  },
  habitNotes: [{
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    habitName: String,
    note: String
  }],
  highlights: [String],
  improvementAreas: [String]
}, {
  timestamps: true
});

// Create index for efficient date-based queries
journalSchema.index({ userId: 1, date: -1 });

export const Journal = mongoose.model('Journal', journalSchema);