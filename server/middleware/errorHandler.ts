import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AsyncHandler } from '../types/express';
import { ApiResponse } from '../types/api';

export const asyncHandler = (fn: AsyncHandler) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (
  err: Error,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  const response: ApiResponse = {
    success: false,
    error: err.message || 'Internal server error'
  };
  
  res.status(500).json(response);
};

export const notFoundHandler = (req: AuthenticatedRequest, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: 'Endpoint not found'
  };
  
  res.status(404).json(response);
};
