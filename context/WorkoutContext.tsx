import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { Workout, Attendance, Streak, Exercise, BodyPart } from '../utils/supabase';
import { DEFAULT_BODY_PARTS } from '../constants/workoutConstants';

type WorkoutContextType = {
  workouts: Workout[];
  todayWorkout: Workout | null;
  streak: Streak | null;
  attendanceHistory: Attendance[];
  bodyParts: BodyPart[];
  exercises: Exercise[];
  isLoading: boolean;
  markAttendance: (date: string) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  getBodyPartForDay: (dayOfWeek: number) => string;
  fetchExercisesByBodyPart: (bodyPart: string) => Promise<Exercise[]>;
  addExerciseToWorkout: (workoutId: string, exerciseId: string) => Promise<void>;
  removeExerciseFromWorkout: (exerciseId: string) => Promise<void>;
  updateExerciseDetails: (exercise: Exercise) => Promise<void>;
  loadWorkouts:()=>Promise<void>;
};

const WorkoutContext = createContext<WorkoutContextType>({
  workouts: [],
  todayWorkout: null,
  streak: null,
  attendanceHistory: [],
  bodyParts: [],
  exercises: [],
  isLoading: true,
  markAttendance: async () => {},
  updateWorkout: async () => {},
  getBodyPartForDay: () => '',
  fetchExercisesByBodyPart: async () => [],
  addExerciseToWorkout: async () => {},
  removeExerciseFromWorkout: async () => {},
  updateExerciseDetails: async () => {},
  loadWorkouts:async () => {},
});

