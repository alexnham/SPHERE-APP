import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpDown, ChevronDown } from 'lucide-react-native';
import { Card } from '../Card';
import { InfoTooltip } from '../shared';
import { formatCurrency } from '../../lib/utils';
import { Liability } from '../../lib/mockData';
import { DebtItem } from './DebtItem';
import { SortOption, sortLabels } from './constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

interface DebtDashboardProps {
  liabilities: Liability[];
  totalDebt: number;
  safeToSpend: number;
  colors: any;
  onDebtPress?: (debtId: string) => void;
}

export const DebtDashboard = ({
  liabilities,
  totalDebt,
  safeToSpend,
  colors,
  onDebtPress,
}: DebtDashboardProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('due_date');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Sort liabilities
  const sortedLiabilities = [...liabilities].sort((a, b) => {
    switch (sortBy) {
      case 'due_date':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'amount':
        return b.currentBalance - a.currentBalance;
      case 'apr':
        return (b.apr || 0) - (a.apr || 0);
      default:
        return 0;
    }
  });

  // Update the onDebtPress to navigate
  const handleDebtPress = (debtId: string) => {
    navigation.navigate('DebtDetail', { id: debtId });
  };

  return (
    <Card>
      {/* Header */}
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={[styles.dashboardTitle, { color: colors.text }]}>
            Lenders & Debts
          </Text>
          <Text style={[styles.dashboardSubtitle, { color: colors.textSecondary }]}>
            Total owed: {formatCurrency(totalDebt)}
          </Text>
        </View>
        <View style={styles.safeToPaySection}>
          <View style={styles.safeToPayHeader}>
            <Text style={[styles.safeToPayLabel, { color: colors.textSecondary }]}>
              Safe to pay today
            </Text>
            <InfoTooltip
              title="Safe to Pay Today"
              content="This is the maximum amount you can put toward debt without affecting your essential expenses or emergency buffer."
            />
          </View>
          <Text style={styles.safeToPayAmount}>{formatCurrency(safeToSpend)}</Text>
        </View>
      </View>

      {/* Sort Control */}
      <View style={styles.sortSection}>
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: colors.surface }]}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <ArrowUpDown size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[styles.sortText, { color: colors.textSecondary }]}>
            {sortLabels[sortBy]}
          </Text>
          <ChevronDown size={12} color={colors.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* Sort Menu Dropdown */}
      {showSortMenu && (
        <View style={[styles.sortMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(Object.keys(sortLabels) as SortOption[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortMenuItem,
                sortBy === option && { backgroundColor: colors.surface },
              ]}
              onPress={() => {
                setSortBy(option);
                setShowSortMenu(false);
              }}
            >
              <Text
                style={[
                  styles.sortMenuText,
                  { color: sortBy === option ? colors.primary : colors.text },
                ]}
              >
                {sortLabels[option]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Debt Items */}
      <View style={styles.debtList}>
        {sortedLiabilities.map((liability) => (
          <DebtItem
            key={liability.id}
            debt={liability}
            colors={colors}
            onPress={() => handleDebtPress(liability.id)}
          />
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  dashboardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  safeToPaySection: {
    alignItems: 'flex-end',
  },
  safeToPayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  safeToPayLabel: {
    fontSize: 11,
  },
  safeToPayAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 2,
  },
  sortSection: {
    marginBottom: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  sortIcon: {
    fontSize: 12,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sortChevron: {
    fontSize: 10,
  },
  sortMenu: {
    position: 'absolute',
    top: 100,
    left: 16,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sortMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortMenuText: {
    fontSize: 13,
  },
  debtList: {
    gap: 12,
  },
});