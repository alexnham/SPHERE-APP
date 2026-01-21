import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../Card';
import { formatCurrency } from '../../../lib/utils';

interface SimpleTopCategoryProps {
  category: string;
  amount: number;
  colors: any;
}

export const SimpleTopCategory = ({ category, amount, colors }: SimpleTopCategoryProps) => {
  return (
    <Card>
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Top Category</Text>
        <Text style={[styles.category, { color: colors.text }]}>{category}</Text>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(amount)}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
  },
});
