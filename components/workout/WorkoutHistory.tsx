import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Attendance, Workout } from '../../utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';

type WorkoutHistoryProps = {
  attendanceHistory: Attendance[];
  workouts: Workout[];
};

export default function WorkoutHistory({ attendanceHistory, workouts }: WorkoutHistoryProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<Attendance | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  // Get the body part for a specific date
  const getBodyPartForDate = (date: string): string => {
    const workoutDate = new Date(date);
    const dayOfWeek = workoutDate.getDay();
    const workout = workouts.find(w => w.day_of_week === dayOfWeek);
    return workout ? workout.body_part : 'Unknown';
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format date for modal display
  const formatFullDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get workout status icon
  const getWorkoutIcon = (bodyPart: string) => {
    switch(bodyPart) {
      case 'Legs':
        return 'body';
      case 'Chest':
        return 'fitness';
      case 'Back':
        return 'barbell';
      case 'Shoulders':
        return 'basketball';
      case 'Arms':
        return 'bicycle';
      case 'Core':
        return 'flame';
      default:
        return 'barbell';
    }
  };

  // Sample exercises for each body part
  const getExercisesForBodyPart = (bodyPart: string) => {
    const exercisesByBodyPart: Record<string, { name: string, sets: number, reps: number }[]> = {
      'Legs': [
        { name: 'Squats', sets: 3, reps: 12 },
        { name: 'Lunges', sets: 3, reps: 10 },
        { name: 'Leg Press', sets: 4, reps: 8 },
        { name: 'Deadlifts', sets: 3, reps: 8 },
        { name: 'Calf Raises', sets: 3, reps: 15 }
      ],
      'Chest': [
        { name: 'Bench Press', sets: 4, reps: 8 },
        { name: 'Push-ups', sets: 3, reps: 12 },
        { name: 'Chest Flys', sets: 3, reps: 10 },
        { name: 'Incline Press', sets: 3, reps: 10 },
        { name: 'Dips', sets: 3, reps: 8 }
      ],
      'Back': [
        { name: 'Pull-ups', sets: 3, reps: 8 },
        { name: 'Rows', sets: 3, reps: 12 },
        { name: 'Lat Pulldowns', sets: 4, reps: 10 },
        { name: 'Deadlifts', sets: 3, reps: 8 },
        { name: 'Face Pulls', sets: 3, reps: 12 }
      ],
      'Shoulders': [
        { name: 'Shoulder Press', sets: 4, reps: 8 },
        { name: 'Lateral Raises', sets: 3, reps: 12 },
        { name: 'Front Raises', sets: 3, reps: 12 },
        { name: 'Shrugs', sets: 3, reps: 15 },
        { name: 'Upright Rows', sets: 3, reps: 10 }
      ],
      'Arms': [
        { name: 'Bicep Curls', sets: 3, reps: 12 },
        { name: 'Tricep Extensions', sets: 3, reps: 12 },
        { name: 'Hammer Curls', sets: 3, reps: 10 },
        { name: 'Skull Crushers', sets: 3, reps: 10 },
        { name: 'Chin-ups', sets: 3, reps: 8 }
      ],
      'Core': [
        { name: 'Planks', sets: 3, reps: 45 },
        { name: 'Crunches', sets: 3, reps: 15 },
        { name: 'Leg Raises', sets: 3, reps: 12 },
        { name: 'Russian Twists', sets: 3, reps: 20 },
        { name: 'Ab Rollouts', sets: 3, reps: 10 }
      ]
    };

    return exercisesByBodyPart[bodyPart] || [
      { name: 'Exercise 1', sets: 3, reps: 12 },
      { name: 'Exercise 2', sets: 3, reps: 12 },
      { name: 'Exercise 3', sets: 3, reps: 12 }
    ];
  };

  // Open workout details modal
  const openDetails = (workout: Attendance) => {
    setSelectedWorkout(workout);
    setDetailsVisible(true);
  };

  // Close workout details modal
  const closeDetails = () => {
    setDetailsVisible(false);
    setSelectedWorkout(null);
  };

  // Generate a random intensity level (for demo purposes)
  const getRandomIntensity = () => {
    const intensities = ['Light', 'Moderate', 'Intense', 'Very Intense'];
    return intensities[Math.floor(Math.random() * intensities.length)];
  };

  // Generate a random duration (for demo purposes)
  const getRandomDuration = () => {
    return Math.floor(Math.random() * 60) + 30; // 30-90 minutes
  };

  // Render workout items in the list
  const renderWorkoutItem = ({ item }: { item: Attendance }) => {
    const bodyPart = getBodyPartForDate(item.date);
    const iconName = getWorkoutIcon(bodyPart);
    
    return (
      <TouchableOpacity 
        style={styles.workoutItem}
        onPress={() => openDetails(item)}
        key={item.id}
      >
        <View style={styles.workoutIcon}>
          <Ionicons 
            // @ts-ignore
            name={iconName} 
            size={24} 
            color="#6366F1" 
          />
        </View>

        <View style={styles.workoutInfo}>
          <Text style={styles.bodyPartText}>{bodyPart}</Text>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </TouchableOpacity>
    );
  };

  // Sort attendance history by date (newest first)
  const sortedHistory = [...attendanceHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <View style={styles.container}>
    <Text style={styles.headerText}>Workout History</Text>
    
    {sortedHistory.length > 0 ? (
      <View>
        {sortedHistory.map(item => renderWorkoutItem({item}))}
      </View>
    ) : (
      <View style={styles.emptyContainer}>
        <Ionicons name="fitness-outline" size={48} color="#64748B" />
        <Text style={styles.emptyText}>No workout history yet</Text>
        <Text style={styles.emptySubText}>Complete your first workout to start tracking</Text>
      </View>
    )}

    {/* Workout Details Modal */}
    <Modal
      visible={detailsVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={closeDetails}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={styles.modalContent}
        >
          {selectedWorkout && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {getBodyPartForDate(selectedWorkout.date)} Workout
                </Text>
                <TouchableOpacity onPress={closeDetails} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#F8FAFC" />
                </TouchableOpacity>
              </View>

              <View style={styles.dateContainer}>
                <Ionicons name="calendar" size={20} color="#6366F1" />
                <Text style={styles.modalDate}>{formatFullDate(selectedWorkout.date)}</Text>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={20} color="#6366F1" />
                  <Text style={styles.statLabel}>Duration</Text>
                  <Text style={styles.statValue}>{getRandomDuration()} min</Text>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="flame" size={20} color="#6366F1" />
                  <Text style={styles.statLabel}>Intensity</Text>
                  <Text style={styles.statValue}>{getRandomIntensity()}</Text>
                </View>
              </View>

              <View style={styles.exercisesContainer}>
                <Text style={styles.exercisesTitle}>Exercises</Text>
                
                {getExercisesForBodyPart(getBodyPartForDate(selectedWorkout.date)).map((exercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetail}>
                      {exercise.sets} sets × {exercise.reps} {exercise.reps > 20 ? 'sec' : 'reps'}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </LinearGradient>
      </View>
    </Modal>
  </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 8,
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  bodyPartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: height * 0.75,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalDate: {
    fontSize: 16,
    color: '#F8FAFC',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 4,
  },
  exercisesContainer: {
    marginBottom: 24,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  exerciseName: {
    fontSize: 16,
    color: '#F8FAFC',
  },
  exerciseDetail: {
    fontSize: 14,
    color: '#94A3B8',
  }
});