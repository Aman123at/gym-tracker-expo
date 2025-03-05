import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useWorkout } from '../context/WorkoutContext';

export default function CalendarScreen() {
  const { attendanceHistory, markAttendance, getBodyPartForDay } = useWorkout();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Create marked dates object for calendar
  const markedDates = attendanceHistory.reduce((acc, curr) => {
    acc[curr.date] = { selected: true, selectedColor: '#00FF00' };
    return acc;
  }, {} as Record<string, any>);
  
  // Add today's marker
  const today = new Date().toISOString().split('T')[0];
  markedDates[today] = { 
    ...markedDates[today],
    marked: true, 
    dotColor: '#EC4899'
  };
  
  // Add selected date
  markedDates[selectedDate] = { 
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: markedDates[selectedDate]?.selectedColor || '#4F46E5'
  };
  
  const selectedDateObj = new Date(selectedDate);
  const dayOfWeek = selectedDateObj.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bodyPart = getBodyPartForDay(dayOfWeek);
  const isAttended = attendanceHistory.some(a => a.date === selectedDate);
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Workout Calendar</Text>
      
      <Calendar
        theme={{
          backgroundColor: '#1E293B',
          calendarBackground: '#1E293B',
          textSectionTitleColor: '#F8FAFC',
          selectedDayBackgroundColor: '#6366F1',
          selectedDayTextColor: '#F8FAFC',
          todayTextColor: '#EC4899',
          dayTextColor: '#F8FAFC',
          textDisabledColor: '#64748B',
          dotColor: '#EC4899',
          selectedDotColor: '#FFFFFF',
          arrowColor: '#6366F1',
          monthTextColor: '#F8FAFC',
          indicatorColor: '#6366F1',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
        }}
        onDayPress={(day:any) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        minDate={today}
        maxDate={today}
      />
      
      <View style={styles.dateCard}>
        <Text style={styles.dateCardTitle}>
          {dayNames[dayOfWeek]}, {selectedDateObj.toLocaleDateString()}
        </Text>
        
        <Text style={styles.workoutText}>
          {dayOfWeek === 0 
            ? 'Rest Day' 
            : `Workout: ${bodyPart}`
          }
        </Text>
        
        {dayOfWeek !== 0 && (
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              isAttended ? styles.completedButton : styles.primaryButton
            ]}
            onPress={() => isAttended ? {} : markAttendance(selectedDate)}
          >
            <Text style={styles.buttonText}>
              {isAttended ? 'Workout Completed ✓' : 'Mark as Completed'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Define color constants
const colors = {
  background: '#121212',  // Assuming a dark theme
  surface: '#1E293B',     // Based on calendar background
  text: '#F8FAFC',        // Light text color for dark theme
  primary: '#4F46E5',     // Indigo color
  green: '#16a34a',       // Green color for completed workouts
  pink: '#EC4899',        // Pink color for today's marker
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,         // p-4
  },
  header: {
    fontSize: 24,        // text-2xl
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,    // mb-4
  },
  dateCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,    // rounded-xl
    padding: 24,         // p-6
    marginTop: 24,       // mt-6
  },
  dateCardTitle: {
    fontSize: 20,        // text-xl
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,     // mb-2
  },
  workoutText: {
    color: colors.text,
    marginBottom: 16,    // mb-4
  },
  actionButton: {
    paddingHorizontal: 16, // px-4
    paddingVertical: 12,   // py-3
    borderRadius: 8,       // rounded-lg
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  completedButton: {
    backgroundColor: colors.green,
  },
  buttonText: {
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});