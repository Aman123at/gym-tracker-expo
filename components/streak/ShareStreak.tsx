import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Streak } from '../../utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';

type ShareStreakProps = {
  streak: Streak | null;
  onShare: () => void;
};

export default function ShareStreak({ streak, onShare }: ShareStreakProps) {
  const viewShotRef = useRef<ViewShot>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share Your Achievement</Text>
      
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
        <LinearGradient
          colors={['#4F46E5', '#6366F1', '#EC4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.centeredContent}>
            <Text style={styles.achievementLabel}>GymTrack Achievement</Text>
            
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>
                {streak?.current_streak || 0} Day Streak 🔥
              </Text>
            </View>
            
            <View style={styles.centeredContent}>
              <Text style={styles.streakNumber}>
                {streak?.current_streak || 0}
              </Text>
              <Text style={styles.streakSubtitle}>Days of Consistency</Text>
            </View>
            
            {streak?.max_streak ? (
              <Text style={styles.maxStreakText}>
                My best streak is {streak.max_streak} days!
              </Text>
            ) : null}
            
            <View style={styles.footer}>
              <Ionicons name="fitness" size={20} color="white" />
              <Text style={styles.footerText}>GymTrack</Text>
            </View>
          </View>
        </LinearGradient>
      </ViewShot>
      
      <TouchableOpacity 
        style={styles.shareButton}
        onPress={onShare}
      >
        <Text style={styles.shareButtonText}>Share My Streak</Text>
      </TouchableOpacity>
    </View>
  );
}

// Define color constants
const colors = {
  surface: '#1E1E1E',   // Assumed value for surface color
  text: '#FFFFFF',      // Assumed value for text color
  primary: '#4F46E5',   // Assuming this matches the primary gradient color
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,   // rounded-xl
    padding: 24,        // p-6
  },
  title: {
    fontSize: 20,       // text-xl
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,   // mb-4
  },
  gradient: {
    padding: 24,        // p-6
    borderRadius: 12,   // rounded-xl
  },
  centeredContent: {
    alignItems: 'center',
  },
  achievementLabel: {
    color: colors.white,
    fontSize: 18,       // text-lg
    marginBottom: 8,    // mb-2
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // bg-white/20
    borderRadius: 9999,  // rounded-full
    paddingHorizontal: 24, // px-6
    paddingVertical: 12,   // py-3
    marginBottom: 16,      // mb-4
  },
  streakBadgeText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  streakNumber: {
    color: colors.white,
    fontSize: 48,        // text-5xl
    fontWeight: 'bold',
    marginBottom: 8,     // mb-2
  },
  streakSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)', // text-white/80
  },
  maxStreakText: {
    color: 'rgba(255, 255, 255, 0.8)', // text-white/80
    marginTop: 16,                      // mt-4
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,                      // mt-6
  },
  footerText: {
    color: colors.white,
    marginLeft: 8,                      // ml-2
  },
  shareButton: {
    paddingHorizontal: 16,              // px-4
    paddingVertical: 12,                // py-3
    backgroundColor: colors.primary,    // bg-primary
    borderRadius: 8,                    // rounded-lg
    marginTop: 16,                      // mt-4
  },
  shareButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});