// server/src/routes/journalRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createJournalEntry,
  getJournalEntry,
  getJournalEntries,
  deleteJournalEntry
} from '../controllers/journalController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .post(createJournalEntry)
  .get(getJournalEntries);

router.route('/:date')
  .get(getJournalEntry);

router.route('/:id')
  .delete(deleteJournalEntry);

export default router;