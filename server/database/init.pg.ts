import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;

export interface User {
  id: number;
  username: string;
  display_name: string | null;
  weight: number;
  height: number;
  created_at: string;
  updated_at: string;
}

export interface DailyGoal {
  id: number;
  user_id: number;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

export interface FoodLog {
  id: number;
  user_id: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string | null;
  logged_at: string;
  date: string;
}

export interface WorkoutLog {
  id: number;
  user_id: number;
  workout_name: string;
  calories_burned: number;
  duration_minutes: number | null;
  logged_at: string;
  date: string;
}

export interface DailyStats {
  date: string;
  calories_in: number;
  calories_out: number;
  protein_in: number;
  carbs_in: number;
  fat_in: number;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
