import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

interface NetWorthCardProps {
  totalAssets: number;
  totalLiabilities: number;
  colors: any;
}

export const NetWorthCard = ({ totalAssets, totalLiabilities, colors }: NetWorthCardProps) => {
  const netWorth = totalAssets - totalLiabilities;
  const assetsPercent = 100;
  const liabilitiesPercent = (totalLiabilities / totalAssets) * 100;

  return (
    <Card>
      {/* Net Worth Header */}
      <View style={styles.netWorthHeader}>
        <Text style={[styles.netWorthLabel, { color: colors.textSecondary }]}>
          Net Worth
        </Text>
        <Text style={[styles.netWorthAmount, { color: colors.text }]}>
          {formatCurrency(netWorth)}
        </Text>
      </View>

      {/* Assets vs Liabilities Bars */}
      <View style={styles.barsContainer}>
        {/* Assets Bar */}
        <View style={styles.barRow}>
          <View style={styles.barLabelRow}>
            <TrendingUp size={18} color="#10b981" strokeWidth={2} style={{ marginRight: 8 }} />
            <View style={styles.barLabelContent}>
              <View style={styles.barLabelTop}>
                <Text style={[styles.barLabelText, { color: colors.textSecondary }]}>
                  Assets
                </Text>
                <Text style={[styles.barAmount, { color: colors.text }]}>
                  {formatCurrency(totalAssets)}
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${assetsPercent}%`, backgroundColor: '#10b981' },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Liabilities Bar */}
        <View style={styles.barRow}>
          <View style={styles.barLabelRow}>
            <TrendingDown size={18} color="#ef4444" strokeWidth={2} style={{ marginRight: 8 }} />
            <View style={styles.barLabelContent}>
              <View style={styles.barLabelTop}>
                <Text style={[styles.barLabelText, { color: colors.textSecondary }]}>
                  Debts
                </Text>
                <Text style={[styles.barAmount, { color: colors.text }]}>
                  {formatCurrency(totalLiabilities)}
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${liabilitiesPercent}%`, backgroundColor: '#ef4444' },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  netWorthHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  netWorthLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  netWorthAmount: {
    fontSize: 36,
    fontWeight: '700',
  },
  barsContainer: {
    gap: 16,
  },
  barRow: {
    marginBottom: 8,
  },
  barLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  barLabelContent: {
    flex: 1,
  },
  barLabelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  barLabelText: {
    fontSize: 14,
  },
  barAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});