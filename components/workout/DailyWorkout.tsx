import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Exercise, Workout } from '../../utils/supabase';

type DailyWorkoutProps = {
  workout: Workout;
};

export default function DailyWorkout({ workout }: DailyWorkoutProps) {
  return (
    <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerText}>{workout.body_part} Day</Text>
    </View>
    
    <View style={styles.content}>
      {workout.exercises ? workout.exercises.map((exercise:Exercise, index) => (
        <View key={index} style={styles.exerciseRow}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseReps}>{exercise.sets || 3} × {exercise.reps || 12}</Text>
        </View>
      )):null}
      
      <Text style={styles.instructions}>
        Rest 60-90 seconds between sets.
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