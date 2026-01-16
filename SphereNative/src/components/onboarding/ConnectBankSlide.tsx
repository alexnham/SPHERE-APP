import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Building2, ArrowRight } from 'lucide-react-native';
import { SecurityItem } from './SecurityItem';
import { ConnectedBankItem } from './ConnectedBankItem';

interface PlaidAccount {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  current_balance: number;
  institution_name?: string;
}

interface ConnectBankSlideProps {
  colors: any;
  isLoading: boolean;
  connectedBanks: string[];
  connectedAccounts?: PlaidAccount[];
  onConnect: () => void;
  onSkip: () => void;
  onNext: () => void;
}

export const ConnectBankSlide = ({
  colors,
  isLoading,
  connectedBanks,
  connectedAccounts = [],
  onConnect,
  onSkip,
  onNext,
}: ConnectBankSlideProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalBalance = connectedAccounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
        <Building2 size={40} color="#3b82f6" strokeWidth={1.5} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Connect Your Bank</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Securely link your accounts with Plaid. Your credentials are never stored on our servers.
      </Text>

      {connectedAccounts.length > 0 ? (
        <ScrollView style={styles.accountsScroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.totalBalanceCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.totalBalanceLabel, { color: colors.textSecondary }]}>Total Balance</Text>
            <Text style={[styles.totalBalanceValue, { color: colors.primary }]}>{formatCurrency(totalBalance)}</Text>
          </View>
          <View style={styles.accounts}>
            {connectedAccounts.map((account) => (
              <View key={account.id} style={[styles.accountCard, { backgroundColor: colors.surface }]}>
                <View style={styles.accountHeader}>
                  <Text style={[styles.accountName, { color: colors.text }]}>{account.name}</Text>
                  <Text style={[styles.accountType, { color: colors.textSecondary }]}>
                    {account.subtype || account.type}
                  </Text>
                </View>
                <Text style={[styles.accountBalance, { color: '#10b981' }]}>
                  {formatCurrency(account.current_balance || 0)}
                </Text>
                {account.institution_name && (
                  <Text style={[styles.institutionName, { color: colors.primary }]}>
                    {account.institution_name}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : connectedBanks.length > 0 ? (
        <View style={styles.banks}>
          {connectedBanks.map((bank) => (
            <ConnectedBankItem key={bank} name={bank} colors={colors} />
          ))}
        </View>
      ) : (
        <View style={styles.security}>
          <SecurityItem icon="lock" text="256-bit encryption" color="#10b981" colors={colors} />
          <SecurityItem icon="eye" text="Read-only access" color="#3b82f6" colors={colors} />
          <SecurityItem icon="check" text="Trusted by 12,000+ banks" color="#8b5cf6" colors={colors} />
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={connectedAccounts.length > 0 || connectedBanks.length > 0 ? onNext : onConnect}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Connecting...</Text>
          </>
        ) : (
          <>
            {connectedAccounts.length === 0 && connectedBanks.length === 0 && (
              <Building2 size={18} color="#fff" strokeWidth={2} />
            )}
            <Text style={styles.buttonText}>
              {connectedAccounts.length > 0 || connectedBanks.length > 0 ? 'Continue' : 'Connect with Plaid'}
            </Text>
            {(connectedAccounts.length > 0 || connectedBanks.length > 0) && (
              <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
            )}
          </>
        )}
      </TouchableOpacity>

      {connectedAccounts.length === 0 && connectedBanks.length === 0 && (
        <TouchableOpacity onPress={onSkip} style={styles.skipContainer}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip for now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20, alignItems: 'center' },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: { fontSize: 40 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 16 },
  banks: { width: '100%', gap: 10, marginBottom: 24 },
  security: { width: '100%', gap: 10, marginBottom: 24 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonArrow: { color: '#fff', fontSize: 16 },
  buttonIcon: { fontSize: 16 },
  skipContainer: { marginTop: 16 },
  skipText: { fontSize: 14 },
  accountsScroll: {
    width: '100%',
    maxHeight: 280,
    marginBottom: 24,
  },
  totalBalanceCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  totalBalanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  totalBalanceValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  accounts: {
    gap: 10,
  },
  accountCard: {
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  accountHeader: {
    marginBottom: 8,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
  },
  accountType: {
    fontSize: 11,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: '700',
  },
  institutionName: {
    fontSize: 11,
    marginTop: 6,
  },
});