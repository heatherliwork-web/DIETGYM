import { Router, Response } from 'express';
import db, { FoodLog, DailyStats } from '../database/init.js';
import { AuthenticatedRequest } from '../types/express.js';
import { ApiResponse, CreateFoodLogRequest } from '../types/api.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateUserId, validateFoodLog, validateDate } from '../middleware/validation.js';

const router = Router();

router.post('/', validateFoodLog, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { user_id, food_name, calories, protein, carbs, fat, image_url, date } = req.body as CreateFoodLogRequest;
  
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id);
  
  if (!user) {
    const response: ApiResponse = {
      success: false,
      error: 'User not found'
    };
    return res.status(404).json(response);
  }
  
  const logDate = date || new Date().toISOString().split('T')[0];
  
  const result = db.prepare(`
    INSERT INTO food_logs (user_id, food_name, calories, protein, carbs, fat, image_url, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(user_id, food_name, calories, protein, carbs, fat, image_url || null, logDate);
  
  const foodLog = db.prepare('SELECT * FROM food_logs WHERE id = ?').get(result.lastInsertRowid) as FoodLog;
  
  const response: ApiResponse<FoodLog> = {
    success: true,
    data: foodLog,
    message: 'Food logged successfully'
  };
  
  res.status(201).json(response);
}));

router.get('/:userId', validateUserId, validateDate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  
  const foodLogs = db.prepare(`
    SELECT * FROM food_logs 
    WHERE user_id = ? AND date = ?
    ORDER BY logged_at DESC
  `).all(userId, date) as FoodLog[];
  
  const response: ApiResponse<FoodLog[]> = {
    success: true,
    data: foodLogs
  };
  
  res.json(response);
}));

router.get('/:userId/range', validateUserId, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const startDate = req.query.start_date as string;
  const endDate = req.query.end_date as string;
  
  if (!startDate || !endDate) {
    const response: ApiResponse = {
      success: false,
      error: 'Both start_date and end_date are required'
    };
    return res.status(400).json(response);
  }
  
  const foodLogs = db.prepare(`
    SELECT * FROM food_logs 
    WHERE user_id = ? AND date BETWEEN ? AND ?
    ORDER BY date DESC, logged_at DESC
  `).all(userId, startDate, endDate) as FoodLog[];
  
  const response: ApiResponse<FoodLog[]> = {
    success: true,
    data: foodLogs
  };
  
  res.json(response);
}));

router.delete('/:logId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const logId = parseInt(req.params.logId);
  
  if (isNaN(logId)) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid log ID'
    };
    return res.status(400).json(response);
  }
  
  const log = db.prepare('SELECT * FROM food_logs WHERE id = ?').get(logId) as FoodLog | undefined;
  
  if (!log) {
    const response: ApiResponse = {
      success: false,
      error: 'Food log not found'
    };
    return res.status(404).json(response);
  }
  
  db.prepare('DELETE FROM food_logs WHERE id = ?').run(logId);
  
  const response: ApiResponse = {
    success: true,
    message: 'Food log deleted successfully'
  };
  
  res.json(response);
}));

router.get('/:userId/stats', validateUserId, validateDate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  
  const foodLogs = db.prepare(`
    SELECT * FROM food_logs 
    WHERE user_id = ? AND date = ?
  `).all(userId, date) as FoodLog[];
  
  const workoutLogs = db.prepare(`
    SELECT * FROM workout_logs 
    WHERE user_id = ? AND date = ?
  `).all(userId, date) as any[];
  
  let goal = db.prepare(`
    SELECT * FROM daily_goals WHERE user_id = ? AND date = ?
  `).get(userId, date) as any;
  
  if (!goal) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }
    
    const calories = Math.round(user.weight * 24 * 1.2);
    const protein = Math.round(user.weight * 2);
    const fat = Math.round(user.weight * 1);
    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
    
    goal = { calories, protein, carbs, fat };
  }
  
  const stats: DailyStats = {
    date,
    calories_in: foodLogs.reduce((sum, log) => sum + log.calories, 0),
    calories_out: workoutLogs.reduce((sum, log) => sum + log.calories_burned, 0),
    protein_in: foodLogs.reduce((sum, log) => sum + log.protein, 0),
    carbs_in: foodLogs.reduce((sum, log) => sum + log.carbs, 0),
    fat_in: foodLogs.reduce((sum, log) => sum + log.fat, 0),
    goals: {
      calories: goal.calories,
      protein: goal.protein,
      carbs: goal.carbs,
      fat: goal.fat
    }
  };
  
  const response: ApiResponse<DailyStats> = {
    success: true,
    data: stats
  };
  
  res.json(response);
}));

export default router;
