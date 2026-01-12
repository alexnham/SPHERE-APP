import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { differenceInDays } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { transactions, dailySpendData } from '../lib/mockData';
import {
  WeeklyReflectionHeader,
  WeekSummary,
  CategoryBreakdown,
  RepeatedPatterns,
  QuickReflection,
} from '../components/weeklyReflection';

export default function WeeklyReflectionScreen() {
  const { colors } = useTheme();
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
          <Text style={styles.completeButtonText}>✅ Mark Week as Reviewed</Text>
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
  completeButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  completeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bottomPadding: { height: 40 },
});