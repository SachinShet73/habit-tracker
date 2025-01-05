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
  getHabitAnalytics
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

// New history and analytics routes
router.get('/history', getHabitHistory);
router.get('/analytics', getHabitAnalytics);

export default router;