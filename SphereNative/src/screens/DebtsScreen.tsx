import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import { liabilities } from '../lib/mockData';
import {
  SemiCircleGauge,
  DebtTypeBreakdown,
  DebtDashboard,
} from '../components/debts';
import { CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react-native';

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
  const { isSimpleView } = useViewMode();

  const handleDebtPress = (debtId: string) => {
    console.log('Navigate to debt:', debtId);
  };

  // Get urgent debts (due soon or overdue)
  const urgentDebts = liabilities.filter(l => l.status === 'due_soon' || l.status === 'overdue');
  const urgentTotal = urgentDebts.reduce((sum, l) => sum + l.currentBalance, 0);

  // Simple View
  if (isSimpleView) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.simpleContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.simpleHeader}>
          <Text style={[styles.simpleTitle, { color: colors.text }]}>Lenders & Debts</Text>
        </View>

        {/* Total Debt Summary */}
        <Card>
          <View style={styles.simpleDebtCard}>
            <Text style={[styles.simpleDebtLabel, { color: colors.textSecondary }]}>
              Total Debt
            </Text>
            <Text style={[styles.simpleDebtAmount, { color: colors.text }]}>
              {formatCurrency(totalDebt)}
            </Text>
            <View style={styles.simpleUtilization}>
              <Text style={[styles.simpleUtilizationText, { color: colors.textSecondary }]}>
                {utilizationPercent.toFixed(0)}% utilization
              </Text>
            </View>
          </View>
        </Card>

        {/* Urgent Debts */}
        {urgentDebts.length > 0 && (
          <Card>
            <View style={styles.simpleUrgentHeader}>
              <AlertCircle size={18} color="#ef4444" strokeWidth={2} />
              <Text style={[styles.simpleUrgentTitle, { color: colors.text }]}>
                Urgent ({urgentDebts.length})
              </Text>
            </View>
            <Text style={[styles.simpleUrgentAmount, { color: '#ef4444' }]}>
              {formatCurrency(urgentTotal)}
            </Text>
            <View style={styles.simpleUrgentList}>
              {urgentDebts.slice(0, 3).map(debt => (
                <View key={debt.id} style={styles.simpleUrgentItem}>
                  <CreditCard size={16} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.simpleUrgentItemText, { color: colors.text }]} numberOfLines={1}>
                    {debt.name}
                  </Text>
                  <Text style={[styles.simpleUrgentItemAmount, { color: colors.text }]}>
                    {formatCurrency(debt.currentBalance)}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Debt Dashboard - Simplified */}
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

  // Detailed View
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
  simpleContentContainer: {
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
  simpleHeader: {
    marginBottom: 20,
    marginTop: 8,
  },
  simpleTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  simpleDebtCard: {
    alignItems: 'center',
    padding: 20,
  },
  simpleDebtLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  simpleDebtAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  simpleUtilization: {
    marginTop: 4,
  },
  simpleUtilizationText: {
    fontSize: 13,
  },
  simpleUrgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  simpleUrgentTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  simpleUrgentAmount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  simpleUrgentList: {
    gap: 10,
  },
  simpleUrgentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  simpleUrgentItemText: {
    flex: 1,
    fontSize: 14,
  },
  simpleUrgentItemAmount: {
    fontSize: 14,
    fontWeight: '600',
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