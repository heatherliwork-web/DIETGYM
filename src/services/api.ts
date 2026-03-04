const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface User {
  id: number;
  username: string;
  display_name: string | null;
  weight: number;
  height: number;
  created_at: string;
  updated_at: string;
}

interface DailyGoal {
  id: number;
  user_id: number;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

interface FoodLog {
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

interface WorkoutLog {
  id: number;
  user_id: number;
  workout_name: string;
  calories_burned: number;
  duration_minutes: number | null;
  logged_at: string;
  date: string;
}

interface DailyStats {
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

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const userApi = {
  create: async (username: string, displayName?: string, weight?: number, height?: number): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify({
        username,
        display_name: displayName || username,
        weight: weight || 70,
        height: height || 175,
      }),
    });
  },

  get: async (userId: number): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users/${userId}`);
  },

  update: async (userId: number, updates: Partial<User>): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  getGoals: async (userId: number, date?: string): Promise<ApiResponse<DailyGoal>> => {
    const query = date ? `?date=${date}` : '';
    return apiRequest<DailyGoal>(`/users/${userId}/goals${query}`);
  },

  updateGoals: async (userId: number, goals: Partial<DailyGoal>, date?: string): Promise<ApiResponse<DailyGoal>> => {
    return apiRequest<DailyGoal>(`/users/${userId}/goals`, {
      method: 'PUT',
      body: JSON.stringify({ ...goals, date }),
    });
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
    return apiRequest<FoodLog>('/food', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        food_name: foodName,
        calories,
        protein,
        carbs,
        fat,
        image_url: imageUrl,
        date,
      }),
    });
  },

  getByDate: async (userId: number, date?: string): Promise<ApiResponse<FoodLog[]>> => {
    const query = date ? `?date=${date}` : '';
    return apiRequest<FoodLog[]>(`/food/${userId}${query}`);
  },

  getByRange: async (userId: number, startDate: string, endDate: string): Promise<ApiResponse<FoodLog[]>> => {
    return apiRequest<FoodLog[]>(`/food/${userId}/range?start_date=${startDate}&end_date=${endDate}`);
  },

  delete: async (logId: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/food/${logId}`, {
      method: 'DELETE',
    });
  },

  getStats: async (userId: number, date?: string): Promise<ApiResponse<DailyStats>> => {
    const query = date ? `?date=${date}` : '';
    return apiRequest<DailyStats>(`/food/${userId}/stats${query}`);
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
    return apiRequest<WorkoutLog>('/workouts', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        workout_name: workoutName,
        calories_burned: caloriesBurned,
        duration_minutes: durationMinutes,
        date,
      }),
    });
  },

  getByDate: async (userId: number, date?: string): Promise<ApiResponse<WorkoutLog[]>> => {
    const query = date ? `?date=${date}` : '';
    return apiRequest<WorkoutLog[]>(`/workouts/${userId}${query}`);
  },

  getByRange: async (userId: number, startDate: string, endDate: string): Promise<ApiResponse<WorkoutLog[]>> => {
    return apiRequest<WorkoutLog[]>(`/workouts/${userId}/range?start_date=${startDate}&end_date=${endDate}`);
  },

  delete: async (logId: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/workouts/${logId}`, {
      method: 'DELETE',
    });
  },
};

export type { User, DailyGoal, FoodLog, WorkoutLog, DailyStats, ApiResponse };
