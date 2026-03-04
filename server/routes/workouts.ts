import { Router, Response } from 'express';
import db, { WorkoutLog } from '../database/init.js';
import { AuthenticatedRequest } from '../types/express.js';
import { ApiResponse, CreateWorkoutLogRequest } from '../types/api.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateUserId, validateWorkoutLog, validateDate } from '../middleware/validation.js';

const router = Router();

router.post('/', validateWorkoutLog, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { user_id, workout_name, calories_burned, duration_minutes, date } = req.body as CreateWorkoutLogRequest;
  
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
    INSERT INTO workout_logs (user_id, workout_name, calories_burned, duration_minutes, date)
    VALUES (?, ?, ?, ?, ?)
  `).run(user_id, workout_name, calories_burned, duration_minutes || null, logDate);
  
  const workoutLog = db.prepare('SELECT * FROM workout_logs WHERE id = ?').get(result.lastInsertRowid) as WorkoutLog;
  
  const response: ApiResponse<WorkoutLog> = {
    success: true,
    data: workoutLog,
    message: 'Workout logged successfully'
  };
  
  res.status(201).json(response);
}));

router.get('/:userId', validateUserId, validateDate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  
  const workoutLogs = db.prepare(`
    SELECT * FROM workout_logs 
    WHERE user_id = ? AND date = ?
    ORDER BY logged_at DESC
  `).all(userId, date) as WorkoutLog[];
  
  const response: ApiResponse<WorkoutLog[]> = {
    success: true,
    data: workoutLogs
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
  
  const workoutLogs = db.prepare(`
    SELECT * FROM workout_logs 
    WHERE user_id = ? AND date BETWEEN ? AND ?
    ORDER BY date DESC, logged_at DESC
  `).all(userId, startDate, endDate) as WorkoutLog[];
  
  const response: ApiResponse<WorkoutLog[]> = {
    success: true,
    data: workoutLogs
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
  
  const log = db.prepare('SELECT * FROM workout_logs WHERE id = ?').get(logId) as WorkoutLog | undefined;
  
  if (!log) {
    const response: ApiResponse = {
      success: false,
      error: 'Workout log not found'
    };
    return res.status(404).json(response);
  }
  
  db.prepare('DELETE FROM workout_logs WHERE id = ?').run(logId);
  
  const response: ApiResponse = {
    success: true,
    message: 'Workout log deleted successfully'
  };
  
  res.json(response);
}));

export default router;
