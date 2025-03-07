import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  StatusBar,
  TextInput
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import { Exercise } from '../utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GradientHeader from '../components/GradientHeader';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter exercises based on search query
  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) {
      return exercises;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return exercises.filter(exercise => 
      exercise.name.toLowerCase().includes(query)
    );
  }, [exercises, searchQuery]);

  // Group filtered exercises by body part
  const filteredExercisesByBodyPart = useMemo(() => {
    return groupExercisesByBodyPart(filteredExercises);
  }, [filteredExercises]);

  // Reset expanded sections when search query changes
  useEffect(() => {
    // If there's no search query, reset to default state
    if (!searchQuery.trim()) {
      // Only set the first section to expanded if there's no existing expanded section
      if (Object.keys(expandedSections).length === 0 && Object.keys(filteredExercisesByBodyPart).length > 0) {
        const firstBodyPart = Object.keys(filteredExercisesByBodyPart).sort()[0];
        setExpandedSections({ [firstBodyPart]: true });
      }
      return;
    }

    // When searching, expand all sections that have matching exercises
    const newExpandedState: Record<string, boolean> = {};
    Object.keys(filteredExercisesByBodyPart).forEach(bodyPart => {
      newExpandedState[bodyPart] = true;
    });
    setExpandedSections(newExpandedState);
    
    // Reset selected exercise when search changes
    setSelectedExercise(null);
  }, [searchQuery, filteredExercisesByBodyPart]);

  const toggleSection = (bodyPart: string) => {
    setExpandedSections(prev => {
      // Close all other sections when opening a new one
      const newState = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {} as Record<string, boolean>);
      
      // Toggle the selected section
      newState[bodyPart] = !prev[bodyPart];
      return newState;
    });
    
    // Reset selected exercise when changing sections
    setSelectedExercise(null);
  };

  // Set first section to expanded by default
  useEffect(() => {
    if (Object.keys(filteredExercisesByBodyPart).length > 0 && Object.keys(expandedSections).length === 0) {
      const firstBodyPart = Object.keys(filteredExercisesByBodyPart).sort()[0];
      setExpandedSections({ [firstBodyPart]: true });
    }
  }, [filteredExercisesByBodyPart]);

  // Handle search clear
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <GradientHeader 
        title="Exercise Tutorials" 
        subtitle="Learn proper form and technique" 
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading tutorials...</Text>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Content */}
          {Object.keys(filteredExercisesByBodyPart).length > 0 ? (
            <ScrollView 
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
            >
              {/* Body Part Accordions */}
              {Object.keys(filteredExercisesByBodyPart).sort().map((bodyPart) => (
                <View key={bodyPart} style={styles.sectionCard}>
                  {/* Body Part Header */}
                  <TouchableOpacity 
                    style={[
                      styles.sectionHeader,
                      expandedSections[bodyPart] && styles.activeSectionHeader
                    ]}
                    onPress={() => toggleSection(bodyPart)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.sectionHeaderLeft}>
                      <View style={[
                        styles.sectionIconContainer,
                        expandedSections[bodyPart] && styles.activeSectionIconContainer
                      ]}>
                        <Ionicons 
                          name={getBodyPartIcon(bodyPart) as any} 
                          size={20} 
                          color={expandedSections[bodyPart] ? "#7C3AED" : "#94A3B8"} 
                        />
                      </View>
                      <Text style={[
                        styles.sectionTitle,
                        expandedSections[bodyPart] && styles.activeSectionTitle
                      ]}>
                        {bodyPart}
                      </Text>
                    </View>
                    <View style={styles.sectionBadge}>
                      <Text style={styles.sectionBadgeText}>
                        {filteredExercisesByBodyPart[bodyPart].length} exercises
                      </Text>
                      <Ionicons 
                        name={expandedSections[bodyPart] ? "chevron-up" : "chevron-down"} 
                        size={18} 
                        color="#94A3B8" 
                      />
                    </View>
                  </TouchableOpacity>
                  
                  {/* Exercises List (shown when section is expanded) */}
                  {expandedSections[bodyPart] && (
                    <View style={styles.exercisesContainer}>
                      {filteredExercisesByBodyPart[bodyPart].map((exercise) => (
                        <View key={exercise.id}>
                          {/* Exercise Item */}
                          <TouchableOpacity 
                            style={[
                              styles.exerciseItem,
                              selectedExercise?.id === exercise.id && styles.selectedExerciseItem,
                              searchQuery && exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) && styles.highlightedExerciseItem
                            ]}
                            onPress={() => {
                              setSelectedExercise(
                                selectedExercise?.id === exercise.id ? null : exercise
                              );
                              setSelectedVideoIndex(0);
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.exerciseItemContent}>
                              <Text style={[
                                styles.exerciseName,
                                selectedExercise?.id === exercise.id && styles.selectedExerciseName,
                                searchQuery && exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) && styles.highlightedExerciseName
                              ]}>
                                {exercise.name}
                              </Text>
                              {exercise.tutorialurls && exercise.tutorialurls.length > 0 ? (
                                <View style={styles.videoBadge}>
                                  <Ionicons name="play-circle" size={14} color="#fff" />
                                  <Text style={styles.videoBadgeText}>
                                    {exercise.tutorialurls.length}
                                  </Text>
                                </View>
                              ) : (
                                <Text style={styles.noTutorialsText}>No tutorials</Text>
                              )}
                            </View>
                            <Ionicons 
                              name={selectedExercise?.id === exercise.id ? "chevron-up" : "chevron-down"} 
                              size={16} 
                              color="#94A3B8" 
                            />
                          </TouchableOpacity>
                          
                          {/* Tutorial Videos (shown when exercise is selected) */}
                          {selectedExercise?.id === exercise.id && exercise.tutorialurls && exercise.tutorialurls.length > 0 && (
                            <View style={styles.tutorialContainer}>
                              {/* Video Player */}
                              <View style={styles.videoAspectRatioContainer}>
                                <View style={styles.videoShadow}>
                                  <View style={styles.webViewContainer}>
                                    {getYoutubeVideoId(exercise.tutorialurls[selectedVideoIndex]) ? (
                                      <WebView
                                        style={styles.webView}
                                        javaScriptEnabled={true}
                                        domStorageEnabled={true}
                                        allowsFullscreenVideo={true}
                                        source={{
                                          uri: `https://www.youtube.com/embed/${getYoutubeVideoId(exercise.tutorialurls[selectedVideoIndex])}?rel=0&autoplay=0&showinfo=0&controls=1&fs=1`
                                        }}
                                      />
                                    ) : (
                                      <View style={styles.errorContainer}>
                                        <Ionicons name="alert-circle" size={32} color="#EF4444" />
                                        <Text style={styles.errorText}>Invalid YouTube URL</Text>
                                      </View>
                                    )}
                                  </View>
                                </View>
                              </View>
                              
                              {/* Multiple Tutorial Selector */}
                              {exercise.tutorialurls.length > 1 && (
                                <View style={styles.tutorialSelectorContainer}>
                                  <Text style={styles.tutorialSelectorTitle}>Available Tutorials:</Text>
                                  <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.tutorialSelectorContent}
                                  >
                                    {exercise.tutorialurls.map((_, index) => (
                                      <TouchableOpacity
                                        key={index}
                                        style={[
                                          styles.tutorialSelectorItem,
                                          selectedVideoIndex === index && styles.selectedTutorialSelectorItem
                                        ]}
                                        onPress={() => setSelectedVideoIndex(index)}
                                        activeOpacity={0.7}
                                      >
                                        <Ionicons 
                                          name="play-circle" 
                                          size={16} 
                                          color={selectedVideoIndex === index ? "#fff" : "#94A3B8"} 
                                        />
                                        <Text style={[
                                          styles.tutorialSelectorText,
                                          selectedVideoIndex === index && styles.selectedTutorialSelectorText
                                        ]}>
                                          Tutorial {index + 1}
                                        </Text>
                                      </TouchableOpacity>
                                    ))}
                                  </ScrollView>
                                </View>
                              )}
                            </View>
                          )}
                          
                          {/* No Tutorials Message */}
                          {selectedExercise?.id === exercise.id && (!exercise.tutorialurls || exercise.tutorialurls.length === 0) && (
                            <View style={styles.noTutorialsContainer}>
                              <Ionicons name="videocam-off" size={32} color="#64748B" />
                              <Text style={styles.noTutorialsMessage}>No tutorials available for this exercise</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color="#64748B" />
              <Text style={styles.noResultsTitle}>No Exercises Found</Text>
              <Text style={styles.noResultsText}>
                We couldn't find any exercises matching "{searchQuery}".
              </Text>
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={clearSearch}
              >
                <Text style={styles.clearSearchButtonText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

// Helper function to get icon for body part
function getBodyPartIcon(bodyPart: string): string {
  const part = bodyPart.toLowerCase();
  if (part.includes('chest')) return 'body';
  if (part.includes('back')) return 'body';
  if (part.includes('leg') || part.includes('quad') || part.includes('thigh')) return 'footsteps';
  if (part.includes('shoulder') || part.includes('delt')) return 'body';
  if (part.includes('arm') || part.includes('bicep') || part.includes('tricep')) return 'barbell';
  if (part.includes('abs') || part.includes('core')) return 'body';
  if (part.includes('glute') || part.includes('butt')) return 'body';
  if (part.includes('calf') || part.includes('calves')) return 'footsteps';
  if (part.includes('cardio')) return 'heart';
  return 'fitness'; // default
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: 'rgba(51, 65, 85, 0.2)',
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#F8FAFC',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94A3B8',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.2)',
  },
  activeSectionHeader: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeSectionIconContainer: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  activeSectionTitle: {
    color: '#7C3AED',
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionBadgeText: {
    fontSize: 12,
    color: '#94A3B8',
    marginRight: 6,
  },
  exercisesContainer: {
    padding: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginVertical: 4,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 8,
  },
  selectedExerciseItem: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#7C3AED',
  },
  highlightedExerciseItem: {
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
  },
  exerciseItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 8,
  },
  exerciseName: {
    fontSize: 15,
    color: '#CBD5E1',
    flex: 1,
  },
  selectedExerciseName: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  highlightedExerciseName: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  videoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  noTutorialsText: {
    fontSize: 12,
    color: '#64748B',
  },
  tutorialContainer: {
    padding: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  videoAspectRatioContainer: {
    width: '100%',
    aspectRatio: 16/9,
    marginBottom: 12,
  },
  videoShadow: {
    flex: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  webViewContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  webView: {
    flex: 1,
  },
  tutorialSelectorContainer: {
    marginTop: 8,
  },
  tutorialSelectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  tutorialSelectorContent: {
    paddingBottom: 4,
  },
  tutorialSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  selectedTutorialSelectorItem: {
    backgroundColor: '#4F46E5',
  },
  tutorialSelectorText: {
    color: '#CBD5E1',
    marginLeft: 6,
    fontSize: 13,
  },
  selectedTutorialSelectorText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  noTutorialsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  noTutorialsMessage: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  clearSearchButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginTop: 8,
  },
}); 