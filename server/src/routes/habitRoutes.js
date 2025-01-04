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
  deleteCategory
} from '../controllers/habitController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Habit routes
router.post('/initialize', initializeHabits);
router.get('/', getHabits);

// Category routes
router.post('/category', addCategory);
router.delete('/category/:categoryId', deleteCategory);

// Habit management routes
router.post('/category/:categoryId', addHabit);
router.put('/category/:categoryId/habit/:habitId', updateHabitStatus);
router.delete('/category/:categoryId/habit/:habitId', deleteHabit);

export default router;