import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../Card';
import { formatCurrency } from '../../lib/utils';
import { Account } from '../../lib/mockData';

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
            <Text style={{ color: colors.primary }}>💸</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={{ color: colors.textSecondary }}>🔄</Text>
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
            <Text style={styles.metaIcon}>📈</Text>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
              Assets:
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {formatCurrency(totalAssets)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📉</Text>
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
        {accounts.map((account) => (
          <View
            key={account.id}
            style={[styles.accountItem, { backgroundColor: colors.surface }]}
          >
            <View style={styles.accountLeft}>
              <View
                style={[styles.accountIcon, { backgroundColor: `${colors.border}80` }]}
              >
                <Text style={styles.accountIconText}>
                  {accountTypeIcons[account.type] || '🏦'}
                </Text>
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
        ))}
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
  metaIcon: {
    fontSize: 14,
  },
  metaLabel: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountsSection: {
    gap: 12,
  },
  accountsSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountIconText: {
    fontSize: 18,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountInstitution: {
    fontSize: 12,
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
    fontSize: 11,
    marginTop: 2,
  },
});