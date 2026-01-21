import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../Card';
import { formatCurrency } from '../../../lib/utils';
import { AlertCircle, CreditCard } from 'lucide-react-native';

interface UrgentDebt {
  id: string;
  name: string;
  amount: number;
}

interface SimpleUrgentDebtsProps {
  debts: UrgentDebt[];
  totalAmount: number;
  colors: any;
}

export const SimpleUrgentDebts = ({ debts, totalAmount, colors }: SimpleUrgentDebtsProps) => {
  if (debts.length === 0) return null;

  return (
    <Card>
      <View style={styles.container}>
        <View style={styles.header}>
          <AlertCircle size={18} color="#ef4444" strokeWidth={2} />
          <Text style={[styles.title, { color: colors.text }]}>
            Urgent ({debts.length})
          </Text>
        </View>
        <Text style={[styles.amount, { color: '#ef4444' }]}>
          {formatCurrency(totalAmount)}
        </Text>
        <View style={styles.list}>
          {debts.slice(0, 3).map((debt) => (
            <View key={debt.id} style={styles.item}>
              <CreditCard size={16} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.itemText, { color: colors.text }]} numberOfLines={1}>
                {debt.name}
              </Text>
              <Text style={[styles.itemAmount, { color: colors.text }]}>
                {formatCurrency(debt.amount)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});
