import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWorkout } from '../../context/WorkoutContext';

export default function WorkoutCalendar() {
  const { attendanceHistory } = useWorkout();
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Get dates for the current week
  const getDatesForCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dates = [];
    
    // Start from Sunday of current week
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOfWeek + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  const weekDates = getDatesForCurrentWeek();
  
  return (
    <View style={styles.container}>
      {weekDates.map((date, index) => {
        const dateStr = date.toISOString().split('T')[0];
        const isToday = new Date().toDateString() === date.toDateString();
        const isAttended = attendanceHistory.some(a => a.date === dateStr);
        const isSunday = date.getDay() === 0;
        
        // Determine which style to use for the day button
        let dayButtonStyle;
        if (isToday) {
          dayButtonStyle = styles.todayButton;
        } else if (isAttended) {
          dayButtonStyle = styles.attendedButton;
        } else if (isSunday) {
          dayButtonStyle = styles.sundayButton;
        } else {
          dayButtonStyle = styles.defaultButton;
        }
        
        return (
          <View key={index} style={styles.dayContainer}>
            <Text style={styles.dayText}>{daysOfWeek[index]}</Text>
            <TouchableOpacity style={[styles.dayButton, dayButtonStyle]}>
              <Text style={styles.dateText}>{date.getDate()}</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

// Define color constants
const colors = {
  text: '#FFFFFF',       // Assuming white text for dark theme
  primary: '#4F46E5',    // Using indigo-600 as primary
  green: '#16a34a',      // green-600
  gray: '#374151',       // gray-700
  surface: '#1E1E1E',    // Assumed surface color for dark theme
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,  // my-4
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayText: {
    color: colors.text,
    marginBottom: 4,     // mb-1
  },
  dayButton: {
    width: 40,           // w-10
    height: 40,          // h-10
    borderRadius: 20,    // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultButton: {
    backgroundColor: colors.surface,
  },
  todayButton: {
    backgroundColor: colors.primary,
  },
  attendedButton: {
    backgroundColor: colors.green,
  },
  sundayButton: {
    backgroundColor: colors.gray,
  },
  dateText: {
    color: colors.text,
  },
});