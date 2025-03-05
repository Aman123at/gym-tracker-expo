import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Workout } from '../../utils/supabase';

type DailyWorkoutProps = {
  workout: Workout;
};

export default function DailyWorkout({ workout }: DailyWorkoutProps) {
  // Example exercises for each body part
  const exercisesByBodyPart: Record<string, string[]> = {
    'Legs': ['Squats', 'Lunges', 'Leg Press', 'Deadlifts', 'Calf Raises'],
    'Chest': ['Bench Press', 'Push-ups', 'Chest Flys', 'Incline Press', 'Dips'],
    'Back': ['Pull-ups', 'Rows', 'Lat Pulldowns', 'Deadlifts', 'Face Pulls'],
    'Shoulders': ['Shoulder Press', 'Lateral Raises', 'Front Raises', 'Shrugs', 'Upright Rows'],
    'Arms': ['Bicep Curls', 'Tricep Extensions', 'Hammer Curls', 'Skull Crushers', 'Chin-ups'],
    'Core': ['Planks', 'Crunches', 'Leg Raises', 'Russian Twists', 'Ab Rollouts'],
  };

  // Get exercises for the current body part or use default
  const exercises = exercisesByBodyPart[workout.body_part] || 
    ['Exercise 1', 'Exercise 2', 'Exercise 3', 'Exercise 4', 'Exercise 5'];

  return (
    <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerText}>{workout.body_part} Day</Text>
    </View>
    
    <View style={styles.content}>
      {exercises.map((exercise, index) => (
        <View key={index} style={styles.exerciseRow}>
          <Text style={styles.exerciseName}>{exercise}</Text>
          <Text style={styles.exerciseReps}>3 × 12</Text>
        </View>
      ))}
      
      <Text style={styles.instructions}>
        Complete 3 sets of 12 reps for each exercise, rest 60-90 seconds between sets.
      </Text>
    </View>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#6366F1',
    padding: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 16,
  },
  exerciseRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseName: {
    color: '#F8FAFC',
    fontWeight: '500',
  },
  exerciseReps: {
    color: '#94A3B8',
  },
  instructions: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 16,
    fontStyle: 'italic',
  },
});