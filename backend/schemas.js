import { z } from 'zod';

export const mealSchema = z.object({
  food_name: z.string().min(1),
  usda_id: z.string().optional().nullable(),
  quantity: z.coerce.number().positive(),
  unit: z.string().default('g'),
  protein: z.coerce.number().min(0).default(0),
  calories: z.coerce.number().min(0).default(0),
  carbs: z.coerce.number().min(0).default(0),
  fats: z.coerce.number().min(0).default(0),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).default('snack'),
  logged_at: z.string().datetime().optional().nullable(),
});

export const workoutSchema = z.object({
  exercise_type: z.enum(['cardio', 'fuerza']),
  exercise_name: z.string().min(1),
  duration_minutes: z.coerce.number().min(0).optional().default(0),
  calories_burned: z.coerce.number().min(0).optional(),
  sets: z.coerce.number().min(0).optional(),
  reps: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(0).optional(),
  notes: z.string().optional().nullable(),
  logged_at: z.string().datetime().optional().nullable(),
});

export const customFoodSchema = z.object({
  name: z.string().min(1),
  protein: z.coerce.number().min(0).default(0),
  calories: z.coerce.number().min(0).default(0),
  carbs: z.coerce.number().min(0).default(0),
  fats: z.coerce.number().min(0).default(0),
  serving_size: z.coerce.number().positive().default(100),
});

export const userSyncSchema = z.object({
  email: z.string().email().optional().nullable(),
  name: z.string().optional().nullable(),
});

export const userUpdateSchema = z.object({
  protein_goal: z.coerce.number().min(0).optional(),
  calories_goal: z.coerce.number().min(0).optional(),
  carbs_goal: z.coerce.number().min(0).optional(),
  fats_goal: z.coerce.number().min(0).optional(),
  weight_kg: z.coerce.number().positive().optional(),
});

