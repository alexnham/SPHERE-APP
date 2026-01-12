import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import { liabilities } from '../lib/mockData';
import {
  SemiCircleGauge,
  DebtTypeBreakdown,
  DebtDashboard,
} from '../components/debts';

// Calculate totals
const totalDebt = liabilities.reduce((sum, l) => sum + l.currentBalance, 0);
const totalLimit = liabilities.reduce(
  (sum, l) => sum + (l.creditLimit || l.currentBalance * 1.5),
  0
);
const utilizationPercent = Math.min(100, (totalDebt / totalLimit) * 100);

// Group debts by type
const debtByType = liabilities.reduce((acc, debt) => {
  acc[debt.type] = (acc[debt.type] || 0) + debt.currentBalance;
  return acc;
}, {} as Record<string, number>);

// Safe to spend (mock)
const safeToSpend = 1247;

export default function DebtsScreen() {
  const { colors } = useTheme();

  const handleDebtPress = (debtId: string) => {
    console.log('Navigate to debt:', debtId);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Lenders & Debts
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage your liabilities and payment schedules
        </Text>
      </View>

      {/* Total Debt with Semi-circle Gauge */}
      <Card>
        <View style={styles.totalDebtCard}>
          <SemiCircleGauge percent={utilizationPercent} colors={colors} />
          <Text style={[styles.totalDebtAmount, { color: colors.text }]}>
            {formatCurrency(totalDebt)}
          </Text>
          <Text style={[styles.totalDebtLabel, { color: colors.textSecondary }]}>
            Total Debt
          </Text>
        </View>
      </Card>

      {/* Debt Breakdown by Type */}
      <DebtTypeBreakdown
        debtByType={debtByType}
        totalDebt={totalDebt}
        colors={colors}
      />

      {/* Debt Dashboard */}
      <DebtDashboard
        liabilities={liabilities}
        totalDebt={totalDebt}
        safeToSpend={safeToSpend}
        colors={colors}
        onDebtPress={handleDebtPress}
      />

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  totalDebtCard: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalDebtAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: -10,
  },
  totalDebtLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
});