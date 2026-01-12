import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../lib/utils';
import { getCategoryIcon } from './constants';

interface BillItemProps {
  id: string;
  merchant: string;
  category: string;
  cadence: string;
  avgAmount: number;
  nextDate: Date;
  daysUntil: number;
  isAcknowledged?: boolean;
  showAckButton?: boolean;
  onAcknowledge?: (id: string) => void;
}

export function BillItem({
  id,
  merchant,
  category,
  cadence,
  avgAmount,
  nextDate,
  daysUntil,
  isAcknowledged = false,
  showAckButton = false,
  onAcknowledge,
}: BillItemProps) {
  const { colors } = useTheme();

  const getDaysText = () => {
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `in ${daysUntil} days`;
  };

  return (
    <View
      style={[
        styles.billItem,
        {
          backgroundColor: isAcknowledged ? `${colors.primary}10` : colors.surface,
          borderColor: isAcknowledged ? colors.primary : 'transparent',
          borderWidth: isAcknowledged ? 1 : 0,
        },
      ]}
    >
      <View style={[styles.billIcon, { backgroundColor: colors.muted }]}>
        <Text>{getCategoryIcon(category)}</Text>
      </View>
      <View style={styles.billInfo}>
        <View style={styles.billNameRow}>
          <Text style={[styles.billName, { color: colors.text }]}>{merchant}</Text>
          {isAcknowledged && (
            <View style={[styles.checkBadge, { backgroundColor: `${colors.primary}20` }]}>
              <Text style={{ color: colors.primary, fontSize: 10 }}>✓</Text>
            </View>
          )}
        </View>
        <Text style={[styles.billMeta, { color: colors.textSecondary }]}>
          🔄 {cadence} • {format(nextDate, 'MMM d')}
        </Text>
      </View>
      <View style={styles.billRight}>
        <Text style={[styles.billAmount, { color: colors.text }]}>
          {formatCurrency(avgAmount)}
        </Text>
        <Text
          style={[
            styles.billDays,
            { color: daysUntil <= 3 ? colors.primary : colors.textSecondary },
          ]}
        >
          {showAckButton ? getDaysText() : `${format(nextDate, 'MMM d')} (${daysUntil} days)`}
        </Text>
      </View>
      {showAckButton && !isAcknowledged && daysUntil <= 3 && onAcknowledge && (
        <TouchableOpacity
          style={[styles.ackButton, { backgroundColor: colors.muted }]}
          onPress={() => onAcknowledge(id)}
        >
          <Text style={{ color: colors.textSecondary }}>✓</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  billIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billInfo: { flex: 1, marginLeft: 12 },
  billNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  billName: { fontSize: 14, fontWeight: '500' },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billMeta: { fontSize: 11, marginTop: 2 },
  billRight: { alignItems: 'flex-end', marginRight: 8 },
  billAmount: { fontSize: 14, fontWeight: '600' },
  billDays: { fontSize: 11, marginTop: 2 },
  ackButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});