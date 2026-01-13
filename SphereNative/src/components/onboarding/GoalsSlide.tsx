import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GoalItem } from './GoalItem';

interface GoalsSlideProps {
  colors: any;
  selectedGoals: string[];
  onToggleGoal: (goal: string) => void;
  onNext: () => void;
}

const GOALS = [
  { label: 'Build an emergency fund', icon: '🛡️' },
  { label: 'Pay off debt faster', icon: '💳' },
  { label: 'Save for a big purchase', icon: '🏠' },
  { label: 'Track daily spending', icon: '📊' },
  { label: 'Invest for the future', icon: '📈' },
];

export const GoalsSlide = ({ colors, selectedGoals, onToggleGoal, onNext }: GoalsSlideProps) => (
  <View style={styles.container}>
    <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
      <Text style={styles.icon}>📈</Text>
    </View>
    <Text style={[styles.title, { color: colors.text }]}>What are your goals?</Text>
    <Text style={[styles.description, { color: colors.textSecondary }]}>
      Select what matters most to you. We'll personalize your experience.
    </Text>

    <View style={styles.goals}>
      {GOALS.map((goal) => (
        <GoalItem
          key={goal.label}
          icon={goal.icon}
          label={goal.label}
          selected={selectedGoals.includes(goal.label)}
          onPress={() => onToggleGoal(goal.label)}
          colors={colors}
        />
      ))}
    </View>

    <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onNext}>
      <Text style={styles.buttonText}>Continue</Text>
      <Text style={styles.buttonArrow}>→</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20, alignItems: 'center' },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: { fontSize: 40 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 16 },
  goals: { width: '100%', gap: 10, marginBottom: 24 },
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