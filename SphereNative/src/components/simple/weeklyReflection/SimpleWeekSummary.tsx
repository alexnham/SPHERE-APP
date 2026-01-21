import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../Card';
import { formatCurrency } from '../../../lib/utils';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react-native';

interface SimpleWeekSummaryProps {
  amount: number;
  changePercent: number;
  colors: any;
}

export const SimpleWeekSummary = ({ amount, changePercent, colors }: SimpleWeekSummaryProps) => {
  const isDown = changePercent < 0;
  const TrendIcon = isDown ? TrendingDown : TrendingUp;
  const trendColor = isDown ? '#10b981' : '#f59e0b';

  return (
    <Card>
      <View style={styles.container}>
        <View style={styles.header}>
          <BarChart3 size={20} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.title, { color: colors.text }]}>This Week</Text>
        </View>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(amount)}
        </Text>
        <View style={styles.trend}>
          <TrendIcon size={18} color={trendColor} strokeWidth={2} />
          <Text style={[styles.trendText, { color: trendColor }]}>
            {Math.abs(changePercent).toFixed(0)}% vs last week
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