export const useWorkout = () => useContext(WorkoutContext);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadUserData();
    } else {
      // Reset when logged out
      setWorkouts([]);
      setTodayWorkout(null);
      setStreak(null);
      setAttendanceHistory([]);
      setBodyParts([]);
      setExercises([]);
      setIsLoading(false);
    }
  }, [session]);

  async function loadUserData() {
    setIsLoading(true);
    
    try {
      await Promise.all([
        loadWorkouts(),
        loadAttendance(),
        loadStreak(),
        loadBodyParts(),
        loadExercises(),
      ]);

    } catch (error: any) {
      Alert.alert('Error', 'Failed to load data');
      console.error('Load data error:', error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadBodyParts() {
    const { data, error } = await supabase
      .from('body_parts')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return loadBodyParts();
    }
    
    setBodyParts(data as BodyPart[]);
  }

  async function loadExercises() {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return loadExercises();
    }
    
    setExercises(data as Exercise[]);
  }

  async function loadWorkouts() {
    try {
      // First, fetch all workouts for the user
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', session?.user.id);
  
      if (workoutsError) throw workoutsError;
      
      // If user has no workouts, create default ones
      if (!workoutsData || workoutsData.length === 0) {
        return;
      }
      
      // Now we'll fetch workout exercises for each workout through the junction table
      const workoutsWithExercises = await Promise.all(workoutsData.map(async (workout) => {
        // Get workout exercises from the junction table
        const { data: workoutExercisesData, error: workoutExercisesError } = await supabase
          .from('workout_exercises')
          .select(`
            id,
            sets,
            reps,
            exercise:exercise_id (
              id,
              name,
              body_part,
              default_sets,
              default_reps
            )
          `)
          .eq('workout_id', workout.id);
        
        if (workoutExercisesError) throw workoutExercisesError;
        
        // Format the exercises data
        const exercises = workoutExercisesData.map((we) => ({
          id: we.id, // This is the workout_exercise junction id
          workout_id: workout.id,
          name: we.exercise.name,
          body_part: we.exercise.body_part,
          sets: we.sets,
          reps: we.reps,
          exercise_id: we.exercise.id // Keep reference to the original exercise
        }));
        
        // Return the workout with its exercises
        return {
          ...workout,
          exercises
        };
      }));
      
      // Update state with the workouts and exercises
      setWorkouts(workoutsWithExercises);
      // Set today's workout
      const today = getTodayWorkout(workoutsWithExercises);
      setTodayWorkout(today);
    } catch (error) {
      console.error('Error loading workouts:', error);
      throw error;
    }
  }

  async function loadAttendance() {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', session?.user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    setAttendanceHistory(data as Attendance[]);
  }

  async function createNewStreak(){
    const { data: newStreak, error: createError } = await supabase
        .from('streaks')
        .upsert(
          {
            user_id: session?.user.id,
            current_streak: 0,
            max_streak: 0,
          },
          {
            onConflict: 'user_id', // The column that determines if a record already exists
            returning: 'representation' // Returns the resulting record after insert/update
          }
        )
        .select('*')
        .single();

      if (createError) throw createError;
      setStreak(newStreak as Streak);
      return
  }

  async function loadStreak() {
    
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', session?.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw error;
    }

    if (data) {
      setStreak(data as Streak);
    } else {
      // Create new streak record for user
      createNewStreak()
      
    }
  }

  function getTodayWorkout(workoutData: Workout[]): Workout | null {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    if (dayOfWeek === 0) return null; // Sunday is rest day
    
    const todayWorkout = workoutData.find(w => w.day_of_week === dayOfWeek);
    
    return todayWorkout || null;
  }

  function getBodyPartForDay(dayOfWeek: number): string {
    const workout = workouts.find(w => w.day_of_week === dayOfWeek);
    return workout ? workout.body_part : DEFAULT_BODY_PARTS[dayOfWeek];
  }

  async function fetchExercisesByBodyPart(bodyPart: string): Promise<Exercise[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('body_part', bodyPart)
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      // Transform data to match Exercise type
      return data.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        body_part: exercise.body_part,
        default_sets: exercise.default_sets,
        default_reps: exercise.default_reps
      }));
    } catch (error) {
      console.error('Error fetching exercises by body part:', error);
      throw error;
    }
  }

  async function addExerciseToWorkout(workoutId: string, exerciseId: string) {
    const exercise = exercises.find(e => e.id === exerciseId);
    
    if (!exercise) {
      throw new Error('Exercise not found');
    }
    
    const { error } = await supabase
      .from('workout_exercises')
      .insert({
        workout_id: workoutId,
        exercise_id: exerciseId,
        sets: exercise.default_sets || 3,
        reps: exercise.default_reps || 12
      });
      
    if (error) throw error;
    
    // Reload workouts to get updated data
    await loadWorkouts();
  }

  async function removeExerciseFromWorkout(exerciseId: string) {
    const { error } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('id', exerciseId);
      
    if (error) throw error;
    
    // Reload workouts to get updated data
    await loadWorkouts();
  }

  async function updateExerciseDetails(exercise: Exercise) {
    const { error } = await supabase
      .from('workout_exercises')
      .update({
        sets: exercise.sets,
        reps: exercise.reps
      })
      .eq('id', exercise.id);
      
    if (error) throw error;
    
    // Reload workouts to get updated data
    await loadWorkouts();
  }

  async function markAttendance(date: string) {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toISOString().split('T')[0];
    const dayOfWeek = dateObj.getDay();
    
    // Check if already marked
    const existingAttendance = attendanceHistory.find(a => a.date === formattedDate);
    
    if (existingAttendance) {
      // Remove attendance if already marked
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', existingAttendance.id);
      
      if (error) throw error;
      
      // Update local state
      setAttendanceHistory(prev => prev.filter(a => a.id !== existingAttendance.id));
      
      // Update streak
      await updateStreak(false, formattedDate);
    } else {
      // Add new attendance
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          user_id: session?.user.id,
          date: formattedDate,
          attended: true,
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Update local state
      setAttendanceHistory(prev => [data as Attendance, ...prev]);
      
      // Update streak
      await updateStreak(true, formattedDate);
    }
  }

  async function updateStreak(attended: boolean, date: string) {
    if (!streak) return;
    
    const today = new Date(date);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if yesterday's attendance exists (except for Sunday)
    const yesterdayIsAttended = yesterday.getDay() === 0 || 
      attendanceHistory.some(a => a.date === yesterdayStr);
    
    let newStreak = { ...streak };
    
    if (attended) {
      // If adding attendance
      if (yesterdayIsAttended || streak.current_streak === 0) {
        // Continue or start streak
        newStreak.current_streak += 1;
        if (newStreak.current_streak > newStreak.max_streak) {
          newStreak.max_streak = newStreak.current_streak;
        }
        if (!newStreak.start_date) {
          newStreak.start_date = date;
        }
      } else {
        // Reset streak if yesterday was missed
        newStreak.current_streak = 1;
        newStreak.start_date = date;
      }
      newStreak.last_attendance_date = date;
    } else {
      // If removing attendance
      if (streak.last_attendance_date === date) {
        // Find the most recent attendance
        const sortedAttendance = [...attendanceHistory]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (sortedAttendance.length > 0) {
          newStreak.last_attendance_date = sortedAttendance[0].date;
          
          // Recalculate streak
          let currentStreak = 1;
          let previousDate = new Date(sortedAttendance[0].date);
          
          for (let i = 1; i < sortedAttendance.length; i++) {
            const attendanceDate = new Date(sortedAttendance[i].date);
            const diffDays = Math.floor((previousDate.getTime() - attendanceDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1 || (diffDays === 2 && previousDate.getDay() === 1 && attendanceDate.getDay() === 6)) {
              currentStreak++;
              previousDate = attendanceDate;
            } else {
              break;
            }
          }
          
          newStreak.current_streak = currentStreak;
        } else {
          // No attendance left
          newStreak.current_streak = 0;
          newStreak.last_attendance_date = '';
          newStreak.start_date = '';
        }
      }
    }
    
    // Update in database
    const { error } = await supabase
      .from('streaks')
      .update(newStreak)
      .eq('id', streak.id);
    
    if (error) throw error;
    
    // Update local state
    setStreak(newStreak);
  }

  async function updateWorkout(workout: Workout) {
    try {
      // Update the workout in the database
      const { data, error } = await supabase
        .from('workouts')
        .update({
          body_part: workout.body_part,
        })
        .eq('id', workout.id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // If exercises are provided, update the workout exercises
      if (workout.exercises) {
        // First, remove all existing workout_exercises for this workout
        const { error: deleteError } = await supabase
          .from('workout_exercises')
          .delete()
          .eq('workout_id', workout.id);
          
        if (deleteError) throw deleteError;
        
        // Now add the new workout exercises
        for (const exercise of workout.exercises) {
          const { error: insertError } = await supabase
            .from('workout_exercises')
            .insert({
              workout_id: workout.id,
              exercise_id: exercise.exercise_id || exercise.id, // Use exercise_id if available
              sets: exercise.sets,
              reps: exercise.reps
            });
            
          if (insertError) {
            console.error('Error inserting exercise:', insertError);
            throw insertError;
          }
        }
      }
      
      // After updating the database, reload the workouts
      await loadWorkouts();
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  }

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        todayWorkout,
        streak,
        attendanceHistory,
        bodyParts,
        exercises,
        isLoading,
        markAttendance,
        updateWorkout,
        getBodyPartForDay,
        fetchExercisesByBodyPart,
        addExerciseToWorkout,
        removeExerciseFromWorkout,
        updateExerciseDetails,
        loadWorkouts
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};