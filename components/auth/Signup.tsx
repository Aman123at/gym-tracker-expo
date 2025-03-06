import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { supabase } from '../../utils/supabase';

export default function Signup({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      Alert.alert(
        'Registration Successful',
        '',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
    <Text style={styles.title}>
      Create Account
    </Text>
    
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="youremail@example.com"
        placeholderTextColor="#64748B"
        onChangeText={(text) => setEmail(text)}
        value={email}
        autoCapitalize="none"
      />
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Create a password"
        placeholderTextColor="#64748B"
        secureTextEntry={true}
        onChangeText={(text) => setPassword(text)}
        value={password}
      />
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm your password"
        placeholderTextColor="#64748B"
        secureTextEntry={true}
        onChangeText={(text) => setConfirmPassword(text)}
        value={confirmPassword}
      />
    </View>

    <TouchableOpacity 
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={signUpWithEmail}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size={24} color="white" />
      ) : (
        <Text style={styles.buttonText}>Create Account</Text>
      )}
    </TouchableOpacity>

    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>Already have an account? </Text>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.footerLink}>Sign In</Text>
      </TouchableOpacity>
    </View>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#F8FAFC',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: '#F8FAFC',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 8,
    color: '#F8FAFC',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(99, 102, 241, 0.7)',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#F8FAFC',
  },
  footerLink: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
});