import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import { InvestmentPortfolio } from '../components/investments';
import {
  SimpleHeader,
  SimplePortfolioCard,
} from '../components/simple';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { getInvestmentAccounts, InvestmentAccount } from '../lib/database';

export default function InvestmentsScreen() {
  const { colors } = useTheme();
  const { isSimpleView } = useViewMode();
  const [investmentAccounts, setInvestmentAccounts] = React.useState<InvestmentAccount[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        const accounts = await getInvestmentAccounts();
        setInvestmentAccounts(accounts);
      } catch (error) {
        console.error('Error fetching investment accounts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvestments();
  }, []);

  const portfolioData = useMemo(() => {
    const totalBalance = investmentAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalGain = investmentAccounts.reduce((sum, acc) => sum + acc.gain, 0);
    const totalContributions = investmentAccounts.reduce((sum, acc) => sum + acc.contributions, 0);
    const avgGainPercent = totalContributions > 0 
      ? ((totalGain / totalContributions) * 100) 
      : 0;
    
    return { totalBalance, totalGain, avgGainPercent, isPositive: totalGain >= 0 };
  }, [investmentAccounts]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: 16 }]}>Loading...</Text>
      </View>
    );
  }

  // Simple View
  if (isSimpleView) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.simpleContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SimpleHeader title="Investments" colors={colors} />

        {/* Portfolio Summary */}
        <SimplePortfolioCard
          label="Total Portfolio"
          amount={portfolioData.totalBalance}
          gain={portfolioData.totalGain}
          gainPercent={portfolioData.avgGainPercent}
          colors={colors}
        />

        {/* Investment Portfolio - Simplified */}
        <InvestmentPortfolio colors={colors} investmentAccounts={investmentAccounts} />

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
        <Text style={[styles.title, { color: colors.text }]}>Investments</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your portfolio performance
        </Text>
      </View>

      {/* Investment Portfolio */}
      <InvestmentPortfolio colors={colors} investmentAccounts={investmentAccounts} />

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