import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { accounts, liabilities } from '../lib/mockData';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import {
  NetWorthCard,
  AccountBreakdownCard,
  AccountsOverview,
  SavingsVaults,
} from '../components/accounts';
import { Building2, PiggyBank, Rocket, Wallet, TrendingUp } from 'lucide-react-native';

// Calculate totals
const totalAssets = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
const totalLiabilities = liabilities.reduce((sum, l) => sum + l.currentBalance, 0);
const netWorth = totalAssets - totalLiabilities;

// Account type colors
const accountTypeColors: Record<string, string> = {
  checking: '#8b5cf6',
  savings: '#10b981',
  investment: '#f59e0b',
};

// Account type icons - now using lucide icon names
const accountTypeIcons: Record<string, string> = {
  checking: 'building',
  savings: 'piggy-bank',
  investment: 'rocket',
};

// Group accounts by type
const accountsByType = accounts.reduce((acc, account) => {
  acc[account.type] = (acc[account.type] || 0) + account.currentBalance;
  return acc;
}, {} as Record<string, number>);

export default function AccountsScreen() {
  const { colors } = useTheme();
  const { isSimpleView } = useViewMode();

  // Simple View
  if (isSimpleView) {
    const checkingAccounts = accounts.filter(a => a.type === 'checking');
    const savingsAccounts = accounts.filter(a => a.type === 'savings');
    const totalChecking = checkingAccounts.reduce((sum, a) => sum + a.availableBalance, 0);
    const totalSavings = savingsAccounts.reduce((sum, a) => sum + a.availableBalance, 0);

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.simpleContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.simpleHeader}>
          <Text style={[styles.simpleTitle, { color: colors.text }]}>Accounts & Banks</Text>
        </View>

        {/* Net Worth Summary */}
        <Card>
          <View style={styles.simpleNetWorth}>
            <Text style={[styles.simpleNetWorthLabel, { color: colors.textSecondary }]}>
              Net Worth
            </Text>
            <Text style={[styles.simpleNetWorthAmount, { color: colors.text }]}>
              {formatCurrency(netWorth)}
            </Text>
            <View style={styles.simpleNetWorthBreakdown}>
              <View style={styles.simpleBreakdownItem}>
                <TrendingUp size={16} color="#10b981" strokeWidth={2} />
                <Text style={[styles.simpleBreakdownText, { color: colors.textSecondary }]}>
                  Assets: {formatCurrency(totalAssets)}
                </Text>
              </View>
              <View style={styles.simpleBreakdownItem}>
                <TrendingUp size={16} color="#ef4444" strokeWidth={2} style={{ transform: [{ rotate: '180deg' }] }} />
                <Text style={[styles.simpleBreakdownText, { color: colors.textSecondary }]}>
                  Liabilities: {formatCurrency(totalLiabilities)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Account Summary */}
        <Card>
          <View style={styles.simpleAccountsSummary}>
            <View style={styles.simpleAccountType}>
              <View style={[styles.simpleAccountIcon, { backgroundColor: `${accountTypeColors.checking}20` }]}>
                <Wallet size={20} color={accountTypeColors.checking} strokeWidth={2} />
              </View>
              <View style={styles.simpleAccountInfo}>
                <Text style={[styles.simpleAccountLabel, { color: colors.textSecondary }]}>
                  Checking
                </Text>
                <Text style={[styles.simpleAccountAmount, { color: colors.text }]}>
                  {formatCurrency(totalChecking)}
                </Text>
              </View>
            </View>
            <View style={styles.simpleAccountType}>
              <View style={[styles.simpleAccountIcon, { backgroundColor: `${accountTypeColors.savings}20` }]}>
                <PiggyBank size={20} color={accountTypeColors.savings} strokeWidth={2} />
              </View>
              <View style={styles.simpleAccountInfo}>
                <Text style={[styles.simpleAccountLabel, { color: colors.textSecondary }]}>
                  Savings
                </Text>
                <Text style={[styles.simpleAccountAmount, { color: colors.text }]}>
                  {formatCurrency(totalSavings)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Accounts Overview - Simplified */}
        <AccountsOverview
          accounts={accounts}
          netWorth={netWorth}
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          accountTypeIcons={accountTypeIcons}
          colors={colors}
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
          Accounts & Banks
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your linked accounts and savings vaults
        </Text>
      </View>

      {/* Net Worth Summary */}
      <NetWorthCard
        totalAssets={totalAssets}
        totalLiabilities={totalLiabilities}
        colors={colors}
      />

      {/* Account Breakdown */}
      <AccountBreakdownCard
        accountsByType={accountsByType}
        totalAssets={totalAssets}
        accountTypeColors={accountTypeColors}
        colors={colors}
      />

      {/* Accounts Overview */}
      <AccountsOverview
        accounts={accounts}
        netWorth={netWorth}
        totalAssets={totalAssets}
        totalLiabilities={totalLiabilities}
        accountTypeIcons={accountTypeIcons}
        colors={colors}
      />

      {/* Savings Vaults */}
      <SavingsVaults colors={colors} />

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
  simpleNetWorth: {
    alignItems: 'center',
    padding: 20,
  },
  simpleNetWorthLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  simpleNetWorthAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 16,
  },
  simpleNetWorthBreakdown: {
    width: '100%',
    gap: 12,
  },
  simpleBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simpleBreakdownText: {
    fontSize: 13,
  },
  simpleAccountsSummary: {
    gap: 16,
    padding: 16,
  },
  simpleAccountType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  simpleAccountIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleAccountInfo: {
    flex: 1,
  },
  simpleAccountLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  simpleAccountAmount: {
    fontSize: 20,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});