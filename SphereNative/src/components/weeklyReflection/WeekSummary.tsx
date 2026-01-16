import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';
import { TrendingDown, TrendingUp, PartyPopper } from 'lucide-react-native';

interface WeekSummaryProps {
  totalSpend: number;
  percentChange: number;
}

export function WeekSummary({ totalSpend, percentChange }: WeekSummaryProps) {
  const { colors } = useTheme();
  const isPositive = percentChange <= 0;

  return (
    <Card
      style={{
        ...styles.summaryCard,
        backgroundColor: isPositive ? `${colors.primary}10` : `${colors.warning}10`,
      }}
    >
      <View style={styles.summaryHeader}>
        {isPositive ? (
          <TrendingDown size={22} color="#10b981" strokeWidth={2} />
        ) : (
          <TrendingUp size={22} color="#f59e0b" strokeWidth={2} />
        )}
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
          This Week's Total
        </Text>
      </View>
      <Text style={[styles.summaryValue, { color: colors.text }]}>
        {formatCurrency(totalSpend)}
      </Text>
      <Text
        style={[
          styles.summaryChange,
          { color: isPositive ? '#10b981' : '#f59e0b' },
        ]}
      >
        {percentChange > 0 ? '+' : ''}{percentChange.toFixed(0)}% vs last week
      </Text>
      <View style={styles.summaryMessageRow}>
        {isPositive && <PartyPopper size={14} color={colors.textSecondary} strokeWidth={2} style={{ marginRight: 4 }} />}
        <Text style={[styles.summaryMessage, { color: colors.textSecondary }]}>
          {isPositive
            ? "You spent less this week. Nice steady pace!"
            : "A bit higher than usual. Let's see where it went."}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  summaryCard: { 
    alignItems: 'center' as const, 
    padding: 24, 
    borderRadius: 16 
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 36, fontWeight: '700', marginBottom: 4 },
  summaryChange: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  summaryMessageRow: { flexDirection: 'row', alignItems: 'center' },
  summaryMessage: { fontSize: 13, textAlign: 'center' },
});