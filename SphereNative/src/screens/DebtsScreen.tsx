import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { mockLiabilities } from '../lib/mockData';
import { formatCurrency, getDaysUntil } from '../lib/utils';
import { spacing, fontSize, borderRadius } from '../lib/theme';

const debtTypeColors: Record<string, string> = {
  credit_card: '#8B5CF6',
  loan: '#3B82F6',
  bnpl: '#F59E0B',
  mortgage: '#10B981',
};

const DebtsScreen = () => {
  const { colors } = useTheme();

  const totalDebt = mockLiabilities.reduce((sum, l) => sum + l.currentBalance, 0);
  const totalLimit = mockLiabilities.reduce((sum, l) => sum + (l.statementBalance || l.currentBalance * 1.5), 0);
  const utilizationPercent = Math.min(100, (totalDebt / totalLimit) * 100);

  // Group by type
  const debtByType = mockLiabilities.reduce((acc, debt) => {
    acc[debt.type] = (acc[debt.type] || 0) + debt.currentBalance;
    return acc;
  }, {} as Record<string, number>);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Debts</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your liabilities</Text>
        </View>

        {/* Semi-circle Gauge */}
        <View style={styles.gaugeContainer}>
          <Svg width={200} height={110} viewBox="0 0 100 55">
            {/* Background arc */}
            <Path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke={colors.muted}
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <Path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke={colors.primary}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="141"
              strokeDashoffset={141 - (141 * utilizationPercent / 100)}
            />
          </Svg>
          <Text style={[styles.gaugePercent, { color: colors.textSecondary }]}>
            {utilizationPercent.toFixed(0)}% utilized
          </Text>
          <Text style={[styles.gaugeValue, { color: colors.text }]}>{formatCurrency(totalDebt)}</Text>
          <Text style={[styles.gaugeLabel, { color: colors.textSecondary }]}>Total Debt</Text>
        </View>

        {/* Debt by Category */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>By Category</Text>
          {Object.entries(debtByType).map(([type, amount]) => {
            const percent = (amount / totalDebt) * 100;
            return (
              <View key={type} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text style={[styles.categoryAmount, { color: colors.text }]}>{formatCurrency(amount)}</Text>
                </View>
                <ProgressBar
                  progress={percent}
                  color={debtTypeColors[type] || colors.primary}
                  height={6}
                  style={styles.categoryBar}
                />
              </View>
            );
          })}
        </Card>

        {/* Individual Debts */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>All Debts</Text>
          {mockLiabilities.map(debt => {
            const daysUntil = debt.dueDate ? getDaysUntil(debt.dueDate) : null;
            const isDueSoon = daysUntil !== null && daysUntil <= 7;

            return (
              <TouchableOpacity key={debt.id} style={styles.debtItem} activeOpacity={0.7}>
                <View style={styles.debtLeft}>
                  <View style={styles.debtHeader}>
                    <Text style={styles.debtIcon}>{debt.icon}</Text>
                    <View>
                      <Text style={[styles.debtLender, { color: colors.text }]}>{debt.lender}</Text>
                      <Text style={[styles.debtType, { color: colors.textSecondary }]}>
                        {debt.type.replace('_', ' ')} • {debt.apr}% APR
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.debtRight}>
                  <Text style={[styles.debtBalance, { color: colors.text }]}>{formatCurrency(debt.currentBalance)}</Text>
                  {daysUntil !== null && (
                    <View style={[styles.dueBadge, { backgroundColor: isDueSoon ? colors.warningLight : colors.muted }]}>
                      <Text style={[styles.dueText, { color: isDueSoon ? colors.warning : colors.textSecondary }]}>
                        {daysUntil === 0 ? 'Due today' : `${daysUntil}d`}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
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
  gaugeContainer: { alignItems: 'center', marginVertical: spacing.md },
  gaugePercent: { fontSize: fontSize.xs, marginTop: -10 },
  gaugeValue: { fontSize: fontSize['3xl'], fontWeight: '700', marginTop: spacing.sm },
  gaugeLabel: { fontSize: fontSize.sm },
  card: { marginBottom: spacing.md },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.md },
  categoryItem: { marginBottom: spacing.md },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  categoryName: { fontSize: fontSize.md, textTransform: 'capitalize' },
  categoryAmount: { fontSize: fontSize.md, fontWeight: '600' },
  categoryBar: { marginTop: 4 },
  debtItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  debtLeft: { flex: 1 },
  debtHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  debtIcon: { fontSize: 24 },
  debtLender: { fontSize: fontSize.md, fontWeight: '600' },
  debtType: { fontSize: fontSize.sm, marginTop: 2 },
  debtRight: { alignItems: 'flex-end' },
  debtBalance: { fontSize: fontSize.md, fontWeight: '700' },
  dueBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm, marginTop: 4 },
  dueText: { fontSize: fontSize.xs, fontWeight: '600' },
  footer: { height: 40 },
});

export default DebtsScreen;