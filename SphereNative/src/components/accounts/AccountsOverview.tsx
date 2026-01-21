import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';
import { Account } from '../../lib/mockData';
import { 
  Building2, 
  PiggyBank, 
  Rocket, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  RefreshCw,
  type LucideIcon 
} from 'lucide-react-native';

// Icon map for account types
const accountIconMap: Record<string, LucideIcon> = {
  building: Building2,
  'piggy-bank': PiggyBank,
  rocket: Rocket,
};

interface AccountsOverviewProps {
  accounts: Account[];
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  accountTypeIcons: Record<string, string>;
  colors: any;
}

export const AccountsOverview = ({
  accounts,
  netWorth,
  totalAssets,
  totalLiabilities,
  accountTypeIcons,
  colors,
}: AccountsOverviewProps) => {
  const assetsPercent = totalAssets > 0 ? 100 : 0;
  const liabilitiesPercent = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  return (
    <Card>
      {/* Header */}
      <View style={styles.overviewHeader}>
        <Text style={[styles.overviewTitle, { color: colors.text }]}>
          Net Worth
        </Text>
        <View style={styles.overviewActions}>
          <TouchableOpacity style={styles.actionButton}>
            <ArrowUpRight size={18} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <RefreshCw size={18} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Net Worth Display */}
      <View style={styles.netWorthDisplay}>
        <Text style={[styles.netWorthBig, { color: colors.text }]}>
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

      {/* Accounts List */}
      <View style={styles.accountsSection}>
        <Text style={[styles.accountsSectionTitle, { color: colors.textSecondary }]}>
          YOUR ACCOUNTS
        </Text>
        {accounts.map((account) => {
          const iconKey = accountTypeIcons[account.type] || 'building';
          const IconComponent = accountIconMap[iconKey] || Building2;
          
          return (
            <View
              key={account.id}
              style={[styles.accountItem, { backgroundColor: colors.surface }]}
            >
              <View style={styles.accountLeft}>
                <View
                  style={[styles.accountIcon, { backgroundColor: `${colors.border}80` }]}
                >
                  <IconComponent size={18} color={colors.textSecondary} strokeWidth={2} />
                </View>
                <View>
                  <Text style={[styles.accountName, { color: colors.text }]}>
                    {account.name}
                  </Text>
                  <Text style={[styles.accountInstitution, { color: colors.textSecondary }]}>
                    {account.institution}
                  </Text>
                </View>
              </View>
              <View style={styles.accountRight}>
                <Text style={[styles.accountBalance, { color: colors.text }]}>
                  {formatCurrency(account.currentBalance)}
                </Text>
                {account.type === 'checking' &&
                  account.availableBalance !== account.currentBalance && (
                    <Text style={[styles.accountAvailable, { color: colors.textSecondary }]}>
                      {formatCurrency(account.availableBalance)} available
                    </Text>
                  )}
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  overviewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  netWorthDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  netWorthBig: {
    fontSize: 36,
    fontWeight: '700',
  },
  barsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  barRow: {
    marginBottom: 8,
  },
  barLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  accountsSection: {
    marginTop: 8,
  },
  accountsSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountIconText: {
    fontSize: 16,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '500',
  },
  accountInstitution: {
    fontSize: 11,
    marginTop: 2,
  },
  accountRight: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountAvailable: {
    fontSize: 10,
    marginTop: 2,
  },
});