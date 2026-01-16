import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { accounts, liabilities } from '../lib/mockData';
import {
  NetWorthCard,
  AccountBreakdownCard,
  AccountsOverview,
  SavingsVaults,
} from '../components/accounts';
import { Building2, PiggyBank, Rocket } from 'lucide-react-native';

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
  bottomPadding: {
    height: 40,
  },
});