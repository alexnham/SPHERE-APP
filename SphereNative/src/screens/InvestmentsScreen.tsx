import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { formatCurrency } from '../lib/utils';
import { spacing, fontSize, borderRadius } from '../lib/theme';

interface InvestmentAccount {
  id: string;
  name: string;
  institution: string;
  balance: number;
  contributions: number;
  gain: number;
  gainPercent: number;
  color: string;
}

const mockInvestmentAccounts: InvestmentAccount[] = [
  { id: 'inv-1', name: 'Fidelity 401(k)', institution: 'Fidelity', balance: 18500, contributions: 15000, gain: 3500, gainPercent: 23.3, color: '#10B981' },
  { id: 'inv-2', name: 'Vanguard IRA', institution: 'Vanguard', balance: 9800, contributions: 8000, gain: 1800, gainPercent: 22.5, color: '#3B82F6' },
  { id: 'inv-3', name: 'Robinhood Brokerage', institution: 'Robinhood', balance: 6267.89, contributions: 5000, gain: 1267.89, gainPercent: 25.4, color: '#F59E0B' },
];

const InvestmentsScreen = () => {
  const { colors } = useTheme();

  const totalBalance = mockInvestmentAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalContributions = mockInvestmentAccounts.reduce((sum, a) => sum + a.contributions, 0);
  const totalGain = mockInvestmentAccounts.reduce((sum, a) => sum + a.gain, 0);
  const totalGainPercent = (totalGain / totalContributions) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Investments</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track your portfolio growth</Text>
        </View>

        {/* Total Portfolio Card */}
        <Card style={styles.card}>
          <Text style={[styles.portfolioLabel, { color: colors.textSecondary }]}>Total Portfolio</Text>
          <Text style={[styles.portfolioValue, { color: colors.text }]}>{formatCurrency(totalBalance)}</Text>
          
          <View style={[styles.gainBadge, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.gainText, { color: colors.success }]}>
              +{formatCurrency(totalGain)} ({totalGainPercent.toFixed(1)}%)
            </Text>
          </View>

          {/* Summary Row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Contributed</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(totalContributions)}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Returns</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>+{formatCurrency(totalGain)}</Text>
            </View>
          </View>
        </Card>

        {/* Portfolio Allocation */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Allocation</Text>
          
          {/* Stacked Bar */}
          <View style={styles.stackedBar}>
            {mockInvestmentAccounts.map((account, index) => (
              <View
                key={account.id}
                style={[
                  styles.stackedSegment,
                  {
                    width: `${(account.balance / totalBalance) * 100}%`,
                    backgroundColor: account.color,
                    borderTopLeftRadius: index === 0 ? borderRadius.full : 0,
                    borderBottomLeftRadius: index === 0 ? borderRadius.full : 0,
                    borderTopRightRadius: index === mockInvestmentAccounts.length - 1 ? borderRadius.full : 0,
                    borderBottomRightRadius: index === mockInvestmentAccounts.length - 1 ? borderRadius.full : 0,
                  },
                ]}
              />
            ))}
          </View>

          {/* Legend */}
          {mockInvestmentAccounts.map(account => (
            <View key={account.id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: account.color }]} />
              <Text style={[styles.legendName, { color: colors.text }]}>{account.name}</Text>
              <Text style={[styles.legendPercent, { color: colors.textSecondary }]}>
                {((account.balance / totalBalance) * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </Card>

        {/* Individual Accounts */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Accounts</Text>
          {mockInvestmentAccounts.map(account => (
            <TouchableOpacity key={account.id} style={styles.accountItem} activeOpacity={0.7}>
              <View style={styles.accountLeft}>
                <View style={[styles.accountDot, { backgroundColor: account.color }]} />
                <View>
                  <Text style={[styles.accountName, { color: colors.text }]}>{account.name}</Text>
                  <Text style={[styles.accountInstitution, { color: colors.textSecondary }]}>{account.institution}</Text>
                </View>
              </View>
              <View style={styles.accountRight}>
                <Text style={[styles.accountBalance, { color: colors.text }]}>{formatCurrency(account.balance)}</Text>
                <Text style={[styles.accountGain, { color: colors.success }]}>+{account.gainPercent.toFixed(1)}%</Text>
              </View>
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
  portfolioLabel: { fontSize: fontSize.sm, textAlign: 'center' },
  portfolioValue: { fontSize: fontSize['4xl'], fontWeight: '700', textAlign: 'center', marginVertical: spacing.xs },
  gainBadge: { alignSelf: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, marginBottom: spacing.lg },
  gainText: { fontSize: fontSize.sm, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: spacing.md },
  summaryItem: { alignItems: 'center' },
  summaryDivider: { width: 1, height: 40 },
  summaryLabel: { fontSize: fontSize.xs, marginBottom: 4 },
  summaryValue: { fontSize: fontSize.lg, fontWeight: '700' },
  stackedBar: { flexDirection: 'row', height: 16, borderRadius: borderRadius.full, overflow: 'hidden', marginBottom: spacing.lg },
  stackedSegment: { height: '100%' },
  legendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.sm },
  legendName: { flex: 1, fontSize: fontSize.md },
  legendPercent: { fontSize: fontSize.md, fontWeight: '600' },
  accountItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  accountLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  accountDot: { width: 10, height: 10, borderRadius: 5 },
  accountName: { fontSize: fontSize.md, fontWeight: '600' },
  accountInstitution: { fontSize: fontSize.sm, marginTop: 2 },
  accountRight: { alignItems: 'flex-end' },
  accountBalance: { fontSize: fontSize.md, fontWeight: '700' },
  accountGain: { fontSize: fontSize.sm, marginTop: 2 },
  footer: { height: 40 },
});

export default InvestmentsScreen;