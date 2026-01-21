import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../Card';
import { formatCurrency } from '../../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

interface SimplePortfolioCardProps {
  label: string;
  amount: number;
  gain: number;
  gainPercent: number;
  colors: any;
}

export const SimplePortfolioCard = ({
  label,
  amount,
  gain,
  gainPercent,
  colors,
}: SimplePortfolioCardProps) => {
  const isPositive = gain >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <Card>
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(amount)}
        </Text>
        <View style={styles.gain}>
          <TrendIcon size={18} color={trendColor} strokeWidth={2} />
          <Text style={[styles.gainText, { color: trendColor }]}>
            {isPositive ? '+' : ''}{formatCurrency(gain)} ({gainPercent.toFixed(1)}%)
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  gain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gainText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
