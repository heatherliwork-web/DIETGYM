import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'DIETGYM API is running',
    timestamp: new Date().toISOString()
  });
});

import usersRouter from '../server/routes/users.js';
import foodRouter from '../server/routes/food.js';
import workoutsRouter from '../server/routes/workouts.js';

app.use('/users', usersRouter);
app.use('/food', foodRouter);
app.use('/workouts', workoutsRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

export default app;
