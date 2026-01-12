import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: Date;
  category: string;
}

interface QuickReflectionProps {
  transactions: Transaction[];
  onFeedback?: (transactionId: string, feedback: 'yes' | 'neutral' | 'no') => void;
}

export function QuickReflection({ transactions, onFeedback }: QuickReflectionProps) {
  const { colors } = useTheme();

  return (
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Reflection</Text>
      <Text style={[styles.reflectionHint, { color: colors.textSecondary }]}>
        Tap how you feel about your biggest spends this week
      </Text>
      {transactions.map((transaction) => (
        <View
          key={transaction.id}
          style={[styles.transactionItem, { backgroundColor: colors.surface }]}
        >
          <View style={styles.transactionHeader}>
            <View style={[styles.transactionIcon, { backgroundColor: `${colors.primary}10` }]}>
              <Text>🏪</Text>
            </View>
            <View style={styles.transactionInfo}>
              <Text style={[styles.transactionMerchant, { color: colors.text }]}>
                {transaction.merchant}
              </Text>
              <Text style={[styles.transactionMeta, { color: colors.textSecondary }]}>
                {format(transaction.date, 'EEE, MMM d')} · {transaction.category}
              </Text>
            </View>
            <Text style={[styles.transactionAmount, { color: colors.text }]}>
              {formatCurrency(transaction.amount)}
            </Text>
          </View>
          <View style={styles.feedbackRow}>
            <Text style={[styles.feedbackLabel, { color: colors.textSecondary }]}>
              Worth it?
            </Text>
            <TouchableOpacity
              style={[styles.feedbackButton, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}
              onPress={() => onFeedback?.(transaction.id, 'yes')}
            >
              <Text style={{ color: '#10b981', fontSize: 12 }}>👍 Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.feedbackButton, { backgroundColor: colors.muted }]}
              onPress={() => onFeedback?.(transaction.id, 'neutral')}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>➖ Neutral</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.feedbackButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
              onPress={() => onFeedback?.(transaction.id, 'no')}
            >
              <Text style={{ color: '#ef4444', fontSize: 12 }}>👎 No</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  reflectionHint: { fontSize: 13, marginBottom: 12 },
  transactionItem: { padding: 12, borderRadius: 12, marginBottom: 12 },
  transactionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: { flex: 1, marginLeft: 12 },
  transactionMerchant: { fontSize: 14, fontWeight: '500' },
  transactionMeta: { fontSize: 11, marginTop: 2 },
  transactionAmount: { fontSize: 14, fontWeight: '600' },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedbackLabel: { fontSize: 11, marginRight: 4 },
  feedbackButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
});