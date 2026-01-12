import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';

interface BalanceOverviewProps {
  currentBalance: number;
  minimumPayment?: number;
}

export function BalanceOverview({ currentBalance, minimumPayment }: BalanceOverviewProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.statsGrid}>
      <Card style={styles.statCard}>
        <Text style={styles.statIcon}>💵</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          Current Balance
        </Text>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {formatCurrency(currentBalance)}
        </Text>
      </Card>

      {minimumPayment !== undefined && (
        <Card style={styles.statCard}>
          <Text style={styles.statIcon}>📉</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Minimum Payment
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatCurrency(minimumPayment)}
          </Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, alignItems: 'center', padding: 16 },
  statIcon: { fontSize: 20, marginBottom: 8 },
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '700' },
});