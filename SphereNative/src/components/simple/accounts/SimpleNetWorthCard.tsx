import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../Card';
import { formatCurrency } from '../../../lib/utils';
import { TrendingUp } from 'lucide-react-native';

interface SimpleNetWorthCardProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  colors: any;
}

export const SimpleNetWorthCard = ({
  netWorth,
  totalAssets,
  totalLiabilities,
  colors,
}: SimpleNetWorthCardProps) => {
  return (
    <Card>
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Net Worth</Text>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(netWorth)}
        </Text>
        <View style={styles.breakdown}>
          <View style={styles.breakdownItem}>
            <TrendingUp size={16} color="#10b981" strokeWidth={2} />
            <Text style={[styles.breakdownText, { color: colors.textSecondary }]}>
              Assets: {formatCurrency(totalAssets)}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <TrendingUp size={16} color="#ef4444" strokeWidth={2} style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={[styles.breakdownText, { color: colors.textSecondary }]}>
              Liabilities: {formatCurrency(totalLiabilities)}
            </Text>
          </View>
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
    marginBottom: 16,
  },
  breakdown: {
    width: '100%',
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownText: {
    fontSize: 13,
  },
});
