import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { protect } from './middleware/auth.js';
import users from './routes/users.js';
import meals from './routes/meals.js';
import customFoods from './routes/customFoods.js';
import workouts from './routes/workouts.js';
import analytics from './routes/analytics.js';
import weightLogs from './routes/weightLogs.js';
import exercises from './routes/exercises.js';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL?.split(',') || true }));
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
if (process.env.CLERK_SECRET_KEY) app.use(clerkMiddleware());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/users', protect, users);
app.use('/api/meals', protect, meals);
app.use('/api/foods/custom', protect, customFoods);
app.use('/api/workouts', protect, workouts);
app.use('/api/weight-logs', protect, weightLogs);
app.use('/api/exercises', protect, exercises);
app.use('/api/analytics', protect, analytics);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Nutrition Tracker API listening on ${port}`));
