import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
try {
  mkdirSync(dataDir, { recursive: true });
} catch (error) {
  // Directory already exists
}

const dbPath = join(dataDir, 'dietgym.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

const schemaPath = join(__dirname, 'schema.sql');
const schema = readFileSync(schemaPath, 'utf-8');
db.exec(schema);

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

export default db;
