import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import { transactions, dailySpendData } from '../lib/mockData';
import {
  TabButton,
  SpendingInsights,
  SpendingCalendar,
  BudgetGoals,
} from '../components/spending';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { differenceInDays } from 'date-fns';

export default function SpendingScreen() {
  const { colors } = useTheme();
  const { isSimpleView } = useViewMode();
  const [activeTab, setActiveTab] = useState<'spending' | 'budget'>('spending');

  // Calculate simple summary data
  const spendingData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTransactions = transactions.filter(
      t => new Date(t.date) >= startOfMonth && t.amount > 0
    );
    const monthlySpending = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalBudget = 1700;
    const budgetRemaining = totalBudget - monthlySpending;
    const isOnTrack = budgetRemaining > 0;
    const progressPercent = Math.min(100, (monthlySpending / totalBudget) * 100);
    
    return { monthlySpending, budgetRemaining, isOnTrack, progressPercent };
  }, []);

  // Simple View
  if (isSimpleView) {
    const ringRadius = 42;
    const circumference = 2 * Math.PI * ringRadius;
    const strokeDashoffset = circumference * (1 - spendingData.progressPercent / 100);

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.simpleContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.simpleHeader}>
          <Text style={[styles.simpleTitle, { color: colors.text }]}>Spending & Budgets</Text>
        </View>

        {/* Circular Progress with spending */}
        <Card>
          <View style={styles.simpleProgressContainer}>
            <View style={styles.ringWrapper}>
              <Svg width={160} height={160} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  fill="none"
                  stroke={colors.border}
                  strokeWidth="8"
                />
                <Circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  fill="none"
                  stroke={spendingData.isOnTrack ? colors.primary : '#f59e0b'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </Svg>
              <View style={styles.ringContent}>
                <Text style={[styles.ringPercent, { color: colors.text }]}>
                  {spendingData.progressPercent.toFixed(0)}%
                </Text>
                <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>of budget</Text>
              </View>
            </View>
            
            <Text style={[styles.simpleSpendingAmount, { color: colors.text }]}>
              {formatCurrency(spendingData.monthlySpending)}
            </Text>
            
            <View style={[
              styles.simpleStatusBadge,
              { backgroundColor: spendingData.isOnTrack ? '#10b98120' : '#f59e0b20' }
            ]}>
              {spendingData.isOnTrack ? (
                <>
                  <CheckCircle2 size={16} color="#10b981" strokeWidth={2} />
                  <Text style={[styles.simpleStatusText, { color: '#10b981' }]}>
                    {formatCurrency(spendingData.budgetRemaining)} left
                  </Text>
                </>
              ) : (
                <>
                  <AlertCircle size={16} color="#f59e0b" strokeWidth={2} />
                  <Text style={[styles.simpleStatusText, { color: '#f59e0b' }]}>
                    {formatCurrency(Math.abs(spendingData.budgetRemaining))} over
                  </Text>
                </>
              )}
            </View>
          </View>
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
          <SpendingCalendar colors={colors} />
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
  simpleHeader: {
    marginBottom: 20,
    marginTop: 8,
    width: '100%',
  },
  simpleTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  simpleProgressContainer: {
    alignItems: 'center',
    padding: 24,
    width: '100%',
  },
  ringWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  ringContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercent: {
    fontSize: 24,
    fontWeight: '700',
  },
  ringLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  simpleSpendingAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  simpleStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  simpleStatusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  bottomPadding: {
    height: 40,
  },
});