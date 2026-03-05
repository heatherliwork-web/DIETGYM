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

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const STORAGE_KEYS = {
  USER: 'dietgym_user',
  FOOD_LOGS: 'dietgym_food_logs',
  WORKOUT_LOGS: 'dietgym_workout_logs',
  DAILY_GOALS: 'dietgym_daily_goals',
};

function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage error:', error);
  }
}

export const userApi = {
  create: async (username: string, displayName?: string, weight?: number, height?: number): Promise<ApiResponse<User>> => {
    const users = getStorageItem<User[]>(STORAGE_KEYS.USER, []);
    const existingUser = users.find(u => u.username === username);
    
    if (existingUser) {
      return { success: true, data: existingUser };
    }

    const newUser: User = {
      id: Date.now(),
      username,
      display_name: displayName || username,
      weight: weight || 70,
      height: height || 175,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(newUser);
    setStorageItem(STORAGE_KEYS.USER, users);
    
    return { success: true, data: newUser, message: 'User created successfully' };
  },

  get: async (userId: number): Promise<ApiResponse<User>> => {
    const users = getStorageItem<User[]>(STORAGE_KEYS.USER, []);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    return { success: true, data: user };
  },

  update: async (userId: number, updates: Partial<User>): Promise<ApiResponse<User>> => {
    const users = getStorageItem<User[]>(STORAGE_KEYS.USER, []);
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
      return { success: false, error: 'User not found' };
    }

    users[index] = {
      ...users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    setStorageItem(STORAGE_KEYS.USER, users);
    return { success: true, data: users[index], message: 'User updated successfully' };
  },

  getGoals: async (userId: number, date?: string): Promise<ApiResponse<DailyGoal>> => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const goals = getStorageItem<DailyGoal[]>(STORAGE_KEYS.DAILY_GOALS, []);
    let goal = goals.find(g => g.user_id === userId && g.date === targetDate);

    if (!goal) {
      const users = getStorageItem<User[]>(STORAGE_KEYS.USER, []);
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const calories = Math.round(user.weight * 24 * 1.2);
      const protein = Math.round(user.weight * 2);
      const fat = Math.round(user.weight * 1);
      const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

      goal = {
        id: Date.now(),
        user_id: userId,
        date: targetDate,
        calories,
        protein,
        carbs,
        fat,
        created_at: new Date().toISOString(),
      };

      goals.push(goal);
      setStorageItem(STORAGE_KEYS.DAILY_GOALS, goals);
    }

    return { success: true, data: goal };
  },

  updateGoals: async (userId: number, goals: Partial<DailyGoal>, date?: string): Promise<ApiResponse<DailyGoal>> => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const allGoals = getStorageItem<DailyGoal[]>(STORAGE_KEYS.DAILY_GOALS, []);
    const index = allGoals.findIndex(g => g.user_id === userId && g.date === targetDate);

    if (index !== -1) {
      allGoals[index] = {
        ...allGoals[index],
        ...goals,
      };
    } else {
      const newGoal: DailyGoal = {
        id: Date.now(),
        user_id: userId,
        date: targetDate,
        calories: goals.calories || 2200,
        protein: goals.protein || 140,
        carbs: goals.carbs || 250,
        fat: goals.fat || 70,
        created_at: new Date().toISOString(),
      };
      allGoals.push(newGoal);
    }

    setStorageItem(STORAGE_KEYS.DAILY_GOALS, allGoals);
    
    const updatedGoal = allGoals.find(g => g.user_id === userId && g.date === targetDate);
    return { success: true, data: updatedGoal!, message: 'Goals updated successfully' };
  },
};

