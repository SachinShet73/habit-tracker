// server/src/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { initCronJobs } from './services/cronService.js';
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize cron jobs
initCronJobs();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/settings', settingsRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});