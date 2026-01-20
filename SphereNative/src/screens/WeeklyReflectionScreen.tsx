import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { differenceInDays } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import { transactions, dailySpendData } from '../lib/mockData';
import {
  WeeklyReflectionHeader,
  WeekSummary,
  CategoryBreakdown,
  RepeatedPatterns,
  QuickReflection,
} from '../components/weeklyReflection';
import { CheckCircle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react-native';

export default function WeeklyReflectionScreen() {
  const { colors } = useTheme();
  const { isSimpleView } = useViewMode();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const now = new Date();

  // Calculate this week vs last week
  const thisWeekSpend = dailySpendData
    .filter((d) => differenceInDays(now, new Date(d.date)) <= 7)
    .reduce((sum, d) => sum + d.amount, 0);

  const lastWeekSpend = dailySpendData
    .filter((d) => {
      const days = differenceInDays(now, new Date(d.date));
      return days > 7 && days <= 14;
    })
    .reduce((sum, d) => sum + d.amount, 0);

  const percentChange =
    lastWeekSpend > 0 ? ((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100 : 0;

  // Get all transactions this week
  const thisWeekTransactions = transactions
    .filter((t) => differenceInDays(now, new Date(t.date)) <= 7 && t.amount > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  thisWeekTransactions.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
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
          <Card>
            <View style={styles.simpleWeekSummary}>
              <View style={styles.simpleWeekHeader}>
                <BarChart3 size={20} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.simpleWeekTitle, { color: colors.text }]}>
                  This Week
                </Text>
              </View>
              <Text style={[styles.simpleWeekAmount, { color: colors.text }]}>
                {formatCurrency(thisWeekSpend)}
              </Text>
              <View style={styles.simpleWeekTrend}>
                {isSpendingDown ? (
                  <TrendingDown size={18} color="#10b981" strokeWidth={2} />
                ) : (
                  <TrendingUp size={18} color="#f59e0b" strokeWidth={2} />
                )}
                <Text style={[
                  styles.simpleWeekTrendText,
                  { color: isSpendingDown ? '#10b981' : '#f59e0b' }
                ]}>
                  {Math.abs(percentChange).toFixed(0)}% vs last week
                </Text>
              </View>
            </View>
          </Card>

          {/* Top Category */}
          {topCategory && (
            <Card>
              <View style={styles.simpleCategoryCard}>
                <Text style={[styles.simpleCategoryLabel, { color: colors.textSecondary }]}>
                  Top Category
                </Text>
                <Text style={[styles.simpleCategoryName, { color: colors.text }]}>
                  {topCategory[0]}
                </Text>
                <Text style={[styles.simpleCategoryAmount, { color: colors.primary }]}>
                  {formatCurrency(topCategory[1])}
                </Text>
              </View>
            </Card>
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
  simpleWeekSummary: {
    padding: 20,
    alignItems: 'center',
  },
  simpleWeekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  simpleWeekTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  simpleWeekAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  simpleWeekTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  simpleWeekTrendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  simpleCategoryCard: {
    padding: 20,
    alignItems: 'center',
  },
  simpleCategoryLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  simpleCategoryName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  simpleCategoryAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  completeButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  completeButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  completeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bottomPadding: { height: 40 },
});