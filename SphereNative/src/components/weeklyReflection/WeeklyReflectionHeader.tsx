import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, subDays } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { Sparkles } from 'lucide-react-native';

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
      <View style={styles.titleRow}>
        <Sparkles size={20} color={colors.primary} strokeWidth={2} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Weekly Reflection
        </Text>
      </View>
      <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
        {format(subDays(now, 7), 'MMM d')} - {format(now, 'MMM d, yyyy')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContent: { gap: 8 },
  backText: { fontSize: 16, fontWeight: '500' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { fontSize: 13 },
});