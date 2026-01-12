import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../Card';
import { formatCurrency, getDaysUntil } from '../../lib/utils';
import { recurringCharges } from '../../lib/mockData';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

interface UpcomingBillsCardProps {
  colors: any;
}

const getCategoryIcon = (category: string) => {
  const map: Record<string, string> = {
    Entertainment: '📺',
    'Bills & Utilities': '⚡',
    Utilities: '⚡',
    Health: '💪',
    Tech: '📱',
    Food: '🍽️',
    Transport: '🚗',
  };
  return map[category] || '📄';
};

const getCadenceLabel = (cadence: string) => {
  const map: Record<string, string> = {
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  };
  return map[cadence] || cadence;
};

export const UpcomingBillsCard = ({ colors }: UpcomingBillsCardProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const sortedBills = [...recurringCharges].sort(
    (a, b) => a.nextDate.getTime() - b.nextDate.getTime()
  );
  const totalUpcoming = sortedBills
    .filter(b => getDaysUntil(b.nextDate) <= 7 && getDaysUntil(b.nextDate) >= 0)
    .reduce((sum, b) => sum + b.avgAmount, 0);
  const displayedBills = sortedBills.slice(0, 3);
  const remainingCount = sortedBills.length - 3;

  return (
    <Card>
      {/* Header */}
      <View style={styles.billsHeader}>
        <View style={styles.billsHeaderLeft}>
          <Text style={{ fontSize: 16, color: colors.primary }}>📅</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Upcoming Bills</Text>
        </View>
        <View style={styles.billsHeaderRight}>
          <Text style={[styles.billsSubtitle, { color: colors.textSecondary }]}>Next 7 days</Text>
          <Text style={[styles.billsTotal, { color: colors.text }]}>
            {formatCurrency(totalUpcoming)}
          </Text>
        </View>
      </View>

      {/* Bills List */}
      <View style={styles.billsList}>
        {displayedBills.map((bill) => {
          const daysUntil = getDaysUntil(bill.nextDate);
          const isUrgent = daysUntil <= 3;

          return (
            <View
              key={bill.id}
              style={[styles.billItem, { backgroundColor: colors.surface }]}
            >
              <View style={styles.billLeft}>
                <View style={[styles.billIcon, { backgroundColor: `${colors.border}80` }]}>
                  <Text>{getCategoryIcon(bill.category)}</Text>
                </View>
                <View>
                  <Text style={[styles.billName, { color: colors.text }]}>{bill.merchant}</Text>
                  <Text style={[styles.billCadence, { color: colors.textSecondary }]}>
                    {getCadenceLabel(bill.cadence)}
                  </Text>
                </View>
              </View>
              <View style={styles.billRight}>
                <Text style={[styles.billAmount, { color: colors.text }]}>
                  {formatCurrency(bill.avgAmount)}
                </Text>
                <Text
                  style={[
                    styles.billDays,
                    { color: isUrgent ? '#ef4444' : colors.textSecondary },
                  ]}
                >
                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* See More */}
      {remainingCount > 0 && (
        <TouchableOpacity 
          style={styles.seeMore}
          onPress={() => navigation.navigate('Bills')}
        >
          <Text style={[styles.seeMoreText, { color: colors.primary }]}>
            +{remainingCount} more bills →
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  billsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  billsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  billsHeaderRight: {
    alignItems: 'flex-end',
  },
  billsSubtitle: {
    fontSize: 11,
  },
  billsTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  billsList: {
    gap: 10,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  billLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  billIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  billName: {
    fontSize: 14,
    fontWeight: '500',
  },
  billCadence: {
    fontSize: 11,
    marginTop: 2,
  },
  billRight: {
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  billDays: {
    fontSize: 11,
    marginTop: 2,
  },
  seeMore: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  seeMoreText: {
    fontSize: 13,
    fontWeight: '500',
  },
});