import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, subDays } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';

interface WeeklyReflectionHeaderProps {
  onBack: () => void;
}

export function WeeklyReflectionHeader({ onBack }: WeeklyReflectionHeaderProps) {
  const { colors } = useTheme();
  const now = new Date();

  return (
    <View style={styles.headerContent}>
      <TouchableOpacity onPress={onBack}>
        <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
      </TouchableOpacity>
      <View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          ✨ Weekly Reflection
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {format(subDays(now, 7), 'MMM d')} - {format(now, 'MMM d, yyyy')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContent: { gap: 8 },
  backText: { fontSize: 16, fontWeight: '500' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { fontSize: 13 },
});