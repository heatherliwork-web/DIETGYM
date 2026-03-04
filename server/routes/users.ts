import { Router, Response } from 'express';
import db, { User, DailyGoal } from '../database/init.js';
import { AuthenticatedRequest } from '../types/express.js';
import { ApiResponse, UpdateUserRequest, UpdateGoalsRequest } from '../types/api.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateUserId } from '../middleware/validation.js';

const router = Router();

router.get('/:userId', validateUserId, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  
  const user = db.prepare(`
    SELECT * FROM users WHERE id = ?
  `).get(userId) as User | undefined;
  
  if (!user) {
    const response: ApiResponse = {
      success: false,
      error: 'User not found'
    };
    return res.status(404).json(response);
  }
  
  const response: ApiResponse<User> = {
    success: true,
    data: user
  };
  
  res.json(response);
}));

router.post('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { username, display_name, weight, height } = req.body;
  
  if (!username) {
    const response: ApiResponse = {
      success: false,
      error: 'Username is required'
    };
    return res.status(400).json(response);
  }
  
  try {
    const result = db.prepare(`
      INSERT INTO users (username, display_name, weight, height)
      VALUES (?, ?, ?, ?)
    `).run(username, display_name || username, weight || 70, height || 175);
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
    
    const today = new Date().toISOString().split('T')[0];
    const calories = Math.round((weight || 70) * 24 * 1.2);
    const protein = Math.round((weight || 70) * 2);
    const fat = Math.round((weight || 70) * 1);
    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
    
    db.prepare(`
      INSERT INTO daily_goals (user_id, date, calories, protein, carbs, fat)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(user.id, today, calories, protein, carbs, fat);
    
    const response: ApiResponse<User> = {
      success: true,
      data: user,
      message: 'User created successfully'
    };
    
    res.status(201).json(response);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      const response: ApiResponse = {
        success: false,
        error: 'Username already exists'
      };
      return res.status(409).json(response);
    }
    throw error;
  }
}));

router.put('/:userId', validateUserId, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { display_name, weight, height } = req.body as UpdateUserRequest;
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
  
  if (!user) {
    const response: ApiResponse = {
      success: false,
      error: 'User not found'
    };
    return res.status(404).json(response);
  }
  
  const updates: string[] = [];
  const values: any[] = [];
  
  if (display_name !== undefined) {
    updates.push('display_name = ?');
    values.push(display_name);
  }
  if (weight !== undefined) {
    updates.push('weight = ?');
    values.push(weight);
  }
  if (height !== undefined) {
    updates.push('height = ?');
    values.push(height);
  }
  
  if (updates.length === 0) {
    const response: ApiResponse = {
      success: false,
      error: 'No fields to update'
    };
    return res.status(400).json(response);
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(userId);
  
  db.prepare(`
    UPDATE users SET ${updates.join(', ')} WHERE id = ?
  `).run(...values);
  
  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
  
  const response: ApiResponse<User> = {
    success: true,
    data: updatedUser,
    message: 'User updated successfully'
  };
  
  res.json(response);
}));

router.get('/:userId/goals', validateUserId, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  
  let goal = db.prepare(`
    SELECT * FROM daily_goals WHERE user_id = ? AND date = ?
  `).get(userId, date) as DailyGoal | undefined;
  
  if (!goal) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
    
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
    
    const result = db.prepare(`
      INSERT INTO daily_goals (user_id, date, calories, protein, carbs, fat)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, date, calories, protein, carbs, fat);
    
    goal = db.prepare('SELECT * FROM daily_goals WHERE id = ?').get(result.lastInsertRowid) as DailyGoal;
  }
  
  const response: ApiResponse<DailyGoal> = {
    success: true,
    data: goal
  };
  
  res.json(response);
}));

router.put('/:userId/goals', validateUserId, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { calories, protein, carbs, fat, date } = req.body as UpdateGoalsRequest;
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
  
  if (!user) {
    const response: ApiResponse = {
      success: false,
      error: 'User not found'
    };
    return res.status(404).json(response);
  }
  
  let goal = db.prepare(`
    SELECT * FROM daily_goals WHERE user_id = ? AND date = ?
  `).get(userId, targetDate) as DailyGoal | undefined;
  
  if (goal) {
    const updates: string[] = [];
    const values: any[] = [];
    
    if (calories !== undefined) {
      updates.push('calories = ?');
      values.push(calories);
    }
    if (protein !== undefined) {
      updates.push('protein = ?');
      values.push(protein);
    }
    if (carbs !== undefined) {
      updates.push('carbs = ?');
      values.push(carbs);
    }
    if (fat !== undefined) {
      updates.push('fat = ?');
      values.push(fat);
    }
    
    if (updates.length > 0) {
      values.push(goal.id);
      db.prepare(`UPDATE daily_goals SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
  } else {
    const result = db.prepare(`
      INSERT INTO daily_goals (user_id, date, calories, protein, carbs, fat)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      targetDate,
      calories || Math.round(user.weight * 24 * 1.2),
      protein || Math.round(user.weight * 2),
      carbs || 250,
      fat || Math.round(user.weight * 1)
    );
    
    goal = db.prepare('SELECT * FROM daily_goals WHERE id = ?').get(result.lastInsertRowid) as DailyGoal;
  }
  
  goal = db.prepare('SELECT * FROM daily_goals WHERE user_id = ? AND date = ?').get(userId, targetDate) as DailyGoal;
  
  const response: ApiResponse<DailyGoal> = {
    success: true,
    data: goal,
    message: 'Goals updated successfully'
  };
  
  res.json(response);
}));

export default router;
