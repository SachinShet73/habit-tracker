// server/src/services/cronService.js
import cron from 'node-cron';
import { resetDailyHabits } from '../controllers/habitController.js';

export const initCronJobs = () => {
  // Run every 5 minutes for testing
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily habit reset...');
    try {
      const result = await resetDailyHabits();
      console.log('Reset result:', result);
    } catch (error) {
      console.error('Error in daily habit reset:', error);
    }
  });
};