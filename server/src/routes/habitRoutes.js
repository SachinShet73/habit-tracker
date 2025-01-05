// server/src/routes/habitRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  initializeHabits,
  getHabits,
  updateHabitStatus,
  addHabit,
  addCategory,
  deleteHabit,
  deleteCategory,
  getHabitHistory,
  getHabitAnalytics,
  resetDailyHabits
} from '../controllers/habitController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Existing routes
router.post('/initialize', initializeHabits);
router.get('/', getHabits);
router.post('/category', addCategory);
router.delete('/category/:categoryId', deleteCategory);
router.post('/category/:categoryId', addHabit);
router.put('/category/:categoryId/habit/:habitId', updateHabitStatus);
router.delete('/category/:categoryId/habit/:habitId', deleteHabit);
router.get('/history', getHabitHistory);
router.get('/analytics', getHabitAnalytics);

// Add manual reset endpoint for testing
router.post('/reset', async (req, res) => {
  try {
    const result = await resetDailyHabits();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error resetting habits', error: error.message });
  }
});

export default router;