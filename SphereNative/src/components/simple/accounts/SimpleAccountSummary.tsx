import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../Card';
import { formatCurrency } from '../../../lib/utils';
import { Wallet, PiggyBank, type LucideIcon } from 'lucide-react-native';

interface AccountType {
  type: 'checking' | 'savings';
  amount: number;
  color: string;
}

interface SimpleAccountSummaryProps {
  accounts: AccountType[];
  colors: any;
}

const iconMap: Record<string, LucideIcon> = {
  checking: Wallet,
  savings: PiggyBank,
};

const labelMap: Record<string, string> = {
  checking: 'Checking',
  savings: 'Savings',
};

export const SimpleAccountSummary = ({ accounts, colors }: SimpleAccountSummaryProps) => {
  return (
    <Card>
      <View style={styles.container}>
        {accounts.map((account) => {
          const IconComponent = iconMap[account.type] || Wallet;
          return (
            <View key={account.type} style={styles.accountType}>
              <View style={[styles.icon, { backgroundColor: `${account.color}20` }]}>
                <IconComponent size={20} color={account.color} strokeWidth={2} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {labelMap[account.type] || account.type}
                </Text>
                <Text style={[styles.amount, { color: colors.text }]}>
                  {formatCurrency(account.amount)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
  accountType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
  },
  amount: {
    fontSize: 20,
    fontWeight: '600',
  },
});
