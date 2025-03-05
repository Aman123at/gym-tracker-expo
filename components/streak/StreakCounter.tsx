import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Streak } from '../../utils/supabase';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type StreakCounterProps = {
  streak: Streak | null;
};

export default function StreakCounter({ streak }: StreakCounterProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  React.useEffect(() => {
    // Animate when streak changes
    scale.value = withSpring(1.2, { damping: 5 });
    
    setTimeout(() => {
      scale.value = withSpring(1);
    }, 500);
  }, [streak?.current_streak]);
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerText}>Current Streak</Text>
          <View style={styles.streakRow}>
            <Animated.Text 
              style={[styles.streakCount, animatedStyle]}
            >
              {streak?.current_streak || 0}
            </Animated.Text>
            <Text style={styles.daysText}>days</Text>
          </View>
        </View>
        
        <View style={styles.iconContainer}>
          <Ionicons name="flame" size={32} color="#6366F1" />
        </View>
      </View>
      
      {streak?.current_streak ? (
        <Text style={styles.streakMessage}>
          Keep it up! You've been consistent since{' '}
          {streak.start_date ? new Date(streak.start_date).toLocaleDateString() : 'recently'}.
        </Text>
      ) : (
        <Text style={styles.streakMessage}>
          Start your streak by marking today's workout as complete!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 24,
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    color: '#F8FAFC',
    fontSize: 18,
    marginBottom: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  daysText: {
    color: '#F8FAFC',
    fontSize: 18,
    marginLeft: 8,
  },
  iconContainer: {
    height: 64,
    width: 64,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakMessage: {
    color: '#94A3B8',
    marginTop: 8,
  },
});