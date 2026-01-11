import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Svg, { Circle, G, Polyline, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/Card';
import { calculateSafeToSpend, mockRecurringCharges, mockLiabilities, mockTransactions } from '../lib/mockData';
import { formatCurrency, getDaysUntil } from '../lib/utils';
import { spacing, fontSize, borderRadius } from '../lib/theme';

// Mini Sparkline Component (like web app)
const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 40;
  const width = 120;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const lastX = width;
  const lastY = height - ((data[data.length - 1] - min) / range) * height;

  return (
    <Svg width={width} height={height}>
      <Polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <Circle cx={lastX} cy={lastY} r="4" fill={color} />
    </Svg>
  );
};

// Spending Trend Line Component
const SpendingTrendLine = ({ colors }: { colors: any }) => {
  const last14Days = mockTransactions
    .filter(t => t.amount < 0)
    .slice(0, 14)
    .map(t => Math.abs(t.amount));
  
  if (last14Days.length < 2) return null;
  
  const max = Math.max(...last14Days);
  const min = Math.min(...last14Days);
  const range = max - min || 1;
  const height = 60;
  const width = 300;
  
  const points = last14Days.map((val, i) => {
    const x = (i / (last14Days.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={styles.trendContainer}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Polyline
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </Svg>
      <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>Last 14 days spending</Text>
    </View>
  );
};

const OverviewScreen = () => {
  const { colors } = useTheme();
  const { safeToSpend, breakdown } = calculateSafeToSpend();
  const healthPercent = Math.min(100, (safeToSpend / breakdown.liquidAvailable) * 100);

  // Weekly spending data
  const last7Days = mockTransactions
    .filter(t => t.amount < 0)
    .slice(0, 7)
    .map(t => Math.abs(t.amount));

  // Upcoming bills (next 7 days)
  const upcomingBills = mockRecurringCharges
    .filter(r => getDaysUntil(r.nextDate) <= 7 && getDaysUntil(r.nextDate) >= 0)
    .sort((a, b) => getDaysUntil(a.nextDate) - getDaysUntil(b.nextDate))
    .slice(0, 3);

  const totalUpcoming = upcomingBills.reduce((sum, b) => sum + b.avgAmount, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero: Total Available - Centered & Prominent (like web) */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconRow}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.heroIconText}>💰</Text>
            </View>
            <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>Total Available</Text>
          </View>
          <Text style={[styles.heroAmount, { color: colors.text }]}>
            {formatCurrency(breakdown.liquidAvailable)}
          </Text>
          <Text style={[styles.heroSubtext, { color: colors.textSecondary }]}>
            Across all linked accounts
          </Text>
          
          <SpendingTrendLine colors={colors} />
        </View>

        {/* Safe to Spend Card (like web SafeToSpendCard) */}
        <Card style={styles.safeToSpendCard}>
          <View style={styles.safeToSpendHeader}>
            <View style={styles.safeToSpendLeft}>
              <View style={[styles.shieldIcon, { backgroundColor: colors.primaryLight }]}>
                <Text>🛡️</Text>
              </View>
              <Text style={[styles.safeToSpendLabel, { color: colors.textSecondary }]}>Safe to Spend</Text>
            </View>
            <View style={[styles.healthBadge, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.healthText, { color: colors.success }]}>{Math.round(healthPercent)}%</Text>
            </View>
          </View>
          
          <Text style={[styles.safeToSpendAmount, { color: colors.text }]}>
            {formatCurrency(safeToSpend)}
          </Text>

          {/* Breakdown items */}
          <View style={styles.breakdownList}>
            <BreakdownItem icon="💰" label="Available" value={breakdown.liquidAvailable} colors={colors} positive />
            <BreakdownItem icon="⏳" label="Pending" value={-breakdown.pendingOutflows} colors={colors} />
            <BreakdownItem icon="📅" label="Bills (7 days)" value={-breakdown.upcoming7dEssentials} colors={colors} />
            <BreakdownItem icon="🛡️" label="Buffer" value={-breakdown.userBuffer} colors={colors} muted />
          </View>
        </Card>

        {/* Upcoming Bills Card (like web UpcomingBills) */}
        <Card style={styles.card}>
          <View style={styles.billsHeader}>
            <View style={styles.billsHeaderLeft}>
              <Text style={styles.billsIcon}>📅</Text>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Upcoming Bills</Text>
            </View>
            <View style={styles.billsHeaderRight}>
              <Text style={[styles.billsSubtitle, { color: colors.textSecondary }]}>Next 7 days</Text>
              <Text style={[styles.billsTotal, { color: colors.text }]}>{formatCurrency(totalUpcoming)}</Text>
            </View>
          </View>

          {upcomingBills.length > 0 ? (
            upcomingBills.map(bill => {
              const daysUntil = getDaysUntil(bill.nextDate);
              return (
                <View key={bill.id} style={[styles.billItem, { backgroundColor: colors.secondary }]}>
                  <View style={styles.billLeft}>
                    <View style={[styles.billIconContainer, { backgroundColor: colors.muted }]}>
                      <Text style={styles.billCategoryIcon}>
                        {bill.category === 'Entertainment' ? '📺' : bill.category === 'Utilities' ? '⚡' : bill.category === 'Health' ? '💪' : '📄'}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.billMerchant, { color: colors.text }]}>{bill.merchant}</Text>
                      <Text style={[styles.billCadence, { color: colors.textSecondary }]}>🔄 {bill.cadence}</Text>
                    </View>
                  </View>
                  <View style={styles.billRight}>
                    <Text style={[styles.billAmount, { color: colors.text }]}>{formatCurrency(bill.avgAmount)}</Text>
                    <Text style={[styles.billDue, { color: daysUntil <= 3 ? colors.primary : colors.textSecondary }]}>
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `in ${daysUntil} days`}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No bills due this week 🎉</Text>
          )}

          {mockRecurringCharges.length > 3 && (
            <Text style={[styles.moreLink, { color: colors.primary }]}>
              +{mockRecurringCharges.length - 3} more bills
            </Text>
          )}
        </Card>

        {/* Weekly Insight Card */}
        <Card style={styles.card}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>📊</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Weekly Insight</Text>
          </View>
          <View style={styles.insightContent}>
            <View>
              <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>This week</Text>
              <Text style={[styles.insightAmount, { color: colors.text }]}>
                {formatCurrency(last7Days.reduce((a, b) => a + b, 0))}
              </Text>
            </View>
            <MiniSparkline data={last7Days.length > 1 ? last7Days : [0, 0]} color={colors.primary} />
          </View>
        </Card>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Breakdown Item Component
const BreakdownItem = ({ icon, label, value, colors, positive, muted }: any) => (
  <View style={[styles.breakdownItem, { backgroundColor: colors.muted + '50' }]}>
    <View style={styles.breakdownLeft}>
      <View style={[styles.breakdownIcon, { backgroundColor: colors.muted }]}>
        <Text>{icon}</Text>
      </View>
      <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
    <Text style={[
      styles.breakdownValue, 
      { color: positive ? colors.text : muted ? colors.textSecondary : colors.warning }
    ]}>
      {value >= 0 ? '+' : ''}{formatCurrency(value)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  
  // Hero Section
  heroSection: { alignItems: 'center', paddingVertical: spacing.lg },
  heroIconRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  heroIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  heroIconText: { fontSize: 20 },
  heroLabel: { fontSize: fontSize.sm, fontWeight: '500' },
  heroAmount: { fontSize: fontSize['5xl'], fontWeight: '700', letterSpacing: -1 },
  heroSubtext: { fontSize: fontSize.sm, marginTop: spacing.xs },
  
  // Trend
  trendContainer: { alignItems: 'center', marginTop: spacing.lg },
  trendLabel: { fontSize: fontSize.xs, marginTop: spacing.xs },
  
  // Safe to Spend Card
  safeToSpendCard: { marginBottom: spacing.md },
  safeToSpendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  safeToSpendLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  shieldIcon: { width: 28, height: 28, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  safeToSpendLabel: { fontSize: fontSize.xs, fontWeight: '500' },
  healthBadge: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  healthText: { fontSize: fontSize.xs, fontWeight: '700' },
  safeToSpendAmount: { fontSize: fontSize['3xl'], fontWeight: '700', marginBottom: spacing.md },
  
  // Breakdown
  breakdownList: { gap: spacing.xs },
  breakdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  breakdownIcon: { width: 24, height: 24, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  breakdownLabel: { fontSize: fontSize.xs, fontWeight: '500' },
  breakdownValue: { fontSize: fontSize.sm, fontWeight: '600' },
  
  // Bills Card
  card: { marginBottom: spacing.md },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '600' },
  billsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  billsHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  billsIcon: { fontSize: 16 },
  billsHeaderRight: { alignItems: 'flex-end' },
  billsSubtitle: { fontSize: fontSize.xs },
  billsTotal: { fontSize: fontSize.sm, fontWeight: '500' },
  billItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.sm, marginBottom: spacing.sm },
  billLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  billIconContainer: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  billCategoryIcon: { fontSize: 16 },
  billMerchant: { fontSize: fontSize.sm, fontWeight: '500' },
  billCadence: { fontSize: fontSize.xs, marginTop: 2 },
  billRight: { alignItems: 'flex-end' },
  billAmount: { fontSize: fontSize.sm, fontWeight: '500' },
  billDue: { fontSize: fontSize.xs, marginTop: 2 },
  moreLink: { textAlign: 'center', fontSize: fontSize.sm, fontWeight: '500', marginTop: spacing.sm },
  emptyText: { textAlign: 'center', fontSize: fontSize.md, paddingVertical: spacing.lg },
  
  // Insight Card
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  insightIcon: { fontSize: 16 },
  insightContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  insightLabel: { fontSize: fontSize.xs },
  insightAmount: { fontSize: fontSize.xl, fontWeight: '700' },
  
  footer: { height: 40 },
});

export default OverviewScreen;