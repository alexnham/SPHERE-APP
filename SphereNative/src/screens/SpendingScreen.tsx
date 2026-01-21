import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import {
  TabButton,
  SpendingInsights,
  SpendingCalendar,
  BudgetGoals,
} from '../components/spending';
import {
  SimpleHeader,
  CircularProgress,
} from '../components/simple';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';
import { differenceInDays } from 'date-fns';
import { useTransactions } from '../hooks/useTransactions';
import { getBills } from '../lib/database';

export default function SpendingScreen() {
  const { colors } = useTheme();
  const { isSimpleView } = useViewMode();
  const [activeTab, setActiveTab] = useState<'spending' | 'budget'>('spending');
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const { transactions, loading: transactionsLoading } = useTransactions({
    start_date: startOfMonth.toISOString().split('T')[0],
    limit: 1000,
  });
  const [totalBudget, setTotalBudget] = useState(1700); // TODO: Fetch from budgets API

  // Calculate simple summary data
  const spendingData = useMemo(() => {
    const monthlyTransactions = transactions.filter(
      t => new Date(t.date) >= startOfMonth && t.amount < 0 // Spending is negative
    );
    const monthlySpending = Math.abs(monthlyTransactions.reduce((sum, t) => sum + t.amount, 0));
    const budgetRemaining = totalBudget - monthlySpending;
    const isOnTrack = budgetRemaining > 0;
    const progressPercent = Math.min(100, (monthlySpending / totalBudget) * 100);
    
    return { monthlySpending, budgetRemaining, isOnTrack, progressPercent };
  }, [transactions, totalBudget, startOfMonth]);

  if (transactionsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: 16 }]}>Loading...</Text>
      </View>
    );
  }

  // Simple View
  if (isSimpleView) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.simpleContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SimpleHeader title="Spending & Budgets" colors={colors} />

        {/* Circular Progress with spending */}
        <Card>
          <CircularProgress
            progress={spendingData.progressPercent}
            label="of budget"
            amount={formatCurrency(spendingData.monthlySpending)}
            statusText={
              spendingData.isOnTrack
                ? `${formatCurrency(spendingData.budgetRemaining)} left`
                : `${formatCurrency(Math.abs(spendingData.budgetRemaining))} over`
            }
            statusColor={spendingData.isOnTrack ? '#10b981' : '#f59e0b'}
            statusIcon={
              spendingData.isOnTrack ? (
                <CheckCircle2 size={16} color="#10b981" strokeWidth={2} />
              ) : (
                <AlertCircle size={16} color="#f59e0b" strokeWidth={2} />
              )
            }
            colors={colors}
          />
        </Card>

        {/* Calendar */}
        <SpendingCalendar colors={colors} />

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
        <Text style={[styles.title, { color: colors.text }]}>Spending & Budgets</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your spending patterns and budget goals
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          title="Spending"
          icon="trending-up"
          isActive={activeTab === 'spending'}
          onPress={() => setActiveTab('spending')}
          colors={colors}
        />
        <TabButton
          title="Budget"
          icon="target"
          isActive={activeTab === 'budget'}
          onPress={() => setActiveTab('budget')}
          colors={colors}
        />
      </View>

      {/* Tab Content */}
      {activeTab === 'spending' ? (
        <>
          <SpendingInsights colors={colors} />
          <SpendingCalendar colors={colors} transactions={transactions} />
        </>
      ) : (
        <BudgetGoals colors={colors} />
      )}

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
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
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
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  bottomPadding: {
    height: 40,
  },
  loadingText: {
    fontSize: 14,
  },
});