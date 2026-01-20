import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import { investmentAccounts } from '../lib/mockData';
import { InvestmentPortfolio } from '../components/investments';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

export default function InvestmentsScreen() {
  const { colors } = useTheme();
  const { isSimpleView } = useViewMode();

  const portfolioData = useMemo(() => {
    const totalBalance = investmentAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalGain = investmentAccounts.reduce((sum, acc) => sum + acc.gain, 0);
    const totalContributions = investmentAccounts.reduce((sum, acc) => sum + acc.contributions, 0);
    const avgGainPercent = totalContributions > 0 
      ? ((totalGain / totalContributions) * 100) 
      : 0;
    
    return { totalBalance, totalGain, avgGainPercent, isPositive: totalGain >= 0 };
  }, []);

  // Simple View
  if (isSimpleView) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.simpleContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.simpleHeader}>
          <Text style={[styles.simpleTitle, { color: colors.text }]}>Investments</Text>
        </View>

        {/* Portfolio Summary */}
        <Card>
          <View style={styles.simplePortfolioCard}>
            <Text style={[styles.simplePortfolioLabel, { color: colors.textSecondary }]}>
              Total Portfolio
            </Text>
            <Text style={[styles.simplePortfolioAmount, { color: colors.text }]}>
              {formatCurrency(portfolioData.totalBalance)}
            </Text>
            <View style={styles.simpleGainContainer}>
              {portfolioData.isPositive ? (
                <TrendingUp size={18} color="#10b981" strokeWidth={2} />
              ) : (
                <TrendingDown size={18} color="#ef4444" strokeWidth={2} />
              )}
              <Text style={[
                styles.simpleGainText,
                { color: portfolioData.isPositive ? '#10b981' : '#ef4444' }
              ]}>
                {portfolioData.isPositive ? '+' : ''}{formatCurrency(portfolioData.totalGain)} 
                {' '}({portfolioData.avgGainPercent.toFixed(1)}%)
              </Text>
            </View>
          </View>
        </Card>

        {/* Investment Portfolio - Simplified */}
        <InvestmentPortfolio colors={colors} />

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
      <InvestmentPortfolio colors={colors} />

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
  simplePortfolioCard: {
    alignItems: 'center',
    padding: 20,
  },
  simplePortfolioLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  simplePortfolioAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  simpleGainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  simpleGainText: {
    fontSize: 15,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});