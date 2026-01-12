import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';

interface BillsSummaryProps {
  totalUpcoming: number;
  totalMonthly: number;
}

export function BillsSummary({ totalUpcoming, totalMonthly }: BillsSummaryProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.summaryGrid}>
      <Card style={styles.summaryCard}>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
          Next 7 Days
        </Text>
        <Text style={[styles.summaryValue, { color: colors.text }]}>
          {formatCurrency(totalUpcoming)}
        </Text>
      </Card>
      <Card style={styles.summaryCard}>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
          Monthly Total
        </Text>
        <Text style={[styles.summaryValue, { color: colors.text }]}>
          {formatCurrency(totalMonthly)}
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, alignItems: 'center', padding: 16 },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: '700' },
});