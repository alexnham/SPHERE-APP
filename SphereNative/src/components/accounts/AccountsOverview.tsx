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
        <View style={styles.netWorthMeta}>
          <View style={styles.metaItem}>
            <TrendingUp size={14} color="#10b981" strokeWidth={2} />
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              Assets:
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {formatCurrency(totalAssets)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <TrendingDown size={14} color="#ef4444" strokeWidth={2} />
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              Debts:
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {formatCurrency(totalLiabilities)}
            </Text>
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
    marginBottom: 24,
  },
  netWorthBig: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  netWorthMeta: {
    flexDirection: 'row',
    gap: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
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