import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import { Text } from 'react-native';

const Stack = createNativeStackNavigator();

export default function AuthScreen() {
  return (
    <Stack.Navigator
    initialRouteName='Login' 
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: '#0F172A' }
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );
}