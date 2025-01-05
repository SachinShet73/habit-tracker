// server/src/routes/settingsRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/', getSettings);
router.put('/:section', updateSettings);

export default router;