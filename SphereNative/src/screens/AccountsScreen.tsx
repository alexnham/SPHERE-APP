import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import {
  AccountBreakdownCard,
  AccountsOverview,
  SavingsVaults,
} from '../components/accounts';
import {
  SimpleHeader,
  SimpleNetWorthCard,
  SimpleAccountSummary,
} from '../components/simple';
import { Building2, PiggyBank, Rocket, Wallet, TrendingUp } from 'lucide-react-native';
import { useAccounts } from '../hooks/useAccounts';
import { useLiabilities } from '../hooks/useLiabilities';
import { calculateNetWorth } from '../lib/database';

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

export default function AccountsScreen() {
  const { colors } = useTheme();
  const { isSimpleView } = useViewMode();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { liabilities, loading: liabilitiesLoading } = useLiabilities();
  const [netWorthData, setNetWorthData] = React.useState<{ assets: number; liabilities: number; netWorth: number } | null>(null);
  const [loadingNetWorth, setLoadingNetWorth] = React.useState(true);

  // Fetch net worth data
  React.useEffect(() => {
    const fetchNetWorth = async () => {
      try {
        setLoadingNetWorth(true);
        const data = await calculateNetWorth();
        setNetWorthData(data);
      } catch (error) {
        console.error('Error fetching net worth:', error);
      } finally {
        setLoadingNetWorth(false);
      }
    };
    fetchNetWorth();
  }, [accounts, liabilities]);

  // Calculate totals
  const totalAssets = useMemo(() => {
    return accounts.reduce((sum, a) => sum + a.currentBalance, 0);
  }, [accounts]);

  const totalLiabilities = useMemo(() => {
    return liabilities.reduce((sum, l) => sum + l.currentBalance, 0);
  }, [liabilities]);

  const netWorth = netWorthData?.netWorth ?? (totalAssets - totalLiabilities);

  // Group accounts by type - only asset accounts (checking, savings, investment)
  const accountsByType = useMemo(() => {
    return accounts
      .filter(a => a.type === 'checking' || a.type === 'savings' || a.type === 'investment')
      .reduce((acc, account) => {
        acc[account.type] = (acc[account.type] || 0) + account.currentBalance;
        return acc;
      }, {} as Record<string, number>);
  }, [accounts]);

  const isLoading = accountsLoading || liabilitiesLoading || loadingNetWorth;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: 16 }]}>Loading...</Text>
      </View>
    );
  }

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
        <SimpleHeader title="Accounts & Banks" colors={colors} />

        {/* Net Worth Summary */}
        <SimpleNetWorthCard
          netWorth={netWorth}
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          colors={colors}
        />

        {/* Quick Account Summary */}
        <SimpleAccountSummary
          accounts={[
            { type: 'checking', amount: totalChecking, color: accountTypeColors.checking },
            { type: 'savings', amount: totalSavings, color: accountTypeColors.savings },
          ]}
          colors={colors}
        />

      {/* Savings Vaults */}
      <SavingsVaults colors={colors} />

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


      {/* Accounts Overview with Net Worth */}
      <AccountsOverview
        accounts={accounts}
        netWorth={netWorth}
        totalAssets={totalAssets}
        totalLiabilities={totalLiabilities}
        accountTypeIcons={accountTypeIcons}
        colors={colors}
      />

            {/* Account Breakdown */}
            <AccountBreakdownCard
        accountsByType={accountsByType}
        totalAssets={totalAssets}
        accountTypeColors={accountTypeColors}
        colors={colors}
      />




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
  bottomPadding: {
    height: 40,
  },
  loadingText: {
    fontSize: 14,
  },
});