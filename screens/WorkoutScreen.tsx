import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
import { useWorkout } from '../context/WorkoutContext';
import { Workout } from '../utils/supabase';

export default function WorkoutScreen() {
  const { workouts, updateWorkout } = useWorkout();
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [bodyPart, setBodyPart] = useState('');
  
  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setBodyPart(workout.body_part);
  };
  
  const handleSave = async () => {
    if (!editingWorkout || !bodyPart.trim()) return;
    
    try {
      await updateWorkout({
        ...editingWorkout,
        body_part: bodyPart.trim()
      });
      
      setEditingWorkout(null);
      setBodyPart('');
      Alert.alert('Success', 'Workout updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <ScrollView style={styles.container}>
    <Text style={styles.title}>Customize Workouts</Text>
    
    <View style={styles.infoCard}>
      <Text style={styles.infoText}>
        Customize your weekly workout schedule by assigning different body parts to each day.
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
              
              {editingWorkout?.id !== workout.id && (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEdit(workout)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {editingWorkout?.id === workout.id ? (
              <View>
                <TextInput
                  style={styles.input}
                  value={bodyPart}
                  onChangeText={setBodyPart}
                  placeholder="Body part (e.g. Chest, Legs) or Combined"
                  placeholderTextColor="#64748B"
                  maxLength={20}
                />
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditingWorkout(null);
                      setBodyPart('');
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={bodyPart ? styles.saveButton : styles.saveButtonDisabled}
                    onPress={handleSave}
                    disabled={!bodyPart}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.bodyPartText}>
                {workout.body_part}
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
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#F8FAFC',
  },
  input: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    color: '#F8FAFC',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#555555',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#F8FAFC',
  },
  bodyPartText: {
    color: '#F8FAFC',
    fontSize: 18,
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
});