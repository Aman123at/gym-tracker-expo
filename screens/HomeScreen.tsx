import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useWorkout } from '../context/WorkoutContext';
import DailyWorkout from '../components/workout/DailyWorkout';
import StreakCounter from '../components/streak/StreakCounter';
import { Ionicons } from '@expo/vector-icons';
import { Workout } from '../utils/supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { isLoading, todayWorkout, streak, attendanceHistory, markAttendance, workouts, loadWorkouts  } = useWorkout();
  const today = new Date().toISOString().split('T')[0];
  const todayIdx = new Date().getDay()
  const isMarkedToday = attendanceHistory.some(a => a.date === today);

  useFocusEffect(
    useCallback(() => {
      // Reload workout data when the screen comes into focus
      if(workouts.length===0 || !todayWorkout){
        loadWorkouts();
      }
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={36} color="#6366F1" />
      </View>
    );
  }

  const getWeeklyScheduleBodyPart = (dayIndex:number) : string => {
    if(dayIndex === 0){
      return 'Rest Day'
    }else{
      if(workouts.length>0){
        const filterByDay = workouts.filter((w:Workout) => w.day_of_week === dayIndex)
        return (filterByDay && filterByDay.length>0) ? filterByDay[0].body_part : ''
      }else{
        return ''
      }
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          GymTrack
        </Text>
        
        <StreakCounter streak={streak} />
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Workout</Text>
          
          <TouchableOpacity 
            style={[styles.markButton, isMarkedToday && styles.markedButton]}
            onPress={() => isMarkedToday ? {} : markAttendance(today)}
          >
            {isMarkedToday ? (
              <View style={styles.buttonContent}>
                <Ionicons name="checkmark" size={18} color="white" />
                <Text style={styles.buttonText}>Completed</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="fitness" size={18} color="white" />
                <Text style={styles.buttonText}>Mark as Done</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {todayWorkout ? (
          <DailyWorkout workout={todayWorkout} />
        ) : (
          <View style={styles.restDayCard}>
            <Text style={styles.restDayText}>
              Today is Rest Day! 
              Take time to recover and prepare for tomorrow's workout.
            </Text>
          </View>
        )}
        
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>Weekly Schedule</Text>
          
          {Array.from({ length: 7 }).map((_, i) => {
            const dayIndex = (i + 1) % 7; // Start with Monday (1) at index 0
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[dayIndex];
            
            return (
              <View key={i} style={todayIdx===dayIndex ? styles.rowHighlighted :styles.scheduleRow}>
                <Text style={styles.dayName}>{dayName}</Text>
                <Text style={styles.bodyPart}>{getWeeklyScheduleBodyPart(dayIndex)}</Text>
              </View>
            );
          })}
          
          <TouchableOpacity 
            style={styles.customizeButton}
            onPress={() => navigation.navigate('Workout')}
          >
            <Text style={styles.customizeButtonText}>Customize Workouts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  markButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  markedButton: {
    backgroundColor: '#16A34A', // green-600
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  restDayCard: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  restDayText: {
    color: '#F8FAFC',
    textAlign: 'center',
    fontSize: 18,
  },
  scheduleCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 24,
    marginTop: 16,
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // gray-700
  },
  rowHighlighted:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal:6,
    borderWidth:2,
    borderColor:'#00FF00',
    borderRadius:8
  },
  dayName: {
    color: '#F8FAFC',
    fontWeight: '500',
  },
  bodyPart: {
    color: '#F8FAFC',
  },
  customizeButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4F46E5', // secondary color
    borderRadius: 8,
    alignSelf: 'center',
  },
  customizeButtonText: {
    color: '#F8FAFC',
  },
});