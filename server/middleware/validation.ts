import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../types/api';

export const validateUserId = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId || req.body.user_id;
  
  if (!userId) {
    const response: ApiResponse = {
      success: false,
      error: 'User ID is required'
    };
    return res.status(400).json(response);
  }
  
  const id = parseInt(userId);
  if (isNaN(id) || id <= 0) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid user ID'
    };
    return res.status(400).json(response);
  }
  
  next();
};

export const validateFoodLog = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { food_name, calories, protein, carbs, fat } = req.body;
  
  if (!food_name || typeof food_name !== 'string') {
    const response: ApiResponse = {
      success: false,
      error: 'Food name is required and must be a string'
    };
    return res.status(400).json(response);
  }
  
  const nutrients = { calories, protein, carbs, fat };
  for (const [key, value] of Object.entries(nutrients)) {
    if (typeof value !== 'number' || value < 0) {
      const response: ApiResponse = {
        success: false,
        error: `${key} must be a non-negative number`
      };
      return res.status(400).json(response);
    }
  }
  
  next();
};

export const validateWorkoutLog = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { workout_name, calories_burned } = req.body;
  
  if (!workout_name || typeof workout_name !== 'string') {
    const response: ApiResponse = {
      success: false,
      error: 'Workout name is required and must be a string'
    };
    return res.status(400).json(response);
  }
  
  if (typeof calories_burned !== 'number' || calories_burned < 0) {
    const response: ApiResponse = {
      success: false,
      error: 'Calories burned must be a non-negative number'
    };
    return res.status(400).json(response);
  }
  
  next();
};

export const validateDate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const date = req.params.date || req.query.date || req.body.date;
  
  if (date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      };
      return res.status(400).json(response);
    }
    
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid date'
      };
      return res.status(400).json(response);
    }
  }
  
  next();
};
