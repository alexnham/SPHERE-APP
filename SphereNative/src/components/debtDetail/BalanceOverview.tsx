import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';
import { Banknote, TrendingDown } from 'lucide-react-native';

interface BalanceOverviewProps {
  currentBalance: number;
  minimumPayment?: number;
}

export function BalanceOverview({ currentBalance, minimumPayment }: BalanceOverviewProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.statsGrid}>
      <Card style={styles.statCard}>
        <Banknote size={22} color={colors.primary} strokeWidth={2} />
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          Current Balance
        </Text>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {formatCurrency(currentBalance)}
        </Text>
      </Card>

      {minimumPayment !== undefined && (
        <Card style={styles.statCard}>
          <TrendingDown size={22} color="#10b981" strokeWidth={2} />
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
  statLabel: { fontSize: 12, marginBottom: 4, marginTop: 8 },
  statValue: { fontSize: 20, fontWeight: '700' },
});