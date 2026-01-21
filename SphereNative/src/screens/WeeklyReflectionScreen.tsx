import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { differenceInDays } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import {
  WeeklyReflectionHeader,
  WeekSummary,
  CategoryBreakdown,
  RepeatedPatterns,
  QuickReflection,
} from '../components/weeklyReflection';
import {
  SimpleWeekSummary,
  SimpleTopCategory,
} from '../components/simple';
import { CheckCircle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react-native';
import { useTransactions } from '../hooks/useTransactions';
import { generateDailySpendData } from '../lib/database';

export default function WeeklyReflectionScreen() {
  const { colors } = useTheme();
  const { isSimpleView } = useViewMode();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const now = new Date();
  const [dailySpendData, setDailySpendData] = React.useState<Array<{ date: Date; amount: number; categories: Record<string, number> }>>([]);
  const [loadingDailySpend, setLoadingDailySpend] = React.useState(true);
  
  // Get transactions for last 30 days
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 30);
  const { transactions, loading: transactionsLoading } = useTransactions({
    start_date: startDate.toISOString().split('T')[0],
    limit: 1000,
  });

  useEffect(() => {
    const fetchDailySpend = async () => {
      try {
        setLoadingDailySpend(true);
        const data = await generateDailySpendData();
        setDailySpendData(data);
      } catch (error) {
        console.error('Error fetching daily spend data:', error);
      } finally {
        setLoadingDailySpend(false);
      }
    };
    fetchDailySpend();
  }, [transactions]);

  // Calculate this week vs last week
  const thisWeekSpend = useMemo(() => {
    return dailySpendData
      .filter((d) => differenceInDays(now, new Date(d.date)) <= 7)
      .reduce((sum, d) => sum + d.amount, 0);
  }, [dailySpendData, now]);

  const lastWeekSpend = useMemo(() => {
    return dailySpendData
      .filter((d) => {
        const days = differenceInDays(now, new Date(d.date));
        return days > 7 && days <= 14;
      })
      .reduce((sum, d) => sum + d.amount, 0);
  }, [dailySpendData, now]);

  const percentChange = useMemo(() => {
    return lastWeekSpend > 0 ? ((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100 : 0;
  }, [thisWeekSpend, lastWeekSpend]);

  // Get all transactions this week
  const thisWeekTransactions = useMemo(() => {
    return transactions
      .filter((t) => differenceInDays(now, new Date(t.date)) <= 7 && t.amount < 0) // Spending is negative
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, now]);

  // Category breakdown
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    thisWeekTransactions.forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount);
    });
    return totals;
  }, [thisWeekTransactions]);

  const isLoading = transactionsLoading || loadingDailySpend;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: 16 }]}>Loading...</Text>
      </View>
    );
  }
  const sortedCategories = Object.entries(categoryTotals).sort(
    ([, a], [, b]) => b - a
  );

  // Repeated merchants
  const merchantCounts: Record<string, { count: number; total: number }> = {};
  thisWeekTransactions.forEach((t) => {
    if (!merchantCounts[t.merchant]) {
      merchantCounts[t.merchant] = { count: 0, total: 0 };
    }
    merchantCounts[t.merchant].count += 1;
    merchantCounts[t.merchant].total += t.amount;
  });
  const repeatedMerchants = Object.entries(merchantCounts)
    .filter(([, data]) => data.count >= 2)
    .sort(([, a], [, b]) => b.total - a.total);

  // Largest transactions
  const largestTransactions = [...thisWeekTransactions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const handleFeedback = (transactionId: string, feedback: 'yes' | 'neutral' | 'no') => {
    console.log(`Feedback for ${transactionId}: ${feedback}`);
    // Handle feedback logic here
  };

  const isSpendingDown = percentChange < 0;
  const topCategory = sortedCategories[0];

  // Simple View
  if (isSimpleView) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 8,
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <WeeklyReflectionHeader onBack={() => navigation.goBack()} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.simpleContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Week Summary - Simplified */}
          <SimpleWeekSummary
            amount={thisWeekSpend}
            changePercent={percentChange}
            colors={colors}
          />

          {/* Top Category */}
          {topCategory && (
            <SimpleTopCategory
              category={topCategory[0]}
              amount={topCategory[1]}
              colors={colors}
            />
          )}

          {/* Category Breakdown - Simplified */}
          <CategoryBreakdown categories={sortedCategories} totalSpend={thisWeekSpend} />

          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: colors.primary }]}
          >
            <View style={styles.completeButtonContent}>
              <CheckCircle size={18} color="#fff" strokeWidth={2} />
              <Text style={styles.completeButtonText}>Mark Week as Reviewed</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    );
  }

  // Detailed View
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <WeeklyReflectionHeader onBack={() => navigation.goBack()} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <WeekSummary totalSpend={thisWeekSpend} percentChange={percentChange} />

        <CategoryBreakdown categories={sortedCategories} totalSpend={thisWeekSpend} />

        <RepeatedPatterns merchants={repeatedMerchants} />

        <QuickReflection
          transactions={largestTransactions}
          onFeedback={handleFeedback}
        />

        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: colors.primary }]}
        >
          <View style={styles.completeButtonContent}>
            <CheckCircle size={18} color="#fff" strokeWidth={2} />
            <Text style={styles.completeButtonText}>Mark Week as Reviewed</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  scrollView: { flex: 1 },
  contentContainer: { padding: 16 },
  simpleContentContainer: { padding: 16, gap: 16 },
  completeButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  completeButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  completeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bottomPadding: { height: 40 },
  loadingText: {
    fontSize: 14,
  },
});