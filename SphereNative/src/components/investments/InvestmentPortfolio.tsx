import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../Card';
import { InfoTooltip } from '../shared';
import { formatCurrency } from '../../lib/utils';
import { InvestmentAccount } from '../../lib/mockData';
import { PerformanceChart } from './PerformanceChart';
import { AllocationBar } from './AllocationBar';
import { InvestmentAccountItem } from './InvestmentAccountItem';
import { Lock, TrendingUp, TrendingDown, ChevronUp, ChevronDown, BarChart3 } from 'lucide-react-native';

interface InvestmentPortfolioProps {
  colors: any;
  investmentAccounts?: InvestmentAccount[];
}

export const InvestmentPortfolio = ({ colors, investmentAccounts = [] }: InvestmentPortfolioProps) => {
  const [expanded, setExpanded] = useState(false);

  // Calculate portfolio metrics
  const portfolioValue = useMemo(() => {
    return investmentAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [investmentAccounts]);

  const totalContributions = useMemo(() => {
    return investmentAccounts.reduce((sum, acc) => sum + acc.contributions, 0);
  }, [investmentAccounts]);

  const totalGain = useMemo(() => portfolioValue - totalContributions, [portfolioValue, totalContributions]);
  const gainPercent = useMemo(() => totalContributions > 0 ? (totalGain / totalContributions) * 100 : 0, [totalGain, totalContributions]);
  const isPositive = totalGain >= 0;

  // Projection calculation
  const calculateProjection = (years: number, monthlyContribution: number = 500) => {
    const annualReturn = 0.07;
    const monthlyReturn = annualReturn / 12;
    const months = years * 12;

    let futureValue = portfolioValue;
    for (let i = 0; i < months; i++) {
      futureValue = futureValue * (1 + monthlyReturn) + monthlyContribution;
    }
    return futureValue;
  };

  const fiveYearProjection = useMemo(() => calculateProjection(5), [portfolioValue]);
  const tenYearProjection = useMemo(() => calculateProjection(10), [portfolioValue]);

  return (
    <Card>
      {/* Header */}
      <View style={styles.portfolioHeader}>
        <View>
          <Text style={[styles.portfolioTitle, { color: colors.text }]}>
            Investment Portfolio
          </Text>
          <Text style={[styles.portfolioSubtitle, { color: colors.textSecondary }]}>
            Long-term growth focus
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.lowDopamineTag}>
            <Lock size={12} color={colors.textSecondary} strokeWidth={2} style={{ marginRight: 4 }} />
            <Text style={[styles.lowDopamineText, { color: colors.textSecondary }]}>
              Low-dopamine
            </Text>
          </View>
          <InfoTooltip
            title="Low-Dopamine View"
            content="This view intentionally hides short-term fluctuations to help you focus on long-term growth. Checking investments too frequently can lead to emotional decision-making."
          />
        </View>
      </View>

      {/* Main Stats - Clickable */}
      <TouchableOpacity
        style={styles.mainStats}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        {/* Total Value */}
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Value
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatCurrency(portfolioValue)}
          </Text>
          <View style={styles.expandIcon}>
            {expanded ? (
              <ChevronUp size={16} color={colors.textSecondary} strokeWidth={2} />
            ) : (
              <ChevronDown size={16} color={colors.textSecondary} strokeWidth={2} />
            )}
          </View>
        </View>

        {/* Total Return */}
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: isPositive
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
            },
          ]}
        >
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Return
          </Text>
          <View style={styles.returnRow}>
            <Text
              style={[
                styles.statValue,
                { color: isPositive ? '#10b981' : '#ef4444' },
              ]}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(totalGain)}
            </Text>
            {isPositive ? (
              <TrendingUp size={16} color="#10b981" strokeWidth={2} style={{ marginLeft: 8 }} />
            ) : (
              <TrendingDown size={16} color="#ef4444" strokeWidth={2} style={{ marginLeft: 8 }} />
            )}
          </View>
          <Text
            style={[
              styles.returnPercent,
              { color: isPositive ? '#10b981' : '#ef4444' },
            ]}
          >
            {isPositive ? '+' : ''}
            {gainPercent.toFixed(1)}% all time
          </Text>
        </View>
      </TouchableOpacity>

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Performance Chart */}
          <PerformanceChart colors={colors} />

          {/* Asset Allocation */}
          <AllocationBar colors={colors} />

          {/* Individual Accounts */}
          <View style={styles.accountsSection}>
            <Text style={[styles.accountsTitle, { color: colors.text }]}>
              Accounts
            </Text>
            {investmentAccounts.map((account) => (
              <InvestmentAccountItem
                key={account.id}
                account={account}
                colors={colors}
              />
            ))}
          </View>

          {/* Projections */}
          <View style={[styles.projectionsCard, { backgroundColor: colors.surface }]}>
            <View style={styles.projectionsTitleRow}>
              <BarChart3 size={16} color={colors.text} strokeWidth={2} />
              <Text style={[styles.projectionsTitle, { color: colors.text }]}>
                Future Projections
              </Text>
            </View>
            <Text style={[styles.projectionsNote, { color: colors.textSecondary }]}>
              Based on 7% average annual return
            </Text>
            <View style={styles.projectionRow}>
              <View style={styles.projectionItem}>
                <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>
                  5 Years
                </Text>
                <Text style={[styles.projectionValue, { color: colors.text }]}>
                  {formatCurrency(fiveYearProjection)}
                </Text>
              </View>
              <View style={styles.projectionItem}>
                <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>
                  10 Years
                </Text>
                <Text style={[styles.projectionValue, { color: colors.text }]}>
                  {formatCurrency(tenYearProjection)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  portfolioSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lowDopamineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  lowDopamineText: {
    fontSize: 10,
  },
  mainStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  expandIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  returnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  returnPercent: {
    fontSize: 11,
    marginTop: 4,
  },
  expandedContent: {
    marginTop: 8,
  },
  accountsSection: {
    marginTop: 16,
  },
  accountsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  projectionsCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  projectionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  projectionsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  projectionsNote: {
    fontSize: 11,
    marginBottom: 12,
  },
  projectionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  projectionItem: {
    flex: 1,
  },
  projectionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  projectionValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});