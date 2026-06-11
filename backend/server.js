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

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL?.split(',') || true }));
app.use(express.json());
if (process.env.CLERK_SECRET_KEY) app.use(clerkMiddleware());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/users', protect, users);
app.use('/api/meals', protect, meals);
app.use('/api/foods/custom', protect, customFoods);
app.use('/api/workouts', protect, workouts);
app.use('/api/analytics', protect, analytics);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Nutrition Tracker API listening on ${port}`));
