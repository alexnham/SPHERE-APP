import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { differenceInDays } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { liabilities, calculateSafeToSpend } from '../lib/mockData';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  DebtDetailHeader,
  BalanceOverview,
  CreditUtilization,
  DueDateInfo,
  CostOfWaiting,
  PaymentOptions,
} from '../components/debtDetail';

export default function DebtDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'DebtDetail'>>();
  const insets = useSafeAreaInsets();

  const { safeToSpend } = calculateSafeToSpend();
  const liability = liabilities.find((l) => l.id === route.params.id);

  if (!liability) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
            Debt not found
          </Text>
          <TouchableOpacity
            style={[styles.goBackButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go back to Debts</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const daysUntilDue = liability.dueDate
    ? differenceInDays(new Date(liability.dueDate), new Date())
    : null;

  const utilizationPercent =
    liability.type === 'credit_card' && liability.creditLimit
      ? (liability.currentBalance / liability.creditLimit) * 100
      : null;

  const recommendedPayment = Math.min(safeToSpend, liability.currentBalance);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <DebtDetailHeader
          name={liability.name}
          type={liability.type}
          onBack={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <BalanceOverview
          currentBalance={liability.currentBalance}
          minimumPayment={liability.minimumPayment}
        />

        {utilizationPercent !== null && (
          <CreditUtilization utilizationPercent={utilizationPercent} />
        )}

        <DueDateInfo
          dueDate={liability.dueDate}
          apr={liability.apr}
          daysUntilDue={daysUntilDue}
        />

        {liability.apr && (
          <CostOfWaiting currentBalance={liability.currentBalance} apr={liability.apr} />
        )}

        <PaymentOptions
          minimumPayment={liability.minimumPayment}
          recommendedPayment={recommendedPayment}
          fullBalance={liability.currentBalance}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  scrollView: { flex: 1 },
  contentContainer: { padding: 16 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, marginBottom: 16 },
  goBackButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  goBackButtonText: { color: '#fff', fontWeight: '600' },
  backText: { fontSize: 16, fontWeight: '500' },
  bottomPadding: { height: 40 },
});