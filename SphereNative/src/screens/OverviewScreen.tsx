import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/Card';
import { accounts } from '../lib/mockData';
import { formatCurrency } from '../lib/utils';
import {
  SpendingTrendLine,
  SafeToSpendCard,
  UpcomingBillsCard,
  WeeklyInsightCard,
} from '../components/overview';

export default function OverviewScreen() {
  const { colors } = useTheme();

  // Calculate total available
  const totalAvailable = accounts
    .filter(a => a.type === 'checking' || a.type === 'savings')
    .reduce((sum, a) => sum + a.availableBalance, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Page Title - simplified since greeting is in Header */}
      <View style={styles.pageHeader}>
        <Text style={[styles.title, { color: colors.text }]}>Overview</Text>
      </View>

      {/* Hero Section - Total Available */}
      <Card>
        <View style={styles.heroContent}>
          <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>
            Total Available
          </Text>
          <Text style={[styles.heroAmount, { color: colors.text }]}>
            {formatCurrency(totalAvailable)}
          </Text>
          <SpendingTrendLine colors={colors} />
        </View>
      </Card>

      {/* Safe to Spend */}
      <SafeToSpendCard colors={colors} />

      {/* Upcoming Bills */}
      <UpcomingBillsCard colors={colors} />

      {/* Weekly Insight */}
      <WeeklyInsightCard colors={colors} />

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
  pageHeader: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 16,
  },
  bottomPadding: {
    height: 40,
  },
});