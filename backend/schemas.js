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

export const workoutSetSchema = z.object({
  exercise_id: z.coerce.number().int().positive(),
  weight_kg: z.coerce.number().min(0).optional().nullable(),
  reps: z.coerce.number().int().min(0).optional().nullable(),
  duration_minutes: z.coerce.number().min(0).optional().nullable(),
  calories_burned: z.coerce.number().min(0).optional(),
  set_order: z.coerce.number().int().positive().optional(),
  notes: z.string().optional().nullable(),
});

export const workoutSchema = z.object({
  name: z.string().min(1).default('Workout'),
  notes: z.string().optional().nullable(),
  logged_at: z.string().datetime().optional().nullable(),
  sets: z.array(workoutSetSchema).min(1),
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
  sex: z.enum(['male', 'female']).optional().nullable(),
  height_cm: z.coerce.number().positive().optional().nullable(),
  age: z.coerce.number().int().min(13).max(120).optional().nullable(),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional().nullable(),
});

export const weightLogSchema = z.object({
  value_kg: z.coerce.number().positive(),
  logged_at: z.string().datetime().optional().nullable(),
});
