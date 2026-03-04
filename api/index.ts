import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    success: true,
    message: 'DIETGYM API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users',
      food: '/api/food',
      workouts: '/api/workouts'
    }
  });
}
