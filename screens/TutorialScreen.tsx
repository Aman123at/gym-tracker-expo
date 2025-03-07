import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import { Exercise } from '../utils/supabase';

// Group exercises by body part
const groupExercisesByBodyPart = (exercises: Exercise[]) => {
  return exercises.reduce((groups: Record<string, Exercise[]>, exercise) => {
    const bodyPart = exercise.body_part;
    if (!groups[bodyPart]) {
      groups[bodyPart] = [];
    }
    groups[bodyPart].push(exercise);
    return groups;
  }, {});
};

// Extract YouTube video ID from URL
const getYoutubeVideoId = (url: string) => {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function TutorialScreen() {
  const { session } = useAuth();
  const { exercises, isLoading } = useWorkout();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const exercisesByBodyPart = groupExercisesByBodyPart(exercises);

  const toggleSection = (bodyPart: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [bodyPart]: !prev[bodyPart]
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise Tutorials</Text>
      
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <View style={styles.content}>
          {/* Left panel - Exercise list */}
          <ScrollView style={styles.exerciseList}>
            {Object.keys(exercisesByBodyPart).sort().map((bodyPart) => (
              <View key={bodyPart} style={styles.bodyPartSection}>
                <TouchableOpacity 
                  style={styles.bodyPartHeader}
                  onPress={() => toggleSection(bodyPart)}
                >
                  <Text style={styles.bodyPartTitle}>{bodyPart}</Text>
                  <Text style={styles.expandIcon}>
                    {expandedSections[bodyPart] ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                
                {expandedSections[bodyPart] && (
                  <View style={styles.exerciseItems}>
                    {exercisesByBodyPart[bodyPart].map((exercise) => (
                      <TouchableOpacity
                        key={exercise.id}
                        style={[
                          styles.exerciseItem,
                          selectedExercise?.id === exercise.id && styles.selectedExerciseItem
                        ]}
                        onPress={() => {
                          setSelectedExercise(exercise);
                          setSelectedVideoIndex(0); // Reset to first video when changing exercise
                        }}
                      >
                        <Text 
                          style={[
                            styles.exerciseName, 
                            selectedExercise?.id === exercise.id && styles.selectedExerciseName
                          ]}
                        >
                          {exercise.name}
                        </Text>
                        {exercise.tutorialurls && exercise.tutorialurls.length > 0 && (
                          <Text style={styles.videoCount}>
                            {exercise.tutorialurls.length} {exercise.tutorialurls.length === 1 ? 'video' : 'videos'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
          
          {/* Right panel - Tutorial video */}
          <View style={styles.videoContainer}>
            {selectedExercise ? (
              selectedExercise.tutorialurls && selectedExercise.tutorialurls.length > 0 ? (
                <View style={styles.videoWrapper}>
                  <Text style={styles.exerciseTitle}>{selectedExercise.name}</Text>
                  
                  <View style={styles.videoAspectRatioContainer}>
                    <View style={styles.webViewContainer}>
                      {getYoutubeVideoId(selectedExercise.tutorialurls[selectedVideoIndex]) ? (
                        <WebView
                          style={styles.webView}
                          javaScriptEnabled={true}
                          domStorageEnabled={true}
                          source={{
                            uri: `https://www.youtube.com/embed/${getYoutubeVideoId(selectedExercise.tutorialurls[selectedVideoIndex])}?rel=0&autoplay=0&showinfo=0&controls=1`
                          }}
                        />
                      ) : (
                        <View style={styles.errorContainer}>
                          <Text style={styles.errorText}>Invalid YouTube URL</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {/* Video selector if multiple tutorials */}
                  {selectedExercise.tutorialurls && selectedExercise.tutorialurls.length > 1 && (
                    <View style={styles.videoSelector}>
                      <Text style={styles.videoSelectorTitle}>Available Tutorials:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedExercise.tutorialurls.map((_, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.videoSelectorItem,
                              selectedVideoIndex === index && styles.selectedVideoSelectorItem
                            ]}
                            onPress={() => setSelectedVideoIndex(index)}
                          >
                            <Text 
                              style={[
                                styles.videoSelectorText,
                                selectedVideoIndex === index && styles.selectedVideoSelectorText
                              ]}
                            >
                              Tutorial {index + 1}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.centerContainer}>
                  <Text style={styles.noTutorialText}>No tutorials available for this exercise</Text>
                </View>
              )
            ) : (
              <View style={styles.centerContainer}>
                <Text style={styles.selectExerciseText}>Select an exercise to view tutorials</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 15,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  exerciseList: {
    flex: 1,
    marginRight: 10,
    maxWidth: '40%',
  },
  bodyPartSection: {
    marginBottom: 10,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bodyPartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#334155',
  },
  bodyPartTitle: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 16,
  },
  expandIcon: {
    color: '#F8FAFC',
    fontSize: 12,
  },
  exerciseItems: {
    padding: 8,
  },
  exerciseItem: {
    padding: 10,
    borderRadius: 6,
    marginVertical: 4,
  },
  selectedExerciseItem: {
    backgroundColor: '#3B82F6',
  },
  exerciseName: {
    color: '#F8FAFC',
    fontSize: 14,
  },
  selectedExerciseName: {
    fontWeight: 'bold',
  },
  videoCount: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  videoContainer: {
    flex: 2,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoWrapper: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 15,
    textAlign: 'center',
  },
  videoAspectRatioContainer: {
    width: '100%',
    aspectRatio: 16/9, // Standard YouTube aspect ratio
    marginBottom: 15,
  },
  webViewContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  videoSelector: {
    marginTop: 10,
  },
  videoSelectorTitle: {
    color: '#F8FAFC',
    marginBottom: 8,
    fontSize: 16,
  },
  videoSelectorItem: {
    backgroundColor: '#334155',
    padding: 8,
    borderRadius: 6,
    marginRight: 6,
  },
  selectedVideoSelectorItem: {
    backgroundColor: '#3B82F6',
  },
  videoSelectorText: {
    color: '#F8FAFC',
  },
  selectedVideoSelectorText: {
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTutorialText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  selectExerciseText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
}); 