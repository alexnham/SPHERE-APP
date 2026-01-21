import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useViewMode } from '../contexts/ViewModeContext';
import { Card } from '../components/Card';
import { formatCurrency } from '../lib/utils';
import {
  SemiCircleGauge,
  DebtTypeBreakdown,
  DebtDashboard,
} from '../components/debts';
import {
  SimpleHeader,
  SimpleDebtCard,
  SimpleUrgentDebts,
} from '../components/simple';
import { CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useLiabilities } from '../hooks/useLiabilities';
import { calculateSafeToSpend } from '../lib/database';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

export default function DebtsScreen() {
  const { colors } = useTheme();
  const { isSimpleView } = useViewMode();
  const { liabilities, loading: liabilitiesLoading } = useLiabilities();
  const [safeToSpendData, setSafeToSpendData] = React.useState<{ safeToSpend: number } | null>(null);
  const [loadingSafeToSpend, setLoadingSafeToSpend] = React.useState(true);

  React.useEffect(() => {
    const fetchSafeToSpend = async () => {
      try {
        setLoadingSafeToSpend(true);
        const data = await calculateSafeToSpend();
        setSafeToSpendData(data);
      } catch (error) {
        console.error('Error fetching safe to spend:', error);
      } finally {
        setLoadingSafeToSpend(false);
      }
    };
    fetchSafeToSpend();
  }, []);

  // Calculate totals
  const totalDebt = useMemo(() => {
    return liabilities.reduce((sum, l) => sum + l.currentBalance, 0);
  }, [liabilities]);

  const totalLimit = useMemo(() => {
    return liabilities.reduce(
      (sum, l) => sum + (l.creditLimit || l.currentBalance * 1.5),
      0
    );
  }, [liabilities]);

  const utilizationPercent = useMemo(() => {
    return totalLimit > 0 ? Math.min(100, (totalDebt / totalLimit) * 100) : 0;
  }, [totalDebt, totalLimit]);

  // Group debts by type
  const debtByType = useMemo(() => {
    return liabilities.reduce((acc, debt) => {
      acc[debt.type] = (acc[debt.type] || 0) + debt.currentBalance;
      return acc;
    }, {} as Record<string, number>);
  }, [liabilities]);

  const safeToSpend = safeToSpendData?.safeToSpend || 0;

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleDebtPress = (debtId: string) => {
    navigation.navigate('DebtDetail', { id: debtId });
  };

  // Get urgent debts (due soon or overdue)
  const urgentDebts = useMemo(() => {
    return liabilities.filter(l => l.status === 'due_soon' || l.status === 'overdue');
  }, [liabilities]);

  const urgentTotal = useMemo(() => {
    return urgentDebts.reduce((sum, l) => sum + l.currentBalance, 0);
  }, [urgentDebts]);

  const isLoading = liabilitiesLoading || loadingSafeToSpend;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: 16 }]}>Loading...</Text>
      </View>
    );
  }

  // Simple View
  if (isSimpleView) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.simpleContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SimpleHeader title="Lenders & Debts" colors={colors} />

        {/* Total Debt Summary */}
        <SimpleDebtCard
          label="Total Debt"
          amount={totalDebt}
          subtitle={`${utilizationPercent.toFixed(0)}% utilization`}
          colors={colors}
        />

        {/* Urgent Debts */}
        <SimpleUrgentDebts
          debts={urgentDebts.map(d => ({ id: d.id, name: d.name, amount: d.currentBalance }))}
          totalAmount={urgentTotal}
          colors={colors}
        />

        {/* Debt Dashboard - Simplified */}
        <DebtDashboard
          liabilities={liabilities}
          totalDebt={totalDebt}
          safeToSpend={safeToSpend}
          colors={colors}
          onDebtPress={handleDebtPress}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  }

  // Detailed View
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Lenders & Debts
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage your liabilities and payment schedules
        </Text>
      </View>

      {/* Total Debt with Semi-circle Gauge */}
      <Card>
        <View style={styles.totalDebtCard}>
          <SemiCircleGauge percent={utilizationPercent} colors={colors} />
          <Text style={[styles.totalDebtAmount, { color: colors.text }]}>
            {formatCurrency(totalDebt)}
          </Text>
          <Text style={[styles.totalDebtLabel, { color: colors.textSecondary }]}>
            Total Debt
          </Text>
        </View>
      </Card>

      {/* Debt Breakdown by Type */}
      <DebtTypeBreakdown
        debtByType={debtByType}
        totalDebt={totalDebt}
        colors={colors}
      />

      {/* Debt Dashboard */}
      <DebtDashboard
        liabilities={liabilities}
        totalDebt={totalDebt}
        safeToSpend={safeToSpend}
        colors={colors}
        onDebtPress={handleDebtPress}
      />

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  simpleContentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  totalDebtCard: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalDebtAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: -10,
  },
  totalDebtLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
  loadingText: {
    fontSize: 14,
  },
});