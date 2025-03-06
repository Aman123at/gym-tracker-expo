import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// SecureStore adapter implementation
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Database types (to be used with TypeScript)
export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type BodyPart = {
  id: string;
  name: string;
  created_at?: string;
};

export type Exercise = {
  id: string;
  name: string;
  body_part: string;
  default_sets?: number;
  default_reps?: number;
  workout_id?: string; // When associated with a workout
  sets?: number;
  reps?: number;
  created_at?: string;
};

export type Workout = {
  id: string;
  user_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  body_part: string;
  exercises?: Exercise[];
  created_at?: string;
  updated_at?: string;
};

export type WorkoutExercise = {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  created_at?: string;
};

export type Attendance = {
  id: string;
  user_id: string;
  date: string;
  attended: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Streak = {
  id: string;
  user_id: string;
  current_streak: number;
  max_streak: number;
  start_date: string;
  last_attendance_date: string;
  created_at?: string;
  updated_at?: string;
};