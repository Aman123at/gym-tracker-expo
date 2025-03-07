import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type GoogleSignInButtonProps = {
  onPress: () => void;
  loading: boolean;
  label?: string;
};

export default function GoogleSignInButton({ 
  onPress, 
  loading, 
  label = 'Sign In with Google' 
}: GoogleSignInButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.googleButton, loading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size={24} color="white" />
      ) : (
        <View style={styles.googleButtonContent}>
          <Ionicons name="logo-google" size={20} color="white" />
          <Text style={styles.buttonText}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    backgroundColor: '#DB4437', // Google red color
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(219, 68, 55, 0.7)',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 8,
  },
});