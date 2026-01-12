import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../Card';

interface DueDateInfoProps {
  dueDate?: Date;
  apr?: number;
  daysUntilDue?: number | null;
}

export function DueDateInfo({ dueDate, apr, daysUntilDue }: DueDateInfoProps) {
  const { colors } = useTheme();

  if (!dueDate && apr === undefined) return null;

  return (
    <View style={styles.statsGrid}>
      {dueDate && (
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Due Date</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {format(dueDate, 'MMM d, yyyy')}
          </Text>
          {daysUntilDue !== null && daysUntilDue !== undefined && (
            <Text
              style={[
                styles.daysRemaining,
                { color: daysUntilDue <= 5 ? '#f59e0b' : colors.textSecondary },
              ]}
            >
              {daysUntilDue} days remaining
            </Text>
          )}
        </Card>
      )}
      {apr !== undefined && (
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>APR</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{apr}%</Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, alignItems: 'center', padding: 16 },
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '700' },
  daysRemaining: { fontSize: 11, marginTop: 4 },
});