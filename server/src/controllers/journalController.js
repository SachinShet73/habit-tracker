// server/src/controllers/journalController.js
import { Journal } from '../models/Journal.js';

// @desc    Create or update journal entry
// @route   POST /api/journal
// @access  Private
export const createJournalEntry = async (req, res) => {
  try {
    const { date, mood, reflection, habitNotes, highlights, improvementAreas } = req.body;

    // Check if entry already exists for this date
    let journal = await Journal.findOne({
      userId: req.user._id,
      date: new Date(date)
    });

    if (journal) {
      // Update existing entry
      journal.mood = mood;
      journal.reflection = reflection;
      journal.habitNotes = habitNotes;
      journal.highlights = highlights;
      journal.improvementAreas = improvementAreas;
    } else {
      // Create new entry
      journal = new Journal({
        userId: req.user._id,
        date,
        mood,
        reflection,
        habitNotes,
        highlights,
        improvementAreas
      });
    }

    const savedJournal = await journal.save();
    res.json(savedJournal);
  } catch (error) {
    console.error('Journal entry error:', error);
    res.status(400).json({ message: 'Error saving journal entry', error: error.message });
  }
};

// @desc    Get journal entry by date
// @route   GET /api/journal/:date
// @access  Private
export const getJournalEntry = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const journal = await Journal.findOne({
      userId: req.user._id,
      date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });

    if (!journal) {
      return res.status(404).json({ message: 'No journal entry found for this date' });
    }

    res.json(journal);
  } catch (error) {
    console.error('Get journal error:', error);
    res.status(400).json({ message: 'Error fetching journal entry', error: error.message });
  }
};

// @desc    Get all journal entries (with optional date range)
// @route   GET /api/journal
// @access  Private
export const getJournalEntries = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { userId: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const journals = await Journal.find(query)
      .sort({ date: -1 })
      .limit(30); // Limit to last 30 entries by default

    res.json(journals);
  } catch (error) {
    console.error('Get journals error:', error);
    res.status(400).json({ message: 'Error fetching journal entries', error: error.message });
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
// @access  Private
export const deleteJournalEntry = async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    await journal.remove();
    res.json({ message: 'Journal entry removed' });
  } catch (error) {
    console.error('Delete journal error:', error);
    res.status(400).json({ message: 'Error deleting journal entry', error: error.message });
  }
};