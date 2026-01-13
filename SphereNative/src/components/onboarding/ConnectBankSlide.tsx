import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SecurityItem } from './SecurityItem';
import { ConnectedBankItem } from './ConnectedBankItem';

interface ConnectBankSlideProps {
  colors: any;
  isLoading: boolean;
  connectedBanks: string[];
  onConnect: () => void;
  onSkip: () => void;
  onNext: () => void;
}

export const ConnectBankSlide = ({
  colors,
  isLoading,
  connectedBanks,
  onConnect,
  onSkip,
  onNext,
}: ConnectBankSlideProps) => (
  <View style={styles.container}>
    <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
      <Text style={styles.icon}>🏦</Text>
    </View>
    <Text style={[styles.title, { color: colors.text }]}>Connect Your Bank</Text>
    <Text style={[styles.description, { color: colors.textSecondary }]}>
      Securely link your accounts with Plaid. Your credentials are never stored on our servers.
    </Text>

    {connectedBanks.length > 0 ? (
      <View style={styles.banks}>
        {connectedBanks.map((bank) => (
          <ConnectedBankItem key={bank} name={bank} colors={colors} />
        ))}
      </View>
    ) : (
      <View style={styles.security}>
        <SecurityItem icon="🔒" text="256-bit encryption" color="#10b981" colors={colors} />
        <SecurityItem icon="👁️" text="Read-only access" color="#3b82f6" colors={colors} />
        <SecurityItem icon="✓" text="Trusted by 12,000+ banks" color="#8b5cf6" colors={colors} />
      </View>
    )}

    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary }]}
      onPress={connectedBanks.length > 0 ? onNext : onConnect}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Connecting...</Text>
        </>
      ) : (
        <>
          {connectedBanks.length === 0 && <Text style={styles.buttonIcon}>🏦</Text>}
          <Text style={styles.buttonText}>
            {connectedBanks.length > 0 ? 'Continue' : 'Connect with Plaid'}
          </Text>
          {connectedBanks.length > 0 && <Text style={styles.buttonArrow}>→</Text>}
        </>
      )}
    </TouchableOpacity>

    {connectedBanks.length === 0 && (
      <TouchableOpacity onPress={onSkip} style={styles.skipContainer}>
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip for now</Text>
      </TouchableOpacity>
    )}
  </View>
);

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
});