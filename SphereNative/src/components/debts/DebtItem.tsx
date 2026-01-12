import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../../lib/utils';
import { Liability } from '../../lib/mockData';
import { debtTypeIcons, debtTypeLabels } from './constants';

interface DebtItemProps {
  debt: Liability;
  colors: any;
  onPress: () => void;
}

export const DebtItem = ({ debt, colors, onPress }: DebtItemProps) => {
  // Calculate days until due
  const daysUntilDue = debt.dueDate
    ? Math.ceil(
        (new Date(debt.dueDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Credit utilization for credit cards
  const utilizationPercent =
    debt.type === 'credit_card' && debt.creditLimit
      ? (debt.currentBalance / debt.creditLimit) * 100
      : null;

  // Urgency state
  const getUrgencyState = () => {
    if (daysUntilDue !== null && daysUntilDue < 0)
      return { label: 'Overdue', color: '#ef4444' };
    if (daysUntilDue !== null && daysUntilDue <= 3)
      return { label: `${daysUntilDue} days`, color: '#ef4444' };
    if (daysUntilDue !== null && daysUntilDue <= 7)
      return { label: `${daysUntilDue} days`, color: '#f59e0b' };
    if (daysUntilDue !== null)
      return { label: `${daysUntilDue} days`, color: colors.textSecondary };
    return { label: 'No due date', color: colors.textSecondary };
  };

  const urgency = getUrgencyState();
  const displayAmount = debt.minimumPayment || debt.currentBalance;

  return (
    <TouchableOpacity
      style={[
        styles.debtItem,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.debtItemContent}>
        {/* Icon */}
        <View style={[styles.debtIcon, { backgroundColor: `${colors.border}80` }]}>
          <Text style={styles.debtIconText}>
            {debtTypeIcons[debt.type] || '💳'}
          </Text>
        </View>

        {/* Main content */}
        <View style={styles.debtInfo}>
          <View style={styles.debtNameRow}>
            <Text style={[styles.debtLender, { color: colors.text }]}>
              {debt.name}
            </Text>
            <Text style={[styles.debtType, { color: colors.textSecondary }]}>
              • {debtTypeLabels[debt.type] || debt.type}
            </Text>
          </View>
          <View style={styles.debtMetaRow}>
            {debt.dueDate && (
              <Text style={[styles.debtMeta, { color: colors.textSecondary }]}>
                Due{' '}
                {new Date(debt.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                • <Text style={{ color: urgency.color }}>{urgency.label}</Text>
              </Text>
            )}
            {utilizationPercent !== null && (
              <Text
                style={[
                  styles.debtUtilization,
                  { color: utilizationPercent > 30 ? '#f59e0b' : '#10b981' },
                ]}
              >
                • {utilizationPercent.toFixed(0)}% used
              </Text>
            )}
          </View>
        </View>

        {/* Amount + chevron */}
        <View style={styles.debtAmountSection}>
          <Text style={[styles.debtAmount, { color: colors.text }]}>
            {formatCurrency(displayAmount)}
          </Text>
          {debt.minimumPayment && (
            <Text style={[styles.debtMinLabel, { color: colors.textSecondary }]}>
              min due
            </Text>
          )}
        </View>
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  debtItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  debtItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  debtIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  debtIconText: {
    fontSize: 18,
  },
  debtInfo: {
    flex: 1,
    marginRight: 12,
  },
  debtNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  debtLender: {
    fontSize: 14,
    fontWeight: '600',
  },
  debtType: {
    fontSize: 11,
    marginLeft: 4,
  },
  debtMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  debtMeta: {
    fontSize: 11,
  },
  debtUtilization: {
    fontSize: 11,
    marginLeft: 4,
  },
  debtAmountSection: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  debtAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  debtMinLabel: {
    fontSize: 10,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
});