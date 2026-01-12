import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../../lib/utils';
import { InvestmentAccount } from '../../lib/mockData';

interface InvestmentAccountItemProps {
  account: InvestmentAccount;
  colors: any;
}

export const InvestmentAccountItem = ({ account, colors }: InvestmentAccountItemProps) => {
  const isAccountPositive = account.gain >= 0;

  return (
    <View
      style={[
        styles.accountItem,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.accountHeader}>
        <View style={styles.accountNameRow}>
          <View
            style={[styles.accountDot, { backgroundColor: account.color }]}
          />
          <Text style={[styles.accountName, { color: colors.text }]}>
            {account.name}
          </Text>
        </View>
        <Text style={[styles.accountInstitution, { color: colors.textSecondary }]}>
          {account.institution}
        </Text>
      </View>
      <View style={styles.accountFooter}>
        <View>
          <Text style={[styles.accountBalance, { color: colors.text }]}>
            {formatCurrency(account.balance)}
          </Text>
          <Text style={[styles.accountContributed, { color: colors.textSecondary }]}>
            Contributed: {formatCurrency(account.contributions)}
          </Text>
        </View>
        <View style={styles.accountGainSection}>
          <View style={styles.accountGainRow}>
            <Text style={{ marginRight: 4 }}>
              {isAccountPositive ? '📈' : '📉'}
            </Text>
            <Text
              style={[
                styles.accountGain,
                { color: isAccountPositive ? '#10b981' : '#ef4444' },
              ]}
            >
              {isAccountPositive ? '+' : ''}
              {formatCurrency(account.gain)}
            </Text>
          </View>
          <Text
            style={[
              styles.accountGainPercent,
              { color: isAccountPositive ? '#10b981' : '#ef4444' },
            ]}
          >
            {isAccountPositive ? '+' : ''}
            {account.gainPercent.toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  accountItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
  },
  accountInstitution: {
    fontSize: 11,
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: '600',
  },
  accountContributed: {
    fontSize: 11,
    marginTop: 4,
  },
  accountGainSection: {
    alignItems: 'flex-end',
  },
  accountGainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountGain: {
    fontSize: 15,
    fontWeight: '600',
  },
  accountGainPercent: {
    fontSize: 11,
    marginTop: 2,
  },
});