import { Router, Response } from 'express';
import pool from '../database/init.pg.js';
import { AuthenticatedRequest } from '../types/express.js';
import { ApiResponse, UpdateUserRequest, UpdateGoalsRequest } from '../types/api.js';
import { User, DailyGoal } from '../database/init.pg.js';

const router = Router();

router.get('/:userId', async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0] as User | undefined;
    
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
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const { username, display_name, weight, height } = req.body;
  
  if (!username) {
    const response: ApiResponse = {
      success: false,
      error: 'Username is required'
    };
    return res.status(400).json(response);
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO users (username, display_name, weight, height)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [username, display_name || username, weight || 70, height || 175]
    );
    
    const user = result.rows[0] as User;
    
    const today = new Date().toISOString().split('T')[0];
    const calories = Math.round((weight || 70) * 24 * 1.2);
    const protein = Math.round((weight || 70) * 2);
    const fat = Math.round((weight || 70) * 1);
    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
    
    await pool.query(
      `INSERT INTO daily_goals (user_id, date, calories, protein, carbs, fat)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, today, calories, protein, carbs, fat]
    );
    
    const response: ApiResponse<User> = {
      success: true,
      data: user,
      message: 'User created successfully'
    };
    
    res.status(201).json(response);
  } catch (error: any) {
    if (error.code === '23505') {
      const response: ApiResponse = {
        success: false,
        error: 'Username already exists'
      };
      return res.status(409).json(response);
    }
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/:userId', async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { display_name, weight, height } = req.body as UpdateUserRequest;
  
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0] as User | undefined;
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (display_name !== undefined) {
      updates.push(`display_name = $${paramCount++}`);
      values.push(display_name);
    }
    if (weight !== undefined) {
      updates.push(`weight = $${paramCount++}`);
      values.push(weight);
    }
    if (height !== undefined) {
      updates.push(`height = $${paramCount++}`);
      values.push(height);
    }
    
    if (updates.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'No fields to update'
      };
      return res.status(400).json(response);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);
    
    const updateResult = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    const updatedUser = updateResult.rows[0] as User;
    
    const response: ApiResponse<User> = {
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:userId/goals', async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  
  try {
    let result = await pool.query(
      'SELECT * FROM daily_goals WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    
    let goal = result.rows[0] as DailyGoal | undefined;
    
    if (!goal) {
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = userResult.rows[0] as User | undefined;
      
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
      
      const insertResult = await pool.query(
        `INSERT INTO daily_goals (user_id, date, calories, protein, carbs, fat)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, date, calories, protein, carbs, fat]
      );
      
      goal = insertResult.rows[0] as DailyGoal;
    }
    
    const response: ApiResponse<DailyGoal> = {
      success: true,
      data: goal
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/:userId/goals', async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { calories, protein, carbs, fat, date } = req.body as UpdateGoalsRequest;
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0] as User | undefined;
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }
    
    let result = await pool.query(
      'SELECT * FROM daily_goals WHERE user_id = $1 AND date = $2',
      [userId, targetDate]
    );
    
    let goal = result.rows[0] as DailyGoal | undefined;
    
    if (goal) {
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      if (calories !== undefined) {
        updates.push(`calories = $${paramCount++}`);
        values.push(calories);
      }
      if (protein !== undefined) {
        updates.push(`protein = $${paramCount++}`);
        values.push(protein);
      }
      if (carbs !== undefined) {
        updates.push(`carbs = $${paramCount++}`);
        values.push(carbs);
      }
      if (fat !== undefined) {
        updates.push(`fat = $${paramCount++}`);
        values.push(fat);
      }
      
      if (updates.length > 0) {
        values.push(goal.id);
        await pool.query(
          `UPDATE daily_goals SET ${updates.join(', ')} WHERE id = $${paramCount}`,
          values
        );
      }
    } else {
      const insertResult = await pool.query(
        `INSERT INTO daily_goals (user_id, date, calories, protein, carbs, fat)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          userId,
          targetDate,
          calories || Math.round(user.weight * 24 * 1.2),
          protein || Math.round(user.weight * 2),
          carbs || 250,
          fat || Math.round(user.weight * 1)
        ]
      );
      
      goal = insertResult.rows[0] as DailyGoal;
    }
    
    result = await pool.query(
      'SELECT * FROM daily_goals WHERE user_id = $1 AND date = $2',
      [userId, targetDate]
    );
    goal = result.rows[0] as DailyGoal;
    
    const response: ApiResponse<DailyGoal> = {
      success: true,
      data: goal,
      message: 'Goals updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating goals:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
