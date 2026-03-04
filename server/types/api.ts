export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateFoodLogRequest {
  user_id: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url?: string;
  date?: string;
}

export interface CreateWorkoutLogRequest {
  user_id: number;
  workout_name: string;
  calories_burned: number;
  duration_minutes?: number;
  date?: string;
}

export interface UpdateUserRequest {
  display_name?: string;
  weight?: number;
  height?: number;
}

export interface UpdateGoalsRequest {
  user_id: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  date?: string;
}
