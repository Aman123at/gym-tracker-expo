import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Share, Dimensions, Animated } from 'react-native';
import { Streak, supabase } from '../../utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
// import { supabase } from '../utils/supabase';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '../../context/AuthContext';
import Svg, { Path, Circle, G } from 'react-native-svg';

type ShareStreakProps = {
  streak: Streak | null;
};


export default function ShareStreak({ streak }: ShareStreakProps) {
  const viewShotRef = useRef<ViewShot>(null);
  const { session } = useAuth();

  // Get the longest streak (either max_streak or current_streak if it's higher)
  const getLongestStreak = () => {
    const maxStreak = streak?.max_streak || 0;
    const currentStreak = streak?.current_streak || 0;
    return Math.max(maxStreak, currentStreak);
  };

  const handleShare = async () => {
    try {
      // Show loading indicator
      Alert.alert('Processing', 'Generating your achievement image...');
      
      // 1. Capture the view as an image
      if (!viewShotRef.current) {
        throw new Error('ViewShot reference not available');
      }
      
      const uri = await viewShotRef.current.capture();
      
      // 2. Generate a unique filename
      const timestamp = Date.now();
      const userId = session?.user.id;
      const filename = `streak_${userId}_${timestamp}.png`;
      
      // 3. Upload to Supabase Storage
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }
      
      const fileBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const filePath = `public/${filename}`;
      
      const { data, error } = await supabase.storage
        .from('achievements')
        .upload(filePath, decode(fileBase64), {
          contentType: 'image/png',
          upsert: true,
        });
      
      if (error) {
        throw error;
      }
      
      // 4. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('achievements')
        .getPublicUrl(filePath);
      
      // 5. Share the image URL
      const result = await Share.share({
        message: `Check out my ${streak?.current_streak || 0} day gym streak with GymTrack! 💪 ${publicUrl}`,
        // url: Platform.OS === 'ios' ? publicUrl : undefined,
        url: publicUrl,
        title: 'My GymTrack Streak',
      });
      
    } catch (error: any) {
      console.error('Sharing error:', error);
      Alert.alert('Error', error.message || 'Failed to share your achievement');
    }
  };
  
    // Helper function to decode Base64
    const decode = (base64: string) => {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    };

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
            <View style={styles.logoContainer}>
              <Ionicons name="fitness" size={28} color="white" />
              <Text style={styles.logoText}>GymTrack</Text>
            </View>
            
            <Text style={styles.achievementLabel}>WORKOUT ACHIEVEMENT</Text>
            
            <View style={styles.streakDisplay}>
              <Text style={styles.streakCount}>{streak?.current_streak || 0}</Text>
              <Text style={styles.streakLabel}>DAY STREAK</Text>
              <View style={styles.streakIcon}>
                <Ionicons name="flame" size={24} color="#FFC107" />
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statTitle}>CURRENT</Text>
                <Text style={styles.statValue}>{streak?.current_streak || 0}</Text>
                <Text style={styles.statUnit}>days</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statBox}>
                <Text style={styles.statTitle}>LONGEST</Text>
                <Text style={styles.statValue}>{getLongestStreak()}</Text>
                <Text style={styles.statUnit}>days</Text>
              </View>
            </View>
            
            {streak?.start_date ? (
              <View style={styles.startDateContainer}>
                <Text style={styles.startDateLabel}>STARTED</Text>
                <Text style={styles.startDateValue}>
                  {new Date(streak.start_date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            ) : null}
            
            <View style={styles.footer}>
              <View style={styles.footerLine} />
              <Text style={styles.footerText}>CONSISTENCY IS KEY</Text>
              <View style={styles.footerLine} />
            </View>
          </View>
        </LinearGradient>
      </ViewShot>
      
      <TouchableOpacity 
        style={styles.shareButton}
        onPress={handleShare}
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

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  gradient: {
    padding: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  centeredContent: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  achievementLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 20,
  },
  streakDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  streakCount: {
    color: colors.white,
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: -5,
  },
  streakLabel: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
  },
  streakIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  statTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    color: colors.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  statUnit: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  startDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  startDateLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: 1,
  },
  startDateValue: {
    color: colors.white,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginHorizontal: 12,
  },
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: 16,
  },
  shareButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});