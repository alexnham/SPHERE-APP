import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Check, Target, Building2, Sparkles } from 'lucide-react-native';

interface PlaidAccount {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  current_balance: number;
  institution_name?: string;
}

interface AllSetSlideProps {
  colors: any;
  connectedBanks: string[];
  connectedAccounts?: PlaidAccount[];
  userEmail?: string | null;
  userName?: string | null;
  selectedGoals?: string[];
  onComplete: () => void;
}

export const AllSetSlide = ({ 
  colors, 
  connectedBanks, 
  connectedAccounts = [],
  userEmail,
  userName,
  selectedGoals = [],
  onComplete 
}: AllSetSlideProps) => {
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
      <View style={styles.successCircle}>
        <Check size={48} color="#fff" strokeWidth={3} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>You're all set!</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Your account is ready. Let's start your journey to financial freedom.
      </Text>

      <ScrollView style={styles.summaryScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          {/* User Account */}
          {userEmail && (
            <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
              <View style={[styles.summaryIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Check size={18} color={colors.primary} strokeWidth={3} />
              </View>
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryText, { color: colors.text }]}>Google account connected</Text>
                <Text style={[styles.summaryDetail, { color: colors.textSecondary }]}>{userEmail}</Text>
              </View>
            </View>
          )}

          {/* Selected Goals */}
          {selectedGoals.length > 0 && (
            <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
              <View style={[styles.summaryIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <Target size={18} color="#8b5cf6" strokeWidth={2} />
              </View>
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryText, { color: colors.text }]}>{selectedGoals.length} financial goals set</Text>
                <Text style={[styles.summaryDetail, { color: colors.textSecondary }]} numberOfLines={1}>
                  {selectedGoals.join(', ')}
                </Text>
              </View>
            </View>
          )}

          {/* Connected Accounts */}
          {connectedAccounts.length > 0 && (
            <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
              <View style={[styles.summaryIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Building2 size={18} color="#3b82f6" strokeWidth={2} />
              </View>
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryText, { color: colors.text }]}>
                  {connectedAccounts.length} bank accounts linked
                </Text>
                <Text style={[styles.summaryDetail, { color: '#10b981' }]}>
                  Total: {formatCurrency(totalBalance)}
                </Text>
              </View>
            </View>
          )}

          {/* Fallback for legacy connectedBanks */}
          {connectedAccounts.length === 0 && connectedBanks.length > 0 && (
            <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
              <View style={[styles.summaryIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Check size={18} color="#3b82f6" strokeWidth={3} />
              </View>
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryText, { color: colors.text }]}>
                  {connectedBanks.length} bank accounts linked
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onComplete}>
        <Text style={styles.buttonText}>Go to Dashboard</Text>
        <Sparkles size={18} color="#fff" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20, alignItems: 'center' },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: '#10b981',
  },
  successIcon: { color: '#fff', fontSize: 48, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 16 },
  summary: { width: '100%', gap: 12, marginBottom: 32 },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContent: {
    flex: 1,
  },
  summaryText: { fontSize: 14, fontWeight: '500' },
  summaryDetail: { fontSize: 12, marginTop: 2 },
  summaryScroll: {
    width: '100%',
    maxHeight: 220,
    marginBottom: 24,
  },
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
});