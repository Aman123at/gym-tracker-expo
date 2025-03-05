import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { Workout, Attendance, Streak } from '../utils/supabase';

type WorkoutContextType = {
  workouts: Workout[];
  todayWorkout: Workout | null;
  streak: Streak | null;
  attendanceHistory: Attendance[];
  isLoading: boolean;
  markAttendance: (date: string) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  getBodyPartForDay: (dayOfWeek: number) => string;
  shareStreak: () => void;
};

const defaultBodyParts = [
  '', // Sunday (rest day)
  'Legs', // Monday
  'Chest', // Tuesday
  'Back', // Wednesday
  'Shoulders', // Thursday
  'Arms', // Friday
  'Core', // Saturday
];

const WorkoutContext = createContext<WorkoutContextType>({
  workouts: [],
  todayWorkout: null,
  streak: null,
  attendanceHistory: [],
  isLoading: true,
  markAttendance: async () => {},
  updateWorkout: async () => {},
  getBodyPartForDay: () => '',
  shareStreak: () => {},
});

export const useWorkout = () => useContext(WorkoutContext);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
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
      ]);

    } catch (error: any) {
      Alert.alert('Error', 'Failed to load data');
      console.error('Load data error:', error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadWorkouts() {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises(*)
      `)
      .eq('user_id', session?.user.id);

    if (error) throw error;
        // console.log("LOAD WORKOUTS>>",data,error)
    // If user has no workouts, create default ones
    if (!data || data.length === 0) {
      await createDefaultWorkouts();
    } else {
      // console.log("INSIDE SET WORKOUTS>>",data)
      setWorkouts(data as Workout[]);
      setTodayWorkout(getTodayWorkout(data));
    }
  }

  async function createDefaultWorkouts() {
    const userId = session?.user.id;
    
    // Create a workout for each day of the week (except Sunday)
    for (let day = 1; day <= 6; day++) {
      await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          day_of_week: day,
          body_part: defaultBodyParts[day],
        });
    }

    // Reload workouts
    await loadWorkouts();
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

  function getTodayWorkout(workoutData:Workout[]): Workout | null {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    if (dayOfWeek === 0) return null; // Sunday is rest day
    return workoutData.find(w => w.day_of_week === dayOfWeek) || null;
  }

  function getBodyPartForDay(dayOfWeek: number): string {
    const workout = workouts.find(w => w.day_of_week === dayOfWeek);
    return workout ? workout.body_part : defaultBodyParts[dayOfWeek];
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
    const { data, error } = await supabase
      .from('workouts')
      .update({
        body_part: workout.body_part,
      })
      .eq('id', workout.id)
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Update local state
    setWorkouts(prev => 
      prev.map(w => w.id === workout.id ? { ...w, ...data } : w)
    );
    
    if (workout.day_of_week === new Date().getDay()) {
      setTodayWorkout({ ...todayWorkout, ...data } as Workout);
    }
  }

  function shareStreak() {
    // This will be implemented in a separate component
    // Will generate a sharable image of the streak
    if (!streak) return;
    
    // Generate and share image
    Alert.alert('Sharing', `Ready to share your ${streak.current_streak} day streak!`);
  }

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        todayWorkout,
        streak,
        attendanceHistory,
        isLoading,
        markAttendance,
        updateWorkout,
        getBodyPartForDay,
        shareStreak,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};