export const foodApi = {
  create: async (
    userId: number,
    foodName: string,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    imageUrl?: string,
    date?: string
  ): Promise<ApiResponse<FoodLog>> => {
    const foodLogs = getStorageItem<FoodLog[]>(STORAGE_KEYS.FOOD_LOGS, []);
    
    const newLog: FoodLog = {
      id: Date.now(),
      user_id: userId,
      food_name: foodName,
      calories,
      protein,
      carbs,
      fat,
      image_url: imageUrl || null,
      logged_at: new Date().toISOString(),
      date: date || new Date().toISOString().split('T')[0],
    };

    foodLogs.push(newLog);
    setStorageItem(STORAGE_KEYS.FOOD_LOGS, foodLogs);
    
    return { success: true, data: newLog, message: 'Food logged successfully' };
  },

  getByDate: async (userId: number, date?: string): Promise<ApiResponse<FoodLog[]>> => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const foodLogs = getStorageItem<FoodLog[]>(STORAGE_KEYS.FOOD_LOGS, []);
    const userLogs = foodLogs.filter(log => 
      log.user_id === userId && log.date === targetDate
    );
    
    return { success: true, data: userLogs };
  },

  getByRange: async (userId: number, startDate: string, endDate: string): Promise<ApiResponse<FoodLog[]>> => {
    const foodLogs = getStorageItem<FoodLog[]>(STORAGE_KEYS.FOOD_LOGS, []);
    const userLogs = foodLogs.filter(log => 
      log.user_id === userId && 
      log.date >= startDate && 
      log.date <= endDate
    );
    
    return { success: true, data: userLogs };
  },

  delete: async (logId: number): Promise<ApiResponse<void>> => {
    const foodLogs = getStorageItem<FoodLog[]>(STORAGE_KEYS.FOOD_LOGS, []);
    const filtered = foodLogs.filter(log => log.id !== logId);
    setStorageItem(STORAGE_KEYS.FOOD_LOGS, filtered);
    
    return { success: true, message: 'Food log deleted successfully' };
  },

  getStats: async (userId: number, date?: string): Promise<ApiResponse<DailyStats>> => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const foodLogs = getStorageItem<FoodLog[]>(STORAGE_KEYS.FOOD_LOGS, []);
    const workoutLogs = getStorageItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
    
    const userFoodLogs = foodLogs.filter(log => 
      log.user_id === userId && log.date === targetDate
    );
    
    const userWorkoutLogs = workoutLogs.filter(log => 
      log.user_id === userId && log.date === targetDate
    );

    const goalsResponse = await userApi.getGoals(userId, targetDate);
    const goals = goalsResponse.data || {
      calories: 2200,
      protein: 140,
      carbs: 250,
      fat: 70,
    };

    const stats: DailyStats = {
      date: targetDate,
      calories_in: userFoodLogs.reduce((sum, log) => sum + log.calories, 0),
      calories_out: userWorkoutLogs.reduce((sum, log) => sum + log.calories_burned, 0),
      protein_in: userFoodLogs.reduce((sum, log) => sum + log.protein, 0),
      carbs_in: userFoodLogs.reduce((sum, log) => sum + log.carbs, 0),
      fat_in: userFoodLogs.reduce((sum, log) => sum + log.fat, 0),
      goals: {
        calories: goals.calories,
        protein: goals.protein,
        carbs: goals.carbs,
        fat: goals.fat,
      },
    };

    return { success: true, data: stats };
  },
};

export const workoutApi = {
  create: async (
    userId: number,
    workoutName: string,
    caloriesBurned: number,
    durationMinutes?: number,
    date?: string
  ): Promise<ApiResponse<WorkoutLog>> => {
    const workoutLogs = getStorageItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
    
    const newLog: WorkoutLog = {
      id: Date.now(),
      user_id: userId,
      workout_name: workoutName,
      calories_burned: caloriesBurned,
      duration_minutes: durationMinutes || null,
      logged_at: new Date().toISOString(),
      date: date || new Date().toISOString().split('T')[0],
    };

    workoutLogs.push(newLog);
    setStorageItem(STORAGE_KEYS.WORKOUT_LOGS, workoutLogs);
    
    return { success: true, data: newLog, message: 'Workout logged successfully' };
  },

  getByDate: async (userId: number, date?: string): Promise<ApiResponse<WorkoutLog[]>> => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const workoutLogs = getStorageItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
    const userLogs = workoutLogs.filter(log => 
      log.user_id === userId && log.date === targetDate
    );
    
    return { success: true, data: userLogs };
  },

  getByRange: async (userId: number, startDate: string, endDate: string): Promise<ApiResponse<WorkoutLog[]>> => {
    const workoutLogs = getStorageItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
    const userLogs = workoutLogs.filter(log => 
      log.user_id === userId && 
      log.date >= startDate && 
      log.date <= endDate
    );
    
    return { success: true, data: userLogs };
  },

  delete: async (logId: number): Promise<ApiResponse<void>> => {
    const workoutLogs = getStorageItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
    const filtered = workoutLogs.filter(log => log.id !== logId);
    setStorageItem(STORAGE_KEYS.WORKOUT_LOGS, filtered);
    
    return { success: true, message: 'Workout log deleted successfully' };
  },
};

export type { ApiResponse };
