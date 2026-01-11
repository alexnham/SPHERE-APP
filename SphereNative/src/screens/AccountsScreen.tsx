import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { mockAccounts, calculateNetWorth } from '../lib/mockData';
import { formatCurrency } from '../lib/utils';
import { spacing, fontSize, borderRadius } from '../lib/theme';

const accountTypeColors: Record<string, string> = {
  checking: '#6366F1',
  savings: '#10B981',
  investment: '#8B5CF6',
  credit: '#EF4444',
  loan: '#F59E0B',
};

const AccountsScreen = () => {
  const { colors } = useTheme();
  const { netWorth, assets, liabilities } = calculateNetWorth();

  // Group accounts by type
  const accountsByType = mockAccounts.reduce((acc, account) => {
    acc[account.type] = (acc[account.type] || 0) + account.currentBalance;
    return acc;
  }, {} as Record<string, number>);

  const totalAssets = Object.values(accountsByType).reduce((sum, val) => sum + val, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Accounts</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your linked accounts</Text>
        </View>

        {/* Net Worth Card */}
        <Card style={styles.card}>
          <Text style={[styles.netWorthLabel, { color: colors.textSecondary }]}>Net Worth</Text>
          <Text style={[styles.netWorthValue, { color: colors.text }]}>{formatCurrency(netWorth)}</Text>

          {/* Assets vs Liabilities */}
          <View style={styles.assetLiabilityContainer}>
            <View style={styles.assetRow}>
              <View style={styles.assetLabel}>
                <Text style={styles.assetIcon}>📈</Text>
                <Text style={[styles.assetText, { color: colors.textSecondary }]}>Assets</Text>
              </View>
              <Text style={[styles.assetValue, { color: colors.success }]}>{formatCurrency(assets)}</Text>
            </View>
            <ProgressBar progress={100} color={colors.success} height={8} style={styles.assetBar} />

            <View style={[styles.assetRow, { marginTop: spacing.md }]}>
              <View style={styles.assetLabel}>
                <Text style={styles.assetIcon}>📉</Text>
                <Text style={[styles.assetText, { color: colors.textSecondary }]}>Debts</Text>
              </View>
              <Text style={[styles.assetValue, { color: colors.destructive }]}>{formatCurrency(liabilities)}</Text>
            </View>
            <ProgressBar progress={(liabilities / assets) * 100} color={colors.destructive} height={8} style={styles.assetBar} />
          </View>
        </Card>

        {/* Account Breakdown */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Account Breakdown</Text>
          
          {/* Stacked Bar */}
          <View style={styles.stackedBar}>
            {Object.entries(accountsByType).map(([type, amount], index) => (
              <View
                key={type}
                style={[
                  styles.stackedSegment,
                  {
                    width: `${(amount / totalAssets) * 100}%`,
                    backgroundColor: accountTypeColors[type] || colors.primary,
                    borderTopLeftRadius: index === 0 ? borderRadius.full : 0,
                    borderBottomLeftRadius: index === 0 ? borderRadius.full : 0,
                    borderTopRightRadius: index === Object.keys(accountsByType).length - 1 ? borderRadius.full : 0,
                    borderBottomRightRadius: index === Object.keys(accountsByType).length - 1 ? borderRadius.full : 0,
                  },
                ]}
              />
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {Object.entries(accountsByType).map(([type, amount]) => (
              <View key={type} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: accountTypeColors[type] || colors.primary }]} />
                <Text style={[styles.legendType, { color: colors.textSecondary }]}>{type}</Text>
                <Text style={[styles.legendAmount, { color: colors.text }]}>{formatCurrency(amount)}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Individual Accounts */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>All Accounts</Text>
          {mockAccounts.map(account => (
            <TouchableOpacity key={account.id} style={styles.accountItem} activeOpacity={0.7}>
              <View style={styles.accountLeft}>
                <Text style={styles.accountIcon}>{account.icon}</Text>
                <View>
                  <Text style={[styles.accountName, { color: colors.text }]}>{account.name}</Text>
                  <Text style={[styles.accountInstitution, { color: colors.textSecondary }]}>
                    {account.institution} • {account.type}
                  </Text>
                </View>
              </View>
              <Text style={[styles.accountBalance, { color: colors.text }]}>
                {formatCurrency(account.currentBalance)}
              </Text>
            </TouchableOpacity>
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
  card: { marginBottom: spacing.md },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.md },
  netWorthLabel: { fontSize: fontSize.sm, textAlign: 'center' },
  netWorthValue: { fontSize: fontSize['4xl'], fontWeight: '700', textAlign: 'center', marginVertical: spacing.sm },
  assetLiabilityContainer: { marginTop: spacing.lg },
  assetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assetLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  assetIcon: { fontSize: 16 },
  assetText: { fontSize: fontSize.sm },
  assetValue: { fontSize: fontSize.md, fontWeight: '600' },
  assetBar: { marginTop: spacing.xs },
  stackedBar: { flexDirection: 'row', height: 16, borderRadius: borderRadius.full, overflow: 'hidden', marginBottom: spacing.lg },
  stackedSegment: { height: '100%' },
  legend: { gap: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.sm },
  legendType: { flex: 1, fontSize: fontSize.sm, textTransform: 'capitalize' },
  legendAmount: { fontSize: fontSize.sm, fontWeight: '600' },
  accountItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  accountLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  accountIcon: { fontSize: 24 },
  accountName: { fontSize: fontSize.md, fontWeight: '600' },
  accountInstitution: { fontSize: fontSize.sm, marginTop: 2, textTransform: 'capitalize' },
  accountBalance: { fontSize: fontSize.md, fontWeight: '700' },
  footer: { height: 40 },
});

export default AccountsScreen;