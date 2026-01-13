import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface AllSetSlideProps {
  colors: any;
  connectedBanks: string[];
  onComplete: () => void;
}

export const AllSetSlide = ({ colors, connectedBanks, onComplete }: AllSetSlideProps) => (
  <View style={styles.container}>
    <View style={styles.successCircle}>
      <Text style={styles.successIcon}>✓</Text>
    </View>
    <Text style={[styles.title, { color: colors.text }]}>You're all set!</Text>
    <Text style={[styles.description, { color: colors.textSecondary }]}>
      Your account is ready. Let's start your journey to financial freedom.
    </Text>

    <View style={styles.summary}>
      <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
        <View style={[styles.summaryIcon, { backgroundColor: `${colors.primary}20` }]}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>✓</Text>
        </View>
        <Text style={[styles.summaryText, { color: colors.text }]}>Google account connected</Text>
      </View>

      {connectedBanks.length > 0 && (
        <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
          <View style={[styles.summaryIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
            <Text style={{ color: '#3b82f6', fontWeight: '600' }}>✓</Text>
          </View>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            {connectedBanks.length} bank accounts linked
          </Text>
        </View>
      )}
    </View>

    <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onComplete}>
      <Text style={styles.buttonText}>Go to Dashboard</Text>
      <Text style={styles.buttonArrow}>✨</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20, alignItems: 'center' },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: '#10b981',
  },
  successIcon: { color: '#fff', fontSize: 48, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 16 },
  summary: { width: '100%', gap: 12, marginBottom: 32 },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: { fontSize: 14, fontWeight: '500' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonArrow: { color: '#fff', fontSize: 16 },
});