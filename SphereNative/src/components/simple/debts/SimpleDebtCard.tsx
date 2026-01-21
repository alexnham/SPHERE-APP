import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../Card';
import { formatCurrency } from '../../../lib/utils';

interface SimpleDebtCardProps {
  label: string;
  amount: number;
  subtitle?: string;
  colors: any;
}

export const SimpleDebtCard = ({ label, amount, subtitle, colors }: SimpleDebtCardProps) => {
  return (
    <Card>
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(amount)}
        </Text>
        {subtitle && (
          <View style={styles.subtitle}>
            <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>{subtitle}</Text>
          </View>
        )}
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
    marginBottom: 8,
  },
  subtitle: {
    marginTop: 4,
  },
  subtitleText: {
    fontSize: 13,
  },
});
