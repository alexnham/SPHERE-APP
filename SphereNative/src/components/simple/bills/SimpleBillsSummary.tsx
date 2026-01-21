import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../Card';
import { formatCurrency } from '../../../lib/utils';
import { Calendar } from 'lucide-react-native';

interface SimpleBillsSummaryProps {
  amount: number;
  subtitle: string;
  colors: any;
}

export const SimpleBillsSummary = ({ amount, subtitle, colors }: SimpleBillsSummaryProps) => {
  return (
    <Card>
      <View style={styles.container}>
        <View style={styles.header}>
          <Calendar size={20} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.title, { color: colors.text }]}>Upcoming Bills</Text>
        </View>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(amount)}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
});
