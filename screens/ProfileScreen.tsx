import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Share, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import ShareStreak from '../components/streak/ShareStreak';
import WorkoutHistory from '../components/workout/WorkoutHistory';
import ViewShot from 'react-native-view-shot';
import { supabase } from '../utils/supabase';
import * as FileSystem from 'expo-file-system';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { streak, attendanceHistory, workouts } = useWorkout();
  const viewShotRef = useRef<ViewShot>(null);
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Profile</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.emailText}>{session?.user?.email}</Text>
        
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

        <ShareStreak streak={streak} />
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Statistics</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Current Streak</Text>
          <Text style={styles.statValue}>{streak?.current_streak || 0} {(streak?.current_streak || 0) === 1 ? 'Day':'Days'}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Longest Streak</Text>
          <Text style={styles.statValue}>{streak?.max_streak || 0} {(streak?.max_streak || 0) === 1 ? 'Day':'Days'}</Text>
        </View>
        
        <View style={[styles.statRow, styles.lastStatRow]}>
          <Text style={styles.statLabel}>Start Date</Text>
          <Text style={styles.statValue}>
            {streak?.start_date 
              ? new Date(streak.start_date).toLocaleDateString() 
              : 'Not started'}
          </Text>
        </View>
      </View>

      {/* Add the new WorkoutHistory component */}
      <WorkoutHistory 
        attendanceHistory={attendanceHistory}
        workouts={workouts}
      />
      
      <View style={styles.card}>
        <Text style={styles.versionText}>
          GymTrack v1.0.0
        </Text>
        <Text style={styles.versionSubtext}>
          Developed with Expo and React Native
        </Text>
      </View>
      </ScrollView>
    </View>
  );
}

// Define color constants for consistency
const colors = {
  background: '#121212', // Assuming a dark theme based on border-gray-700
  surface: '#1E1E1E',    // Slightly lighter than background
  text: '#FFFFFF',       // White text for dark theme
  borderColor: '#374151' // gray-700 equivalent
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24, // p-6 (6 * 4)
  },
  scrollContent: {
    paddingBottom: 20, // Add extra padding at the bottom for better scrolling
  },
  header: {
    fontSize: 24, // text-2xl
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24, // mb-6
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12, // rounded-xl
    padding: 24, // p-6
    marginBottom: 24, // mb-6
    marginTop: 24, // mt-6 for some cards
  },
  label: {
    fontSize: 18, // text-lg
    color: colors.text,
    marginBottom: 8, // mb-2
  },
  emailText: {
    color: colors.text,
    fontSize: 20, // text-xl
    marginBottom: 16, // mb-4
  },
  signOutButton: {
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3
    backgroundColor: '#dc2626', // bg-red-600
    borderRadius: 8, // rounded-lg
    marginTop: 8, // mt-2
  },
  signOutButtonText: {
    color: '#ffffff', // text-white
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 18, // text-lg
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8, // mb-2
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8, // py-2
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  lastStatRow: {
    borderBottomWidth: 0, // Remove border for last row
  },
  statLabel: {
    color: colors.text,
  },
  statValue: {
    color: colors.text,
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 18, // text-lg
    color: colors.text,
    marginBottom: 8, // mb-2
    textAlign: 'center',
  },
  versionSubtext: {
    fontSize: 14, // text-sm
    color: '#9ca3af', // text-gray-400
    textAlign: 'center',
  },
});