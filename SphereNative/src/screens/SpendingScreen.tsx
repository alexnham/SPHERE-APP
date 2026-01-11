import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/Card';
import { ProgressRing } from '../components/ProgressRing';
import { ProgressBar } from '../components/ProgressBar';
import { mockTransactions } from '../lib/mockData';
import { formatCurrency } from '../lib/utils';
import { spacing, fontSize, categoryColors } from '../lib/theme';

const SpendingScreen = () => {
  const { colors } = useTheme();

  // Calculate monthly spending
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyTransactions = mockTransactions.filter(t => t.date >= startOfMonth && t.amount < 0);
  const monthlySpending = monthlyTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Category breakdown
  const categorySpending = monthlyTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalBudget = 1700;
  const budgetRemaining = totalBudget - monthlySpending;
  const isOnTrack = budgetRemaining > 0;
  const progressPercent = Math.min(100, (monthlySpending / totalBudget) * 100);

  // Recent transactions
  const recentTransactions = mockTransactions.filter(t => t.amount < 0).slice(0, 8);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Spending</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track your monthly expenses</Text>
        </View>

        {/* Budget Progress Ring */}
        <View style={styles.ringContainer}>
          <ProgressRing progress={progressPercent} size={160} strokeWidth={12}>
            <Text style={[styles.ringPercent, { color: colors.text }]}>{progressPercent.toFixed(0)}%</Text>
            <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>of budget</Text>
          </ProgressRing>
        </View>

        {/* Spending Summary */}
        <Card style={styles.card}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Spent</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(monthlySpending)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Budget</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(totalBudget)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Left</Text>
              <Text style={[styles.summaryValue, { color: isOnTrack ? colors.success : colors.destructive }]}>
                {isOnTrack ? formatCurrency(budgetRemaining) : `-${formatCurrency(Math.abs(budgetRemaining))}`}
              </Text>
            </View>
          </View>
        </Card>

        {/* Category Breakdown */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>By Category</Text>
          {topCategories.map(([category, amount]) => {
            const percent = (amount / monthlySpending) * 100;
            return (
              <View key={category} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{category}</Text>
                  <Text style={[styles.categoryAmount, { color: colors.text }]}>{formatCurrency(amount)}</Text>
                </View>
                <ProgressBar
                  progress={percent}
                  color={categoryColors[category] || colors.primary}
                  height={6}
                  style={styles.categoryBar}
                />
              </View>
            );
          })}
        </Card>

        {/* Recent Transactions */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Recent Transactions</Text>
          {recentTransactions.map(txn => (
            <View key={txn.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <Text style={[styles.transactionMerchant, { color: colors.text }]}>{txn.merchant}</Text>
                <Text style={[styles.transactionCategory, { color: colors.textSecondary }]}>{txn.category}</Text>
              </View>
              <Text style={[styles.transactionAmount, { color: colors.destructive }]}>
                {formatCurrency(txn.amount)}
              </Text>
            </View>
          ))}
        </Card>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  header: { marginBottom: spacing.md },
  title: { fontSize: fontSize['2xl'], fontWeight: '700' },
  subtitle: { fontSize: fontSize.sm, marginTop: 4 },
  ringContainer: { alignItems: 'center', marginVertical: spacing.lg },
  ringPercent: { fontSize: fontSize['2xl'], fontWeight: '700' },
  ringLabel: { fontSize: fontSize.xs },
  card: { marginBottom: spacing.md },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#E5E7EB' },
  summaryLabel: { fontSize: fontSize.xs, marginBottom: 4 },
  summaryValue: { fontSize: fontSize.lg, fontWeight: '700' },
  categoryItem: { marginBottom: spacing.md },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  categoryName: { fontSize: fontSize.md },
  categoryAmount: { fontSize: fontSize.md, fontWeight: '600' },
  categoryBar: { marginTop: 4 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  transactionLeft: { flex: 1 },
  transactionMerchant: { fontSize: fontSize.md, fontWeight: '500' },
  transactionCategory: { fontSize: fontSize.sm, marginTop: 2 },
  transactionAmount: { fontSize: fontSize.md, fontWeight: '600' },
  footer: { height: 40 },
});

export default SpendingScreen;