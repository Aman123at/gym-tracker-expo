import React from 'react';
import { View, StatusBar, SafeAreaView, StyleSheet } from 'react-native';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
  },
  debug: {
    color: 'white',
    backgroundColor: '#1E293B',
    padding: 8,
    textAlign: 'center',
  }
});