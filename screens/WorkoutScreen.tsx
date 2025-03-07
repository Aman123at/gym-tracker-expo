import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  StyleSheet, 
  Modal, 
  TextInput,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useWorkout } from '../context/WorkoutContext';
import { Workout, Exercise, BodyPart } from '../utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import GradientHeader from '../components/GradientHeader';

export default function WorkoutScreen() {
  const { 
    workouts, 
    updateWorkout, 
    bodyParts, 
    exercises, 
    fetchExercisesByBodyPart,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateExerciseDetails
  } = useWorkout();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);
  const [newExercise, setNewExercise] = useState<string>('');
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  
  // Track used body parts to prevent duplicates
  const [usedBodyParts, setUsedBodyParts] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize used body parts
    const used = workouts
      .filter(w => w.day_of_week !== 0 && w.body_part)
      .map(w => w.body_part);
    setUsedBodyParts(used);
  }, [workouts]);

  useEffect(() => {
    // Fetch available exercises when body part changes
    if (selectedBodyPart) {
      fetchExercisesByBodyPart(selectedBodyPart)
        .then(result => {
          setAvailableExercises(result);
        })
        .catch(error => {
          console.error('Error fetching exercises:', error);
          Alert.alert('Error', 'Failed to load exercises');
        });
    }
  }, [selectedBodyPart]);

  const openEditModal = (workout: Workout) => {
    setEditingWorkout(workout);
    setSelectedBodyPart(workout.body_part);
    
    // Fetch existing exercises for this workout
    if (workout.exercises) {
      setWorkoutExercises(workout.exercises);
    } else {
      setWorkoutExercises([]);
    }
    
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingWorkout(null);
    setSelectedBodyPart('');
    setWorkoutExercises([]);
    setNewExercise('');
  };

  const handleSave = async () => {
    if (!editingWorkout || !selectedBodyPart) {
      Alert.alert('Error', 'Please select a body part');
      return;
    }
    
    if (workoutExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }
  
    setIsSaving(true);
    
    try {
      // Check if this body part is already used on another day
      const currentUsage = usedBodyParts.filter(bp => 
        bp === selectedBodyPart && 
        workouts.find(w => w.body_part === bp && w.id !== editingWorkout.id)
      );
      
      if (currentUsage.length > 0) {
        Alert.alert(
          'Body Part Already Used',
          'This body part is already assigned to another day. Please select a different one.'
        );
        setIsSaving(false);
        return;
      }
  
      // Update the workout with new body part
      await updateWorkout({
        ...editingWorkout,
        body_part: selectedBodyPart,
        exercises: workoutExercises
      });
      
      closeModal();
      Alert.alert('Success', 'Workout updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExercise = async () => {
    if (!newExercise || !editingWorkout) return;
    
    try {
      const selectedExercise = availableExercises.find(e => e.id === newExercise);
      
      if (selectedExercise) {
        // Check if exercise already exists in workout
        const exerciseExists = workoutExercises.some(e => e.name === selectedExercise.name);
        
        if (exerciseExists) {
          Alert.alert('Error', 'This exercise is already added to your workout');
          return;
        }
        
        // Add exercise to local state
        const newExerciseItem = {
          ...selectedExercise,
          workout_id: editingWorkout.id,
          sets: 3,
          reps: 12
        };
        
        setWorkoutExercises([...workoutExercises, newExerciseItem]);
        setNewExercise('');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to add exercise');
    }
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setWorkoutExercises(workoutExercises.filter(e => e.id !== exerciseId));
  };

  const updateExerciseSets = (exerciseId: string, sets: number) => {
    setWorkoutExercises(workoutExercises.map(e => 
      e.id === exerciseId ? { ...e, sets } : e
    ));
  };

  const updateExerciseReps = (exerciseId: string, reps: number) => {
    setWorkoutExercises(workoutExercises.map(e => 
      e.id === exerciseId ? { ...e, reps } : e
    ));
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <View style={styles.container}>
      <GradientHeader title="Weekly Workouts" subtitle="Customize your exercise plan" />
      
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Customize Workouts</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Customize your weekly workout schedule by assigning different body parts and exercises to each day.
          </Text>
        </View>
        
        {workouts
          .sort((a, b) => a.day_of_week - b.day_of_week)
          .map(workout => (
            workout.day_of_week !== 0 ? (
              <View 
                key={workout.id} 
                style={styles.workoutCard}
              >
                <View style={styles.workoutHeader}>
                  <Text style={styles.dayName}>
                    {dayNames[workout.day_of_week]}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => openEditModal(workout)}
                  >
                    <Ionicons name="pencil" size={20} color="#F8FAFC" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.bodyPartText}>
                  {workout.body_part}
                </Text>
                
                {workout.exercises && workout.exercises.length > 0 ? (
                  <View style={styles.exercisesList}>
                    {workout.exercises.map((exercise, index) => (
                      <Text key={index} style={styles.exerciseItem}>
                        {exercise.name} · {exercise.sets}×{exercise.reps}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noExercisesText}>
                    No exercises configured
                  </Text>
                )}
              </View>
            ) : null
          ))}
        
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            Note: Sunday is always a rest day
          </Text>
        </View>

        {/* Edit Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Edit {editingWorkout ? dayNames[editingWorkout.day_of_week] : ''} Workout
                </Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#F8FAFC" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.sectionTitle}>Body Part</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedBodyPart}
                    onValueChange={(itemValue) => setSelectedBodyPart(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#F8FAFC"
                  >
                    <Picker.Item label="Select Body Part" value="" />
                    {bodyParts.map((part) => (
                      <Picker.Item 
                        key={part.id} 
                        label={part.name} 
                        value={part.name}
                        enabled={
                          part.name === editingWorkout?.body_part || 
                          !usedBodyParts.includes(part.name) ||
                          usedBodyParts.filter(bp => bp === part.name).length === 0
                        }
                      />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.sectionTitle}>Exercises</Text>
                
                {selectedBodyPart ? (
                  <>
                    <View style={styles.addExerciseRow}>
                      <View style={styles.exercisePickerContainer}>
                        <Picker
                          selectedValue={newExercise}
                          onValueChange={(itemValue) => setNewExercise(itemValue)}
                          style={styles.exercisePicker}
                          dropdownIconColor="#F8FAFC"
                          enabled={!!selectedBodyPart}
                        >
                          <Picker.Item label="Select Exercise" value="" />
                          {availableExercises.map((exercise) => (
                            <Picker.Item 
                              key={exercise.id} 
                              label={exercise.name} 
                              value={exercise.id} 
                            />
                          ))}
                        </Picker>
                      </View>
                      
                      <TouchableOpacity 
                        style={[
                          styles.addButton, 
                          !newExercise ? styles.addButtonDisabled : null
                        ]}
                        onPress={handleAddExercise}
                        disabled={!newExercise}
                      >
                        <Ionicons name="add" size={24} color="#F8FAFC" />
                      </TouchableOpacity>
                    </View>
                    
                    {workoutExercises.length === 0 ? (
                      <Text style={styles.noExercisesText}>
                        No exercises added yet
                      </Text>
                    ) : (
                      <View style={styles.exercisesContainer}>
                        {workoutExercises.map((exercise:Exercise, index:number) => (
                          <View key={index} style={styles.exerciseRow}>
                            <View style={styles.exerciseInfo}>
                              <Text style={styles.exerciseName}>{exercise.name}</Text>
                              
                              <View style={styles.exerciseControls}>
                                <View style={styles.controlGroup}>
                                  <Text style={styles.controlLabel}>Sets</Text>
                                  <View style={styles.counterContainer}>
                                    <TouchableOpacity 
                                      style={styles.counterButton}
                                      onPress={() => updateExerciseSets(exercise.id, Math.max(1, (exercise.sets || 1) - 1))}
                                    >
                                      <Ionicons name="remove" size={16} color="#F8FAFC" />
                                    </TouchableOpacity>
                                    
                                    <Text style={styles.counterValue}>{exercise.sets}</Text>
                                    
                                    <TouchableOpacity 
                                      style={styles.counterButton}
                                      onPress={() => updateExerciseSets(exercise.id, (exercise.sets || 1) + 1)}
                                    >
                                      <Ionicons name="add" size={16} color="#F8FAFC" />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                                
                                <View style={styles.controlGroup}>
                                  <Text style={styles.controlLabel}>Reps</Text>
                                  <View style={styles.counterContainer}>
                                    <TouchableOpacity 
                                      style={styles.counterButton}
                                      onPress={() => updateExerciseReps(exercise.id, Math.max(1, (exercise.reps || 1) - 1))}
                                    >
                                      <Ionicons name="remove" size={16} color="#F8FAFC" />
                                    </TouchableOpacity>
                                    
                                    <Text style={styles.counterValue}>{exercise.reps}</Text>
                                    
                                    <TouchableOpacity 
                                      style={styles.counterButton}
                                      onPress={() => updateExerciseReps(exercise.id, (exercise.reps || 1) + 1)}
                                    >
                                      <Ionicons name="add" size={16} color="#F8FAFC" />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </View>
                            </View>
                            
                            <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => handleRemoveExercise(exercise.id)}
                            >
                              <Ionicons name="trash" size={20} color="#F43F5E" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={styles.selectBodyPartPrompt}>
                    Please select a body part first
                  </Text>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={closeModal}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.saveButton,
                    (!selectedBodyPart || workoutExercises.length === 0 || isSaving) ? styles.saveButtonDisabled : null
                  ]}
                  onPress={handleSave}
                  disabled={!selectedBodyPart || workoutExercises.length === 0 || isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size={24} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    color: '#F8FAFC',
  },
  workoutCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  editButton: {
    backgroundColor: '#4F46E5',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyPartText: {
    color: '#F8FAFC',
    fontSize: 18,
    marginBottom: 12,
  },
  exercisesList: {
    marginTop: 8,
  },
  exerciseItem: {
    color: '#94A3B8',
    paddingVertical: 4,
  },
  noExercisesText: {
    color: '#64748B',
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  noteCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  noteText: {
    color: '#F8FAFC',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
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
  modalBody: {
    padding: 16,
    maxHeight: 500,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 16,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    color: '#F8FAFC',
    height: 50,
  },
  exercisePickerContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  exercisePicker: {
    color: '#F8FAFC',
    height: 50,
  },
  addExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#6366F1',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#475569',
  },
  exercisesContainer: {
    marginTop: 8,
    marginBottom:15
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#F8FAFC',
    fontSize: 16,
    marginBottom: 8,
  },
  exerciseControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlGroup: {
    marginRight: 24,
  },
  controlLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 4,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  counterButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    color: '#F8FAFC',
    width: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  cancelButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#475569',
  },
  buttonText: {
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  selectBodyPartPrompt: {
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
});